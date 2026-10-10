import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  TrendingUp,
  RotateCcw,
  Play,
  Info,
  CheckCircle2,
  AlertTriangle,
  Cpu
} from 'lucide-react';

export const ControlSystemsLabView: React.FC = () => {
  // Mode: PID Controller vs 2nd-Order Natural Response
  const [controlMode, setControlMode] = useState<'pid' | 'second_order'>('pid');

  // PID Parameters
  const [kp, setKp] = useState<number>(3.5);
  const [ki, setKi] = useState<number>(1.2);
  const [kd, setKd] = useState<number>(0.8);
  const [setpoint, setSetpoint] = useState<number>(1.0); // Step input magnitude

  // 2nd Order Parameters
  const [wn, setWn] = useState<number>(3.0); // Natural frequency rad/s
  const [zeta, setZeta] = useState<number>(0.5); // Damping ratio

  // Calculated Step Response Metrics
  const [metrics, setMetrics] = useState({
    riseTime: 0,
    peakTime: 0,
    overshootPct: 0,
    settlingTime: 0,
    steadyStateError: 0,
  });

  // Canvas ref for plotting curve
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Numerical ODE Simulation Engine (Runge-Kutta / Euler)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simulation time config
    const dt = 0.01; // 10ms step
    const totalTime = 8.0; // 8 seconds
    const steps = Math.floor(totalTime / dt);

    const timePoints: number[] = [];
    const responsePoints: number[] = [];

    let y = 0; // Output position
    let v = 0; // Output velocity (dy/dt)
    let integralError = 0;
    let prevError = setpoint - y;

    // Second order plant: J*d2y/dt2 + b*dy/dt = u, let J=1, b=1
    const plantJ = 1.0;
    const plantB = 1.0;

    let peakVal = 0;
    let peakT = 0;
    let t10 = -1;
    let t90 = -1;

    for (let i = 0; i < steps; i++) {
      const t = i * dt;
      timePoints.push(t);

      if (controlMode === 'pid') {
        const error = setpoint - y;
        integralError += error * dt;
        const derivativeError = (error - prevError) / dt;
        prevError = error;

        // PID control signal
        const u = kp * error + ki * integralError + kd * derivativeError;

        // Acceleration from plant dynamics: J*a + B*v = u => a = (u - B*v)/J
        const a = (u - plantB * v) / plantJ;

        // Euler integration
        v += a * dt;
        y += v * dt;
      } else {
        // Second order natural step response: wn^2 / (s^2 + 2*zeta*wn*s + wn^2)
        const error = setpoint - y;
        const a = wn * wn * error - 2 * zeta * wn * v;
        v += a * dt;
        y += v * dt;
      }

      responsePoints.push(y);

      // Metric tracking
      if (y > peakVal) {
        peakVal = y;
        peakT = t;
      }
      if (t10 < 0 && y >= 0.1 * setpoint) t10 = t;
      if (t90 < 0 && y >= 0.9 * setpoint) t90 = t;
    }

    const finalY = responsePoints[responsePoints.length - 1];
    const overshoot = setpoint > 0 && peakVal > setpoint ? ((peakVal - setpoint) / setpoint) * 100 : 0;
    const ess = Math.abs(setpoint - finalY);
    const riseTime = (t90 > 0 && t10 > 0) ? (t90 - t10) : (t90 > 0 ? t90 : 0);

    // Settling time: within ±2% band of setpoint
    let ts = totalTime;
    for (let i = steps - 1; i >= 0; i--) {
      if (Math.abs(responsePoints[i] - setpoint) > 0.02 * setpoint) {
        ts = timePoints[i];
        break;
      }
    }

    setMetrics({
      riseTime: parseFloat(riseTime.toFixed(2)),
      peakTime: parseFloat(peakT.toFixed(2)),
      overshootPct: parseFloat(overshoot.toFixed(1)),
      settlingTime: parseFloat(ts.toFixed(2)),
      steadyStateError: parseFloat(ess.toFixed(3)),
    });

    // Render Canvas Plot
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 25;
    const padBottom = 35;
    const plotW = canvas.width - padLeft - padRight;
    const plotH = canvas.height - padTop - padBottom;

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const x = padLeft + (i / 8) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();

      // Time label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(`${i}s`, x, padTop + plotH + 15);
    }

    const maxScaleY = Math.max(setpoint * 1.6, 2.0);
    for (let val = 0; val <= maxScaleY; val += 0.5) {
      const yPos = padTop + plotH - (val / maxScaleY) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(padLeft + plotW, yPos);
      ctx.stroke();

      // Voltage/Amp label
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(val.toFixed(1), padLeft - 6, yPos + 3);
    }

    // Setpoint target line (Dashed Amber)
    const setpointYPos = padTop + plotH - (setpoint / maxScaleY) * plotH;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padLeft, setpointYPos);
    ctx.lineTo(padLeft + plotW, setpointYPos);
    ctx.stroke();
    ctx.setLineDash([]);

    // Actual Response Curve (Solid Cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < steps; i++) {
      const x = padLeft + (timePoints[i] / totalTime) * plotW;
      const yVal = responsePoints[i];
      const yPos = padTop + plotH - (yVal / maxScaleY) * plotH;
      if (i === 0) ctx.moveTo(x, yPos);
      else ctx.lineTo(x, yPos);
    }
    ctx.stroke();

    // Plot Legend
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('-- Setpoint (المرجع)', padLeft + 120, padTop + 15);
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('— y(t) استجابة النظام', padLeft + 220, padTop + 15);

  }, [controlMode, kp, ki, kd, setpoint, wn, zeta]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-1">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30">
            <Sliders className="w-5 h-5" />
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">مختبر أنظمة التحكم ومتحكم PID</h1>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Feedback Control, Closed-Loop Dynamics, PID Tuning (Kp, Ki, Kd) & Transient Step Response
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          onClick={() => setControlMode('pid')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            controlMode === 'pid'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          معايرة متحكم PID التناسبي التكاملي التفاضلي
        </button>
        <button
          onClick={() => setControlMode('second_order')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            controlMode === 'second_order'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          استجابة الأنظمة من الدرجة الثانية (Damping & Natural Frequency)
        </button>
      </div>

      {/* Main Grid: Parameters on Left, Response Graph on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tuning Sliders (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              <span>معاملات الضبط والمعايرة</span>
            </span>
            <button
              onClick={() => {
                setKp(3.5); setKi(1.2); setKd(0.8); setSetpoint(1.0);
                setWn(3.0); setZeta(0.5);
              }}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة ضبط</span>
            </button>
          </div>

          {controlMode === 'pid' ? (
            <div className="space-y-4 text-xs">
              {/* Setpoint Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-amber-400 font-bold">القيمة المرجعية المستهدفة (Setpoint):</span>
                  <span className="font-mono text-white font-bold">{setpoint.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={setpoint}
                  onChange={(e) => setSetpoint(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Kp Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">المعامل التناسبي Kp (Proportional):</span>
                  <span className="font-mono text-rose-400 font-bold">{kp.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.1"
                  value={kp}
                  onChange={(e) => setKp(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
                <span className="text-[10px] text-slate-500 block">يسرع زمن الصعود ويزيد التجاوز</span>
              </div>

              {/* Ki Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">المعامل التكاملي Ki (Integral):</span>
                  <span className="font-mono text-cyan-400 font-bold">{ki.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="5.0"
                  step="0.05"
                  value={ki}
                  onChange={(e) => setKi(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-[10px] text-slate-500 block">يلغي خطأ الحالة المستقرة (Steady-State Error)</span>
              </div>

              {/* Kd Slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">المعامل التفاضلي Kd (Derivative):</span>
                  <span className="font-mono text-emerald-400 font-bold">{kd.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="3.0"
                  step="0.05"
                  value={kd}
                  onChange={(e) => setKd(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500 block">يخمد التذبذب ويقلل التجاوز (Damping)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">التردد الطبيعي ωn (rad/s):</span>
                  <span className="font-mono text-rose-400 font-bold">{wn.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8.0"
                  step="0.1"
                  value={wn}
                  onChange={(e) => setWn(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">نسبة التخميد ζ (Damping Ratio):</span>
                  <span className="font-mono text-cyan-400 font-bold">{zeta.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="2.0"
                  step="0.05"
                  value={zeta}
                  onChange={(e) => setZeta(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>ζ &lt; 1 (تذبذب)</span>
                  <span>ζ = 1 (حرج)</span>
                  <span>ζ &gt; 1 (فائق التخميد)</span>
                </div>
              </div>
            </div>
          )}

          {/* Educational Formula Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
            <span className="font-bold text-rose-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>معادلة المتحكم في الزمن:</span>
            </span>
            <p className="font-mono text-sky-300 text-center py-1">
              u(t) = Kp·e(t) + Ki·∫e(t)dt + Kd·(de/dt)
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تعتمد المحاكاة على الحل العددي اللحظي للمعادلة التفاضلية الحركية للكتلة والتخميد والمتحكم في الزمن الحقيقي.
            </p>
          </div>
        </div>

        {/* Right: Step Response Graph & Performance Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>منحنى الاستجابة الزمنية للخطوة (Step Response Curve)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                حل عددي فوري ODE
              </span>
            </div>

            {/* Canvas Plot */}
            <div className="bg-slate-950 rounded-2xl p-2 border border-slate-800 flex justify-center">
              <canvas
                ref={canvasRef}
                width={650}
                height={260}
                className="w-full max-w-[650px] h-[260px] rounded-xl"
              />
            </div>

            {/* Performance Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">زمن الصعود tr:</span>
                <span className="text-cyan-400 font-bold text-sm">{metrics.riseTime} s</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">زمن القمة tp:</span>
                <span className="text-sky-400 font-bold text-sm">{metrics.peakTime} s</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">نسبة التجاوز Mp:</span>
                <span className={`font-bold text-sm ${metrics.overshootPct > 20 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {metrics.overshootPct} %
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">زمن الاستقرار ts:</span>
                <span className="text-purple-400 font-bold text-sm">{metrics.settlingTime} s</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">خطأ الاستقرار ess:</span>
                <span className={`font-bold text-sm ${metrics.steadyStateError < 0.01 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {metrics.steadyStateError}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
