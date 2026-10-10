import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Gauge,
  Power,
  RotateCcw,
  Zap,
  Activity,
  Layers,
  ShieldAlert,
  Info,
  CheckCircle,
  AlertTriangle,
  Radio,
  Eye,
  Sliders,
  Play,
  Square,
  Plus,
  Trash2,
  Sparkles,
  Award,
  ArrowRight,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { labAudio } from '../utils/audio.ts';
import {
  solvePowerSupplyCircuit,
  WorkbenchComponent,
  JumperWire,
  SolverResult
} from '../utils/circuitSolver.ts';

type PowerRail = '+5V' | '+12V' | '-12V' | '+15V' | '-15V' | 'VAR' | 'GND' | 'NONE';

export const TrainingBoardView: React.FC = () => {
  // Main board AC input toggle switch & fuse
  const [isPowerOn, setIsPowerOn] = useState<boolean>(true);
  const [isMainFuseIntact, setIsMainFuseIntact] = useState<boolean>(true);

  // Rotary Potentiometer Knob Voltage (3.0V to 20.0V)
  const [varVoltageKnob, setVarVoltageKnob] = useState<number>(10.0); // Default 10.0V for user testing!

  // Active supply rails connected to workbench
  const [sourceRail, setSourceRail] = useState<'+5V' | '+12V' | '-12V' | '+15V' | '-15V' | 'VAR' | 'NONE'>('VAR');
  const [returnRail, setReturnRail] = useState<'GND' | '-12V' | '-15V' | 'NONE'>('GND');

  // Interactive Workbench Topology & Components
  const [connectionTopology, setConnectionTopology] = useState<'single' | 'series' | 'parallel' | 'custom'>('single');
  const [components, setComponents] = useState<WorkbenchComponent[]>([
    {
      id: 'res_1',
      type: 'resistor',
      name: 'مقاومة R1',
      value: 100, // 100Ω (Test Case 1)
      unit: 'Ω',
      pins: [
        { id: 'res_1_p1', label: 'طرف 1' },
        { id: 'res_1_p2', label: 'طرف 2' },
      ],
    },
  ]);

  // Interactive Jumper Wires connecting the Power Supply to Workbench
  const [wires, setWires] = useState<JumperWire[]>([
    { id: 'w_source', fromPinId: 'ps_var', toPinId: 'res_1_p1', color: 'yellow' },
    { id: 'w_return', fromPinId: 'res_1_p2', toPinId: 'ps_gnd', color: 'black' },
  ]);

  // Wire creation state
  const [selectedPinForWire, setSelectedPinForWire] = useState<{ id: string; label: string } | null>(null);
  const [activeWireColor, setActiveWireColor] = useState<'red' | 'black' | 'blue' | 'yellow' | 'green' | 'white'>('red');

  // Automated Test Preset tracker
  const [activeTestPreset, setActiveTestPreset] = useState<number>(1);

  // Benchtop Meters Controls
  const [vmHold, setVmHold] = useState<boolean>(false);
  const [vmRange, setVmRange] = useState<'AUTO' | '200mV' | '2V' | '20V' | '200V'>('AUTO');
  const [amHold, setAmHold] = useState<boolean>(false);
  const [amRange, setAmRange] = useState<'AUTO' | '200mA' | '10A'>('AUTO');

  // Live Oscilloscope Canvas Ref
  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate Circuit Physics using the Unified Circuit Physics Solver (memoized to prevent render thrashing)
  const solverResult: SolverResult = useMemo(() => {
    return solvePowerSupplyCircuit({
      isPowerOn,
      fuseIntact: isMainFuseIntact,
      varKnobVoltage: varVoltageKnob,
      activeRails: {
        sourceRail,
        returnRail,
      },
      components,
      wires,
      connectionTopology,
    });
  }, [
    isPowerOn,
    isMainFuseIntact,
    varVoltageKnob,
    sourceRail,
    returnRail,
    components,
    wires,
    connectionTopology,
  ]);

  const solverResultRef = useRef(solverResult);
  solverResultRef.current = solverResult;

  // Handle Main Switch Toggle
  const handleTogglePower = () => {
    labAudio.playSwitch();
    setIsPowerOn(!isPowerOn);
  };

  // Handle Knob Turning
  const handleKnobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVarVoltageKnob(parseFloat(e.target.value));
  };

  // Replace Main Fuse
  const handleReplaceFuse = () => {
    labAudio.playRelayClick();
    setIsMainFuseIntact(true);
  };

  // Connect Pin Handler (Click to wire)
  const handlePinClick = (pinId: string, pinLabel: string) => {
    labAudio.playWireSnap();

    if (!selectedPinForWire) {
      // First terminal selected
      setSelectedPinForWire({ id: pinId, label: pinLabel });
    } else {
      // Second terminal selected: create jumper wire!
      if (selectedPinForWire.id !== pinId) {
        const newWire: JumperWire = {
          id: `wire_${Date.now()}`,
          fromPinId: selectedPinForWire.id,
          toPinId: pinId,
          color: activeWireColor,
        };
        setWires((prev) => [...prev, newWire]);
      }
      setSelectedPinForWire(null);
    }
  };

  // Delete a wire
  const handleDeleteWire = (wireId: string) => {
    labAudio.playClick();
    setWires((prev) => prev.filter((w) => w.id !== wireId));
  };

  // Clear all wires
  const handleClearAllWires = () => {
    labAudio.playClick();
    setWires([]);
    setSelectedPinForWire(null);
  };

  // Apply Specific User Test Presets
  const applyTestPreset = (presetNumber: number) => {
    labAudio.playRelayClick();
    setActiveTestPreset(presetNumber);
    setIsPowerOn(true);
    setIsMainFuseIntact(true);

    switch (presetNumber) {
      case 1:
        // Test 1: 10V Source + 100Ω Resistor -> I = 0.1A
        setVarVoltageKnob(10.0);
        setSourceRail('VAR');
        setReturnRail('GND');
        setConnectionTopology('single');
        setComponents([
          {
            id: 'res_1',
            type: 'resistor',
            name: 'مقاومة R1 (100Ω)',
            value: 100,
            unit: 'Ω',
            pins: [
              { id: 'res_1_p1', label: 'طرف 1' },
              { id: 'res_1_p2', label: 'طرف 2' },
            ],
          },
        ]);
        setWires([
          { id: 'w1', fromPinId: 'ps_var', toPinId: 'res_1_p1', color: 'yellow' },
          { id: 'w2', fromPinId: 'res_1_p2', toPinId: 'ps_gnd', color: 'black' },
        ]);
        break;

      case 2:
        // Test 2: 10V Source + Two 100Ω Resistors in Series -> I = 0.05A
        setVarVoltageKnob(10.0);
        setSourceRail('VAR');
        setReturnRail('GND');
        setConnectionTopology('series');
        setComponents([
          {
            id: 'res_1',
            type: 'resistor',
            name: 'مقاومة R1 (100Ω)',
            value: 100,
            unit: 'Ω',
            pins: [
              { id: 'res_1_p1', label: 'طرف 1' },
              { id: 'res_1_p2', label: 'طرف 2' },
            ],
          },
          {
            id: 'res_2',
            type: 'resistor',
            name: 'مقاومة R2 (100Ω)',
            value: 100,
            unit: 'Ω',
            pins: [
              { id: 'res_2_p1', label: 'طرف 1' },
              { id: 'res_2_p2', label: 'طرف 2' },
            ],
          },
        ]);
        setWires([
          { id: 'w1', fromPinId: 'ps_var', toPinId: 'res_1_p1', color: 'yellow' },
          { id: 'w_mid', fromPinId: 'res_1_p2', toPinId: 'res_2_p1', color: 'green' },
          { id: 'w2', fromPinId: 'res_2_p2', toPinId: 'ps_gnd', color: 'black' },
        ]);
        break;

      case 3:
        // Test 3: 10V Source + Two 100Ω Resistors in Parallel -> I_total = 0.2A, each branch 0.1A
        setVarVoltageKnob(10.0);
        setSourceRail('VAR');
        setReturnRail('GND');
        setConnectionTopology('parallel');
        setComponents([
          {
            id: 'res_1',
            type: 'resistor',
            name: 'مقاومة فرع 1: R1 (100Ω)',
            value: 100,
            unit: 'Ω',
            pins: [
              { id: 'res_1_p1', label: 'طرف 1' },
              { id: 'res_1_p2', label: 'طرف 2' },
            ],
          },
          {
            id: 'res_2',
            type: 'resistor',
            name: 'مقاومة فرع 2: R2 (100Ω)',
            value: 100,
            unit: 'Ω',
            pins: [
              { id: 'res_2_p1', label: 'طرف 1' },
              { id: 'res_2_p2', label: 'طرف 2' },
            ],
          },
        ]);
        setWires([
          { id: 'w_top1', fromPinId: 'ps_var', toPinId: 'res_1_p1', color: 'yellow' },
          { id: 'w_top2', fromPinId: 'ps_var', toPinId: 'res_2_p1', color: 'yellow' },
          { id: 'w_bot1', fromPinId: 'res_1_p2', toPinId: 'ps_gnd', color: 'black' },
          { id: 'w_bot2', fromPinId: 'res_2_p2', toPinId: 'ps_gnd', color: 'black' },
        ]);
        break;

      case 4:
        // Test 4: Disconnect a wire -> Open circuit, I = 0.00A
        setVarVoltageKnob(10.0);
        setSourceRail('VAR');
        setReturnRail('GND');
        setConnectionTopology('single');
        setComponents([
          {
            id: 'res_1',
            type: 'resistor',
            name: 'مقاومة R1 (100Ω)',
            value: 100,
            unit: 'Ω',
            pins: [
              { id: 'res_1_p1', label: 'طرف 1' },
              { id: 'res_1_p2', label: 'طرف 2' },
            ],
          },
        ]);
        // Only one wire connected, return wire missing!
        setWires([
          { id: 'w1', fromPinId: 'ps_var', toPinId: 'res_1_p1', color: 'yellow' },
        ]);
        break;

      case 5:
        // Test 5: Power Supply OFF -> Outputs cut to 0.00V, 0.00A
        setIsPowerOn(false);
        break;

      case 6:
        // Test 6: Short Circuit -> OCP protection trips, warning shown
        setVarVoltageKnob(10.0);
        setSourceRail('VAR');
        setReturnRail('GND');
        setConnectionTopology('single');
        setComponents([]);
        // Wire directly from VAR to GND!
        setWires([
          { id: 'w_short', fromPinId: 'ps_var', toPinId: 'ps_gnd', color: 'red' },
        ]);
        labAudio.playFuseBlow();
        break;

      case 7:
        // Test 7: 12V Lamp + SPST Switch Control
        setVarVoltageKnob(12.0);
        setSourceRail('+12V');
        setReturnRail('GND');
        setConnectionTopology('series');
        setComponents([
          {
            id: 'sw_1',
            type: 'switch',
            name: 'مفتاح تحكم SPST',
            value: 1,
            unit: '',
            state: true,
            pins: [
              { id: 'sw_1_p1', label: 'مدخل' },
              { id: 'sw_1_p2', label: 'مخرج' },
            ],
          },
          {
            id: 'lamp_1',
            type: 'lamp',
            name: 'مصباح إضاءة 12V 10W',
            value: 12,
            unit: 'V',
            pins: [
              { id: 'lamp_1_p1', label: 'طرف +' },
              { id: 'lamp_1_p2', label: 'طرف -' },
            ],
          },
        ]);
        setWires([
          { id: 'w1', fromPinId: 'ps_12v', toPinId: 'sw_1_p1', color: 'red' },
          { id: 'w2', fromPinId: 'sw_1_p2', toPinId: 'lamp_1_p1', color: 'yellow' },
          { id: 'w3', fromPinId: 'lamp_1_p2', toPinId: 'ps_gnd', color: 'black' },
        ]);
        break;

      default:
        break;
    }
  };

  // Oscilloscope wave canvas
  useEffect(() => {
    const canvas = oscCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      ctx.fillStyle = '#030d0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = '#0e382b';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Center line
      ctx.strokeStyle = '#185942';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      const centerY = canvas.height / 2;

      const currentSolver = solverResultRef.current;
      if (currentSolver.isPowerOn && !currentSolver.isOcpTripped && !currentSolver.isOpenCircuit) {
        // Live voltage DC trace (Yellow)
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const vHeight = (currentSolver.sourceVoltage_V / 25) * (canvas.height / 2 - 15);
        for (let x = 0; x < canvas.width; x++) {
          const rip = Math.sin((x / 10) + t) * 1.5;
          const y = centerY - vHeight + rip;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Live Current DC trace (Cyan)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const iHeight = (currentSolver.totalCurrent_A / 0.5) * (canvas.height / 2 - 20);
        for (let x = 0; x < canvas.width; x++) {
          const y = centerY - iHeight;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        t += 0.05;
      } else {
        // Flatline 0V / 0A
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(canvas.width, centerY);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-600 text-white rounded-xl shadow-lg shadow-emerald-600/25">
              <Gauge className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                لوحة مزود الطاقة التفاعلية AC/DC POWER SUPPLY
              </h1>
              <p className="text-xs text-emerald-400 font-mono">
                Interactive Green PCB Trainer • Fused Multi-Rails (+5V, ±12V, ±15V, GND, VAR 3-20V) • Breadboard Circuit Solver
              </p>
            </div>
          </div>
        </div>

        {/* Power Switch & Status Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePower}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg cursor-pointer ${
              isPowerOn
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 shadow-rose-950/40'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isPowerOn ? 'المصدر قيد التشغيل (POWER ON)' : 'المصدر متوقف (POWER OFF)'}</span>
          </button>

          {!isMainFuseIntact && (
            <button
              onClick={handleReplaceFuse}
              className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md animate-pulse cursor-pointer"
            >
              استبدال الفيوز المنصهر
            </button>
          )}
        </div>
      </div>

      {/* QUICK ACADEMIC VERIFICATION PRESETS (Tests Required by User) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white">
              الاختبارات والتجارب المعيارية السريعة (One-Click Verification Suite):
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">مطابقة دقيقة لقوانين أوم وكيرشوف</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={() => applyTestPreset(1)}
            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
              activeTestPreset === 1
                ? 'bg-sky-950 border-sky-400 shadow-md shadow-sky-500/15'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-sky-400 font-bold block">اختبار 1 (مقاومة 100Ω):</span>
            <span className="text-xs font-bold text-white block">10V + 100Ω</span>
            <span className="text-[10px] text-emerald-400 font-mono">التيار = 0.1A</span>
          </button>

          <button
            onClick={() => applyTestPreset(2)}
            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
              activeTestPreset === 2
                ? 'bg-sky-950 border-sky-400 shadow-md shadow-sky-500/15'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-sky-400 font-bold block">اختبار 2 (مقاومتان توالي):</span>
            <span className="text-xs font-bold text-white block">10V + 100Ω + 100Ω</span>
            <span className="text-[10px] text-emerald-400 font-mono">التيار = 0.05A</span>
          </button>

          <button
            onClick={() => applyTestPreset(3)}
            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
              activeTestPreset === 3
                ? 'bg-sky-950 border-sky-400 shadow-md shadow-sky-500/15'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-sky-400 font-bold block">اختبار 3 (مقاومتان توازي):</span>
            <span className="text-xs font-bold text-white block">10V || 100Ω || 100Ω</span>
            <span className="text-[10px] text-emerald-400 font-mono">الكلي 0.2A (كل فرع 0.1A)</span>
          </button>

          <button
            onClick={() => applyTestPreset(4)}
            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
              activeTestPreset === 4
                ? 'bg-sky-950 border-sky-400 shadow-md shadow-sky-500/15'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-amber-400 font-bold block">اختبار 4 (فصل سلك):</span>
            <span className="text-xs font-bold text-white block">دائرة مفتوحة Open</span>
            <span className="text-[10px] text-slate-400 font-mono">التيار = 0.00A</span>
          </button>

          <button
            onClick={() => applyTestPreset(6)}
            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
              activeTestPreset === 6
                ? 'bg-rose-950 border-rose-500 shadow-md shadow-rose-500/15'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-rose-400 font-bold block">اختبار 5 (قصر كهربائي):</span>
            <span className="text-xs font-bold text-white block">Short Circuit</span>
            <span className="text-[10px] text-rose-400 font-mono">حماية OCP تفصل</span>
          </button>

          <button
            onClick={() => applyTestPreset(7)}
            className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
              activeTestPreset === 7
                ? 'bg-indigo-950 border-indigo-400 shadow-md shadow-indigo-500/15'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-[10px] text-indigo-400 font-bold block">اختبار 6 (مصباح ومفتاح):</span>
            <span className="text-xs font-bold text-white block">مصباح 12V 10W</span>
            <span className="text-[10px] text-indigo-300 font-mono">إضاءة حقيقية ومفتاح</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* THE GREEN PCB ELECTRONIC BOARD (Matching User Uploaded Photo Exactly) */}
      {/* ========================================================================= */}
      <div className="bg-[#0b3d2c] border-4 border-[#125840] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden select-none">
        {/* PCB Screws in 4 corners */}
        <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-amber-400/90 border-2 border-amber-600 shadow-inner flex items-center justify-center text-[8px] text-amber-950 font-bold">+</div>
        <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-amber-400/90 border-2 border-amber-600 shadow-inner flex items-center justify-center text-[8px] text-amber-950 font-bold">+</div>
        <div className="absolute bottom-4 left-4 w-4 h-4 rounded-full bg-amber-400/90 border-2 border-amber-600 shadow-inner flex items-center justify-center text-[8px] text-amber-950 font-bold">+</div>
        <div className="absolute bottom-4 right-4 w-4 h-4 rounded-full bg-amber-400/90 border-2 border-amber-600 shadow-inner flex items-center justify-center text-[8px] text-amber-950 font-bold">+</div>

        {/* PCB Silkscreen Borders & Ground Traces */}
        <div className="absolute inset-5 border border-emerald-500/30 rounded-2xl pointer-events-none" />

        {/* Board Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          {/* LEFT SECTION (Col 1-4): Transformer, Primary Switch, Fuse, Power LED */}
          <div className="lg:col-span-4 space-y-4">
            {/* 1. Main Power Switch with Red Pilot LED and Fuse */}
            <div className="bg-emerald-950/80 border-2 border-emerald-500/40 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-700/50 pb-2">
                <span className="text-xs font-mono font-black text-white">AC MAINS 240V INPUT</span>
                <span className="text-[10px] text-emerald-300 font-mono">50/60 Hz</span>
              </div>

              <div className="flex items-center justify-around py-1">
                {/* Red Pilot Lamp / LED */}
                <div className="text-center space-y-1">
                  <div
                    className={`w-7 h-7 rounded-full mx-auto border-2 transition-all ${
                      isPowerOn
                        ? 'bg-rose-500 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-pulse'
                        : 'bg-rose-950 border-rose-900 opacity-50'
                    }`}
                  />
                  <span className="text-[9px] font-mono font-bold text-rose-300 block">POWER LED</span>
                </div>

                {/* Rocker Toggle Switch */}
                <div className="text-center space-y-1">
                  <button
                    onClick={handleTogglePower}
                    className={`w-12 h-8 rounded-lg font-mono text-xs font-black border-2 transition-all cursor-pointer shadow-md ${
                      isPowerOn
                        ? 'bg-rose-600 text-white border-rose-400 shadow-rose-600/40'
                        : 'bg-slate-800 text-slate-400 border-slate-600'
                    }`}
                  >
                    {isPowerOn ? 'ON' : 'OFF'}
                  </button>
                  <span className="text-[9px] font-mono text-emerald-300 block">SWITCH</span>
                </div>

                {/* Cartridge Fuse Holder */}
                <div className="text-center space-y-1">
                  <div
                    onClick={() => {
                      if (!isMainFuseIntact) handleReplaceFuse();
                    }}
                    className={`w-14 h-6 rounded-md border flex items-center justify-center text-[9px] font-mono cursor-pointer transition-all ${
                      isMainFuseIntact
                        ? 'bg-slate-800/90 border-slate-500 text-amber-300'
                        : 'bg-rose-950 border-rose-500 text-rose-400 animate-pulse'
                    }`}
                    title={isMainFuseIntact ? 'فيوز 1A سليم' : 'الفيوز محترق! اضغط للاستبدال'}
                  >
                    {isMainFuseIntact ? 'FUSE 1A' : 'BLOWN!'}
                  </div>
                  <span className="text-[9px] font-mono text-emerald-300 block">PROTECTION</span>
                </div>
              </div>
            </div>

            {/* 2. Realistic Step-Down Transformer with Yellow Coil (Matching Photo) */}
            <div className="bg-emerald-950/80 border-2 border-emerald-500/40 rounded-2xl p-4 text-center space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-emerald-200 border-b border-emerald-700/50 pb-1">
                <span>T1 TRANSFORMER</span>
                <span>240V → 15V / 12V / 9V (20VA)</span>
              </div>

              {/* Graphic of Transformer with Yellow Core and 4 Screws */}
              <div className="w-full h-32 bg-[#1b2432] rounded-xl border-2 border-slate-700 p-2 flex items-center justify-between shadow-inner relative">
                {/* 4 Corner Screws on Transformer Bracket */}
                <div className="absolute top-1 left-1 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 text-[6px] text-black font-bold flex items-center justify-center">+</div>
                <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 text-[6px] text-black font-bold flex items-center justify-center">+</div>
                <div className="absolute bottom-1 left-1 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 text-[6px] text-black font-bold flex items-center justify-center">+</div>
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-slate-400 border border-slate-600 text-[6px] text-black font-bold flex items-center justify-center">+</div>

                {/* Left Iron Lamination */}
                <div className="w-7 h-24 bg-gradient-to-r from-slate-700 to-slate-800 rounded border border-slate-600 shadow" />

                {/* Bright Yellow Wound Secondary Coil (Matching Photo!) */}
                <div className="flex-1 mx-2 h-24 bg-gradient-to-b from-yellow-400 via-yellow-300 to-yellow-500 rounded-lg border-2 border-yellow-600 shadow-md flex flex-col justify-around py-1.5 px-3">
                  <div className="h-1 bg-yellow-600/40 rounded" />
                  <span className="text-[10px] font-mono font-black text-amber-950 text-center tracking-wider">
                    COPPER WINDING
                  </span>
                  <div className="h-1 bg-yellow-600/40 rounded" />
                  <span className="text-[8px] font-mono text-amber-900 text-center">
                    CLASS B ISOLATED
                  </span>
                  <div className="h-1 bg-yellow-600/40 rounded" />
                </div>

                {/* Right Iron Lamination */}
                <div className="w-7 h-24 bg-gradient-to-r from-slate-800 to-slate-700 rounded border border-slate-600 shadow" />
              </div>

              <span className="text-[9px] text-emerald-300 font-mono block">محول خافض جهد معزول كلفانياً للحماية</span>
            </div>
          </div>

          {/* CENTER SECTION (Col 5-8): Capacitors, Regulators, Dual Digital Display & Rotary Knob */}
          <div className="lg:col-span-4 space-y-4">
            {/* 1. Electrolytic Filter Capacitors & Heat Sinks (Matching Image Components) */}
            <div className="bg-emerald-950/80 border-2 border-emerald-500/40 rounded-2xl p-3 flex items-center justify-around shadow-inner">
              {/* Large Capacitors */}
              <div className="flex gap-2">
                <div className="w-10 h-14 rounded-lg bg-gradient-to-b from-slate-800 to-black border border-slate-600 flex flex-col justify-between items-center p-1 shadow-md">
                  <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-[8px] text-slate-300">+</div>
                  <span className="text-[7px] font-mono text-white">1000µF</span>
                  <span className="text-[6px] font-mono text-slate-400">35V</span>
                </div>
                <div className="w-10 h-14 rounded-lg bg-gradient-to-b from-slate-800 to-black border border-slate-600 flex flex-col justify-between items-center p-1 shadow-md">
                  <div className="w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center text-[8px] text-slate-300">+</div>
                  <span className="text-[7px] font-mono text-white">1000µF</span>
                  <span className="text-[6px] font-mono text-slate-400">35V</span>
                </div>
              </div>

              {/* Heatsink with Regulators (LM7805, LM7812, LM7912, LM317) */}
              <div className="w-16 h-14 bg-gradient-to-b from-slate-600 to-slate-800 rounded-lg border border-slate-400 p-1 flex flex-col justify-between shadow-md">
                <div className="flex justify-around">
                  <div className="w-1 h-3 bg-slate-900 rounded" />
                  <div className="w-1 h-3 bg-slate-900 rounded" />
                  <div className="w-1 h-3 bg-slate-900 rounded" />
                </div>
                <span className="text-[8px] font-mono font-bold text-center text-white">LM317 / 78xx</span>
                <span className="text-[6px] font-mono text-center text-slate-300">HEATSINK</span>
              </div>

              {/* Bridge Diodes 1N4007 */}
              <div className="text-center font-mono text-[8px] text-emerald-200">
                <span className="block font-bold">1N4007 × 4</span>
                <span className="text-amber-300">BRIDGE RECTIFIER</span>
              </div>
            </div>

            {/* 2. DUAL DIGITAL 7-SEGMENT LED DISPLAY (RED VOLTAGE & BLUE CURRENT) */}
            <div className="bg-black border-4 border-slate-700 rounded-2xl p-4 shadow-2xl text-center space-y-1 relative">
              <span className="text-[9px] font-mono text-slate-400 block tracking-wider">
                DUAL DIGITAL METER (V & A DISPLAY)
              </span>

              {/* Red Voltage Display */}
              <div className="bg-[#120000] border border-rose-950 rounded-xl py-1 px-3 shadow-inner">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-mono text-rose-500 font-bold">VOLTS</span>
                  <span className="font-mono text-3xl font-black text-rose-500 tracking-widest drop-shadow-[0_0_12px_rgba(244,63,94,0.85)]">
                    {solverResult.isPowerOn && !solverResult.isOcpTripped
                      ? `${solverResult.sourceVoltage_V.toFixed(1)}`
                      : '0.0'}
                    <span className="text-xl ml-1 font-bold">V</span>
                  </span>
                </div>
              </div>

              {/* Blue Current Display */}
              <div className="bg-[#000814] border border-sky-950 rounded-xl py-1 px-3 shadow-inner">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-mono text-sky-400 font-bold">AMPS</span>
                  <span className="font-mono text-3xl font-black text-sky-400 tracking-widest drop-shadow-[0_0_12px_rgba(56,189,248,0.85)]">
                    {solverResult.isPowerOn && !solverResult.isOcpTripped
                      ? `${solverResult.totalCurrent_A.toFixed(2)}`
                      : '0.00'}
                    <span className="text-xl ml-1 font-bold">A</span>
                  </span>
                </div>
              </div>

              {solverResult.isOcpTripped && (
                <div className="absolute inset-0 bg-rose-950/90 rounded-2xl flex items-center justify-center border-2 border-rose-500 animate-pulse">
                  <span className="text-xs font-mono font-bold text-white px-2 py-1 bg-rose-600 rounded">
                    OCP TRIPPED (قصر كهربائي!)
                  </span>
                </div>
              )}
            </div>

            {/* 3. CALIBRATED ROTARY POTENTIOMETER KNOB (3V to 20V) */}
            <div className="bg-emerald-950/80 border-2 border-emerald-500/40 rounded-2xl p-4 text-center space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white font-bold">مقبض معايرة الجهد (3-20V):</span>
                <span className="text-amber-300 font-black">{varVoltageKnob.toFixed(1)}V</span>
              </div>

              {/* Rotary Knob Dial Graphic with Pointer */}
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                {/* Dial Markings Ring (3V, 6V, 10V, 15V, 20V) */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400/50 flex items-center justify-center">
                  <span className="absolute top-0 text-[8px] font-mono text-white">10V</span>
                  <span className="absolute bottom-0 text-[8px] font-mono text-white">0V</span>
                  <span className="absolute left-1 text-[8px] font-mono text-white">3V</span>
                  <span className="absolute right-1 text-[8px] font-mono text-white">20V</span>
                </div>

                {/* Rotating Metallic Knob */}
                <div
                  className="w-18 h-18 rounded-full bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 border-4 border-slate-600 shadow-xl flex items-center justify-center relative cursor-pointer"
                  style={{
                    transform: `rotate(${((varVoltageKnob - 3) / 17) * 270 - 135}deg)`,
                  }}
                >
                  {/* Indicator Notch / Pointer */}
                  <div className="w-1.5 h-6 bg-rose-600 rounded-full absolute -top-1" />
                  <div className="w-6 h-6 rounded-full bg-slate-700 shadow-inner" />
                </div>
              </div>

              {/* Slider for smooth and precise adjustment */}
              <input
                type="range"
                min="3.0"
                max="20.0"
                step="0.1"
                value={varVoltageKnob}
                onChange={handleKnobChange}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* RIGHT SECTION (Col 9-12): OUTPUT BANANA BINDING POSTS & AC SUPPLIES */}
          <div className="lg:col-span-4 space-y-4">
            {/* 1. DC Output Terminals Matrix (+5V, +12V, -12V, +15V, -15V, GND, VAR) */}
            <div className="bg-emerald-950/80 border-2 border-emerald-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-emerald-700/50 pb-2">
                <h3 className="text-xs font-mono font-black text-white">DC OUTPUT TERMINALS</h3>
                <span className="text-[10px] text-sky-300 font-mono">REGULATED RAILS</span>
              </div>

              {/* Terminals Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                {/* +5V Terminal (Red) */}
                <div
                  onClick={() => {
                    handlePinClick('ps_5v', '+5V Rail');
                    setSourceRail('+5V');
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    selectedPinForWire?.id === 'ps_5v' ? 'scale-110' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-rose-600 border-4 border-rose-300 shadow-lg flex items-center justify-center relative group-hover:scale-105 transition-all">
                    <div className="w-4 h-4 rounded-full bg-rose-950 shadow-inner" />
                    {selectedPinForWire?.id === 'ps_5v' && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    +5V
                  </span>
                </div>

                {/* +12V Terminal (Red) */}
                <div
                  onClick={() => {
                    handlePinClick('ps_12v', '+12V Rail');
                    setSourceRail('+12V');
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    selectedPinForWire?.id === 'ps_12v' ? 'scale-110' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-rose-600 border-4 border-rose-300 shadow-lg flex items-center justify-center relative group-hover:scale-105 transition-all">
                    <div className="w-4 h-4 rounded-full bg-rose-950 shadow-inner" />
                    {selectedPinForWire?.id === 'ps_12v' && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    +12V
                  </span>
                </div>

                {/* +15V Terminal (Red) */}
                <div
                  onClick={() => {
                    handlePinClick('ps_15v', '+15V Rail');
                    setSourceRail('+15V');
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    selectedPinForWire?.id === 'ps_15v' ? 'scale-110' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-rose-600 border-4 border-rose-300 shadow-lg flex items-center justify-center relative group-hover:scale-105 transition-all">
                    <div className="w-4 h-4 rounded-full bg-rose-950 shadow-inner" />
                    {selectedPinForWire?.id === 'ps_15v' && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    +15V
                  </span>
                </div>

                {/* -12V Terminal (Blue - Negative Potential!) */}
                <div
                  onClick={() => {
                    handlePinClick('ps_minus12v', '-12V Rail');
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    selectedPinForWire?.id === 'ps_minus12v' ? 'scale-110' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-blue-300 shadow-lg flex items-center justify-center relative group-hover:scale-105 transition-all">
                    <div className="w-4 h-4 rounded-full bg-blue-950 shadow-inner" />
                    {selectedPinForWire?.id === 'ps_minus12v' && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                    -12V
                  </span>
                </div>

                {/* -15V Terminal (Blue - Negative Potential!) */}
                <div
                  onClick={() => {
                    handlePinClick('ps_minus15v', '-15V Rail');
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    selectedPinForWire?.id === 'ps_minus15v' ? 'scale-110' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-blue-300 shadow-lg flex items-center justify-center relative group-hover:scale-105 transition-all">
                    <div className="w-4 h-4 rounded-full bg-blue-950 shadow-inner" />
                    {selectedPinForWire?.id === 'ps_minus15v' && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                    -15V
                  </span>
                </div>

                {/* Common GND Terminal (Black - 0V Reference!) */}
                <div
                  onClick={() => {
                    handlePinClick('ps_gnd', 'GND Reference');
                    setReturnRail('GND');
                  }}
                  className={`flex flex-col items-center gap-1 cursor-pointer group ${
                    selectedPinForWire?.id === 'ps_gnd' ? 'scale-110' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-900 border-4 border-slate-500 shadow-lg flex items-center justify-center relative group-hover:scale-105 transition-all">
                    <div className="w-4 h-4 rounded-full bg-black shadow-inner" />
                    {selectedPinForWire?.id === 'ps_gnd' && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                    GND (0V)
                  </span>
                </div>

                {/* Variable DC Output +VAR (Yellow) */}
                <div
                  onClick={() => {
                    handlePinClick('ps_var', '+VAR Output');
                    setSourceRail('VAR');
                  }}
                  className={`col-span-3 flex items-center justify-center gap-3 p-2 bg-slate-950/70 rounded-xl border border-yellow-500/50 cursor-pointer ${
                    selectedPinForWire?.id === 'ps_var' ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-yellow-400 border-4 border-yellow-600 shadow-lg flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-950" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-yellow-300 block">
                      +VAR OUTPUT ({varVoltageKnob.toFixed(1)}V)
                    </span>
                    <span className="text-[9px] text-slate-400">مخرج الجهد المتغير المنظم</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. AC Isolated Supplies Section (Matching Photo: 15V, 12V, 9V, 0V) */}
            <div className="bg-emerald-950/80 border-2 border-emerald-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-emerald-700/50 pb-2">
                <h3 className="text-xs font-mono font-black text-white">AC SUPPLIES (ISOLATED)</h3>
                <span className="text-[10px] text-amber-300 font-mono">MULTI-FUSED</span>
              </div>

              <div className="flex items-center justify-around">
                <div
                  onClick={() => handlePinClick('ps_ac15v', '15V AC')}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center shadow">
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-white">15V AC</span>
                </div>

                <div
                  onClick={() => handlePinClick('ps_ac12v', '12V AC')}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center shadow">
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-white">12V AC</span>
                </div>

                <div
                  onClick={() => handlePinClick('ps_ac9v', '9V AC')}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center shadow">
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-white">9V AC</span>
                </div>

                <div
                  onClick={() => handlePinClick('ps_ac0v', '0V AC Return')}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center shadow">
                    <div className="w-3 h-3 rounded-full bg-black" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-white">0V COM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Board Bottom Silkscreen Label (Matching Photo!) */}
        <div className="mt-6 pt-3 border-t-2 border-emerald-400/30 flex items-center justify-between text-xs font-mono text-emerald-200">
          <span className="font-bold tracking-widest text-sm">AC/DC POWER SUPPLY</span>
          <span className="text-[10px] text-emerald-400">CLASSROOM MECHATRONICS LAB TRAINER • REV 2.4</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE BREADBOARD & COMPONENT WORKBENCH */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Workbench Control Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                لوحة التجارب والمكونات التفاعلية (Breadboard & Wiring Workbench)
              </h2>
              <span className="text-xs text-slate-400">
                قم بتوصيل الأسلاك بين مخارج مزود الطاقة والمكونات لحساب التيار والجهد بقوانين أوم وكيرشوف
              </span>
            </div>
          </div>

          {/* Wire Color Picker & Clear Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 px-1 font-mono">لون السلك:</span>
              {(['red', 'black', 'blue', 'yellow', 'green'] as const).map((clr) => (
                <button
                  key={clr}
                  onClick={() => setActiveWireColor(clr)}
                  className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer ${
                    activeWireColor === clr ? 'scale-125 border-white shadow' : 'border-transparent opacity-70'
                  }`}
                  style={{
                    backgroundColor:
                      clr === 'red' ? '#ef4444' : clr === 'black' ? '#0f172a' : clr === 'blue' ? '#3b82f6' : clr === 'yellow' ? '#eab308' : '#22c55e',
                  }}
                  title={clr}
                />
              ))}
            </div>

            <button
              onClick={handleClearAllWires}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>حذف جميع الأسلاك</span>
            </button>
          </div>
        </div>

        {/* Wire Connection Helper Banner */}
        {selectedPinForWire && (
          <div className="bg-amber-950/80 border border-amber-600 p-3 rounded-xl flex items-center justify-between text-xs text-amber-200 animate-pulse">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                تم تحديد الطرف: <strong className="text-white">{selectedPinForWire.label}</strong>. اضغط الآن على الطرف الآخر لتوصيل سلك بنانا!
              </span>
            </div>
            <button
              onClick={() => setSelectedPinForWire(null)}
              className="text-[10px] underline text-amber-400 cursor-pointer"
            >
              إلغاء التحديد
            </button>
          </div>
        )}

        {/* Live Status Message & Circuit Condition Banner */}
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
            solverResult.statusType === 'normal'
              ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-200'
              : solverResult.statusType === 'open'
              ? 'bg-amber-950/70 border-amber-600/60 text-amber-200'
              : solverResult.statusType === 'short'
              ? 'bg-rose-950/90 border-rose-500 text-rose-100 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {solverResult.statusType === 'normal' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {solverResult.statusType === 'open' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {solverResult.statusType === 'short' && <ShieldAlert className="w-5 h-5 text-rose-400" />}
            {solverResult.statusType === 'off' && <Power className="w-4 h-4 text-slate-500" />}
            <span className="font-bold">{solverResult.statusMessage}</span>
          </div>

          <div className="font-mono text-[11px] font-bold">
            {solverResult.isOcpTripped && <span className="text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-700">حماية OCP مفعلة</span>}
          </div>
        </div>

        {/* Breadboard Visualizer with Mounted Components */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 shadow-inner space-y-4">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-mono font-bold">BREADBOARD EXPERIMENTAL AREA</span>
            <span>{components.length} مكونات مركبة • {wires.length} أسلاك موصلة</span>
          </div>

          {/* Components Grid on the Breadboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((comp) => (
              <div
                key={comp.id}
                className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-lg relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{comp.name}</span>
                  <span className="text-xs font-mono text-sky-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {comp.value} {comp.unit}
                  </span>
                </div>

                {/* Resistor Color Bands Graphic */}
                {comp.type === 'resistor' && (
                  <div className="py-2">
                    <div className="w-full h-8 bg-amber-100 rounded-full border-2 border-amber-800 flex items-center justify-around px-4 shadow">
                      {/* Color bands for 100 ohms: Brown, Black, Brown, Gold */}
                      <div className="w-2 h-full bg-amber-900" title="بني (1)" />
                      <div className="w-2 h-full bg-black" title="أسود (0)" />
                      <div className="w-2 h-full bg-amber-900" title="بني (×10)" />
                      <div className="w-2 h-full bg-yellow-500" title="ذهبي (±5%)" />
                    </div>
                  </div>
                )}

                {/* Lamp Visualizer with Live Filament Glow */}
                {comp.type === 'lamp' && (
                  <div className="text-center py-2">
                    <div
                      className="w-14 h-14 rounded-full mx-auto flex items-center justify-center border transition-all duration-300"
                      style={{
                        backgroundColor:
                          solverResult.totalCurrent_A > 0.05
                            ? `rgba(245, 158, 11, ${Math.min(1, solverResult.totalCurrent_A / 0.8)})`
                            : '#1e293b',
                        boxShadow:
                          solverResult.totalCurrent_A > 0.05
                            ? `0 0 25px rgba(245, 158, 11, ${Math.min(1, solverResult.totalCurrent_A / 0.8)})`
                            : 'none',
                        borderColor: solverResult.totalCurrent_A > 0.05 ? '#f59e0b' : '#475569',
                      }}
                    >
                      <Zap className={`w-7 h-7 ${solverResult.totalCurrent_A > 0.05 ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                  </div>
                )}

                {/* Switch SPST Toggle */}
                {comp.type === 'switch' && (
                  <div className="flex justify-center py-2">
                    <button
                      onClick={() => {
                        labAudio.playSwitch();
                        setComponents((prev) =>
                          prev.map((c) => (c.id === comp.id ? { ...c, state: !c.state } : c))
                        );
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        comp.state ? 'bg-emerald-600 text-white' : 'bg-rose-950 text-rose-300 border border-rose-700'
                      }`}
                    >
                      {comp.state ? 'مفتاح مغلق (CLOSED / ON)' : 'مفتاح مفتوح (OPEN / OFF)'}
                    </button>
                  </div>
                )}

                {/* Component Connection Pins / Terminals */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                  {comp.pins.map((pin) => (
                    <button
                      key={pin.id}
                      onClick={() => handlePinClick(pin.id, `${comp.name} (${pin.label})`)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        selectedPinForWire?.id === pin.id
                          ? 'bg-amber-500 text-black border-amber-300 shadow font-bold'
                          : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      <span>{pin.label}</span>
                    </button>
                  ))}
                </div>

                {/* Live Branch Calculation Display */}
                {solverResult.branchResults[comp.id] && (
                  <div className="mt-2 pt-2 border-t border-slate-800/60 font-mono text-[10px] text-emerald-400 flex justify-between">
                    <span>V = {solverResult.branchResults[comp.id].voltageDrop_V.toFixed(2)}V</span>
                    <span>I = {solverResult.branchResults[comp.id].current_A.toFixed(3)}A</span>
                    <span>P = {solverResult.branchResults[comp.id].power_W.toFixed(2)}W</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Wires List & Active Leads */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 block mb-2">الأسلاك الموصلة حالياً:</span>
            {wires.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {wires.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl text-xs"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          w.color === 'red' ? '#ef4444' : w.color === 'black' ? '#0f172a' : w.color === 'blue' ? '#3b82f6' : w.color === 'yellow' ? '#eab308' : '#22c55e',
                      }}
                    />
                    <span className="font-mono text-[11px] text-slate-300">
                      {w.fromPinId} ⟷ {w.toPinId}
                    </span>
                    <button
                      onClick={() => handleDeleteWire(w.id)}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer ml-1"
                      title="فصل السلك"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono">لا توجد أسلاك موصلة (الدائرة مفتوحة)</span>
            )}
          </div>
        </div>

        {/* SHARED BENCHTOP LABORATORY MEASUREMENT INSTRUMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* 1. Precision Benchtop Digital Voltmeter */}
          <div className="bg-[#1b222d] border-4 border-[#0e141c] rounded-3xl p-5 shadow-2xl space-y-3 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm" />
                <span className="font-mono font-black text-xs text-slate-200 tracking-wider">
                  BENCHTOP VOLTMETER <span className="text-cyan-400">VM-8000</span>
                </span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                CALIBRATED · TRUE RMS
              </span>
            </div>

            {/* Glowing Cyan VFD Display */}
            <div className="bg-[#03151b] border-2 border-[#093544] rounded-2xl p-4 shadow-inner space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                <span>DC VOLTS</span>
                <span>RANGE: {vmRange}</span>
                {vmHold && <span className="bg-amber-950 text-amber-300 px-1 rounded font-bold">HOLD</span>}
              </div>
              <div className="flex items-baseline justify-between py-1">
                <div className="font-mono text-4xl sm:text-5xl font-black text-cyan-300 tracking-widest drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">
                  {vmHold
                    ? `${solverResult.voltmeterReading_V.toFixed(2)}`
                    : `${solverResult.isPowerOn && !solverResult.isOcpTripped ? solverResult.voltmeterReading_V.toFixed(2) : '0.00'}`}
                </div>
                <span className="font-mono text-xl font-bold text-cyan-400">V DC</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full border border-cyan-950 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-150"
                  style={{ width: `${Math.min(100, Math.max(0, (solverResult.voltmeterReading_V / 25) * 100))}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <button
                onClick={() => {
                  labAudio.playBeep();
                  setVmHold(!vmHold);
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl border font-bold transition-all cursor-pointer ${
                  vmHold ? 'bg-amber-950 border-amber-600 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                HOLD (تثبيت)
              </button>
              <button
                onClick={() => {
                  labAudio.playDialClick();
                  setVmRange((prev) => (prev === 'AUTO' ? '20V' : prev === '20V' ? '200V' : 'AUTO'));
                }}
                className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
              >
                المدى: {vmRange}
              </button>
            </div>
          </div>

          {/* 2. Precision Benchtop Digital Ammeter */}
          <div className="bg-[#1b222d] border-4 border-[#0e141c] rounded-3xl p-5 shadow-2xl space-y-3 relative overflow-hidden select-none">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                <span className="font-mono font-black text-xs text-slate-200 tracking-wider">
                  BENCHTOP AMMETER <span className="text-emerald-400">AM-3000</span>
                </span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                SERIES FUSED 10A
              </span>
            </div>

            {/* Glowing Emerald VFD Display */}
            <div className="bg-[#041a12] border-2 border-[#0c4431] rounded-2xl p-4 shadow-inner space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
                <span>DC CURRENT</span>
                <span>RANGE: {amRange}</span>
                {amHold && <span className="bg-amber-950 text-amber-300 px-1 rounded font-bold">HOLD</span>}
              </div>
              <div className="flex items-baseline justify-between py-1">
                <div className="font-mono text-4xl sm:text-5xl font-black text-emerald-300 tracking-widest drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
                  {amHold
                    ? `${solverResult.ammeterReading_A.toFixed(3)}`
                    : `${solverResult.isPowerOn && !solverResult.isOcpTripped ? solverResult.ammeterReading_A.toFixed(3) : '0.000'}`}
                </div>
                <span className="font-mono text-xl font-bold text-emerald-400">
                  {amRange === '200mA' ? 'mA' : 'A DC'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full border border-emerald-950 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-150"
                  style={{ width: `${Math.min(100, Math.max(0, (solverResult.ammeterReading_A / 1.0) * 100))}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <button
                onClick={() => {
                  labAudio.playBeep();
                  setAmHold(!amHold);
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl border font-bold transition-all cursor-pointer ${
                  amHold ? 'bg-amber-950 border-amber-600 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                HOLD (تثبيت)
              </button>
              <button
                onClick={() => {
                  labAudio.playDialClick();
                  setAmRange((prev) => (prev === 'AUTO' ? '200mA' : prev === '200mA' ? '10A' : 'AUTO'));
                }}
                className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
              >
                المدى: {amRange}
              </button>
            </div>
          </div>
        </div>

        {/* Live Digital Oscilloscope Screen */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>راسم الإشارة الرقمي (V & I Waveform Monitor):</span>
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-yellow-400">CH1 (Voltage): 5V/div</span>
              <span className="text-cyan-400">CH2 (Current): 0.1A/div</span>
              <span className="text-emerald-400">Time: 10ms/div</span>
            </div>
          </div>

          <canvas
            ref={oscCanvasRef}
            width={720}
            height={160}
            className="w-full h-40 rounded-xl bg-[#030d0a] block border border-emerald-950"
          />
        </div>
      </div>
    </div>
  );
};
