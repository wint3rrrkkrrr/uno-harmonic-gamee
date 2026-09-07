# ∿ HARMONIC — Simple Harmonic Motion Card Game

เกมการ์ดสไตล์ UNO ผสมผสานหลักการฟิสิกส์เรื่อง **การเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย (Simple Harmonic Motion: SHM)** สามารถเล่นออนไลน์แข่งขันกับเพื่อน (2–6 คน) ผ่านระบบห้อง (Room Code) หรือเล่นออฟไลน์ฝึกสมองกับบอท AI

---

## 🚀 การ Deploy ขึ้น Netlify

โปรเจกต์นี้รองรับการ Build และ Deploy ขึ้น **Netlify** ได้อย่างง่ายดาย

### 1. Build Settings บน Netlify
- **Base directory:** `.` (หรือเว้นว่าง)
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 2. การตั้งค่า Environment Variables บน Netlify
ไปที่ Netlify Dashboard > **Site configuration** > **Environment variables** และเพิ่ม 2 ค่านี้:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

*หมายเหตุ: ระบบมีไฟล์ `public/_redirects` และ `netlify.toml` รองรับ Single Page Application (SPA) routing เรียบร้อยแล้ว (`/* /index.html 200`)*

---

## 🗄️ การตั้งค่า Supabase Backend & Database

เกมใช้ **Supabase Realtime** และ **Postgres Database** ในการเชื่อมต่อห้องและซิงค์สถานะการเล่นแบบ Multiplayer แบบ Real-time

### ขั้นตอนการตั้งค่า:
1. เข้าไปที่ [Supabase Console](https://supabase.com) แล้วสร้างโปรเจกต์ใหม่
2. ไปที่เมนู **SQL Editor** แล้วคลิก **New query**
3. คัดลอกโค้ด SQL จากไฟล์ `supabase_schema.sql` (อยู่ในโปรเจกต์) ไปวาง แล้วกด **RUN**
4. ไปที่ **Project Settings** > **API** เพื่อคัดลอก:
   - **Project URL** -> นำไปใส่ใน `VITE_SUPABASE_URL`
   - **Project API Keys (anon / public)** -> นำไปใส่ใน `VITE_SUPABASE_ANON_KEY`
   *(ห้ามใช้ Service Role Key บน Frontend โดยเด็ดขาด)*

### ความสามารถของ Schema (`supabase_schema.sql`):
- ตาราง `rooms` พร้อมระบบ Row Level Security (RLS)
- Stored Procedure `sync_room_state` ตรวจสอบ Version Concurrency ป้องกัน Race Condition
- Stored Procedure `claim_equation_answer` ล็อกการกดแย่งตอบโจทย์ (Buzzer) แบบ Atomic ป้องกันผู้เล่นหลายคนแย่งตอบพร้อมกัน

---

## 🎮 กติกาการเล่นเกม (Game Rules)

### กติกาพื้นฐาน (UNO Style)
- แจกไพ่เริ่มต้นคนละ 7 ใบ ไพ่ใบแรกเปิดวางบนกองทิ้ง
- ผู้เล่นต้องลงไพ่ที่มี **สีเดียวกัน** หรือ **ตัวเลข/สัญลักษณ์เดียวกัน** กับไพ่ใบบนสุดของกองทิ้ง
- หากไม่มีไพ่ที่ลงได้ ต้องกด **จั่วไพ่ 1 ใบ** (หากจั่วได้ไพ่ที่ลงได้ สามารถเลือกลงได้ทันที)
- **ไพ่พิเศษ:**
  - `+2 (ENERGY LOSS)`: ผู้เล่นคนถัดไปต้องจั่ว 2 ใบ และข้ามตาเล่น
  - `SKIP (EQUILIBRIUM STOP)`: ข้ามตาผู้เล่นคนถัดไป
  - `REVERSE (INVERSION)`: สลับทิศทางการวนรอบโต๊ะ (ตามเข็ม ↻ / ทวนเข็ม ↺)
  - `WILD (FREE PHASE)`: ลงได้ทุกเมื่อ และมีสิทธิ์เลือกเปลี่ยนสีนำ
  - `E (โจทย์ฟิสิกส์ SHM)`: เปิดการประลองคำนวณฟิสิกส์ SHM!
- **การประกาศ HARMONIC!**:
  - เมื่อเหลือไพ่ 1–2 ใบในมือ ต้องกดปุ่ม **"∿ ประกาศ HARMONIC!"**
  - หากเหลือ 1 ใบแล้วลืมประกาศ ผู้เล่นคนอื่นสามารถกดปุ่ม **"🚨 จับได้!"** เพื่อปรับให้จั่วเพิ่ม 2 ใบ

### ระบบโจทย์ฟิสิกส์ SHM (Equation Challenge)
เมื่อมีผู้เล่นลงไพ่ `E (EQUATION)`:
1. **สุ่มโจทย์ฟิสิกส์ SHM** พร้อมสุ่มระบุผู้เล่นที่ต้องนำการ์ดตัวเลขสีที่ตรงกันมาเติมค่าลงในแต่ละตัวแปร
2. **การนับถอยหลังแย่งตอบ:**
   เมื่อเติมตัวแปรครบแล้ว ระบบจะนับถอยหลังตามความยาก:
   - **EASY (ง่าย):** 10 วินาที
   - **MEDIUM (ปานกลาง):** 20 วินาที
   - **HARD (ยาก):** 30 วินาที
3. **การแย่งตอบ (THE ANSWER IS!):**
   - ผู้เล่นที่กดปุ่มแย่งตอบได้คนแรก จะมีสิทธิ์พิมพ์คำตอบพร้อมหน่วย
   - **หากตอบถูก:** ได้สิทธิ์ทิ้งไพ่ใบใดก็ได้ในมือ 1 ใบฟรี!
   - **หากตอบผิด:** ถูกตัดสิทธิ์ในโจทย์นี้ และเปิดโอกาสให้ผู้เล่นอื่นแย่งตอบต่อ
   - **หากหมดเวลา:** โจทย์จะถูกทิ้งและเกมดำเนินต่อตามปกติ

---

## 🛠️ สแต็คเทคโนโลยี
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Animation:** `motion/react`
- **Backend & Realtime:** Supabase (`@supabase/supabase-js`)
- **Effects:** Canvas Confetti + Web Audio API Synthesizer
