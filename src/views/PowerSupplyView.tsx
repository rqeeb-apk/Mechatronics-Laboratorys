import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Gauge,
  Power,
  ShieldAlert,
  Zap,
  Activity,
  RotateCcw,
  Sliders,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const PowerSupplyView: React.FC = () => {
  const [isOn, setIsOn] = useState<boolean>(true);
  const [supplyMode, setSupplyMode] = useState<'DC' | 'AC'>('DC');
  const [targetVoltage, setTargetVoltage] = useState<number>(12.0); // 0 to 30V
  const [currentLimit, setCurrentLimit] = useState<number>(2.0); // 0.1 to 5.0A
  const [acFrequency, setAcFrequency] = useState<number>(50); // Hz

  // Load simulator
  const [loadType, setLoadType] = useState<'resistor' | 'lamp' | 'motor' | 'short' | 'open'>('resistor');
  const [loadResistance, setLoadResistance] = useState<number>(10.0); // Ohms
  const [ocpTripped, setOcpTripped] = useState<boolean>(false);

  // Determine if output is tripped due to short or latch
  const isTripped = ocpTripped || loadType === 'short';

  // Solve Power Supply Output with real physics (useMemo prevents update depth exceeded issues)
  const { actualVoltage, actualCurrent, operatingMode } = useMemo(() => {
    if (!isOn) {
      return { actualVoltage: 0, actualCurrent: 0, operatingMode: 'OFF' as const };
    }

    if (isTripped) {
      return { actualVoltage: 0, actualCurrent: 0, operatingMode: 'TRIPPED' as const };
    }

    // Determine load impedance
    let effectiveR = loadResistance;
    if (loadType === 'open') effectiveR = 10000000; // Open circuit
    if (loadType === 'lamp') effectiveR = 14.4; // 12V 10W bulb
    if (loadType === 'motor') effectiveR = 8.5; // Small DC motor winding

    // Ohm's law: theoretical current if in CV (Constant Voltage)
    const idealCurrent = targetVoltage / Math.max(effectiveR, 0.01);

    if (idealCurrent > currentLimit) {
      // Regulates in CC (Constant Current) mode: current is clamped, voltage drops!
      const clampedCurrent = currentLimit;
      const droppedVoltage = clampedCurrent * effectiveR;
      return {
        actualVoltage: parseFloat(droppedVoltage.toFixed(2)),
        actualCurrent: parseFloat(clampedCurrent.toFixed(2)),
        operatingMode: 'CC' as const,
      };
    } else {
      // Regulates in CV (Constant Voltage) mode
      return {
        actualVoltage: targetVoltage,
        actualCurrent: parseFloat(idealCurrent.toFixed(2)),
        operatingMode: 'CV' as const,
      };
    }
  }, [isOn, isTripped, loadResistance, loadType, targetVoltage, currentLimit]);

  // Waveform graph canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Live waveform graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Center line
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      if (isOn && !isTripped) {
        const centerY = canvas.height / 2;
        const vScale = 2.5;

        // Voltage Waveform (Sky Blue)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          let vInstant = 0;
          if (supplyMode === 'DC') {
            // DC with tiny ripple
            vInstant = actualVoltage + Math.sin(t * 10 + x * 0.1) * 0.05;
          } else {
            // AC Sine Wave
            const omega = 2 * Math.PI * (acFrequency / 10);
            vInstant = actualVoltage * Math.SQRT2 * Math.sin((x * 0.04) + t * 0.1);
          }
          const y = centerY - vInstant * vScale;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Current Waveform (Emerald)
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const iScale = 12; // visual scaling for current
        for (let x = 0; x < canvas.width; x++) {
          let iInstant = 0;
          if (supplyMode === 'DC') {
            iInstant = actualCurrent;
          } else {
            iInstant = actualCurrent * Math.SQRT2 * Math.sin((x * 0.04) + t * 0.1);
          }
          const y = centerY - iInstant * iScale;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        t += 0.05;
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isOn, isTripped, actualVoltage, actualCurrent, supplyMode, acFrequency]);

  const powerWatts = parseFloat((actualVoltage * actualCurrent).toFixed(2));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/30">
              <Gauge className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">مزود الطاقة المخبري AC/DC</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Precision Dual-Mode Benchtop Power Supply (0-30V / 0-5A, OCP & CC/CV Modes)
          </p>
        </div>

        <button
          onClick={() => {
            setOcpTripped(false);
            setLoadType('resistor');
            setLoadResistance(10.0);
            setTargetVoltage(12.0);
            setCurrentLimit(2.0);
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>إعادة ضبط المصنع</span>
        </button>
      </div>

      {/* Main Benchtop Instrument Case */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Metal chassis screws & lab brand badge */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600" />
            <div className="text-left font-mono">
              <span className="text-xs font-bold text-slate-300 block">MECHA-PSU 3005D</span>
              <span className="text-[10px] text-slate-500">LAB GRADE POWER SUPPLY</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode selection buttons AC / DC */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSupplyMode('DC')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  supplyMode === 'DC' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                تيار مستمر DC
              </button>
              <button
                onClick={() => setSupplyMode('AC')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  supplyMode === 'AC' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                تيار متردد AC
              </button>
            </div>

            {/* Main Power ON/OFF Toggle */}
            <button
              onClick={() => setIsOn(!isOn)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-black text-xs transition-all shadow-lg cursor-pointer ${
                isOn
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isOn ? 'تشغيل ON' : 'إيقاف OFF'}</span>
            </button>
          </div>
        </div>

        {/* 7-Segment Digital Readouts & Mode Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Voltage Display */}
          <div className="bg-black border-2 border-slate-800 rounded-2xl p-5 text-center shadow-inner relative">
            <span className="text-xs font-bold text-slate-400 block mb-1">الجهد الفعلي (VOLTAGE)</span>
            <div className="text-4xl sm:text-5xl font-mono font-black text-sky-400 tracking-wider">
              {actualVoltage.toFixed(2)}
              <span className="text-xl ml-1 text-sky-600">V</span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-slate-500">
              {supplyMode === 'DC' ? 'DC Continuous' : `${acFrequency}Hz RMS`}
            </div>
          </div>

          {/* Current Display */}
          <div className="bg-black border-2 border-slate-800 rounded-2xl p-5 text-center shadow-inner relative">
            <span className="text-xs font-bold text-slate-400 block mb-1">التيار الفعلي (CURRENT)</span>
            <div className="text-4xl sm:text-5xl font-mono font-black text-emerald-400 tracking-wider">
              {actualCurrent.toFixed(2)}
              <span className="text-xl ml-1 text-emerald-600">A</span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-slate-500">
              Limit: {currentLimit.toFixed(2)}A
            </div>
          </div>

          {/* Power & Status Indicators */}
          <div className="bg-black border-2 border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-inner">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-1">القدرة المستهلكة (POWER)</span>
              <div className="text-3xl sm:text-4xl font-mono font-black text-purple-400 tracking-wider">
                {powerWatts.toFixed(2)}
                <span className="text-lg ml-1 text-purple-600">W</span>
              </div>
            </div>

            {/* Status LEDs */}
            <div className="flex items-center justify-around pt-3 border-t border-slate-900 mt-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${operatingMode === 'CV' ? 'bg-sky-400 shadow-sm shadow-sky-400 animate-pulse' : 'bg-slate-800'}`} />
                <span className="text-[10px] font-bold text-slate-300">CV (جهد ثابت)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${operatingMode === 'CC' ? 'bg-amber-400 shadow-sm shadow-amber-400 animate-pulse' : 'bg-slate-800'}`} />
                <span className="text-[10px] font-bold text-slate-300">CC (تيار ثابت)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${operatingMode === 'TRIPPED' ? 'bg-rose-500 shadow-sm shadow-rose-500 animate-ping' : 'bg-slate-800'}`} />
                <span className="text-[10px] font-bold text-slate-300">OCP (حماية)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Knobs & Adjustment Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          {/* Voltage Knob */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">ضبط الجهد المستهدف (Voltage Setting):</span>
              <span className="font-mono text-sky-400 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {targetVoltage.toFixed(1)} V
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={supplyMode === 'DC' ? 30 : 24}
              step="0.1"
              value={targetVoltage}
              onChange={(e) => setTargetVoltage(parseFloat(e.target.value))}
              className="w-full accent-sky-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.0 V</span>
              <span>12.0 V</span>
              <span>{supplyMode === 'DC' ? '30.0 V' : '24.0 V'}</span>
            </div>
          </div>

          {/* Current Limit Knob */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">ضبط حد التيار الأقصى (Current Limit):</span>
              <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {currentLimit.toFixed(2)} A
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.05"
              value={currentLimit}
              onChange={(e) => setCurrentLimit(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.10 A</span>
              <span>2.50 A</span>
              <span>5.00 A</span>
            </div>
          </div>
        </div>

        {/* Load Selector & Test Circuit Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-bold text-white">الحمل الكهربائي المتصل بمزود الطاقة (Connected Load)</h4>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              المقاومة الفعلية: {loadType === 'open' ? '∞' : loadType === 'short' ? '0 Ω (قصر)' : `${loadResistance.toFixed(1)} Ω`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <button
              onClick={() => { setLoadType('resistor'); setOcpTripped(false); }}
              className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                loadType === 'resistor' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              مقاومة حمل متغيرة
            </button>
            <button
              onClick={() => { setLoadType('lamp'); setOcpTripped(false); }}
              className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                loadType === 'lamp' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              مصباح إضاءة (10W)
            </button>
            <button
              onClick={() => { setLoadType('motor'); setOcpTripped(false); }}
              className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                loadType === 'motor' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              محرك تيار مستمر
            </button>
            <button
              onClick={() => { setLoadType('open'); setOcpTripped(false); }}
              className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                loadType === 'open' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              دائرة مفتوحة (Open)
            </button>
            <button
              onClick={() => setLoadType('short')}
              className={`p-3 rounded-xl text-xs font-bold border transition-all text-center ${
                loadType === 'short' ? 'bg-rose-600 text-white border-rose-400' : 'bg-rose-950/40 text-rose-300 border-rose-900 hover:bg-rose-900/60'
              }`}
            >
              اختبار القصر (Short)
            </button>
          </div>

          {loadType === 'resistor' && (
            <div className="pt-2">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>تعديل مقاومة الحمل:</span>
                <span className="font-mono text-sky-400 font-bold">{loadResistance.toFixed(1)} Ω</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                step="0.5"
                value={loadResistance}
                onChange={(e) => setLoadResistance(parseFloat(e.target.value))}
                className="w-full accent-sky-500"
              />
            </div>
          )}

          {isTripped && (
            <div className="bg-rose-950/90 border border-rose-700 p-4 rounded-xl flex items-center justify-between text-rose-200 text-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>
                  انطلقت حماية القصر (OCP)! تم فصل مخارج المزود فورياً لمنع تلف الدائرة.
                </span>
              </div>
              <button
                onClick={() => { setOcpTripped(false); setLoadType('resistor'); }}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0"
              >
                إعادة تفعيل المخرج
              </button>
            </div>
          )}
        </div>

        {/* Live V-I Waveform Screen */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2 font-bold text-white">
              <Activity className="w-4 h-4 text-sky-400" />
              <span>مخطط الجهد والتيار بمرور الزمن (V-I Time Waveform)</span>
            </span>
            <div className="flex items-center gap-4 font-mono">
              <span className="text-sky-400">■ الجهد V(t)</span>
              <span className="text-emerald-400">■ التيار I(t)</span>
            </div>
          </div>
          <div className="bg-slate-950 rounded-2xl p-2 border border-slate-800 flex justify-center">
            <canvas ref={canvasRef} width={800} height={180} className="w-full max-w-[800px] h-[180px] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
