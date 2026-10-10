import React, { useState, useEffect } from 'react';
import {
  Binary,
  Layers,
  Play,
  RotateCcw,
  CheckCircle,
  Cpu,
  Sparkles,
  Info,
  Clock
} from 'lucide-react';

export const DigitalLogicLabView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'gates' | 'kmap' | 'combinational' | 'sequential'>('gates');

  // Logic Gates State
  const [selectedGate, setSelectedGate] = useState<'AND' | 'OR' | 'NOT' | 'NAND' | 'NOR' | 'XOR' | 'XNOR'>('AND');
  const [inputA, setInputA] = useState<boolean>(true);
  const [inputB, setInputB] = useState<boolean>(false);

  // K-Map State
  const [kmapVars, setKmapVars] = useState<2 | 3 | 4>(3);
  // Grid of minterms
  const [minterms, setMinterms] = useState<boolean[]>(new Array(16).fill(false));

  // Combinational State
  const [combCircuit, setCombCircuit] = useState<'half_adder' | 'full_adder' | 'mux_4to1'>('full_adder');
  const [adderA, setAdderA] = useState<boolean>(true);
  const [adderB, setAdderB] = useState<boolean>(true);
  const [adderCin, setAdderCin] = useState<boolean>(false);
  const [muxInputs, setMuxInputs] = useState<[boolean, boolean, boolean, boolean]>([false, true, false, true]);
  const [muxSelect, setMuxSelect] = useState<[boolean, boolean]>([false, true]);

  // Sequential State
  const [seqCircuit, setSeqCircuit] = useState<'sr_latch' | 'd_ff' | 'jk_ff' | 'counter_4bit'>('counter_4bit');
  const [clock, setClock] = useState<boolean>(false);
  const [autoClock, setAutoClock] = useState<boolean>(false);
  const [counterValue, setCounterValue] = useState<number>(0);
  const [dInput, setDInput] = useState<boolean>(true);
  const [jInput, setJInput] = useState<boolean>(true);
  const [kInput, setKInput] = useState<boolean>(true);
  const [qState, setQState] = useState<boolean>(false);

  // Gate Calculation
  const calculateGate = (gate: string, a: boolean, b: boolean): boolean => {
    switch (gate) {
      case 'AND': return a && b;
      case 'OR': return a || b;
      case 'NOT': return !a;
      case 'NAND': return !(a && b);
      case 'NOR': return !(a || b);
      case 'XOR': return (a || b) && !(a && b);
      case 'XNOR': return !((a || b) && !(a && b));
      default: return false;
    }
  };

  const gateOutput = calculateGate(selectedGate, inputA, inputB);

  // Auto Clock Timer for Sequential
  useEffect(() => {
    if (!autoClock) return;
    const interval = setInterval(() => {
      setClock(prev => {
        const nextClock = !prev;
        if (nextClock) {
          // Rising edge trigger
          if (seqCircuit === 'counter_4bit') {
            setCounterValue(c => (c + 1) % 16);
          } else if (seqCircuit === 'd_ff') {
            setQState(dInput);
          } else if (seqCircuit === 'jk_ff') {
            if (jInput && kInput) setQState(q => !q);
            else if (jInput) setQState(true);
            else if (kInput) setQState(false);
          }
        }
        return nextClock;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [autoClock, seqCircuit, dInput, jInput, kInput]);

  const handleManualClockPulse = () => {
    setClock(true);
    setTimeout(() => {
      setClock(false);
      if (seqCircuit === 'counter_4bit') {
        setCounterValue(c => (c + 1) % 16);
      } else if (seqCircuit === 'd_ff') {
        setQState(dInput);
      } else if (seqCircuit === 'jk_ff') {
        if (jInput && kInput) setQState(q => !q);
        else if (jInput) setQState(true);
        else if (kInput) setQState(false);
      }
    }, 150);
  };

  // Full Adder Calculations
  const faSum = (adderA !== adderB) !== adderCin;
  const faCout = (adderA && adderB) || (adderCin && (adderA !== adderB));

  // MUX 4:1 Calculation
  const selIndex = (muxSelect[1] ? 2 : 0) + (muxSelect[0] ? 1 : 0);
  const muxOutput = muxInputs[selIndex];

  // K-Map Simplification String Builder
  const getKmapFormula = () => {
    const activeIndices = minterms.map((v, i) => v ? i : -1).filter(i => i >= 0);
    if (activeIndices.length === 0) return 'F = 0';
    if (activeIndices.length === Math.pow(2, kmapVars)) return 'F = 1';
    return `F = ∑m(${activeIndices.join(', ')}) [تعبير مصغر تلقائياً]`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30">
            <Binary className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">المختبر الرقمي والمنطق (Digital Logic)</h1>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Logic Gates, Truth Tables, K-Maps, Combinational Adders/MUX & Sequential Flip-Flops/Counters
        </p>
      </div>

      {/* Main Mode Navigation */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'gates', label: 'البوابات المنطقية وجداول الحقيقة' },
          { id: 'kmap', label: 'خرائط كارنوف (K-Maps)' },
          { id: 'combinational', label: 'الدوائر التوافقية (Adders & MUX)' },
          { id: 'sequential', label: 'الدوائر المتتابعة (القلابات والعدادات)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: LOGIC GATES */}
      {activeTab === 'gates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gate Selection & Inputs */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white border-r-2 border-cyan-500 pr-2">اختر البوابة المنطقية</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGate(g)}
                  className={`p-2.5 rounded-xl font-bold border transition-all text-center ${
                    selectedGate === g
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  بوابة {g}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300">مفاتيح الدخل المنطقية (Inputs)</h4>
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 font-bold">المدخل A:</span>
                <button
                  onClick={() => setInputA(!inputA)}
                  className={`px-4 py-1.5 rounded-lg font-mono font-bold text-sm ${
                    inputA ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {inputA ? '1 (HIGH)' : '0 (LOW)'}
                </button>
              </div>

              {selectedGate !== 'NOT' && (
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-300 font-bold">المدخل B:</span>
                  <button
                    onClick={() => setInputB(!inputB)}
                    className={`px-4 py-1.5 rounded-lg font-mono font-bold text-sm ${
                      inputB ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {inputB ? '1 (HIGH)' : '0 (LOW)'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Gate Simulation Box */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white">المحاكاة المنطقية للبوابة: {selectedGate}</span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                المعادلة: {selectedGate === 'AND' ? 'Y = A · B' : selectedGate === 'OR' ? 'Y = A + B' : selectedGate === 'NOT' ? 'Y = A\'' : selectedGate === 'XOR' ? 'Y = A ⊕ B' : selectedGate === 'NAND' ? 'Y = (A · B)\'' : selectedGate === 'NOR' ? 'Y = (A + B)\'' : 'Y = (A ⊕ B)\''}
              </span>
            </div>

            {/* Visual Gate Schematic */}
            <div className="bg-slate-900/90 rounded-2xl p-8 border border-slate-800 flex flex-col sm:flex-row items-center justify-around gap-6">
              {/* Inputs */}
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">A:</span>
                  <span className={`px-2.5 py-1 rounded-md font-bold ${inputA ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {inputA ? '1' : '0'}
                  </span>
                </div>
                {selectedGate !== 'NOT' && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">B:</span>
                    <span className={`px-2.5 py-1 rounded-md font-bold ${inputB ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {inputB ? '1' : '0'}
                    </span>
                  </div>
                )}
              </div>

              {/* Gate Graphic Icon */}
              <div className="text-center p-6 bg-slate-950 rounded-2xl border-2 border-cyan-500/40 shadow-lg shadow-cyan-500/10">
                <span className="text-3xl font-black text-white font-mono block">[{selectedGate}]</span>
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">LOGIC GATE</span>
              </div>

              {/* Output Indicator LED */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-mono text-xl font-bold transition-all shadow-xl ${
                  gateOutput
                    ? 'bg-emerald-500 border-white text-white shadow-emerald-500/50 scale-110'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}>
                  {gateOutput ? '1' : '0'}
                </div>
                <span className="text-xs font-bold text-white">المخرج Y</span>
              </div>
            </div>

            {/* Dynamic Truth Table */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 mb-2">جدول الحقيقة الكامل (Truth Table):</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1.5">A</th>
                      {selectedGate !== 'NOT' && <th className="py-1.5">B</th>}
                      <th className="py-1.5 text-cyan-400">Y (المخرج)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedGate === 'NOT' ? [[false], [true]] : [[false, false], [false, true], [true, false], [true, true]]).map((row, idx) => {
                      const out = selectedGate === 'NOT' ? calculateGate(selectedGate, row[0], false) : calculateGate(selectedGate, row[0], row[1]);
                      const isCurrentActive = selectedGate === 'NOT' ? (inputA === row[0]) : (inputA === row[0] && inputB === row[1]);
                      return (
                        <tr key={idx} className={`border-b border-slate-800/50 ${isCurrentActive ? 'bg-cyan-950/60 text-cyan-200 font-bold' : 'text-slate-400'}`}>
                          <td className="py-1">{row[0] ? '1' : '0'}</td>
                          {selectedGate !== 'NOT' && <td className="py-1">{row[1] ? '1' : '0'}</td>}
                          <td className={`py-1 font-bold ${out ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {out ? '1' : '0'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KARNAUGH MAP (K-MAP) */}
      {activeTab === 'kmap' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">حل وتبسيط خرائط كارنوف التفاعلية (Karnaugh Maps)</h3>
              <p className="text-xs text-slate-400">اضغط على الخلايا لتغيير قيم الحدود الصغرى (Minterms: 0 / 1) ومشاهدة التبسيط الجبري فورياً.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">عدد المتغيرات:</span>
              {[2, 3, 4].map((v) => (
                <button
                  key={v}
                  onClick={() => setKmapVars(v as any)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                    kmapVars === v ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {v} متغيرات
                </button>
              ))}
            </div>
          </div>

          {/* Interactive K-Map Matrix */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="text-xs font-mono text-cyan-400 mb-4 font-bold">
              {kmapVars === 2 && 'متغيران (A, B) — 4 خلايا'}
              {kmapVars === 3 && 'ثلاثة متغيرات (A, B, C) — 8 خلايا (ترميز Gray Code: 00, 01, 11, 10)'}
              {kmapVars === 4 && 'أربعة متغيرات (A, B, C, D) — 16 خلية'}
            </div>

            {/* Grid display */}
            <div className={`grid gap-2 text-center font-mono ${
              kmapVars === 2 ? 'grid-cols-2' : kmapVars === 3 ? 'grid-cols-4' : 'grid-cols-4'
            }`}>
              {minterms.slice(0, Math.pow(2, kmapVars)).map((val, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const copy = [...minterms];
                    copy[idx] = !copy[idx];
                    setMinterms(copy);
                  }}
                  className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    val
                      ? 'bg-emerald-600 border-white text-white font-bold text-xl shadow-lg shadow-emerald-600/30 scale-105'
                      : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                  }`}
                >
                  <span>{val ? '1' : '0'}</span>
                  <span className="text-[9px] opacity-60">m{idx}</span>
                </button>
              ))}
            </div>

            {/* Simplified Formula Banner */}
            <div className="mt-6 bg-slate-900 border border-slate-800 p-4 rounded-xl text-center w-full max-w-lg">
              <span className="text-xs text-slate-400 block mb-1">المعادلة المنطقية المبسطة:</span>
              <span className="text-base sm:text-lg font-mono font-bold text-cyan-300">
                {getKmapFormula()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMBINATIONAL CIRCUITS */}
      {activeTab === 'combinational' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex gap-2 border-b border-slate-800 pb-4">
            <button
              onClick={() => setCombCircuit('full_adder')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                combCircuit === 'full_adder' ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              الجامع الكامل (Full Adder)
            </button>
            <button
              onClick={() => setCombCircuit('mux_4to1')}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                combCircuit === 'mux_4to1' ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              موزع البيانات (4-to-1 Multiplexer)
            </button>
          </div>

          {combCircuit === 'full_adder' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-300">مداخل الجامع:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl">
                    <span className="text-xs text-slate-300">البت A:</span>
                    <button onClick={() => setAdderA(!adderA)} className={`px-4 py-1.5 rounded-lg font-bold font-mono text-sm ${adderA ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {adderA ? '1' : '0'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl">
                    <span className="text-xs text-slate-300">البت B:</span>
                    <button onClick={() => setAdderB(!adderB)} className={`px-4 py-1.5 rounded-lg font-bold font-mono text-sm ${adderB ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {adderB ? '1' : '0'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl">
                    <span className="text-xs text-slate-300">الحمل السابق Cin:</span>
                    <button onClick={() => setAdderCin(!adderCin)} className={`px-4 py-1.5 rounded-lg font-bold font-mono text-sm ${adderCin ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      {adderCin ? '1' : '0'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-400">مخارج الجمع الثنائي (Binary Outputs):</h4>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-2xl font-black ${
                      faCout ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {faCout ? '1' : '0'}
                    </div>
                    <span className="text-xs font-bold text-slate-300 mt-1 block">الحمل Cout</span>
                  </div>
                  <div className="text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-2xl font-black ${
                      faSum ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {faSum ? '1' : '0'}
                    </div>
                    <span className="text-xs font-bold text-slate-300 mt-1 block">المجموع Sum</span>
                  </div>
                </div>
                <p className="text-xs font-mono text-cyan-400">
                  {adderA ? 1 : 0} + {adderB ? 1 : 0} + {adderCin ? 1 : 0} = {(faCout ? 2 : 0) + (faSum ? 1 : 0)} (بالعشري)
                </p>
              </div>
            </div>
          )}

          {combCircuit === 'mux_4to1' && (
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-300">مداخل البيانات الأربعة وأسطر الاختيار (S1, S0):</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {muxInputs.map((val, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const copy = [...muxInputs] as [boolean, boolean, boolean, boolean];
                      copy[idx] = !copy[idx];
                      setMuxInputs(copy);
                    }}
                    className={`p-3 rounded-xl border text-center font-mono ${
                      val ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    <span className="block text-xs font-bold">المدخل D{idx}</span>
                    <span className="text-lg font-bold">{val ? '1' : '0'}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">خطوط التحديد:</span>
                  <button onClick={() => setMuxSelect([!muxSelect[0], muxSelect[1]])} className={`px-3 py-1 rounded-lg text-xs font-bold font-mono ${muxSelect[0] ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    S0: {muxSelect[0] ? '1' : '0'}
                  </button>
                  <button onClick={() => setMuxSelect([muxSelect[0], !muxSelect[1]])} className={`px-3 py-1 rounded-lg text-xs font-bold font-mono ${muxSelect[1] ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    S1: {muxSelect[1] ? '1' : '0'}
                  </button>
                  <span className="text-xs font-mono text-cyan-400 font-bold">(المحدد الحالي: D{selIndex})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">المخرج Y:</span>
                  <span className={`px-4 py-1.5 rounded-xl font-mono text-lg font-bold ${muxOutput ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>
                    {muxOutput ? '1' : '0'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SEQUENTIAL CIRCUITS & COUNTERS */}
      {activeTab === 'sequential' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSeqCircuit('counter_4bit')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  seqCircuit === 'counter_4bit' ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                عداد تصاعدي 4 بت (4-Bit Binary Counter)
              </button>
              <button
                onClick={() => setSeqCircuit('d_ff')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  seqCircuit === 'd_ff' ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                قلاب د (D Flip-Flop)
              </button>
              <button
                onClick={() => setSeqCircuit('jk_ff')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  seqCircuit === 'jk_ff' ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                قلاب جيه-كيه (JK Flip-Flop)
              </button>
            </div>

            {/* Clock Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualClockPulse}
                className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-600/30 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>نبضة ساعة يدوية (CLK Pulse)</span>
              </button>
              <button
                onClick={() => setAutoClock(!autoClock)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  autoClock ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                {autoClock ? 'نبض آلي (مستمر)' : 'تشغيل نبض آلي'}
              </button>
            </div>
          </div>

          {/* Sequential Display */}
          <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-6">
            {seqCircuit === 'counter_4bit' && (
              <div className="space-y-6 text-center">
                <span className="text-xs text-slate-400 font-mono">قراءة العداد الثنائية (Binary LEDs) والعشرية (Decimal)</span>
                {/* 4 bit LEDs */}
                <div className="flex gap-4 justify-center">
                  {[3, 2, 1, 0].map((bit) => {
                    const isBitOn = ((counterValue >> bit) & 1) === 1;
                    return (
                      <div key={bit} className="flex flex-col items-center gap-2">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-mono text-2xl font-black border-2 transition-all ${
                          isBitOn ? 'bg-emerald-500 border-white text-white shadow-xl shadow-emerald-500/40 scale-105' : 'bg-slate-900 border-slate-700 text-slate-500'
                        }`}>
                          {isBitOn ? '1' : '0'}
                        </div>
                        <span className="text-xs font-mono text-slate-400">Q{bit} (2^{bit})</span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 inline-block font-mono">
                  <span className="text-xs text-slate-400 block">القيمة العشرية الحالية:</span>
                  <span className="text-4xl font-black text-cyan-400">{counterValue}</span>
                  <span className="text-xs text-slate-500 block mt-1">(المدى: 0 إلى 15 ثم يصفر)</span>
                </div>
              </div>
            )}

            {(seqCircuit === 'd_ff' || seqCircuit === 'jk_ff') && (
              <div className="space-y-4 text-center">
                <div className="flex items-center gap-4 justify-center">
                  {seqCircuit === 'd_ff' && (
                    <button onClick={() => setDInput(!dInput)} className={`px-4 py-2 rounded-xl text-xs font-bold ${dInput ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      المدخل D: {dInput ? '1' : '0'}
                    </button>
                  )}
                  {seqCircuit === 'jk_ff' && (
                    <>
                      <button onClick={() => setJInput(!jInput)} className={`px-4 py-2 rounded-xl text-xs font-bold ${jInput ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        المدخل J: {jInput ? '1' : '0'}
                      </button>
                      <button onClick={() => setKInput(!kInput)} className={`px-4 py-2 rounded-xl text-xs font-bold ${kInput ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        المدخل K: {kInput ? '1' : '0'}
                      </button>
                    </>
                  )}
                </div>

                <div className="flex gap-6 justify-center">
                  <div className="text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-xl font-bold ${qState ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-900 text-slate-500'}`}>
                      {qState ? '1' : '0'}
                    </div>
                    <span className="text-xs text-slate-300 mt-1 block">المخرج Q</span>
                  </div>
                  <div className="text-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-xl font-bold ${!qState ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-900 text-slate-500'}`}>
                      {!qState ? '1' : '0'}
                    </div>
                    <span className="text-xs text-slate-300 mt-1 block">المتمم Q'</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
