import React, { useState, useEffect } from 'react';
import {
  Activity,
  Sliders,
  Play,
  RotateCcw,
  Zap,
  Info,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const ElectronicsLabView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<
    'rectifier' | 'zener' | 'transistor' | 'opamp' | 'timer555' | 'sensor_relay'
  >('rectifier');

  // Rectifier States
  const [rectifierType, setRectifierType] = useState<'half' | 'full'>('full');
  const [acInputVrms, setAcInputVrms] = useState<number>(12);
  const [filterCap_uF, setFilterCap_uF] = useState<number>(470);
  const [rectLoadRes_ohm, setRectLoadRes_ohm] = useState<number>(220);

  // Zener Regulator States
  const [zenerVin, setZenerVin] = useState<number>(15);
  const [zenerVz, setZenerVz] = useState<number>(5.1);
  const [zenerRs, setZenerRs] = useState<number>(330);
  const [zenerRl, setZenerRl] = useState<number>(1000);

  // BJT Transistor Switch States
  const [bjtVin, setBjtVin] = useState<number>(5);
  const [bjtRb, setBjtRb] = useState<number>(10000);
  const [bjtVcc, setBjtVcc] = useState<number>(12);
  const [bjtRc, setBjtRc] = useState<number>(470);
  const [bjtBeta, setBjtBeta] = useState<number>(150);

  // Op-Amp States
  const [opampMode, setOpampMode] = useState<'inverting' | 'non_inverting' | 'comparator'>('inverting');
  const [opampVin, setOpampVin] = useState<number>(1.5);
  const [opampRin, setOpampRin] = useState<number>(10); // kOhm
  const [opampRf, setOpampRf] = useState<number>(47); // kOhm
  const [opampVsat, setOpampVsat] = useState<number>(12); // Volts rail

  // 555 Timer States
  const [t555R1, setT555R1] = useState<number>(10); // kOhm
  const [t555R2, setT555R2] = useState<number>(47); // kOhm
  const [t555C, setT555C] = useState<number>(10); // uF
  const [t555LedState, setT555LedState] = useState<boolean>(false);

  // Sensor & Relay States
  const [sensorLightLevel, setSensorLightLevel] = useState<number>(75); // %
  const [relayThreshold, setRelayThreshold] = useState<number>(50); // %

  // Timer 555 animation
  useEffect(() => {
    if (selectedTopic !== 'timer555') return;
    const r1 = t555R1 * 1000;
    const r2 = t555R2 * 1000;
    const c = t555C * 1e-6;
    const freq = 1.44 / ((r1 + 2 * r2) * c);
    const periodMs = Math.max((1 / Math.max(freq, 0.1)) * 1000, 100);

    const interval = setInterval(() => {
      setT555LedState(prev => !prev);
    }, periodMs / 2);

    return () => clearInterval(interval);
  }, [selectedTopic, t555R1, t555R2, t555C]);

  // Calculations for Rectifiers
  const vPeakInput = acInputVrms * Math.SQRT2;
  const diodeDrop = rectifierType === 'half' ? 0.7 : 1.4;
  const vPeakOutput = Math.max(vPeakInput - diodeDrop, 0);
  const vDcOutput = rectifierType === 'half' ? (vPeakOutput / Math.PI) : (2 * vPeakOutput / Math.PI);
  const fMains = 50; // 50 Hz
  const fRipple = rectifierType === 'half' ? fMains : (2 * fMains);
  const idcCurrent = (vDcOutput / rectLoadRes_ohm); // Amps
  const rippleVoltageV = (idcCurrent / (fRipple * (filterCap_uF * 1e-6)));

  // Calculations for Zener
  const zenerIs = (zenerVin - zenerVz) / zenerRs; // Amps
  const zenerIl = zenerVz / zenerRl; // Amps
  const zenerIz = Math.max(zenerIs - zenerIl, 0);
  const zenerRegulatedV = zenerIs >= zenerIl ? zenerVz : (zenerVin * (zenerRl / (zenerRs + zenerRl)));
  const zenerPowerW = zenerIz * zenerVz;

  // Calculations for Transistor
  const bjtIb = Math.max((bjtVin - 0.7) / bjtRb, 0); // Amps
  const bjtIcSat = bjtVcc / bjtRc; // Amps
  const bjtIcActive = bjtIb * bjtBeta; // Amps
  const bjtIsSaturated = bjtIcActive >= bjtIcSat;
  const bjtActualIc = bjtIsSaturated ? bjtIcSat : bjtIcActive;
  const bjtVce = bjtIsSaturated ? 0.2 : Math.max(bjtVcc - bjtActualIc * bjtRc, 0.2);

  // Calculations for Op-Amp
  let opampGain = 1;
  let opampVout = 0;
  if (opampMode === 'inverting') {
    opampGain = -(opampRf / opampRin);
    const theoretical = opampGain * opampVin;
    opampVout = Math.max(-opampVsat, Math.min(opampVsat, theoretical));
  } else if (opampMode === 'non_inverting') {
    opampGain = 1 + (opampRf / opampRin);
    const theoretical = opampGain * opampVin;
    opampVout = Math.max(-opampVsat, Math.min(opampVsat, theoretical));
  } else {
    // comparator
    opampVout = opampVin >= 2.5 ? opampVsat : -opampVsat;
  }

  // Calculations for 555 Timer
  const t555Freq = 1.44 / (((t555R1 * 1000) + 2 * (t555R2 * 1000)) * (t555C * 1e-6));
  const t555Duty = ((t555R1 + t555R2) / (t555R1 + 2 * t555R2)) * 100;

  // Sensor relay calculation
  const isRelayEnergized = sensorLightLevel >= relayThreshold;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Activity className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">مختبر الإلكترونيات والمضخمات</h1>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Semiconductor Physics, Rectifiers, Op-Amps, 555 Timers, Transistor Biasing & Sensors
        </p>
      </div>

      {/* Experiment Topic Selector Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        {[
          { id: 'rectifier', label: 'المقومات والفلاتر', desc: 'Half/Full Bridge & Ripple' },
          { id: 'zener', label: 'منظم جهد زينر', desc: 'Zener Diode Shunt Regulator' },
          { id: 'transistor', label: 'مفتاح الترانزستور BJT', desc: 'BJT Saturation & Cutoff' },
          { id: 'opamp', label: 'مضخم العمليات Op-Amp', desc: 'Inverting & Non-Inverting' },
          { id: 'timer555', label: 'المؤقت 555 المتذبذب', desc: 'Astable Multivibrator' },
          { id: 'sensor_relay', label: 'دائرة الحساس والمرحل', desc: 'LDR Light Sensor & Relay' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTopic(tab.id as any)}
            className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-right transition-all cursor-pointer border ${
              selectedTopic === tab.id
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/20'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="text-xs font-bold block">{tab.label}</span>
            <span className="text-[10px] opacity-80 font-mono">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Main Experiment Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls & Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">معايير وتوليف الدائرة</h3>
          </div>

          {/* 1. Rectifier Controls */}
          {selectedTopic === 'rectifier' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">نوع دائرة التقويم:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRectifierType('half')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      rectifierType === 'half' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    نصف موجة (Half Wave)
                  </button>
                  <button
                    onClick={() => setRectifierType('full')}
                    className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                      rectifierType === 'full' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    قنطري كامل (Bridge)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>جهد الدخل AC RMS:</span>
                  <span className="font-mono text-sky-400 font-bold">{acInputVrms} V</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="24"
                  step="1"
                  value={acInputVrms}
                  onChange={(e) => setAcInputVrms(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>سعة مكثف التنعيم C:</span>
                  <span className="font-mono text-sky-400 font-bold">{filterCap_uF} µF</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="2200"
                  step="10"
                  value={filterCap_uF}
                  onChange={(e) => setFilterCap_uF(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>مقاومة الحمل R_load:</span>
                  <span className="font-mono text-sky-400 font-bold">{rectLoadRes_ohm} Ω</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="10"
                  value={rectLoadRes_ohm}
                  onChange={(e) => setRectLoadRes_ohm(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          )}

          {/* 2. Zener Controls */}
          {selectedTopic === 'zener' && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>جهد الدخل V_in:</span>
                  <span className="font-mono text-sky-400 font-bold">{zenerVin} V</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="25"
                  step="0.5"
                  value={zenerVin}
                  onChange={(e) => setZenerVin(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">جهد كسر زينر V_z:</label>
                <select
                  value={zenerVz}
                  onChange={(e) => setZenerVz(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value="3.3">3.3 V (BZX55C3V3)</option>
                  <option value="5.1">5.1 V (1N4733A)</option>
                  <option value="9.1">9.1 V (1N4739A)</option>
                  <option value="12">12.0 V (1N4742A)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>مقاومة التوالي R_s:</span>
                  <span className="font-mono text-sky-400 font-bold">{zenerRs} Ω</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="10"
                  value={zenerRs}
                  onChange={(e) => setZenerRs(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>مقاومة الحمل R_L:</span>
                  <span className="font-mono text-sky-400 font-bold">{zenerRl} Ω</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={zenerRl}
                  onChange={(e) => setZenerRl(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          )}

          {/* 3. BJT Transistor Controls */}
          {selectedTopic === 'transistor' && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>جهد القاعدة V_in (Base):</span>
                  <span className="font-mono text-sky-400 font-bold">{bjtVin} V</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={bjtVin}
                  onChange={(e) => setBjtVin(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>مقاومة القاعدة R_b:</span>
                  <span className="font-mono text-sky-400 font-bold">{(bjtRb / 1000).toFixed(1)} kΩ</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={bjtRb}
                  onChange={(e) => setBjtRb(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>مقاومة المجمع R_c:</span>
                  <span className="font-mono text-sky-400 font-bold">{bjtRc} Ω</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={bjtRc}
                  onChange={(e) => setBjtRc(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>معامل الكسب β (hFE):</span>
                  <span className="font-mono text-sky-400 font-bold">{bjtBeta}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={bjtBeta}
                  onChange={(e) => setBjtBeta(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          )}

          {/* 4. Op-Amp Controls */}
          {selectedTopic === 'opamp' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">تشكيلة المضخم:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOpampMode('inverting')}
                    className={`py-2 px-2 rounded-xl font-bold border transition-all ${
                      opampMode === 'inverting' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    عاكس (Inverting)
                  </button>
                  <button
                    onClick={() => setOpampMode('non_inverting')}
                    className={`py-2 px-2 rounded-xl font-bold border transition-all ${
                      opampMode === 'non_inverting' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    غير عاكس (Non-Inv)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>جهد الدخل V_in:</span>
                  <span className="font-mono text-sky-400 font-bold">{opampVin} V</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={opampVin}
                  onChange={(e) => setOpampVin(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>مقاومة الدخل R_in:</span>
                  <span className="font-mono text-sky-400 font-bold">{opampRin} kΩ</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={opampRin}
                  onChange={(e) => setOpampRin(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>مقاومة التغذية R_f:</span>
                  <span className="font-mono text-sky-400 font-bold">{opampRf} kΩ</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={opampRf}
                  onChange={(e) => setOpampRf(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          )}

          {/* 5. 555 Timer Controls */}
          {selectedTopic === 'timer555' && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>المقاومة R1:</span>
                  <span className="font-mono text-sky-400 font-bold">{t555R1} kΩ</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={t555R1}
                  onChange={(e) => setT555R1(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>المقاومة R2:</span>
                  <span className="font-mono text-sky-400 font-bold">{t555R2} kΩ</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={t555R2}
                  onChange={(e) => setT555R2(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>المكثف C:</span>
                  <span className="font-mono text-sky-400 font-bold">{t555C} µF</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={t555C}
                  onChange={(e) => setT555C(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          )}

          {/* 6. Sensor Relay Controls */}
          {selectedTopic === 'sensor_relay' && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>شدة الضوء على حساس LDR:</span>
                  <span className="font-mono text-amber-400 font-bold">{sensorLightLevel} %</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={sensorLightLevel}
                  onChange={(e) => setSensorLightLevel(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>عتبة التبديل (Potentiometer):</span>
                  <span className="font-mono text-sky-400 font-bold">{relayThreshold} %</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={relayThreshold}
                  onChange={(e) => setRelayThreshold(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Simulation Visual Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl lab-grid-bg relative min-h-[380px] flex flex-col justify-between">
            {/* Visual Schematic Diagram Box */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <span>مخطط الدائرة والنتائج الحية (Live Schematic & Physical Readings)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                  محاكاة فيزيائية فعلية
                </span>
              </div>

              {/* Graphic Representation per Topic */}
              <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center min-h-[200px]">
                {selectedTopic === 'rectifier' && (
                  <div className="space-y-4 text-center">
                    <div className="text-3xl sm:text-4xl">
                      {rectifierType === 'half' ? '⚡ ──[ ⮞| ]──┬── [ C ] ──┬── [ R_L ]' : '⚡ ──[ 🔲 BRIDGE ]──┬── [ C ] ──┬── [ R_L ]'}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-4">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">جهد القمة V_peak:</span>
                        <span className="font-mono text-sky-400 font-bold text-sm">{vPeakOutput.toFixed(2)} V</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">الجهد المستمر V_dc:</span>
                        <span className="font-mono text-emerald-400 font-bold text-sm">{vDcOutput.toFixed(2)} V</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">تيار الحمل I_load:</span>
                        <span className="font-mono text-amber-400 font-bold text-sm">{(idcCurrent * 1000).toFixed(1)} mA</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">تموج الجهد V_ripple:</span>
                        <span className="font-mono text-rose-400 font-bold text-sm">{rippleVoltageV.toFixed(2)} V</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTopic === 'zener' && (
                  <div className="space-y-4 text-center">
                    <div className="text-3xl">
                      ⚡ V_in ({zenerVin}V) ──[ R_s: {zenerRs}Ω ]──┬──[ R_L: {zenerRl}Ω ]<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ ⮝ Zener {zenerVz}V ]
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-4">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">الجهد المنظم V_out:</span>
                        <span className="font-mono text-sky-400 font-bold text-sm">{zenerRegulatedV.toFixed(2)} V</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">تيار المصدر I_s:</span>
                        <span className="font-mono text-emerald-400 font-bold text-sm">{(zenerIs * 1000).toFixed(1)} mA</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">تيار زينر I_z:</span>
                        <span className="font-mono text-amber-400 font-bold text-sm">{(zenerIz * 1000).toFixed(1)} mA</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">قدرة زينر P_z:</span>
                        <span className="font-mono text-purple-400 font-bold text-sm">{(zenerPowerW * 1000).toFixed(1)} mW</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTopic === 'transistor' && (
                  <div className="space-y-4 text-center">
                    <div className="text-2xl font-mono text-slate-300">
                      V_in ({bjtVin}V) ──[ R_b ]── Base ──| NPN |── Collector ──[ R_c: {bjtRc}Ω ]── Vcc ({bjtVcc}V)
                    </div>
                    <div className="flex items-center justify-center gap-3 py-2">
                      <span className="text-xs text-slate-400">حالة الترانزستور الحالية:</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        bjtIsSaturated ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}>
                        {bjtIsSaturated ? 'تشبع كامل (Saturation - المفتاح مغلق)' : 'المنطقة الفعالة (Active Region)'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">تيار القاعدة I_b:</span>
                        <span className="font-mono text-sky-400 font-bold text-sm">{(bjtIb * 1000).toFixed(3)} mA</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">تيار المجمع I_c:</span>
                        <span className="font-mono text-emerald-400 font-bold text-sm">{(bjtActualIc * 1000).toFixed(1)} mA</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">جهد V_ce:</span>
                        <span className="font-mono text-amber-400 font-bold text-sm">{bjtVce.toFixed(2)} V</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">قدرة التبدد P_d:</span>
                        <span className="font-mono text-purple-400 font-bold text-sm">{((bjtVce * bjtActualIc) * 1000).toFixed(1)} mW</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTopic === 'opamp' && (
                  <div className="space-y-4 text-center">
                    <div className="text-3xl">
                      📐 V_out = {opampMode === 'inverting' ? '-(R_f / R_in) × V_in' : '(1 + R_f / R_in) × V_in'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-4">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">الكسب النظري A_v:</span>
                        <span className="font-mono text-sky-400 font-bold text-sm">{opampGain.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">جهد الخرج الفعلي V_out:</span>
                        <span className="font-mono text-emerald-400 font-bold text-sm">{opampVout.toFixed(2)} V</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">حالة التشبع (Rail Limit):</span>
                        <span className={`font-bold ${Math.abs(opampVout) >= opampVsat ? 'text-rose-400' : 'text-slate-300'}`}>
                          {Math.abs(opampVout) >= opampVsat ? 'مشبع عند القضيب ±12V' : 'خطي غير مشبع'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTopic === 'timer555' && (
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-4xl animate-bounce">⏱️</div>
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                          t555LedState ? 'bg-emerald-400 border-white shadow-lg shadow-emerald-400' : 'bg-slate-800 border-slate-700'
                        }`}>
                          💡
                        </span>
                        <span className="text-xs font-bold text-white">نبضة المخرج Pin 3</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">التردد المحسوب f:</span>
                        <span className="font-mono text-sky-400 font-bold text-sm">{t555Freq.toFixed(2)} Hz</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">دورة التشغيل (Duty Cycle):</span>
                        <span className="font-mono text-emerald-400 font-bold text-sm">{t555Duty.toFixed(1)} %</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">الزمن الدوري T:</span>
                        <span className="font-mono text-amber-400 font-bold text-sm">{(1 / t555Freq).toFixed(2)} s</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTopic === 'sensor_relay' && (
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-6">
                      <span className="text-3xl">{sensorLightLevel >= 50 ? '☀️ LDR' : '🌑 LDR'}</span>
                      <span className="text-2xl text-slate-500">──▶ [ المقارن ] ──▶</span>
                      <div className={`p-3 rounded-2xl border-2 flex items-center gap-2 ${
                        isRelayEnergized ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}>
                        <span>🧲 Relay Coil</span>
                        <span className="font-bold text-xs">{isRelayEnergized ? 'مفعل (ON)' : 'مفصول (OFF)'}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 pt-2">
                      {isRelayEnergized
                        ? 'تجاوزت شدة الضوء عتبة المقارن: الترانزستور مشبع والمرحل يجذب نقاط التلامس لتشغيل الحمل.'
                        : 'شدة الضوء أقل من العتبة: الترانزستور في وضع القطع (Cutoff) والدايود المعاكس يمتص القوة الدافعة العكسية.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Scientific Theory & Equations Guide */}
            <div className="mt-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Info className="w-4 h-4" />
                <span>الأساس العلمي والمعادلات المطبقة:</span>
              </span>
              {selectedTopic === 'rectifier' && (
                <p className="text-slate-400 leading-relaxed">
                  يستخدم المقوم القنطري أربعة دايودات لتمرير نصفي الموجة الموجب والسالب، مما يضاعف تردد التموج إلى 100Hz ويسهّل ترشيحه بواسطة مكثف التنعيم وفق المعادلة V_ripple = I_dc / (2·f·C).
                </p>
              )}
              {selectedTopic === 'zener' && (
                <p className="text-slate-400 leading-relaxed">
                  يحافظ دايود زينر على جهد ثابت Vz في حالة الانحياز العكسي طالما أن تيار زينر Iz أكبر من تيار الركبة Iz(min) وأقل من الحد الأقصى للطاقة Pz(max).
                </p>
              )}
              {selectedTopic === 'transistor' && (
                <p className="text-slate-400 leading-relaxed">
                  يعمل الترانزستور كمفتاح إلكتروني بين منطقتي القطع (Cutoff: Ib=0, Vce=Vcc) والتشبع (Saturation: Vce ≈ 0.2V, Ic=Vcc/Rc) للتحكم في الأحمال الكبيرة بتيار قاعدة صغير.
                </p>
              )}
              {selectedTopic === 'opamp' && (
                <p className="text-slate-400 leading-relaxed">
                  المضخم التشغيلي المثالي يتميز بممانعة دخل لا نهائية وممانعة خرج صفرية وكسب حلقة مفتوحة لا نهائي. يتم تحديد الكسب بدقة عبر المقاومات الخارجية Rf و Rin.
                </p>
              )}
              {selectedTopic === 'timer555' && (
                <p className="text-slate-400 leading-relaxed">
                  يشحن المكثف عبر R1+R2 ويفرغ عبر R2 فقط، مما يولد موجة مربعة بتردد f = 1.44 / ((R1 + 2R2)·C) بدقة واستقرار حراري عالي.
                </p>
              )}
              {selectedTopic === 'sensor_relay' && (
                <p className="text-slate-400 leading-relaxed">
                  مقسم الجهد بحساس LDR يحول التغير الضوئي إلى إشارة جهد يقارنها مكبر العمليات لتشغيل ترانزستور قيادة المرحل مع دايود حماية (Flyback Diode) لمنع انهيار الترانزستور.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
