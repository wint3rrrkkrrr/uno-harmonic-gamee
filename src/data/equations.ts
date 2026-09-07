import { EquationCard } from '../types/game';

// Helper for rounding to 2 decimal places
const r2 = (n: number) => Math.round(n * 100) / 100;

export const EQUATION_CARDS_DATA: EquationCard[] = [
  // ================= EASY (E01 - E07) =================
  {
    id: 'eq-e01',
    code: 'E01',
    difficulty: 'EASY',
    title: 'Period from Frequency',
    formula: 'f = 1/T',
    targetVariable: 'T',
    targetUnit: 's',
    promptText: 'จงหาคาบการแกว่ง (T)',
    blanks: [
      {
        id: 'e01-f',
        variable: 'f',
        nameTh: 'ความถี่ (Frequency)',
        unit: 'Hz',
        color: 'BLUE',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const fRaw = inputs['f'] ?? 1;
      const f = fRaw === 0 ? 10 : fRaw; // treat 0 as 10 to prevent div by 0
      const T = 1 / f;
      const tRounded = r2(T);
      const is0Special = fRaw === 0;

      const answers = [
        String(tRounded),
        `${f}/1`,
        `1/${f}`,
        `${tRounded} s`,
        `${tRounded}s`,
        `1/${f} s`,
        `1/${f}s`,
      ];
      if (T === 0.5) answers.push('0.5', '1/2', '0.50');
      if (T === 0.25) answers.push('0.25', '1/4');
      if (T === 0.2) answers.push('0.2', '1/5');
      if (T === 0.1) answers.push('0.1', '1/10');

      return {
        numericValue: tRounded,
        acceptableAnswers: answers,
        displayAnswer: `T = 1/${f} = ${tRounded} s`,
        explanationSteps: [
          `สูตร: f = 1/T ⟹ T = 1/f`,
          `แทนค่า f = ${f} Hz${is0Special ? ' (ไพ่ 0 มีค่าเท่ากับ 10 Hz)' : ''}`,
          `T = 1 / ${f}`,
          `T = ${tRounded} s (หรือ 1/${f} s)`,
        ],
      };
    },
  },
  {
    id: 'eq-e02',
    code: 'E02',
    difficulty: 'EASY',
    title: 'Frequency from Period',
    formula: 'f = 1/T',
    targetVariable: 'f',
    targetUnit: 'Hz',
    promptText: 'จงหาความถี่ (f)',
    blanks: [
      {
        id: 'e02-T',
        variable: 'T',
        nameTh: 'คาบ (Period)',
        unit: 's',
        color: 'YELLOW',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const TRaw = inputs['T'] ?? 1;
      const T = TRaw === 0 ? 10 : TRaw;
      const f = 1 / T;
      const fRounded = r2(f);
      const is0Special = TRaw === 0;

      const answers = [
        String(fRounded),
        `1/${T}`,
        `${fRounded} Hz`,
        `${fRounded}hz`,
        `1/${T} Hz`,
      ];
      if (f === 0.5) answers.push('0.5', '1/2');
      if (f === 0.25) answers.push('0.25', '1/4');
      if (f === 0.2) answers.push('0.2', '1/5');
      if (f === 0.1) answers.push('0.1', '1/10');

      return {
        numericValue: fRounded,
        acceptableAnswers: answers,
        displayAnswer: `f = 1/${T} = ${fRounded} Hz`,
        explanationSteps: [
          `สูตร: f = 1/T`,
          `แทนค่า T = ${T} s${is0Special ? ' (ไพ่ 0 มีค่าเท่ากับ 10 s)' : ''}`,
          `f = 1 / ${T}`,
          `f = ${fRounded} Hz (หรือ 1/${T} Hz)`,
        ],
      };
    },
  },
  {
    id: 'eq-e03',
    code: 'E03',
    difficulty: 'EASY',
    title: 'Cycles Count in Time t=5s',
    formula: 'N = f · t',
    targetVariable: 'N',
    targetUnit: 'รอบ',
    promptText: 'จงหาจำนวนรอบการสั่น (N) เมื่อเวลา t = 5 s',
    fixedConstants: { t: 5 },
    blanks: [
      {
        id: 'e03-f',
        variable: 'f',
        nameTh: 'ความถี่ (Frequency)',
        unit: 'Hz',
        color: 'BLUE',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const f = inputs['f'] ?? 0;
      const t = 5;
      const N = f * t;

      return {
        numericValue: N,
        acceptableAnswers: [String(N), `${N} รอบ`, `${N} cycles`, `${N}รอบ`],
        displayAnswer: `N = ${N} รอบ`,
        explanationSteps: [
          `สูตร: N = f · t`,
          `โจทย์กำหนดให้: f = ${f} Hz, t = 5 s`,
          `N = ${f} × 5`,
          `N = ${N} รอบ`,
        ],
      };
    },
  },
  {
    id: 'eq-e04',
    code: 'E04',
    difficulty: 'EASY',
    title: 'Angular Frequency from Frequency',
    formula: 'ω = 2πf',
    targetVariable: 'ω',
    targetUnit: 'rad/s',
    promptText: 'จงหาความถี่เชิงมุม (ω)',
    blanks: [
      {
        id: 'e04-f',
        variable: 'f',
        nameTh: 'ความถี่ (Frequency)',
        unit: 'Hz',
        color: 'BLUE',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const f = inputs['f'] ?? 0;
      const piVal = 2 * f;
      const numVal = r2(2 * Math.PI * f);

      const acceptable = [
        String(numVal),
        `${piVal}pi`,
        `${piVal}*pi`,
        `${piVal} π`,
        `${piVal}π`,
        `${numVal} rad/s`,
        `${piVal}pi rad/s`,
        `${piVal}π rad/s`,
      ];
      if (f === 0) acceptable.push('0');

      return {
        numericValue: numVal,
        acceptableAnswers: acceptable,
        displayAnswer: `ω = ${piVal}π ≈ ${numVal} rad/s`,
        explanationSteps: [
          `สูตร: ω = 2πf`,
          `โจทย์กำหนดให้: f = ${f} Hz`,
          `ω = 2 × π × ${f} = ${piVal}π rad/s`,
          `ω ≈ ${numVal} rad/s (ตอบในรูปติด π หรือทศนิยมได้)`,
        ],
      };
    },
  },
  {
    id: 'eq-e05',
    code: 'E05',
    difficulty: 'EASY',
    title: 'Total Tip-to-Tip Distance',
    formula: 'd = 2A',
    targetVariable: 'd',
    targetUnit: 'cm',
    promptText: 'จงหาระยะทางระหว่างตำแหน่งปลายสุดทั้งสอง (d)',
    blanks: [
      {
        id: 'e05-A',
        variable: 'A',
        nameTh: 'แอมพลิจูด (Amplitude)',
        unit: 'cm',
        color: 'RED',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const A = inputs['A'] ?? 0;
      const d = 2 * A;
      return {
        numericValue: d,
        acceptableAnswers: [String(d), `${d} cm`, `${d}cm`],
        displayAnswer: `d = ${d} cm`,
        explanationSteps: [
          `สูตร: d = 2A (ระยะห่างระหว่างจุดปลายสุดซ้ายถึงขวา)`,
          `โจทย์กำหนดให้: A = ${A} cm`,
          `d = 2 × ${A}`,
          `d = ${d} cm`,
        ],
      };
    },
  },
  {
    id: 'eq-e06',
    code: 'E06',
    difficulty: 'EASY',
    title: 'Maximum Velocity with A=2m',
    formula: 'vmax = ωA',
    targetVariable: 'vmax',
    targetUnit: 'm/s',
    promptText: 'จงหาความเร็วสูงสุด (vmax) เมื่อ A = 2 m',
    fixedConstants: { A: 2 },
    blanks: [
      {
        id: 'e06-omega',
        variable: 'ω',
        nameTh: 'ความถี่เชิงมุม (ω)',
        unit: 'rad/s',
        color: 'BLUE',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const omega = inputs['ω'] ?? 0;
      const vmax = omega * 2;
      return {
        numericValue: vmax,
        acceptableAnswers: [String(vmax), `${vmax} m/s`, `${vmax}m/s`],
        displayAnswer: `vmax = ${vmax} m/s`,
        explanationSteps: [
          `สูตร: vmax = ωA`,
          `โจทย์กำหนดให้: ω = ${omega} rad/s, A = 2 m`,
          `vmax = ${omega} × 2`,
          `vmax = ${vmax} m/s`,
        ],
      };
    },
  },
  {
    id: 'eq-e07',
    code: 'E07',
    difficulty: 'EASY',
    title: 'Maximum Acceleration with A=2m',
    formula: 'amax = ω²A',
    targetVariable: 'amax',
    targetUnit: 'm/s²',
    promptText: 'จงหาความเร่งสูงสุด (amax) เมื่อ A = 2 m',
    fixedConstants: { A: 2 },
    blanks: [
      {
        id: 'e07-omega',
        variable: 'ω',
        nameTh: 'ความถี่เชิงมุม (ω)',
        unit: 'rad/s',
        color: 'BLUE',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const omega = inputs['ω'] ?? 0;
      const amax = omega * omega * 2;
      return {
        numericValue: amax,
        acceptableAnswers: [String(amax), `${amax} m/s²`, `${amax} m/s^2`, `${amax}m/s²`],
        displayAnswer: `amax = ${amax} m/s²`,
        explanationSteps: [
          `สูตร: amax = ω²A`,
          `โจทย์กำหนดให้: ω = ${omega} rad/s, A = 2 m`,
          `amax = (${omega})² × 2 = ${omega * omega} × 2`,
          `amax = ${amax} m/s²`,
        ],
      };
    },
  },

  // ================= MEDIUM (M01 - M07) =================
  {
    id: 'eq-m01',
    code: 'M01',
    difficulty: 'MEDIUM',
    title: 'Cycles Count N = f·t',
    formula: 'N = f · t',
    targetVariable: 'N',
    targetUnit: 'รอบ',
    promptText: 'จงหาจำนวนรอบการสั่น (N)',
    blanks: [
      {
        id: 'm01-f',
        variable: 'f',
        nameTh: 'ความถี่ (Frequency)',
        unit: 'Hz',
        color: 'BLUE',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'm01-t',
        variable: 't',
        nameTh: 'เวลา (Time)',
        unit: 's',
        color: 'GREEN',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const f = inputs['f'] ?? 0;
      const t = inputs['t'] ?? 0;
      const N = f * t;
      return {
        numericValue: N,
        acceptableAnswers: [String(N), `${N} รอบ`, `${N} cycles`],
        displayAnswer: `N = ${N} รอบ`,
        explanationSteps: [
          `สูตร: N = f · t`,
          `โจทย์กำหนดให้: f = ${f} Hz, t = ${t} s`,
          `N = ${f} × ${t}`,
          `N = ${N} รอบ`,
        ],
      };
    },
  },
  {
    id: 'eq-m02',
    code: 'M02',
    difficulty: 'MEDIUM',
    title: 'Maximum Velocity vmax = ωA',
    formula: 'vmax = ωA',
    targetVariable: 'vmax',
    targetUnit: 'm/s',
    promptText: 'จงหาความเร็วสูงสุด (vmax)',
    blanks: [
      {
        id: 'm02-omega',
        variable: 'ω',
        nameTh: 'ความถี่เชิงมุม (ω)',
        unit: 'rad/s',
        color: 'BLUE',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'm02-A',
        variable: 'A',
        nameTh: 'แอมพลิจูด (A)',
        unit: 'm',
        color: 'RED',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const omega = inputs['ω'] ?? 0;
      const A = inputs['A'] ?? 0;
      const vmax = omega * A;
      return {
        numericValue: vmax,
        acceptableAnswers: [String(vmax), `${vmax} m/s`, `${vmax}m/s`],
        displayAnswer: `vmax = ${vmax} m/s`,
        explanationSteps: [
          `สูตร: vmax = ωA`,
          `โจทย์กำหนดให้: ω = ${omega} rad/s, A = ${A} m`,
          `vmax = ${omega} × ${A}`,
          `vmax = ${vmax} m/s`,
        ],
      };
    },
  },
  {
    id: 'eq-m03',
    code: 'M03',
    difficulty: 'MEDIUM',
    title: 'Total Mechanical Energy E = 1/2 kA²',
    formula: 'E = 1/2 kA²',
    targetVariable: 'E',
    targetUnit: 'J',
    promptText: 'จงหาพลังงานกลรวม (E)',
    blanks: [
      {
        id: 'm03-k',
        variable: 'k',
        nameTh: 'ค่านิจสปริง (Spring Constant)',
        unit: 'N/m',
        color: 'GREEN',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'm03-A',
        variable: 'A',
        nameTh: 'แอมพลิจูด (A)',
        unit: 'm',
        color: 'RED',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const k = inputs['k'] ?? 0;
      const A = inputs['A'] ?? 0;
      const E = 0.5 * k * A * A;
      const rounded = r2(E);
      const frac = `${k * A * A}/2`;
      return {
        numericValue: rounded,
        acceptableAnswers: [String(rounded), frac, `${rounded} J`, `${rounded}J`],
        displayAnswer: `E = ${rounded} J`,
        explanationSteps: [
          `สูตร: E = 1/2 kA²`,
          `โจทย์กำหนดให้: k = ${k} N/m, A = ${A} m`,
          `E = 0.5 × ${k} × (${A})² = 0.5 × ${k} × ${A * A}`,
          `E = ${rounded} J`,
        ],
      };
    },
  },
  {
    id: 'eq-m04',
    code: 'M04',
    difficulty: 'MEDIUM',
    title: 'Maximum Acceleration amax = ω²A',
    formula: 'amax = ω²A',
    targetVariable: 'amax',
    targetUnit: 'm/s²',
    promptText: 'จงหาความเร่งสูงสุด (amax)',
    blanks: [
      {
        id: 'm04-omega',
        variable: 'ω',
        nameTh: 'ความถี่เชิงมุม (ω)',
        unit: 'rad/s',
        color: 'BLUE',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'm04-A',
        variable: 'A',
        nameTh: 'แอมพลิจูด (A)',
        unit: 'm',
        color: 'RED',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const omega = inputs['ω'] ?? 0;
      const A = inputs['A'] ?? 0;
      const amax = omega * omega * A;
      return {
        numericValue: amax,
        acceptableAnswers: [String(amax), `${amax} m/s²`, `${amax} m/s^2`],
        displayAnswer: `amax = ${amax} m/s²`,
        explanationSteps: [
          `สูตร: amax = ω²A`,
          `โจทย์กำหนดให้: ω = ${omega} rad/s, A = ${A} m`,
          `amax = (${omega})² × ${A} = ${omega * omega} × ${A}`,
          `amax = ${amax} m/s²`,
        ],
      };
    },
  },
  {
    id: 'eq-m05',
    code: 'M05',
    difficulty: 'MEDIUM',
    title: 'Angular Frequency from Frequency',
    formula: 'ω = 2πf',
    targetVariable: 'ω',
    targetUnit: 'rad/s',
    promptText: 'จงหาความถี่เชิงมุม (ω)',
    blanks: [
      {
        id: 'm05-f',
        variable: 'f',
        nameTh: 'ความถี่ (Frequency)',
        unit: 'Hz',
        color: 'BLUE',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const f = inputs['f'] ?? 0;
      const piVal = 2 * f;
      const numVal = r2(2 * Math.PI * f);
      return {
        numericValue: numVal,
        acceptableAnswers: [
          String(numVal),
          `${piVal}pi`,
          `${piVal}*pi`,
          `${piVal} π`,
          `${piVal}π`,
          `${numVal} rad/s`,
        ],
        displayAnswer: `ω = ${piVal}π ≈ ${numVal} rad/s`,
        explanationSteps: [
          `สูตร: ω = 2πf`,
          `โจทย์กำหนดให้: f = ${f} Hz`,
          `ω = 2 × π × ${f} = ${piVal}π rad/s`,
          `ω ≈ ${numVal} rad/s`,
        ],
      };
    },
  },
  {
    id: 'eq-m06',
    code: 'M06',
    difficulty: 'MEDIUM',
    title: 'Period of Mass-Spring System',
    formula: 'T = 2π√(m/k)',
    targetVariable: 'T',
    targetUnit: 's',
    promptText: 'จงหาคาบการสั่น (T)',
    blanks: [
      {
        id: 'm06-m',
        variable: 'm',
        nameTh: 'มวล (Mass)',
        unit: 'kg',
        color: 'YELLOW',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'm06-k',
        variable: 'k',
        nameTh: 'ค่านิจสปริง (Spring Constant)',
        unit: 'N/m',
        color: 'GREEN',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const m = inputs['m'] ?? 1;
      const kRaw = inputs['k'] ?? 1;
      const k = kRaw === 0 ? 10 : kRaw;
      const ratio = m / k;
      const sqrtVal = Math.sqrt(ratio);
      const T = 2 * Math.PI * sqrtVal;
      const rounded = r2(T);
      const piMultiplier = r2(2 * sqrtVal);

      const acceptable = [
        String(rounded),
        `${piMultiplier}pi`,
        `${piMultiplier}π`,
        `${rounded} s`,
        `${rounded}s`,
      ];
      return {
        numericValue: rounded,
        acceptableAnswers: acceptable,
        displayAnswer: `T = ${piMultiplier}π ≈ ${rounded} s`,
        explanationSteps: [
          `สูตร: T = 2π√(m/k)`,
          `โจทย์กำหนดให้: m = ${m} kg, k = ${k} N/m${kRaw === 0 ? ' (ไพ่ 0 = 10 N/m)' : ''}`,
          `√(m/k) = √(${m}/${k}) = √(${r2(ratio)}) ≈ ${r2(sqrtVal)}`,
          `T = 2 × π × ${r2(sqrtVal)} ≈ ${rounded} s (หรือ ${piMultiplier}π s)`,
        ],
      };
    },
  },
  {
    id: 'eq-m07',
    code: 'M07',
    difficulty: 'MEDIUM',
    title: 'Maximum Velocity vmax = A√(k/m)',
    formula: 'vmax = A√(k/m)',
    targetVariable: 'vmax',
    targetUnit: 'm/s',
    promptText: 'จงหาความเร็วสูงสุด (vmax)',
    blanks: [
      {
        id: 'm07-A',
        variable: 'A',
        nameTh: 'แอมพลิจูด (Amplitude)',
        unit: 'm',
        color: 'RED',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'm07-k',
        variable: 'k',
        nameTh: 'ค่านิจสปริง (Spring Constant)',
        unit: 'N/m',
        color: 'GREEN',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'm07-m',
        variable: 'm',
        nameTh: 'มวล (Mass)',
        unit: 'kg',
        color: 'YELLOW',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const A = inputs['A'] ?? 1;
      const k = inputs['k'] ?? 1;
      const mRaw = inputs['m'] ?? 1;
      const m = mRaw === 0 ? 10 : mRaw;
      const omega = Math.sqrt(k / m);
      const vmax = A * omega;
      const rounded = r2(vmax);

      return {
        numericValue: rounded,
        acceptableAnswers: [String(rounded), `${rounded} m/s`],
        displayAnswer: `vmax = ${rounded} m/s`,
        explanationSteps: [
          `สูตร: vmax = A · √(k/m)`,
          `โจทย์กำหนดให้: A = ${A} m, k = ${k} N/m, m = ${m} kg${mRaw === 0 ? ' (ไพ่ 0 = 10 kg)' : ''}`,
          `ω = √(k/m) = √(${k}/${m}) ≈ ${r2(omega)} rad/s`,
          `vmax = ${A} × ${r2(omega)} ≈ ${rounded} m/s`,
        ],
      };
    },
  },

  // ================= HARD (H01 - H07) =================
  {
    id: 'eq-h01',
    code: 'H01',
    difficulty: 'HARD',
    title: 'Angular Frequency from Spring',
    formula: 'ω = √(k/m)',
    targetVariable: 'ω',
    targetUnit: 'rad/s',
    promptText: 'จงหาความถี่เชิงมุม (ω)',
    blanks: [
      {
        id: 'h01-k',
        variable: 'k',
        nameTh: 'ค่านิจสปริง (Spring Constant)',
        unit: 'N/m',
        color: 'GREEN',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'h01-m',
        variable: 'm',
        nameTh: 'มวล (Mass)',
        unit: 'kg',
        color: 'YELLOW',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const k = inputs['k'] ?? 1;
      const mRaw = inputs['m'] ?? 1;
      const m = mRaw === 0 ? 10 : mRaw;
      const val = Math.sqrt(k / m);
      const rounded = r2(val);
      return {
        numericValue: rounded,
        acceptableAnswers: [String(rounded), `${rounded} rad/s`],
        displayAnswer: `ω = ${rounded} rad/s`,
        explanationSteps: [
          `สูตร: ω = √(k/m)`,
          `แทนค่า k = ${k} N/m, m = ${m} kg${mRaw === 0 ? ' (ไพ่ 0 = 10 kg)' : ''}`,
          `ω = √(${k}/${m}) = √(${r2(k / m)})`,
          `ω ≈ ${rounded} rad/s`,
        ],
      };
    },
  },
  {
    id: 'eq-h02',
    code: 'H02',
    difficulty: 'HARD',
    title: 'Period of Mass-Spring System',
    formula: 'T = 2π√(m/k)',
    targetVariable: 'T',
    targetUnit: 's',
    promptText: 'จงหาคาบการสั่น (T)',
    blanks: [
      {
        id: 'h02-m',
        variable: 'm',
        nameTh: 'มวล (Mass)',
        unit: 'kg',
        color: 'YELLOW',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'h02-k',
        variable: 'k',
        nameTh: 'ค่านิจสปริง (Spring Constant)',
        unit: 'N/m',
        color: 'GREEN',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const m = inputs['m'] ?? 1;
      const kRaw = inputs['k'] ?? 1;
      const k = kRaw === 0 ? 10 : kRaw;
      const sqrtVal = Math.sqrt(m / k);
      const T = 2 * Math.PI * sqrtVal;
      const rounded = r2(T);
      const piMult = r2(2 * sqrtVal);

      return {
        numericValue: rounded,
        acceptableAnswers: [
          String(rounded),
          `${piMult}pi`,
          `${piMult}π`,
          `${rounded} s`,
        ],
        displayAnswer: `T = ${piMult}π ≈ ${rounded} s`,
        explanationSteps: [
          `สูตร: T = 2π√(m/k)`,
          `แทนค่า m = ${m} kg, k = ${k} N/m${kRaw === 0 ? ' (ไพ่ 0 = 10 N/m)' : ''}`,
          `T = 2π √(${m}/${k}) = 2π × ${r2(sqrtVal)}`,
          `T ≈ ${rounded} s (หรือ ${piMult}π s)`,
        ],
      };
    },
  },
  {
    id: 'eq-h03',
    code: 'H03',
    difficulty: 'HARD',
    title: 'Maximum Velocity vmax = A√(k/m)',
    formula: 'vmax = A√(k/m)',
    targetVariable: 'vmax',
    targetUnit: 'm/s',
    promptText: 'จงหาความเร็วสูงสุด (vmax)',
    blanks: [
      {
        id: 'h03-A',
        variable: 'A',
        nameTh: 'แอมพลิจูด (A)',
        unit: 'm',
        color: 'RED',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'h03-k',
        variable: 'k',
        nameTh: 'ค่านิจสปริง (k)',
        unit: 'N/m',
        color: 'GREEN',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'h03-m',
        variable: 'm',
        nameTh: 'มวล (m)',
        unit: 'kg',
        color: 'YELLOW',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const A = inputs['A'] ?? 1;
      const k = inputs['k'] ?? 1;
      const mRaw = inputs['m'] ?? 1;
      const m = mRaw === 0 ? 10 : mRaw;
      const omega = Math.sqrt(k / m);
      const vmax = A * omega;
      const rounded = r2(vmax);
      return {
        numericValue: rounded,
        acceptableAnswers: [String(rounded), `${rounded} m/s`],
        displayAnswer: `vmax = ${rounded} m/s`,
        explanationSteps: [
          `สูตร: vmax = A√(k/m)`,
          `แทนค่า A = ${A} m, k = ${k} N/m, m = ${m} kg${mRaw === 0 ? ' (ไพ่ 0 = 10 kg)' : ''}`,
          `ω = √(${k}/${m}) ≈ ${r2(omega)} rad/s`,
          `vmax = ${A} × ${r2(omega)} ≈ ${rounded} m/s`,
        ],
      };
    },
  },
  {
    id: 'eq-h04',
    code: 'H04',
    difficulty: 'HARD',
    title: 'Maximum Acceleration amax = (k/m)A',
    formula: 'amax = (k/m)A',
    targetVariable: 'amax',
    targetUnit: 'm/s²',
    promptText: 'จงหาความเร่งสูงสุด (amax)',
    blanks: [
      {
        id: 'h04-k',
        variable: 'k',
        nameTh: 'ค่านิจสปริง (k)',
        unit: 'N/m',
        color: 'GREEN',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'h04-m',
        variable: 'm',
        nameTh: 'มวล (m)',
        unit: 'kg',
        color: 'YELLOW',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'h04-A',
        variable: 'A',
        nameTh: 'แอมพลิจูด (A)',
        unit: 'm',
        color: 'RED',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const k = inputs['k'] ?? 1;
      const mRaw = inputs['m'] ?? 1;
      const m = mRaw === 0 ? 10 : mRaw;
      const A = inputs['A'] ?? 1;
      const amax = (k / m) * A;
      const rounded = r2(amax);
      return {
        numericValue: rounded,
        acceptableAnswers: [
          String(rounded),
          `${k * A}/${m}`,
          `${rounded} m/s²`,
          `${rounded} m/s^2`,
        ],
        displayAnswer: `amax = ${rounded} m/s²`,
        explanationSteps: [
          `สูตร: amax = (k/m) · A`,
          `แทนค่า k = ${k} N/m, m = ${m} kg, A = ${A} m${mRaw === 0 ? ' (ไพ่ 0 = 10 kg)' : ''}`,
          `amax = (${k}/${m}) × ${A} = ${k * A} / ${m}`,
          `amax = ${rounded} m/s²`,
        ],
      };
    },
  },
  {
    id: 'eq-h05',
    code: 'H05',
    difficulty: 'HARD',
    title: 'Total Mechanical Energy E = 1/2 kA²',
    formula: 'E = 1/2 kA²',
    targetVariable: 'E',
    targetUnit: 'J',
    promptText: 'จงหาพลังงานกลรวม (E)',
    blanks: [
      {
        id: 'h05-k',
        variable: 'k',
        nameTh: 'ค่านิจสปริง (k)',
        unit: 'N/m',
        color: 'GREEN',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'h05-A',
        variable: 'A',
        nameTh: 'แอมพลิจูด (A)',
        unit: 'm',
        color: 'RED',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const k = inputs['k'] ?? 0;
      const A = inputs['A'] ?? 0;
      const E = 0.5 * k * A * A;
      const rounded = r2(E);
      return {
        numericValue: rounded,
        acceptableAnswers: [String(rounded), `${k * A * A}/2`, `${rounded} J`],
        displayAnswer: `E = ${rounded} J`,
        explanationSteps: [
          `สูตร: E = 1/2 kA²`,
          `แทนค่า k = ${k} N/m, A = ${A} m`,
          `E = 0.5 × ${k} × (${A})² = 0.5 × ${k} × ${A * A}`,
          `E = ${rounded} J`,
        ],
      };
    },
  },
  {
    id: 'eq-h06',
    code: 'H06',
    difficulty: 'HARD',
    title: 'Period of Mass-Spring System',
    formula: 'T = 2π√(m/k)',
    targetVariable: 'T',
    targetUnit: 's',
    promptText: 'จงหาคาบการสั่น (T)',
    blanks: [
      {
        id: 'h06-m',
        variable: 'm',
        nameTh: 'มวล (m)',
        unit: 'kg',
        color: 'YELLOW',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'h06-k',
        variable: 'k',
        nameTh: 'ค่านิจสปริง (k)',
        unit: 'N/m',
        color: 'GREEN',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const m = inputs['m'] ?? 1;
      const kRaw = inputs['k'] ?? 1;
      const k = kRaw === 0 ? 10 : kRaw;
      const sqrtVal = Math.sqrt(m / k);
      const T = 2 * Math.PI * sqrtVal;
      const rounded = r2(T);
      const piMult = r2(2 * sqrtVal);

      return {
        numericValue: rounded,
        acceptableAnswers: [
          String(rounded),
          `${piMult}pi`,
          `${piMult}π`,
          `${rounded} s`,
        ],
        displayAnswer: `T = ${piMult}π ≈ ${rounded} s`,
        explanationSteps: [
          `สูตร: T = 2π√(m/k)`,
          `แทนค่า m = ${m} kg, k = ${k} N/m${kRaw === 0 ? ' (ไพ่ 0 = 10 N/m)' : ''}`,
          `T = 2π √(${m}/${k}) = 2π × ${r2(sqrtVal)}`,
          `T ≈ ${rounded} s (หรือ ${piMult}π s)`,
        ],
      };
    },
  },
  {
    id: 'eq-h07',
    code: 'H07',
    difficulty: 'HARD',
    title: 'Instantaneous Acceleration a = -ω²x',
    formula: 'a = -ω²x',
    targetVariable: 'a',
    targetUnit: 'm/s²',
    promptText: 'จงหาความเร่งที่ตำแหน่ง x (a)',
    blanks: [
      {
        id: 'h07-omega',
        variable: 'ω',
        nameTh: 'ความถี่เชิงมุม (ω)',
        unit: 'rad/s',
        color: 'BLUE',
        assignedPlayerId: null,
        filledValue: null,
      },
      {
        id: 'h07-x',
        variable: 'x',
        nameTh: 'การกระจัด (Displacement)',
        unit: 'm',
        color: 'RED',
        assignedPlayerId: null,
        filledValue: null,
      },
    ],
    calculateAnswer: (inputs) => {
      const omega = inputs['ω'] ?? 0;
      const x = inputs['x'] ?? 0;
      const a = -omega * omega * x;
      return {
        numericValue: a,
        acceptableAnswers: [
          String(a),
          `${a} m/s²`,
          `${a} m/s^2`,
          String(Math.abs(a)), // also allow magnitude if user forgot minus
        ],
        displayAnswer: `a = ${a} m/s²`,
        explanationSteps: [
          `สูตร: a = -ω²x (เครื่องหมายลบแสดงว่าความเร่งมีทิศเข้าสู่ตำแหน่งสมดุลเสมอ)`,
          `แทนค่า ω = ${omega} rad/s, x = ${x} m`,
          `a = -(${omega})² × ${x} = -${omega * omega} × ${x}`,
          `a = ${a} m/s² (หรือขนาด |a| = ${Math.abs(a)} m/s²)`,
        ],
      };
    },
  },
];
