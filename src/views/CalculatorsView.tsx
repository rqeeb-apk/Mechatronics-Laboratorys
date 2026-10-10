import React, { useState } from 'react';
import {
  Calculator,
  Zap,
  Activity,
  Sliders,
  RotateCcw,
  TrendingUp,
  Cpu,
  ArrowRightLeft
} from 'lucide-react';

export const CalculatorsView: React.FC = () => {
  const [calcTab, setCalcTab] = useState<
    'ohm' | 'dividers' | 'equivalent' | 'rc_rl' | 'resonance' | 'timer555' | 'gear_motor' | 'units'
  >('ohm');

  // 1. Ohm's Law States
  const [ohmV, setOhmV] = useState<string>('12');
  const [ohmI, setOhmI] = useState<string>('');
  const [ohmR, setOhmR] = useState<string>('240');
  const [ohmP, setOhmP] = useState<string>('');

  // 2. Voltage Divider States
  const [vdivVin, setVdivVin] = useState<number>(12);
  const [vdivR1, setVdivR1] = useState<number>(1000); // 1k
  const [vdivR2, setVdivR2] = useState<number>(2000); // 2k

  // 3. Equivalent Impedance States
  const [eqType, setEqType] = useState<'series' | 'parallel'>('parallel');
  const [eqR1, setEqR1] = useState<number>(100);
  const [eqR2, setEqR2] = useState<number>(100);
  const [eqR3, setEqR3] = useState<number>(100);

  // 4. RC & RL Filters
  const [rcR, setRcR] = useState<number>(10000); // 10k
  const [rcC, setRcC] = useState<number>(100); // 100 nF

  // 5. Resonance LC
  const [resL, setResL] = useState<number>(10); // 10 mH
  const [resC, setResC] = useState<number>(100); // 100 nF

  // 6. 555 Timer Calculator
  const [t555R1, setT555R1] = useState<number>(10); // kOhm
  const [t555R2, setT555R2] = useState<number>(47); // kOhm
  const [t555C, setT555C] = useState<number>(10); // uF

  // 7. Unit Converter
  const [unitMode, setUnitMode] = useState<'rpm_rads' | 'torque_nm_ozin' | 'elec_prefix'>('rpm_rads');
  const [unitInputValue, setUnitInputValue] = useState<number>(1500);

  // Ohm calculations
  const calculateOhm = () => {
    const v = parseFloat(ohmV);
    const i = parseFloat(ohmI);
    const r = parseFloat(ohmR);
    const p = parseFloat(ohmP);

    if (!isNaN(v) && !isNaN(r) && r > 0) {
      const calcI = v / r;
      const calcP = v * calcI;
      return {
        formula: 'I = V / R و P = V × I',
        steps: [
          `التيار I = ${v}V / ${r}Ω = ${calcI.toFixed(4)} A (${(calcI * 1000).toFixed(2)} mA)`,
          `القدرة P = ${v}V × ${calcI.toFixed(4)}A = ${calcP.toFixed(3)} W (${(calcP * 1000).toFixed(1)} mW)`,
          `القدرة البديلة P = V² / R = (${v}²) / ${r} = ${calcP.toFixed(3)} W`
        ],
        i: calcI,
        p: calcP,
        v,
        r
      };
    }
    if (!isNaN(v) && !isNaN(i) && i > 0) {
      const calcR = v / i;
      const calcP = v * i;
      return {
        formula: 'R = V / I و P = V × I',
        steps: [
          `المقاومة R = ${v}V / ${i}A = ${calcR.toFixed(2)} Ω`,
          `القدرة P = ${v}V × ${i}A = ${calcP.toFixed(3)} W`
        ],
        r: calcR,
        p: calcP,
        v,
        i
      };
    }
    return null;
  };

  const ohmResult = calculateOhm();

  // Voltage Divider calculation
  const vdivSum = vdivR1 + vdivR2;
  const vdivVout = vdivSum > 0 ? vdivVin * (vdivR2 / vdivSum) : 0;
  const vdivCurrent = vdivSum > 0 ? (vdivVin / vdivSum) * 1000 : 0; // mA

  // Equivalent Resistors
  let eqResult = 0;
  if (eqType === 'series') {
    eqResult = eqR1 + eqR2 + eqR3;
  } else {
    const inv = (1 / Math.max(eqR1, 0.001)) + (1 / Math.max(eqR2, 0.001)) + (1 / Math.max(eqR3, 0.001));
    eqResult = 1 / inv;
  }

  // RC Filter calculation
  const rcTau = (rcR * (rcC * 1e-9)); // seconds
  const rcCutoffFc = rcTau > 0 ? 1 / (2 * Math.PI * rcTau) : 0; // Hz

  // Resonance LC calculation
  const resLC = (resL * 1e-3) * (resC * 1e-9);
  const resFreq = resLC > 0 ? 1 / (2 * Math.PI * Math.sqrt(resLC)) : 0;

  // 555 Timer Calculation
  const t555Freq = 1.44 / (((t555R1 * 1000) + 2 * (t555R2 * 1000)) * (t555C * 1e-6));
  const t555Period = t555Freq > 0 ? 1 / t555Freq : 0;
  const t555Duty = ((t555R1 + t555R2) / (t555R1 + 2 * t555R2)) * 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
            <Calculator className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">الحاسبات الهندسية والمحولات</h1>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Precision Mechatronics Solvers with Step-by-Step Derivations & Unit Validation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        {[
          { id: 'ohm', label: 'قانون أوم والقدرة (V, I, R, P)' },
          { id: 'dividers', label: 'مقسم الجهد (Voltage Divider)' },
          { id: 'equivalent', label: 'المقاومة المكافئة (Req)' },
          { id: 'rc_rl', label: 'ثابت الزمن وفلتر RC' },
          { id: 'resonance', label: 'التردد الرنيني LC Resonance' },
          { id: 'timer555', label: 'حاسبة المؤقت 555 Timer' },
          { id: 'units', label: 'محول الوحدات الهندسية' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCalcTab(tab.id as any)}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
              calcTab === tab.id
                ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-600/30'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OHM'S LAW */}
      {calcTab === 'ohm' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              مدخلات قانون أوم (أدخل أي قيمتين لحساب الباقي):
            </h3>

            <div>
              <label className="text-slate-400 block mb-1">الجهد الكهربائي V (Volts):</label>
              <input
                type="number"
                value={ohmV}
                onChange={(e) => setOhmV(e.target.value)}
                placeholder="مثال: 12"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">المقاومة الكهربائية R (Ohms Ω):</label>
              <input
                type="number"
                value={ohmR}
                onChange={(e) => setOhmR(e.target.value)}
                placeholder="مثال: 240"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">التيار الكهربائي I (Amperes):</label>
              <input
                type="number"
                value={ohmI}
                onChange={(e) => setOhmI(e.target.value)}
                placeholder="اتركه فارغاً للحساب الآلي"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <button
              onClick={() => { setOhmV('12'); setOhmR('240'); setOhmI(''); }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              استعادة قيم افتراضية
            </button>
          </div>

          {/* Results & Steps */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-amber-400">خطوات الحل التفصيلية والمعادلات:</h4>
            {ohmResult ? (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-cyan-300 text-center font-bold">
                  {ohmResult.formula}
                </div>
                <div className="space-y-2">
                  {ohmResult.steps.map((st, i) => (
                    <div key={i} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-slate-300 font-mono">
                      {st}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">أدخل قيمتين صالحين (أكبر من صفر) لعرض خطوات الحساب.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. VOLTAGE DIVIDER */}
      {calcTab === 'dividers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              مقسم الجهد بمقاومتين (Voltage Divider):
            </h3>

            <div>
              <label className="text-slate-400 block mb-1">جهد الدخل V_in (Volts):</label>
              <input
                type="number"
                value={vdivVin}
                onChange={(e) => setVdivVin(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">المقاومة الأولى R1 (Ohms Ω):</label>
              <input
                type="number"
                value={vdivR1}
                onChange={(e) => setVdivR1(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">المقاومة الثانية R2 (Ohms Ω):</label>
              <input
                type="number"
                value={vdivR2}
                onChange={(e) => setVdivR2(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 text-center">
            <div>
              <span className="text-xs text-slate-400 block">جهد الخرج المقسم V_out:</span>
              <span className="text-4xl font-mono font-black text-emerald-400 mt-2 block">
                {vdivVout.toFixed(3)} V
              </span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
              V_out = V_in × [ R2 / (R1 + R2) ] = {vdivVin} × [{vdivR2} / {vdivSum}]
            </div>

            <div className="text-xs font-mono text-slate-400">
              تيار السلسلة المار: {vdivCurrent.toFixed(2)} mA
            </div>
          </div>
        </div>
      )}

      {/* 3. EQUIVALENT RESISTORS */}
      {calcTab === 'equivalent' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              حساب المقاومة المكافئة (Series & Parallel):
            </h3>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setEqType('series')}
                className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                  eqType === 'series' ? 'bg-amber-600 text-white' : 'text-slate-400'
                }`}
              >
                توالي (Series: R1 + R2 + R3)
              </button>
              <button
                onClick={() => setEqType('parallel')}
                className={`flex-1 py-2 font-bold rounded-lg transition-all ${
                  eqType === 'parallel' ? 'bg-amber-600 text-white' : 'text-slate-400'
                }`}
              >
                توازي (Parallel: 1/Req = 1/R1 + ...)
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">R1 (Ω):</label>
                <input
                  type="number"
                  value={eqR1}
                  onChange={(e) => setEqR1(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">R2 (Ω):</label>
                <input
                  type="number"
                  value={eqR2}
                  onChange={(e) => setEqR2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">R3 (Ω):</label>
                <input
                  type="number"
                  value={eqR3}
                  onChange={(e) => setEqR3(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-xs text-slate-400 block">المقاومة المكافئة R_eq:</span>
            <span className="text-4xl font-mono font-black text-amber-400">
              {eqResult.toFixed(2)} Ω
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {eqType === 'parallel' ? 'المقاومة المكافئة بالتوازي دائماً أصغر من أصغر مقاومة' : 'المقاومة المكافئة بالتوالي هي مجموع المقاومات'}
            </span>
          </div>
        </div>
      )}

      {/* 4. RC TIME CONSTANT & CUTOFF */}
      {calcTab === 'rc_rl' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              حسابات ثابت الزمن وتردد القطع لدائرة RC:
            </h3>

            <div>
              <label className="text-slate-400 block mb-1">المقاومة R (Ω):</label>
              <input
                type="number"
                value={rcR}
                onChange={(e) => setRcR(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">المكثف C (nF):</label>
              <input
                type="number"
                value={rcC}
                onChange={(e) => setRcC(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">ثابت الزمن τ = R × C:</span>
              <span className="text-2xl font-mono font-bold text-cyan-400 mt-1 block">
                {(rcTau * 1000).toFixed(3)} ms
              </span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">تردد القطع fc = 1/(2πRC):</span>
              <span className="text-2xl font-mono font-bold text-emerald-400 mt-1 block">
                {rcCutoffFc >= 1000 ? `${(rcCutoffFc / 1000).toFixed(2)} kHz` : `${rcCutoffFc.toFixed(1)} Hz`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. RESONANCE */}
      {calcTab === 'resonance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              التردد الرنيني لدائرة LC RLC (Resonance Frequency):
            </h3>

            <div>
              <label className="text-slate-400 block mb-1">معامل الحث L (mH):</label>
              <input
                type="number"
                value={resL}
                onChange={(e) => setResL(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">السعة C (nF):</label>
              <input
                type="number"
                value={resC}
                onChange={(e) => setResC(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
            <span className="text-xs text-slate-400 block">تردد الرنين f0 = 1 / (2π√LC):</span>
            <span className="text-4xl font-mono font-black text-purple-400">
              {resFreq >= 1000 ? `${(resFreq / 1000).toFixed(2)} kHz` : `${resFreq.toFixed(1)} Hz`}
            </span>
          </div>
        </div>
      )}

      {/* 6. 555 TIMER */}
      {calcTab === 'timer555' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white border-r-2 border-amber-500 pr-2">
              تصميم المؤقت 555 المتذبذب (Astable Mode):
            </h3>
            <div>
              <label className="text-slate-400 block mb-1">R1 (kΩ):</label>
              <input
                type="number"
                value={t555R1}
                onChange={(e) => setT555R1(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">R2 (kΩ):</label>
              <input
                type="number"
                value={t555R2}
                onChange={(e) => setT555R2(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">C (µF):</label>
              <input
                type="number"
                value={t555C}
                onChange={(e) => setT555C(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">التردد f:</span>
              <span className="text-xl font-mono font-bold text-emerald-400 mt-1 block">{t555Freq.toFixed(2)} Hz</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">الزمن الدوري T:</span>
              <span className="text-xl font-mono font-bold text-sky-400 mt-1 block">{t555Period.toFixed(3)} s</span>
            </div>
            <div className="col-span-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">نسبة التشغيل Duty Cycle:</span>
              <span className="text-2xl font-mono font-bold text-amber-400 mt-1 block">{t555Duty.toFixed(1)} %</span>
            </div>
          </div>
        </div>
      )}

      {/* 7. UNIT CONVERTER */}
      {calcTab === 'units' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex gap-2 border-b border-slate-800 pb-4">
            <button
              onClick={() => { setUnitMode('rpm_rads'); setUnitInputValue(1500); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                unitMode === 'rpm_rads' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              السرعة الدورانية (RPM ↔ rad/s)
            </button>
            <button
              onClick={() => { setUnitMode('torque_nm_ozin'); setUnitInputValue(1.5); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                unitMode === 'torque_nm_ozin' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              العزم الميكانيكي (N·m ↔ oz·in)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 items-center">
            <div>
              <label className="text-xs text-slate-400 block mb-2">القيمة المدخلة:</label>
              <input
                type="number"
                value={unitInputValue}
                onChange={(e) => setUnitInputValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white font-mono text-lg font-bold"
              />
            </div>

            <div className="text-center p-4 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">النتيجة المحولة:</span>
              {unitMode === 'rpm_rads' && (
                <div className="space-y-1 font-mono">
                  <span className="text-2xl font-black text-emerald-400 block">
                    {((unitInputValue * 2 * Math.PI) / 60).toFixed(2)} rad/s
                  </span>
                  <span className="text-xs text-slate-500">ω = (RPM × 2π) / 60</span>
                </div>
              )}
              {unitMode === 'torque_nm_ozin' && (
                <div className="space-y-1 font-mono">
                  <span className="text-2xl font-black text-emerald-400 block">
                    {(unitInputValue * 141.612).toFixed(2)} oz·in
                  </span>
                  <span className="text-xs text-slate-500">1 N·m = 141.612 oz·in</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
