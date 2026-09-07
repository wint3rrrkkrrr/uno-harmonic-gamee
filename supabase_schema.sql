-- ============================================================================
-- HARMONIC CARD GAME - SUPABASE DATABASE SCHEMA
-- ============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It will create the 'rooms' table, RLS security policies, Realtime publication,
-- and atomic functions to prevent race conditions during multiplayer matches.
-- ============================================================================

-- 1. Create the rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  host_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'LOBBY', -- 'LOBBY', 'PLAYING', 'ENDED'
  version INTEGER NOT NULL DEFAULT 1,     -- Optimistic concurrency lock
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast room lookups
CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON public.rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_rooms_updated_at ON public.rooms;
CREATE TRIGGER tr_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Only Anon / Publishable Key is used on the frontend.
-- These policies allow players to create rooms, join, read, and update state.
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read rooms" ON public.rooms;
CREATE POLICY "Allow anon read rooms"
  ON public.rooms
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert rooms" ON public.rooms;
CREATE POLICY "Allow anon insert rooms"
  ON public.rooms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update rooms" ON public.rooms;
CREATE POLICY "Allow anon update rooms"
  ON public.rooms
  FOR UPDATE
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon delete rooms" ON public.rooms;
CREATE POLICY "Allow anon delete rooms"
  ON public.rooms
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- 3. ENABLE SUPABASE REALTIME
-- ============================================================================
-- REPLICA IDENTITY FULL ensures the entire row is included in real-time payloads
ALTER TABLE public.rooms REPLICA IDENTITY FULL;

-- Add rooms table to Supabase Realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;
END $$;

-- ============================================================================
-- 4. ATOMIC RPC FUNCTIONS (RACE CONDITION PROTECTION)
-- ============================================================================

-- Function: Atomically claim the buzzer answer in an Equation Challenge
-- Guarantees that ONLY the first player to buzz in gets the right to answer!
CREATE OR REPLACE FUNCTION public.claim_equation_answer(
  p_room_code TEXT,
  p_player_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room RECORD;
  v_current_claimed TEXT;
BEGIN
  -- Lock the row for update to eliminate race conditions
  SELECT * INTO v_room FROM public.rooms WHERE room_code = p_room_code FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Room not found');
  END IF;

  v_current_claimed := v_room.state->'currentEquationState'->>'claimedByPlayerId';

  -- If already claimed by someone else, reject
  IF v_current_claimed IS NOT NULL AND v_current_claimed <> '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'มีผู้เล่นคนอื่นกดแย่งตอบได้ก่อนแล้ว!',
      'claimedBy', v_current_claimed
    );
  END IF;

  -- Update state atomically: set claimedByPlayerId and switch phase to ANSWERING
  UPDATE public.rooms
  SET state = jsonb_set(
        jsonb_set(state, '{currentEquationState,claimedByPlayerId}', to_jsonb(p_player_id)),
        '{gamePhase}', '"ANSWERING"'
      ),
      version = version + 1,
      updated_at = now()
  WHERE room_code = p_room_code
  RETURNING * INTO v_room;

  RETURN jsonb_build_object(
    'success', true,
    'claimedBy', p_player_id,
    'version', v_room.version
  );
END;
$$;

-- Function: Atomically update room state with optimistic lock
CREATE OR REPLACE FUNCTION public.sync_room_state(
  p_room_code TEXT,
  p_new_state JSONB,
  p_expected_version INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_room RECORD;
BEGIN
  SELECT * INTO v_room FROM public.rooms WHERE room_code = p_room_code FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Room not found');
  END IF;

  -- If version mismatch provided, check conflict
  IF p_expected_version IS NOT NULL AND p_expected_version > 0 AND v_room.version <> p_expected_version THEN
    RETURN jsonb_build_object(
      'success', false,
      'conflict', true,
      'error', 'State conflict: ห้องได้รับการอัปเดตจากผู้เล่นอื่นไปแล้ว',
      'currentVersion', v_room.version,
      'currentState', v_room.state
    );
  END IF;

  UPDATE public.rooms
  SET state = p_new_state,
      status = COALESCE(p_new_state->>'gamePhase', v_room.status),
      players = COALESCE(p_new_state->'players', v_room.players),
      version = v_room.version + 1,
      updated_at = now()
  WHERE room_code = p_room_code
  RETURNING * INTO v_room;

  RETURN jsonb_build_object(
    'success', true,
    'version', v_room.version,
    'state', v_room.state
  );
END;
$$;
