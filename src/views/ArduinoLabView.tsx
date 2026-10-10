import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Play,
  Square,
  RotateCcw,
  Terminal,
  Code2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Cpu,
  Sliders,
  Maximize2
} from 'lucide-react';

export const ArduinoLabView: React.FC = () => {
  // Preset Sketches
  const presetSketches = {
    blink: {
      title: '1. وميض الدايود (Blink LED)',
      code: `// تجربة وميض دايود LED على المنفذ رقم 13
const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("تم تهيئة منفذ LED 13 كمخرج");
}

void loop() {
  digitalWrite(ledPin, HIGH);
  Serial.println("LED: مشتعل (HIGH 5V)");
  delay(1000);
  digitalWrite(ledPin, LOW);
  Serial.println("LED: منطفئ (LOW 0V)");
  delay(1000);
}`,
      explanation: [
        'السطر 2: تعريف متغير ثابت ledPin يحمل رقم المنفذ 13 الموصول به الدايود.',
        'السطر 4-7: دالة setup() تنفذ لمرة واحدة فقط عند تشغيل الأردوينو، وتضبط المنفذ 13 كمخرج (OUTPUT) وتهيئة الاتصال التسلسلي.',
        'السطر 9-16: دالة loop() تتكرر باستمرار؛ تقوم بإرسال 5V للمنفذ (HIGH) للتشغيل، ثم الانتظار 1000ms، ثم إرسال 0V (LOW) للإطفاء.'
      ],
      component: 'led'
    },
    button: {
      title: '2. التحكم بالزر (Button to LED)',
      code: `// قراءة حالة زر ضاغط والتحكم في إضاءة LED
const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int buttonState = digitalRead(buttonPin);
  if (buttonState == LOW) { // الزر مضغوط مع مقاومة الرفع
    digitalWrite(ledPin, HIGH);
    Serial.println("الزر مضغوط: تم تشغيل الدايود");
  } else {
    digitalWrite(ledPin, LOW);
    Serial.println("الزر مفصول: تم إطفاء الدايود");
  }
  delay(200);
}`,
      explanation: [
        'السطر 2-3: تخصيص المنفذ 2 لزر الدخل، والمنفذ 13 لمخرج الإضاءة.',
        'السطر 6: تفعيل مقاومة الرفع الداخلية INPUT_PULLUP لمنع تعويم الإشارة (Floating Pin).',
        'السطر 11: قراءة القيمة الرقمية؛ إذا كانت LOW (مضغوط إلى الأرضي) يتم إشعال LED.'
      ],
      component: 'button'
    },
    analog_pwm: {
      title: '3. قراءة مقاومة متغيرة وتحكم PWM',
      code: `// قراءة مقاومة متغيرة A0 والتحكم في شدة إضاءة LED بواسطة PWM
const int potPin = A0;
const int ledPin = 9; // منفذ يدعم التضمين بعرض النبضة PWM

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(potPin); // قراءة من 0 إلى 1023
  int brightness = map(sensorValue, 0, 1023, 0, 255); // تحويل إلى نطاق PWM
  analogWrite(ledPin, brightness);
  Serial.print("قيمة المقاومة: ");
  Serial.print(sensorValue);
  Serial.print(" -> شدة PWM: ");
  Serial.println(brightness);
  delay(150);
}`,
      explanation: [
        'السطر 2-3: المنفذ التماثلي A0 لقراءة الجهد (0-5V)، ومنفذ PWM 9 للتحكم بالشدة.',
        'السطر 11: analogRead يقرأ الجهد ويحوله إلى قيمة رقمية عبر محول ADC بدقة 10 بت (0 - 1023).',
        'السطر 12: دالة map تقوم بالتحويل التناسبي من نطاق (0-1023) إلى نطاق 8 بت لمتحكم PWM (0-255).'
      ],
      component: 'potentiometer'
    },
    ultrasonic: {
      title: '4. حساس المسافة فوق الصوتي (HC-SR04)',
      code: `// قياس المسافة بالسنتيمتر بواسطة حساس الموجات فوق الصوتية
const int trigPin = 7;
const int echoPin = 8;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.begin(9600);
  Serial.println("مستشعر المسافة جاهز للقياس");
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.0343 / 2; // سرعة الصوت 343 m/s
  
  Serial.print("المسافة المقاسة: ");
  Serial.print(distanceCm);
  Serial.println(" cm");
  delay(300);
}`,
      explanation: [
        'السطر 2-3: منفذ الإرسال Trigger يطلق نبضة 10µs، ومنفذ الاستقبال Echo يستقبل الصدى.',
        'السطر 17: pulseIn تقيس زمن ارتداد الموجة بالميكروثانية.',
        'السطر 18: حساب المسافة بضرب الزمن في سرعة الصوت (0.0343 cm/µs) والقسمة على 2 (ذهاب وإياب).'
      ],
      component: 'ultrasonic'
    },
    servo: {
      title: '5. محرك السيرفو بزوايا محددة (Servo SG90)',
      code: `#include <Servo.h>
Servo myServo;

void setup() {
  myServo.attach(9); // ربط السيرفو بمنفذ PWM 9
  Serial.begin(9600);
  Serial.println("تم ربط محرك السيرفو");
}

void loop() {
  for (int pos = 0; pos <= 180; pos += 45) {
    myServo.write(pos);
    Serial.print("زاوية السيرفو: ");
    Serial.println(pos);
    delay(500);
  }
}`,
      explanation: [
        'السطر 1-2: تضمين مكتبة السيرفو وإنشاء كائن myServo.',
        'السطر 5: ربط إشارة السيرفو بمنفذ التحكم رقم 9.',
        'السطر 11: myServo.write(pos) ترسل نبضات PWM بعرض يتراوح بين 1ms و2ms لتدوير المحور للزاوية المطلوبة (0 - 180 درجة).'
      ],
      component: 'servo'
    }
  };

  const [activeSketchKey, setActiveSketchKey] = useState<keyof typeof presetSketches>('blink');
  const [code, setCode] = useState<string>(presetSketches.blink.code);
  const [activeTab, setActiveTab] = useState<'editor' | 'explain' | 'circuit'>('editor');

  // Simulation execution states
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [serialLogs, setSerialLogs] = useState<string[]>([]);
  const [ledPin13State, setLedPin13State] = useState<boolean>(false);
  const [ledPin9Brightness, setLedPin9Brightness] = useState<number>(0);
  const [buttonPressed, setButtonPressed] = useState<boolean>(false);
  const [potentiometerValue, setPotentiometerValue] = useState<number>(512); // 0 to 1023
  const [ultrasonicDistanceCm, setUltrasonicDistanceCm] = useState<number>(25); // 2 to 400 cm
  const [servoAngle, setServoAngle] = useState<number>(90); // 0 to 180 deg
  const [compileErrors, setCompileErrors] = useState<string[]>([]);

  // Change preset
  const handleSelectPreset = (key: keyof typeof presetSketches) => {
    setActiveSketchKey(key);
    setCode(presetSketches[key].code);
    setSerialLogs([`تم تحميل كود: ${presetSketches[key].title}`]);
    setCompileErrors([]);
  };

  // Real-time Arduino Simulation Loop
  useEffect(() => {
    if (!isRunning) return;

    // Check basic C++ syntax validation
    const errors: string[] = [];
    if (!code.includes('setup') || !code.includes('loop')) {
      errors.push('خطأ برمجي: يجب أن يحتوي كود Arduino على دالتي setup() و loop().');
    }
    if (code.includes('pinMode') && !code.includes('OUTPUT') && !code.includes('INPUT')) {
      errors.push('تنبيه: تم استخدام pinMode دون تحديد وضع المنفذ (INPUT أو OUTPUT).');
    }

    setCompileErrors(errors);
    if (errors.length > 0) return;

    let tick = 0;
    const interval = setInterval(() => {
      tick++;

      if (activeSketchKey === 'blink') {
        const isHigh = tick % 2 === 0;
        setLedPin13State(isHigh);
        setSerialLogs(prev => [
          `[${new Date().toLocaleTimeString()}] LED 13 -> ${isHigh ? 'HIGH (مشتعل)' : 'LOW (منطفئ)'}`,
          ...prev.slice(0, 40)
        ]);
      } else if (activeSketchKey === 'button') {
        const isLedOn = buttonPressed;
        setLedPin13State(isLedOn);
        setSerialLogs(prev => [
          `[${new Date().toLocaleTimeString()}] زر رقم 2: ${buttonPressed ? 'مضغوط (LOW)' : 'مفصول (HIGH)'} -> LED: ${isLedOn ? 'مشتعل' : 'منطفئ'}`,
          ...prev.slice(0, 40)
        ]);
      } else if (activeSketchKey === 'analog_pwm') {
        const pwmVal = Math.round((potentiometerValue / 1023) * 255);
        setLedPin9Brightness(pwmVal);
        setSerialLogs(prev => [
          `[${new Date().toLocaleTimeString()}] A0 = ${potentiometerValue} (ADC) -> PWM Pin 9 = ${pwmVal}/255 (${Math.round((pwmVal/255)*100)}%)`,
          ...prev.slice(0, 40)
        ]);
      } else if (activeSketchKey === 'ultrasonic') {
        setSerialLogs(prev => [
          `[${new Date().toLocaleTimeString()}] HC-SR04 صدى المسافة: ${ultrasonicDistanceCm.toFixed(1)} سم (الموجة استغرقت ${(ultrasonicDistanceCm * 58.3).toFixed(0)} µs)`,
          ...prev.slice(0, 40)
        ]);
      } else if (activeSketchKey === 'servo') {
        const step = (tick % 5) * 45;
        setServoAngle(step);
        setSerialLogs(prev => [
          `[${new Date().toLocaleTimeString()}] محرك السيرفو SG90: الزاوية ${step}° (عرض النبضة: ${(1 + (step/180)).toFixed(2)} ms)`,
          ...prev.slice(0, 40)
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, activeSketchKey, code, buttonPressed, potentiometerValue, ultrasonicDistanceCm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">مختبر ومحاكي Arduino Uno</h1>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Arduino Uno R3 Virtual Sandbox, Sensors, Actuators, C++ Code Engine & Serial Monitor
          </p>
        </div>

        {/* Play/Stop & Reset buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isRunning ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{isRunning ? 'إيقاف المحاكاة' : 'تشغيل الكود'}</span>
          </button>

          <button
            onClick={() => setSerialLogs([])}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700"
          >
            مسح السجل
          </button>
        </div>
      </div>

      {/* Preset Sketch Selector Bar */}
      <div className="flex flex-wrap gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
        {(Object.keys(presetSketches) as Array<keyof typeof presetSketches>).map((key) => {
          const item = presetSketches[key];
          return (
            <button
              key={key}
              onClick={() => handleSelectPreset(key)}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center border ${
                activeSketchKey === key
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      {/* Main Arduino Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Virtual Breadboard & Peripherals (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden lab-breadboard-bg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>لوحة Arduino Uno R3 الافتراضية</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
                {isRunning ? 'ONLINE (16MHz)' : 'HALTED'}
              </span>
            </div>

            {/* Arduino Board Graphic Representation */}
            <div className="bg-blue-950/40 border-2 border-blue-700/60 rounded-2xl p-5 space-y-4 relative">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-black text-white tracking-widest text-sm">ARDUINO UNO</span>
                <span className="text-blue-300 text-[10px]">ATmega328P</span>
              </div>

              {/* Pin Header Mock */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-slate-400 bg-slate-950/80 p-2 rounded-xl">
                <span>D13</span>
                <span>D12</span>
                <span>~D11</span>
                <span>~D10</span>
                <span>~D9</span>
                <span>D8</span>
                <span>D7</span>
              </div>

              {/* Live Pin State Lights */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full border ${
                    ledPin13State ? 'bg-amber-400 border-white shadow-md shadow-amber-400 animate-pulse' : 'bg-slate-800 border-slate-700'
                  }`} />
                  <span className="text-xs font-mono text-slate-300">مصباح اللوحة المدمج (L - Pin 13)</span>
                </div>
                <span className="text-xs font-mono text-sky-400 font-bold">{ledPin13State ? 'HIGH' : 'LOW'}</span>
              </div>

              {/* Connected Peripheral Sandbox Box */}
              <div className="border-t border-slate-800/80 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-400" />
                  <span>المكونات والحساسات المتصلة بالدائرة:</span>
                </h4>

                {/* LED on Breadboard */}
                {activeSketchKey === 'blink' && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">دايود ضوئي LED (Pin 13)</span>
                      <span className="text-[10px] text-slate-400">مع مقاومة حماية 220Ω إلى الأرضي GND</span>
                    </div>
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all ${
                      ledPin13State ? 'bg-emerald-400 border-white shadow-xl shadow-emerald-400/50 scale-110' : 'bg-slate-800 border-slate-700 opacity-40'
                    }`}>
                      💡
                    </div>
                  </div>
                )}

                {/* Pushbutton */}
                {activeSketchKey === 'button' && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">زر ضاغط تفاعلي (Pin 2)</span>
                      <span className="text-[10px] font-mono text-slate-400">INPUT_PULLUP</span>
                    </div>
                    <button
                      onMouseDown={() => setButtonPressed(true)}
                      onMouseUp={() => setButtonPressed(false)}
                      onTouchStart={() => setButtonPressed(true)}
                      onTouchEnd={() => setButtonPressed(false)}
                      className={`w-full py-4 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer select-none active:scale-95 ${
                        buttonPressed
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {buttonPressed ? 'الزر مضغوط حالياً! (LOW)' : 'اضغط مع الاستمرار هنا (HOLD TO PRESS)'}
                    </button>
                  </div>
                )}

                {/* Potentiometer */}
                {activeSketchKey === 'analog_pwm' && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-white font-bold">مقاومة متغيرة (A0 Potentiometer):</span>
                      <span className="font-mono text-sky-400 font-bold">{potentiometerValue} (ADC)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1023"
                      step="1"
                      value={potentiometerValue}
                      onChange={(e) => setPotentiometerValue(parseInt(e.target.value))}
                      className="w-full accent-sky-500"
                    />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400">إضاءة LED (PWM Pin 9):</span>
                      <div
                        className="w-8 h-8 rounded-full bg-emerald-400 border border-white transition-all"
                        style={{ opacity: Math.max(ledPin9Brightness / 255, 0.1), transform: `scale(${1 + (ledPin9Brightness / 255) * 0.3})` }}
                      />
                    </div>
                  </div>
                )}

                {/* Ultrasonic Sensor */}
                {activeSketchKey === 'ultrasonic' && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-white font-bold">حاجز المسافة أمام الحساس (Distance):</span>
                      <span className="font-mono text-emerald-400 font-bold">{ultrasonicDistanceCm} سم</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="150"
                      step="1"
                      value={ultrasonicDistanceCm}
                      onChange={(e) => setUltrasonicDistanceCm(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>2 cm (قريب جداً)</span>
                      <span>75 cm</span>
                      <span>150 cm</span>
                    </div>
                  </div>
                )}

                {/* Servo Motor */}
                {activeSketchKey === 'servo' && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center space-y-3">
                    <span className="text-xs font-bold text-white block">محرك سيرفو SG90 (Pin 9)</span>
                    {/* Visual Servo Arm Needle */}
                    <div className="w-24 h-24 mx-auto rounded-full border-4 border-slate-700 bg-slate-950 relative flex items-center justify-center">
                      <div
                        className="w-1.5 h-10 bg-rose-500 origin-bottom absolute top-2 transition-transform duration-300 rounded"
                        style={{ transform: `rotate(${servoAngle - 90}deg)` }}
                      />
                      <div className="w-4 h-4 rounded-full bg-white z-10" />
                    </div>
                    <span className="font-mono text-lg font-bold text-sky-400 block">{servoAngle}°</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code Editor & Serial Monitor (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            {/* Editor Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'editor' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>محرر الكود C++</span>
                </button>
                <button
                  onClick={() => setActiveTab('explain')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'explain' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>الشرح الهندسي بالعربية</span>
                </button>
              </div>

              <span className="text-xs font-mono text-slate-500">sketch.ino</span>
            </div>

            {/* Editor Window */}
            {activeTab === 'editor' && (
              <div className="space-y-3">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-64 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-sky-300 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                  dir="ltr"
                  spellCheck={false}
                />
                {compileErrors.length > 0 && (
                  <div className="bg-rose-950/80 border border-rose-700 p-3 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{compileErrors[0]}</span>
                  </div>
                )}
              </div>
            )}

            {/* Arabic Code Explanation Tab */}
            {activeTab === 'explain' && (
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-64 overflow-y-auto">
                <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>شرح تفصيلي لكود التجربة:</span>
                </h4>
                {presetSketches[activeSketchKey].explanation.map((line, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {line}
                  </div>
                ))}
              </div>
            )}

            {/* Serial Monitor Window */}
            <div className="bg-black border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-900 pb-2 font-mono">
                <span className="flex items-center gap-1.5 text-white">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>مراقب المنفذ التسلسلي (Serial Monitor - 9600 Baud)</span>
                </span>
                <span className="text-[10px] text-emerald-400 animate-pulse">CONNECTED</span>
              </div>
              <div className="h-32 overflow-y-auto font-mono text-xs text-emerald-400/90 space-y-1 p-1">
                {serialLogs.map((log, i) => (
                  <div key={i} className="truncate">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
