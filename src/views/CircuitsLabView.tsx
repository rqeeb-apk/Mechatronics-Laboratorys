import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Zap,
  Play,
  Square,
  RotateCcw,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Activity,
  Sliders,
  HelpCircle,
  Maximize2,
  Layers
} from 'lucide-react';
import { CircuitComponent, ComponentType, CircuitWire, CircuitSimulationState } from '../types.ts';
import { ElectronicsBoxView } from './ElectronicsBoxView.tsx';

export const CircuitsLabView: React.FC = () => {
  // Available component palette
  const componentPalette: { type: ComponentType; label: string; defaultValue: number; unit: string; iconText: string }[] = [
    { type: 'dc_source', label: 'مصدر DC', defaultValue: 12, unit: 'V', iconText: '🔋' },
    { type: 'ac_source', label: 'مصدر AC', defaultValue: 12, unit: 'V RMS', iconText: '⚡' },
    { type: 'resistor', label: 'مقاومة R', defaultValue: 220, unit: 'Ω', iconText: '⏚' },
    { type: 'capacitor', label: 'مكثف C', defaultValue: 100, unit: 'µF', iconText: '⫝' },
    { type: 'inductor', label: 'ملف L', defaultValue: 10, unit: 'mH', iconText: '⌇' },
    { type: 'switch', label: 'مفتاح SPST', defaultValue: 1, unit: 'حالة', iconText: '⏻' },
    { type: 'lamp', label: 'مصباح إضاءة', defaultValue: 12, unit: 'V (10W)', iconText: '💡' },
    { type: 'diode', label: 'دايود سيليكون', defaultValue: 0.7, unit: 'Vf', iconText: '⮞|' },
    { type: 'led', label: 'دايود ضوئي LED', defaultValue: 2.0, unit: 'Vf', iconText: '🔆' },
    { type: 'npn_transistor', label: 'ترانزستور NPN', defaultValue: 100, unit: 'hFE', iconText: '⎇' },
    { type: 'relay', label: 'مرحل Relay', defaultValue: 12, unit: 'V coil', iconText: '🧲' },
    { type: 'fuse', label: 'فيوز حماية', defaultValue: 2.0, unit: 'A', iconText: '🔌' },
    { type: 'ground', label: 'أرضي GND', defaultValue: 0, unit: 'V', iconText: '⏚' },
    { type: 'voltmeter', label: 'فولتميتر', defaultValue: 0, unit: 'V', iconText: '🅅' },
    { type: 'ammeter', label: 'أمبيرميتر', defaultValue: 0, unit: 'mA', iconText: '🄰' },
  ];

  // Circuit components on canvas
  const [components, setComponents] = useState<CircuitComponent[]>([
    { id: 'c_src', type: 'dc_source', x: 80, y: 160, label: 'مصدر جهد مستمر', value: 12, unit: 'V' },
    { id: 'c_sw', type: 'switch', x: 250, y: 160, label: 'مفتاح التشغيل', value: 1, unit: '', state: true },
    { id: 'c_res', type: 'resistor', x: 420, y: 160, label: 'مقاومة R1', value: 220, unit: 'Ω' },
    { id: 'c_led', type: 'led', x: 590, y: 160, label: 'دايود ضوئي LED', value: 2.0, unit: 'Vf' },
    { id: 'c_fuse', type: 'fuse', x: 740, y: 160, label: 'فيوز حماية', value: 1.5, unit: 'A', isBlown: false },
    { id: 'c_vmt', type: 'voltmeter', x: 420, y: 30, label: 'فولتميتر على المقاومة', value: 0, unit: 'V' },
    { id: 'c_gnd', type: 'ground', x: 80, y: 320, label: 'أرضي الدائرة', value: 0, unit: 'V' },
  ]);

  const [selectedCompId, setSelectedCompId] = useState<string | null>('c_src');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [connectionMode, setConnectionMode] = useState<'series' | 'parallel' | 'custom'>('series');
  const [workbenchMode, setWorkbenchMode] = useState<'physical_board' | 'schematic'>('physical_board');

  // Oscilloscope states
  const [showOscilloscope, setShowOscilloscope] = useState(false);
  const [oscTimeBase, setOscTimeBase] = useState(5); // ms/div
  const [oscVoltDivA, setOscVoltDivA] = useState(2); // V/div
  const [oscVoltDivB, setOscVoltDivB] = useState(2); // V/div
  const [oscFrequency, setOscFrequency] = useState(50); // Hz
  const [oscWaveform, setOscWaveform] = useState<'sine' | 'square' | 'triangle'>('sine');

  // Calculate Circuit Physics using useMemo (prevents Maximum update depth exceeded loop)
  const simState: CircuitSimulationState = useMemo(() => {
    if (!isRunning) {
      return {
        isRunning: false,
        totalCurrent_mA: 0,
        totalResistance_ohm: 0,
        sourceVoltage_V: 0,
        power_mW: 0,
        warnings: ['المحاكاة متوقفة حالياً. اضغط زر التشغيل لتفعيل التغذية الكهربائية.'],
        errors: [],
        isShortCircuit: false,
        isOpenCircuit: true,
      };
    }

    const warnings: string[] = [];
    const errors: string[] = [];

    // Find sources
    const dcSource = components.find(c => c.type === 'dc_source');
    const acSource = components.find(c => c.type === 'ac_source');
    const source = dcSource || acSource;

    const sourceVoltage = source ? source.value : 0;

    // Check switches
    const switches = components.filter(c => c.type === 'switch');
    const hasOpenSwitch = switches.some(s => s.state === false);

    // Check blown fuses
    const fuses = components.filter(c => c.type === 'fuse');
    const hasBlownFuse = fuses.some(f => f.isBlown);

    // Check resistance
    const resistors = components.filter(c => c.type === 'resistor');
    const lamps = components.filter(c => c.type === 'lamp');
    const leds = components.filter(c => c.type === 'led');
    const diodes = components.filter(c => c.type === 'diode');

    // Equivalent resistance calculation
    let totalR = 0;
    if (connectionMode === 'series') {
      resistors.forEach(r => totalR += r.value);
      lamps.forEach(() => totalR += 15); // standard 15 ohm lamp
    } else {
      // parallel mode
      let invSum = 0;
      resistors.forEach(r => invSum += (1 / Math.max(r.value, 0.1)));
      lamps.forEach(() => invSum += (1 / 15));
      totalR = invSum > 0 ? (1 / invSum) : 0;
    }

    // Semiconductor forward voltage drops
    let totalVf = 0;
    diodes.forEach(d => totalVf += (d.value || 0.7));
    leds.forEach(l => totalVf += (l.value || 2.0));

    let isShort = false;
    let isOpen = false;
    let current_mA = 0;

    if (!source || sourceVoltage <= 0) {
      warnings.push('لا يوجد مصدر جهد نشط في الدائرة. أضف مصدر DC أو AC.');
      isOpen = true;
    } else if (hasOpenSwitch) {
      warnings.push('الدائرة مفتوحة: يوجد مفتاح في وضع الإيقاف (OFF). لا يمر أي تيار.');
      isOpen = true;
    } else if (hasBlownFuse) {
      errors.push('تنبيه أمان: الفيوز احترق (انقطع) بسبب تجاوز تيار الحمل، الدائرة مفتوحة.');
      isOpen = true;
    } else if (totalR < 0.5 && (sourceVoltage - totalVf) > 0) {
      // Short circuit condition!
      isShort = true;
      errors.push('خطر: قصر كهربائي مباشر (Short Circuit)! المقاومة قريبة من الصفر دون عنصر حمل.');
      current_mA = 9999;
    } else {
      const netV = Math.max(sourceVoltage - totalVf, 0);
      const current_A = totalR > 0 ? (netV / totalR) : 0;
      current_mA = current_A * 1000;

      // Check if fuse warning
      fuses.forEach(f => {
        if (current_A > f.value) {
          errors.push(`تنبيه: الفيوز (${f.label}) تجاوز تيار الأمان ${f.value}A (التيار الحالي ${current_A.toFixed(2)}A).`);
        }
      });

      // LED check
      if (leds.length > 0) {
        if (current_mA > 35) {
          warnings.push('تحذير: تيار الدايود الضوئي LED مرتفع جدًا (> 35mA)، قد يحترق الدايود!');
        } else if (current_mA < 2 && netV > 0) {
          warnings.push('تيار LED ضعيف جدًا (< 2mA)، قد لا تكون الإضاءة مرئية.');
        }
      }
    }

    const power_mW = (sourceVoltage * (current_mA / 1000)) * 1000;

    return {
      isRunning: true,
      totalCurrent_mA: parseFloat(current_mA.toFixed(2)),
      totalResistance_ohm: parseFloat(totalR.toFixed(2)),
      sourceVoltage_V: sourceVoltage,
      power_mW: parseFloat(power_mW.toFixed(2)),
      warnings,
      errors,
      isShortCircuit: isShort,
      isOpenCircuit: isOpen,
    };
  }, [components, isRunning, connectionMode]);

  // Handle adding new component
  const handleAddComponent = (paletteItem: typeof componentPalette[0]) => {
    const newComp: CircuitComponent = {
      id: 'c_' + Date.now().toString(36),
      type: paletteItem.type,
      x: 100 + (components.length % 5) * 120,
      y: 200 + Math.floor(components.length / 5) * 80,
      label: paletteItem.label,
      value: paletteItem.defaultValue,
      unit: paletteItem.unit,
      state: paletteItem.type === 'switch' ? true : undefined,
      isBlown: paletteItem.type === 'fuse' ? false : undefined,
    };
    setComponents(prev => [...prev, newComp]);
    setSelectedCompId(newComp.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedCompId) return;
    setComponents(prev => prev.filter(c => c.id !== selectedCompId));
    setSelectedCompId(null);
  };

  const handleResetFuses = () => {
    setComponents(prev => prev.map(c => c.type === 'fuse' ? { ...c, isBlown: false } : c));
  };

  const selectedComp = components.find(c => c.id === selectedCompId);

  // Oscilloscope canvas drawing
  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (!showOscilloscope || !oscCanvasRef.current) return;
    const canvas = oscCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let timeOffset = 0;

    const render = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw oscilloscope grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const numHoriz = 8;
      const numVert = 10;
      for (let i = 0; i <= numHoriz; i++) {
        const y = (canvas.height / numHoriz) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      for (let j = 0; j <= numVert; j++) {
        const x = (canvas.width / numVert) * j;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw center axes
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      // Channel A (Source waveform) - Sky Blue
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const centerY = canvas.height / 2;
      const ampA = (simState.sourceVoltage_V / oscVoltDivA) * 20;

      for (let x = 0; x < canvas.width; x++) {
        const t = (x / canvas.width) * (10 / (oscFrequency / 10)) + timeOffset;
        let yVal = 0;
        if (oscWaveform === 'sine') {
          yVal = Math.sin(t * 2 * Math.PI);
        } else if (oscWaveform === 'square') {
          yVal = Math.sin(t * 2 * Math.PI) >= 0 ? 1 : -1;
        } else {
          yVal = (2 / Math.PI) * Math.asin(Math.sin(t * 2 * Math.PI));
        }
        const y = centerY - yVal * ampA;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Channel B (Load waveform / current) - Emerald
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const ampB = ((simState.totalCurrent_mA / 100) / oscVoltDivB) * 20;

      for (let x = 0; x < canvas.width; x++) {
        const t = (x / canvas.width) * (10 / (oscFrequency / 10)) + timeOffset;
        let yVal = 0;
        if (oscWaveform === 'sine') {
          yVal = Math.sin(t * 2 * Math.PI);
        } else if (oscWaveform === 'square') {
          yVal = Math.sin(t * 2 * Math.PI) >= 0 ? 1 : -1;
        } else {
          yVal = (2 / Math.PI) * Math.asin(Math.sin(t * 2 * Math.PI));
        }
        const y = centerY - yVal * ampB;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      timeOffset += isRunning ? 0.05 : 0;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [showOscilloscope, oscWaveform, oscFrequency, oscVoltDivA, oscVoltDivB, simState, isRunning]);

  return (
    <div className="space-y-6 pb-12">
      {/* Workbench Mode Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setWorkbenchMode('physical_board')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              workbenchMode === 'physical_board'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-300" />
            <span>لوحة التيارات والمنافذ وأجهزة القياس المخبرية (Physical Trainer Board)</span>
          </button>

          <button
            onClick={() => setWorkbenchMode('schematic')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              workbenchMode === 'schematic'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/30 ring-2 ring-sky-400'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-sky-400" />
            <span>المختبر التخطيطي وراسم الإشارة (Schematic Workbench)</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          {workbenchMode === 'physical_board'
            ? '⚡ لوحة حقيقية بمنافذ بنانا • أسلاك ملونة • جهاز فولتميتر وأميتر'
            : '📊 مخطط كهربي تفاعلي • قياسات حية • راسم إشارة ثنائي القناة'}
        </span>
      </div>

      {workbenchMode === 'physical_board' ? (
        <ElectronicsBoxView />
      ) : (
        <>
          {/* Header bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">مختبر الدوائر والقياسات الكهربائية</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Electric Circuits, Ohm & Kirchhoff Laws, Oscilloscope & Multimeter
          </p>
        </div>

        {/* Toolbar controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isRunning ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
            <span>{isRunning ? 'إيقاف المحاكاة' : 'تشغيل المحاكاة'}</span>
          </button>

          <button
            onClick={() => {
              setComponents([
                { id: 'c_src', type: 'dc_source', x: 80, y: 160, label: 'مصدر جهد مستمر', value: 12, unit: 'V' },
                { id: 'c_sw', type: 'switch', x: 250, y: 160, label: 'مفتاح التشغيل', value: 1, unit: '', state: true },
                { id: 'c_res', type: 'resistor', x: 420, y: 160, label: 'مقاومة R1', value: 220, unit: 'Ω' },
                { id: 'c_led', type: 'led', x: 590, y: 160, label: 'دايود ضوئي LED', value: 2.0, unit: 'Vf' },
                { id: 'c_fuse', type: 'fuse', x: 740, y: 160, label: 'فيوز حماية', value: 1.5, unit: 'A', isBlown: false },
                { id: 'c_vmt', type: 'voltmeter', x: 420, y: 30, label: 'فولتميتر على المقاومة', value: 0, unit: 'V' },
                { id: 'c_gnd', type: 'ground', x: 80, y: 320, label: 'أرضي الدائرة', value: 0, unit: 'V' },
              ]);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط الدائرة</span>
          </button>

          <button
            onClick={() => setShowOscilloscope(!showOscilloscope)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showOscilloscope
                ? 'bg-sky-600 text-white border-sky-400'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>راسم الإشارة (Oscilloscope)</span>
          </button>
        </div>
      </div>

      {/* Main Lab Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left/Sidebar: Component Palette & Property Editor */}
        <div className="space-y-4">
          {/* Component Palette */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-slate-300 border-r-2 border-sky-500 pr-2 flex items-center justify-between">
              <span>صندوق المكونات الكهربائية</span>
              <span className="text-[10px] text-slate-500 font-mono">15 عنصراً</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {componentPalette.map((p) => (
                <button
                  key={p.type}
                  onClick={() => handleAddComponent(p)}
                  className="bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 p-2 rounded-xl text-right transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">{p.iconText}</span>
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-200 block truncate">{p.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{p.defaultValue}{p.unit}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Component Properties */}
          {selectedComp ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-sky-400">خصائص: {selectedComp.label}</span>
                <button
                  onClick={handleDeleteSelected}
                  className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/50 rounded-lg transition-colors"
                  title="حذف العنصر"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">تسمية العنصر:</label>
                  <input
                    type="text"
                    value={selectedComp.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setComponents(prev => prev.map(c => c.id === selectedComp.id ? { ...c, label: val } : c));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>

                {selectedComp.type !== 'switch' && selectedComp.type !== 'ground' && (
                  <div>
                    <label className="text-slate-400 block mb-1">
                      القيمة ({selectedComp.unit}):
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={selectedComp.value}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setComponents(prev => prev.map(c => c.id === selectedComp.id ? { ...c, value: val } : c));
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                )}

                {selectedComp.type === 'switch' && (
                  <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg">
                    <span>حالة المفتاح:</span>
                    <button
                      onClick={() => {
                        setComponents(prev => prev.map(c => c.id === selectedComp.id ? { ...c, state: !c.state } : c));
                      }}
                      className={`px-3 py-1 rounded-md font-bold text-xs ${
                        selectedComp.state ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {selectedComp.state ? 'مغلق (ON)' : 'مفتوح (OFF)'}
                    </button>
                  </div>
                )}

                {selectedComp.type === 'fuse' && (
                  <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg">
                    <span>حالة السلك المنصهر:</span>
                    {selectedComp.isBlown ? (
                      <button
                        onClick={handleResetFuses}
                        className="bg-amber-600 text-white px-2 py-0.5 rounded text-[10px] font-bold"
                      >
                        إصلاح/استبدال الفيوز
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-bold">سليم وموصل</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-500">
              اضغط على أي عنصر في لوحة العمل لتعديل قيمته أو حذفه
            </div>
          )}

          {/* Connection topology mode */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">طريقة الربط الحسابية:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setConnectionMode('series')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                  connectionMode === 'series'
                    ? 'bg-sky-600 text-white border-sky-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                ربط توالي (Series)
              </button>
              <button
                onClick={() => setConnectionMode('parallel')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                  connectionMode === 'parallel'
                    ? 'bg-sky-600 text-white border-sky-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                ربط توازي (Parallel)
              </button>
            </div>
          </div>
        </div>

        {/* Center Canvas: Interactive Circuit Workbench */}
        <div className="lg:col-span-3 space-y-4">
          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-6 min-h-[420px] shadow-2xl lab-grid-bg overflow-hidden">
            {/* Workbench Header Info */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-900/80 border border-slate-800/80 px-4 py-2.5 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400">الجهد الكلي: </span>
                  <span className="text-sky-400 font-bold">{simState.sourceVoltage_V} V</span>
                </div>
                <div>
                  <span className="text-slate-400">التيار الكلي: </span>
                  <span className={`font-bold ${simState.isShortCircuit ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {simState.totalCurrent_mA} mA
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">المقاومة المكافئة: </span>
                  <span className="text-amber-400 font-bold">{simState.totalResistance_ohm} Ω</span>
                </div>
                <div>
                  <span className="text-slate-400">القدرة: </span>
                  <span className="text-purple-400 font-bold">{simState.power_mW} mW</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`} />
                <span className="text-xs font-semibold text-slate-300">
                  {isRunning ? 'المحاكاة نشطة' : 'متوقفة'}
                </span>
              </div>
            </div>

            {/* Simulated Circuit Board Graphic Wire Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <line x1="120" y1="200" x2="800" y2="200" stroke="#38bdf8" strokeWidth="3" strokeDasharray={isRunning && !simState.isOpenCircuit ? '6,6' : 'none'} className={isRunning && !simState.isOpenCircuit ? 'animate-[dash_1s_linear_infinite]' : ''} />
              <line x1="120" y1="200" x2="120" y2="340" stroke="#38bdf8" strokeWidth="3" />
              <line x1="800" y1="200" x2="800" y2="340" stroke="#38bdf8" strokeWidth="3" />
              <line x1="120" y1="340" x2="800" y2="340" stroke="#0284c7" strokeWidth="3" />
            </svg>

            {/* Component Cards in Canvas */}
            <div className="relative z-10 flex flex-wrap gap-4 items-center justify-around py-8">
              {components.map((comp) => {
                const isSelected = comp.id === selectedCompId;
                const isLedOn = comp.type === 'led' && isRunning && simState.totalCurrent_mA > 1 && !simState.isOpenCircuit;
                const isLampOn = comp.type === 'lamp' && isRunning && simState.totalCurrent_mA > 50 && !simState.isOpenCircuit;

                return (
                  <div
                    key={comp.id}
                    onClick={() => setSelectedCompId(comp.id)}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center min-w-[110px] min-h-[110px] backdrop-blur-sm ${
                      isSelected
                        ? 'border-sky-400 bg-sky-950/70 shadow-lg shadow-sky-500/20 scale-105'
                        : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                    }`}
                  >
                    {/* Visual glowing bulb / led */}
                    {isLedOn && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-400 blur-sm animate-pulse" />
                    )}
                    {isLampOn && (
                      <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 blur-md animate-pulse" />
                    )}

                    {/* Component Icon / Readout */}
                    <div className="text-2xl mb-1">
                      {comp.type === 'dc_source' && '🔋'}
                      {comp.type === 'ac_source' && '⚡'}
                      {comp.type === 'resistor' && '⏚'}
                      {comp.type === 'switch' && (comp.state ? '🟢' : '🔴')}
                      {comp.type === 'led' && (isLedOn ? '💡' : '🔘')}
                      {comp.type === 'lamp' && (isLampOn ? '✨' : '💡')}
                      {comp.type === 'fuse' && (comp.isBlown ? '💥' : '🔌')}
                      {comp.type === 'voltmeter' && '🅅'}
                      {comp.type === 'ammeter' && '🄰'}
                      {comp.type === 'diode' && '⮞|'}
                      {comp.type === 'ground' && '⏚'}
                      {comp.type === 'capacitor' && '⫝'}
                      {comp.type === 'inductor' && '⌇'}
                      {comp.type === 'npn_transistor' && '⎇'}
                      {comp.type === 'relay' && '🧲'}
                    </div>

                    <span className="text-[11px] font-bold text-white text-center truncate max-w-[90px]">
                      {comp.label}
                    </span>

                    {/* Value or live measurement */}
                    {comp.type === 'voltmeter' ? (
                      <span className="text-xs font-mono text-sky-400 font-bold mt-1 bg-slate-950 px-2 py-0.5 rounded">
                        {simState.isOpenCircuit || simState.isShortCircuit
                          ? 0
                          : parseFloat(((simState.totalCurrent_mA / 1000) * (components.find(c => c.type === 'resistor')?.value || 0)).toFixed(2))} V
                      </span>
                    ) : comp.type === 'ammeter' ? (
                      <span className="text-xs font-mono text-emerald-400 font-bold mt-1 bg-slate-950 px-2 py-0.5 rounded">
                        {simState.isOpenCircuit ? 0 : simState.totalCurrent_mA} mA
                      </span>
                    ) : comp.type === 'fuse' ? (
                      <span className={`text-[10px] font-mono mt-1 ${comp.isBlown ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                        {comp.isBlown ? 'محترق!' : `${comp.value} A`}
                      </span>
                    ) : comp.type === 'switch' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setComponents(prev => prev.map(c => c.id === comp.id ? { ...c, state: !c.state } : c));
                        }}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded mt-1 ${
                          comp.state ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}
                      >
                        {comp.state ? 'ON' : 'OFF'}
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {comp.value} {comp.unit}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Diagnostic Messages & Warnings */}
            <div className="mt-6 space-y-2">
              {simState.errors.map((err, i) => (
                <div key={i} className="bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
              {simState.warnings.map((warn, i) => (
                <div key={i} className="bg-amber-950/70 border border-amber-700/80 text-amber-200 text-xs p-2.5 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{warn}</span>
                </div>
              ))}
              {simState.errors.length === 0 && simState.warnings.length === 0 && isRunning && (
                <div className="bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs p-2.5 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>الدائرة الكهربائية مغلقة ومستقرة، والحسابات مطابقة لقوانين كيرشوف وأوم بدقة.</span>
                </div>
              )}
            </div>
          </div>

          {/* Oscilloscope Panel Drawer */}
          {showOscilloscope && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-400" />
                  <h3 className="text-base font-bold text-white">راسم الإشارة ثنائي القناة (Dual-Channel Oscilloscope)</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-sky-400 font-bold">CH A: الجهد</span>
                  <span className="text-emerald-400 font-bold">CH B: التيار</span>
                </div>
              </div>

              {/* Canvas Screen */}
              <div className="flex justify-center bg-slate-950 rounded-2xl p-2 border border-slate-800">
                <canvas
                  ref={oscCanvasRef}
                  width={680}
                  height={220}
                  className="w-full max-w-[700px] h-[220px] rounded-xl"
                />
              </div>

              {/* Oscilloscope Knob Controls */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-slate-400 block mb-1">شكل الموجة (Waveform):</label>
                  <select
                    value={oscWaveform}
                    onChange={(e: any) => setOscWaveform(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="sine">جيبية (Sine Wave)</option>
                    <option value="square">مربعة (Square Wave)</option>
                    <option value="triangle">مثلثية (Triangle Wave)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">التردد ({oscFrequency} Hz):</label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={oscFrequency}
                    onChange={(e) => setOscFrequency(parseInt(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">CH A (Volt/Div):</label>
                  <select
                    value={oscVoltDivA}
                    onChange={(e) => setOscVoltDivA(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="1">1 V / Div</option>
                    <option value="2">2 V / Div</option>
                    <option value="5">5 V / Div</option>
                    <option value="10">10 V / Div</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">CH B (Current/Div):</label>
                  <select
                    value={oscVoltDivB}
                    onChange={(e) => setOscVoltDivB(parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="1">100 mA / Div</option>
                    <option value="2">200 mA / Div</option>
                    <option value="5">500 mA / Div</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
