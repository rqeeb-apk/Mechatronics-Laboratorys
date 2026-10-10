import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  RotateCw,
  Sliders,
  Play,
  RotateCcw,
  Activity,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Cpu,
  Layers
} from 'lucide-react';

export const RoboticsLabView: React.FC = () => {
  const [subTab, setSubTab] = useState<'robot_arm' | 'dc_motor' | 'gear_train' | 'stepper'>('robot_arm');

  // 3-DOF Robotic Arm Joint Angles (in degrees)
  const [theta1, setTheta1] = useState<number>(45); // Base (-90 to +90)
  const [theta2, setTheta2] = useState<number>(30); // Shoulder (0 to 90)
  const [theta3, setTheta3] = useState<number>(-40); // Elbow (-90 to +45)
  const [gripperOpen, setGripperOpen] = useState<boolean>(true);
  const [isTrajectoryRunning, setIsTrajectoryRunning] = useState<boolean>(false);

  // Link Lengths (cm)
  const L0 = 10; // Base height
  const L1 = 18; // Upper arm length
  const L2 = 14; // Forearm length

  // Forward Kinematics Calculations
  const deg2rad = (deg: number) => (deg * Math.PI) / 180;
  const th1Rad = deg2rad(theta1);
  const th2Rad = deg2rad(theta2);
  const th23Rad = deg2rad(theta2 + theta3);

  const planarR = L1 * Math.cos(th2Rad) + L2 * Math.cos(th23Rad);
  const endX = parseFloat((planarR * Math.cos(th1Rad)).toFixed(2));
  const endY = parseFloat((planarR * Math.sin(th1Rad)).toFixed(2));
  const endZ = parseFloat((L0 + L1 * Math.sin(th2Rad) + L2 * Math.sin(th23Rad)).toFixed(2));

  // Trajectory animation
  useEffect(() => {
    if (!isTrajectoryRunning) return;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.08;
      setTheta1(Math.round(45 * Math.sin(t)));
      setTheta2(Math.round(45 + 25 * Math.sin(t * 0.7)));
      setTheta3(Math.round(-30 + 30 * Math.cos(t)));
    }, 50);
    return () => clearInterval(interval);
  }, [isTrajectoryRunning]);

  // DC Motor Simulation State
  const [dcVoltage, setDcVoltage] = useState<number>(12); // V
  const [dcLoadTorque, setDcLoadTorque] = useState<number>(0.05); // Nm
  const dcNoLoadRpm = 3000;
  const dcStallTorque = 0.25; // Nm
  const dcSpeedRpm = Math.max(Math.round(dcNoLoadRpm * (dcVoltage / 12) * (1 - dcLoadTorque / dcStallTorque)), 0);
  const dcMechPowerW = parseFloat(((dcSpeedRpm * 2 * Math.PI / 60) * dcLoadTorque).toFixed(2));
  const dcCurrentA = parseFloat((0.2 + (dcLoadTorque / dcStallTorque) * 2.0).toFixed(2));
  const dcElecPowerW = parseFloat((dcVoltage * dcCurrentA).toFixed(2));
  const dcEfficiency = dcElecPowerW > 0 ? Math.min(Math.round((dcMechPowerW / dcElecPowerW) * 100), 100) : 0;

  // Gear Train State
  const [gearTeethIn, setGearTeethIn] = useState<number>(12); // Driving
  const [gearTeethOut, setGearTeethOut] = useState<number>(48); // Driven
  const [gearEfficiency, setGearEfficiency] = useState<number>(92); // %
  const [inputSpeedRpm, setInputSpeedRpm] = useState<number>(1500);
  const [inputTorqueNm, setInputTorqueNm] = useState<number>(0.1);

  const gearRatio = parseFloat((gearTeethOut / gearTeethIn).toFixed(2));
  const outputSpeedRpm = Math.round(inputSpeedRpm / gearRatio);
  const outputTorqueNm = parseFloat(((inputTorqueNm * gearRatio) * (gearEfficiency / 100)).toFixed(3));

  // Stepper Motor State
  const [stepAngle, setStepAngle] = useState<number>(1.8); // degrees (200 steps/rev)
  const [pulseFrequency, setPulseFrequency] = useState<number>(400); // Hz
  const stepsPerRev = Math.round(360 / stepAngle);
  const stepperRpm = Math.round((pulseFrequency / stepsPerRev) * 60);

  // SVG Canvas for 2D Joint Visualization
  const canvasOriginX = 220;
  const canvasOriginY = 240;
  const scale = 6; // px per cm

  // Joint 1: Base to Shoulder
  const p0 = { x: canvasOriginX, y: canvasOriginY };
  const p1 = { x: canvasOriginX, y: canvasOriginY - L0 * scale };
  // Joint 2: Shoulder to Elbow (projected on X-Z plane)
  const p2 = {
    x: p1.x + L1 * Math.cos(th2Rad) * scale,
    y: p1.y - L1 * Math.sin(th2Rad) * scale,
  };
  // Joint 3: Elbow to End Effector
  const p3 = {
    x: p2.x + L2 * Math.cos(th23Rad) * scale,
    y: p2.y - L2 * Math.sin(th23Rad) * scale,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-purple-500/20 text-purple-400 rounded-lg border border-purple-500/30">
            <Bot className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">المحركات والروبوتات (Robotics & Motors)</h1>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Articulated Robotic Arm Forward Kinematics, DC/Stepper Motor Dynamics & Gear Reduction
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'robot_arm', label: 'الذراع الروبوتية المفصلية (3-DOF Arm)' },
          { id: 'dc_motor', label: 'محرك التيار المستمر DC' },
          { id: 'gear_train', label: 'حسابات صندوق التروس (Gear Ratios)' },
          { id: 'stepper', label: 'المحرك الخطوي (Stepper Motor)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id as any)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              subTab === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. ROBOTIC ARM TAB */}
      {subTab === 'robot_arm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Joint Sliders & Kinematic Controls (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>زوايا المفاصل (Joint Angles)</span>
              </span>
              <button
                onClick={() => setIsTrajectoryRunning(!isTrajectoryRunning)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isTrajectoryRunning
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {isTrajectoryRunning ? 'إيقاف الحركة' : 'تشغيل مسار آلي'}
              </button>
            </div>

            {/* Slider 1: Base */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">مفصل القاعدة θ1 (Base Yaw):</span>
                <span className="font-mono text-purple-400 font-bold">{theta1}°</span>
              </div>
              <input
                type="range"
                min="-90"
                max="90"
                step="1"
                value={theta1}
                disabled={isTrajectoryRunning}
                onChange={(e) => setTheta1(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-90°</span>
                <span>0°</span>
                <span>+90°</span>
              </div>
            </div>

            {/* Slider 2: Shoulder */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">مفصل الكتف θ2 (Shoulder Pitch):</span>
                <span className="font-mono text-purple-400 font-bold">{theta2}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                value={theta2}
                disabled={isTrajectoryRunning}
                onChange={(e) => setTheta2(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0° (أفقي)</span>
                <span>45°</span>
                <span>90° (عمودي)</span>
              </div>
            </div>

            {/* Slider 3: Elbow */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">مفصل الكوع θ3 (Elbow Pitch):</span>
                <span className="font-mono text-purple-400 font-bold">{theta3}°</span>
              </div>
              <input
                type="range"
                min="-90"
                max="45"
                step="1"
                value={theta3}
                disabled={isTrajectoryRunning}
                onChange={(e) => setTheta3(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-90° (منثنٍ)</span>
                <span>0° (ممتد)</span>
                <span>+45°</span>
              </div>
            </div>

            {/* Gripper Button */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">القابض النهائي (End Gripper):</span>
              <button
                onClick={() => setGripperOpen(!gripperOpen)}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  gripperOpen ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {gripperOpen ? 'مفتوح (OPEN)' : 'مغلق (CLOSED)'}
              </button>
            </div>

            {/* Calculated End Effector Position Coordinates */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 block">إحداثيات نقطة النهاية (Forward Kinematics X, Y, Z):</span>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">X</span>
                  <span className="text-sky-400 font-bold text-sm">{endX} cm</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Y</span>
                  <span className="text-emerald-400 font-bold text-sm">{endY} cm</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Z</span>
                  <span className="text-amber-400 font-bold text-sm">{endZ} cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive 2D/3D Kinematic Model Visualizer (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between lab-grid-bg relative min-h-[420px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>المحاكاة الهندسية لحركة الذراع في الفراغ</span>
              </span>
              <span className="text-[10px] font-mono text-purple-300">
                L0 = {L0}cm | L1 = {L1}cm | L2 = {L2}cm
              </span>
            </div>

            {/* Graphic SVG Visual of Robotic Arm */}
            <div className="flex justify-center items-center py-4">
              <svg width="440" height="280" className="overflow-visible">
                {/* Floor line */}
                <line x1="40" y1={canvasOriginY} x2="400" y2={canvasOriginY} stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />

                {/* Base Link L0 */}
                <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
                <rect x={canvasOriginX - 25} y={canvasOriginY - 4} width="50" height="8" rx="2" fill="#475569" />

                {/* Shoulder Link L1 */}
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#a855f7" strokeWidth="8" strokeLinecap="round" />

                {/* Forearm Link L2 */}
                <line x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />

                {/* Gripper */}
                <circle cx={p3.x} cy={p3.y} r="6" fill="#f59e0b" />
                <line x1={p3.x} y1={p3.y} x2={p3.x + (gripperOpen ? 8 : 4)} y2={p3.y - 6} stroke="#f59e0b" strokeWidth="3" />
                <line x1={p3.x} y1={p3.y} x2={p3.x + (gripperOpen ? 8 : 4)} y2={p3.y + 6} stroke="#f59e0b" strokeWidth="3" />

                {/* Joints (Circles) */}
                <circle cx={p1.x} cy={p1.y} r="8" fill="#1e1b4b" stroke="#a855f7" strokeWidth="3" />
                <circle cx={p2.x} cy={p2.y} r="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
              </svg>
            </div>

            {/* Kinematic Formulas Note */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono text-center">
              X = (L1·cos θ2 + L2·cos(θ2+θ3))·cos θ1 | Z = L0 + L1·sin θ2 + L2·sin(θ2+θ3)
            </div>
          </div>
        </div>
      )}

      {/* 2. DC MOTOR TAB */}
      {subTab === 'dc_motor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white border-r-2 border-purple-500 pr-2">
            محاكاة ديناميكا محرك التيار المستمر (DC Motor Torque-Speed Characteristics)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>جهد التغذية (Armature Voltage V):</span>
                  <span className="font-mono text-purple-400 font-bold">{dcVoltage} V</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="24"
                  step="0.5"
                  value={dcVoltage}
                  onChange={(e) => setDcVoltage(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>عزم الحمل الميكانيكي المقاوم (Load Torque):</span>
                  <span className="font-mono text-amber-400 font-bold">{dcLoadTorque} N·m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.22"
                  step="0.01"
                  value={dcLoadTorque}
                  onChange={(e) => setDcLoadTorque(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Calculations & Results */}
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">السرعة الدورانية N:</span>
                <span className="font-mono text-xl font-black text-sky-400">{dcSpeedRpm} RPM</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">تيار المحرك I:</span>
                <span className="font-mono text-xl font-black text-emerald-400">{dcCurrentA} A</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">القدرة الميكانيكية P_mech:</span>
                <span className="font-mono text-xl font-black text-purple-400">{dcMechPowerW} W</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">الكفاءة الكلية η:</span>
                <span className="font-mono text-xl font-black text-amber-400">{dcEfficiency} %</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. GEAR TRAIN TAB */}
      {subTab === 'gear_train' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white border-r-2 border-purple-500 pr-2">
            صندوق التروس ونسب التخفيض ومضاعفة العزم (Gear Ratio & Torque Multiplier)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">أسنان الترس القائد N_in:</label>
                  <input
                    type="number"
                    min="6"
                    max="100"
                    value={gearTeethIn}
                    onChange={(e) => setGearTeethIn(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">أسنان الترس المقاد N_out:</label>
                  <input
                    type="number"
                    min="6"
                    max="200"
                    value={gearTeethOut}
                    onChange={(e) => setGearTeethOut(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>سرعة الدخل (Input RPM):</span>
                  <span className="font-mono text-sky-400 font-bold">{inputSpeedRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={inputSpeedRpm}
                  onChange={(e) => setInputSpeedRpm(parseInt(e.target.value))}
                  className="w-full accent-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>عزم الدخل (Input Torque):</span>
                  <span className="font-mono text-purple-400 font-bold">{inputTorqueNm} N·m</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1.0"
                  step="0.01"
                  value={inputTorqueNm}
                  onChange={(e) => setInputTorqueNm(parseFloat(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">نسبة التروس (Gear Ratio i):</span>
                <span className="font-mono text-2xl font-black text-amber-400">{gearRatio} : 1</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">سرعة الخرج بعد التخفيض:</span>
                <span className="font-mono text-2xl font-black text-sky-400">{outputSpeedRpm} RPM</span>
              </div>
              <div className="col-span-2 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">العزم المضاعف عند الخرج (مع كفاءة 92%):</span>
                <span className="font-mono text-3xl font-black text-emerald-400">{outputTorqueNm} N·m</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. STEPPER MOTOR TAB */}
      {subTab === 'stepper' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white border-r-2 border-purple-500 pr-2">
            محاكاة المحرك الخطوي (Stepper Motor Pulses & Steps)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">زاوية الخطوة (Step Angle):</label>
                <select
                  value={stepAngle}
                  onChange={(e) => setStepAngle(parseFloat(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value="1.8">1.8° (200 خطوة لكل دورة - قياسي NEMA 17)</option>
                  <option value="0.9">0.9° (400 خطوة لكل دورة - دقة عالية)</option>
                  <option value="7.5">7.5° (48 خطوة لكل دورة - محركات صغيرة)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>تردد نبضات السيرفو/الخطوي (Pulse Frequency):</span>
                  <span className="font-mono text-purple-400 font-bold">{pulseFrequency} Hz (Step/s)</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={pulseFrequency}
                  onChange={(e) => setPulseFrequency(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">خطوات الدورة الكاملة (SPR):</span>
                <span className="font-mono text-2xl font-black text-sky-400">{stepsPerRev} Steps/Rev</span>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px]">السرعة الزاوية الناتجة (RPM):</span>
                <span className="font-mono text-2xl font-black text-emerald-400">{stepperRpm} RPM</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
