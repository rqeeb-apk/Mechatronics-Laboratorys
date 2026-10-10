import React, { useState, useMemo } from 'react';
import {
  Layers,
  RotateCcw,
  Zap,
  Play,
  Trash2,
  CheckCircle,
  HelpCircle,
  Activity,
  Sliders,
  Sparkles,
  Info,
  Power,
  ShieldAlert,
  AlertTriangle,
  Radio,
  Plus,
  Volume2,
  VolumeX,
  Gauge,
  X
} from 'lucide-react';
import { labAudio } from '../utils/audio.ts';

export interface BoardComponent {
  id: string;
  type: 'resistor' | 'pot' | 'capacitor' | 'diode' | 'led' | 'lamp' | 'switch' | 'motor' | 'fuse' | 'buzzer' | 'transistor' | 'inductor';
  name: string;
  value: number; // primary value (e.g. ohms for resistor, uF for capacitor, V for lamp)
  unit: string;
  pins: { id: string; label: string }[];
  state?: boolean; // switch state, fuse state
  potPercentage?: number; // 0-100% for potentiometer wiper
  ledColor?: 'red' | 'green' | 'blue' | 'yellow';
}

export interface BananaWire {
  id: string;
  fromPinId: string;
  toPinId: string;
  color: 'red' | 'black' | 'blue' | 'yellow' | 'green' | 'white';
}

// Resistor 4-band color calculator
function getResistorColorBands(val: number): [string, string, string, string] {
  const colorMap: Record<number, string> = {
    0: 'bg-black',
    1: 'bg-amber-900', // Brown
    2: 'bg-rose-600',  // Red
    3: 'bg-orange-500',// Orange
    4: 'bg-yellow-400',// Yellow
    5: 'bg-emerald-600',// Green
    6: 'bg-blue-600',  // Blue
    7: 'bg-purple-600',// Violet
    8: 'bg-slate-500', // Grey
    9: 'bg-white',     // White
  };

  const digitsStr = Math.round(val).toString();
  const d1 = parseInt(digitsStr[0] || '1', 10);
  const d2 = parseInt(digitsStr[1] || '0', 10);
  const multiplier = Math.max(0, digitsStr.length - 2);

  return [
    colorMap[d1] || 'bg-amber-900',
    colorMap[d2] || 'bg-black',
    colorMap[multiplier] || 'bg-amber-900',
    'bg-yellow-500', // Gold 5%
  ];
}

export const ElectronicsBoxView: React.FC = () => {
  // Main Power Supply Rail on the Board
  const [isBoardPowerOn, setIsBoardPowerOn] = useState<boolean>(true);
  const [varRailVoltage, setVarRailVoltage] = useState<number>(12.0); // 0.0 to 30.0V
  const [fixedRail12V, setFixedRail12V] = useState<number>(12.0);
  const [fixedRail5V, setFixedRail5V] = useState<number>(5.0);

  // Benchtop Voltmeter State
  const [vmPower, setVmPower] = useState<boolean>(true);
  const [vmHold, setVmHold] = useState<boolean>(false);
  const [vmRange, setVmRange] = useState<'AUTO' | '200mV' | '2V' | '20V' | '200V'>('AUTO');
  const [vmRelBaseline, setVmRelBaseline] = useState<number | null>(null);
  const [vmRedProbePin, setVmRedProbePin] = useState<string | null>('ps_12v');
  const [vmBlackProbePin, setVmBlackProbePin] = useState<string | null>('ps_gnd');
  const [activeProbeSelecting, setActiveProbeSelecting] = useState<'red' | 'black' | null>(null);

  // Benchtop Ammeter State
  const [amPower, setAmPower] = useState<boolean>(true);
  const [amHold, setAmHold] = useState<boolean>(false);
  const [amRange, setAmRange] = useState<'AUTO' | '200mA' | '10A'>('AUTO');
  const [amSeriesPinA, setAmSeriesPinA] = useState<string | null>('am_in');
  const [amSeriesPinB, setAmSeriesPinB] = useState<string | null>('am_out');

  // Wires and Wiring State
  const [activeWireColor, setActiveWireColor] = useState<'red' | 'black' | 'blue' | 'yellow' | 'green' | 'white'>('red');
  const [selectedStartPin, setSelectedStartPin] = useState<{ id: string; label: string } | null>(null);
  const [wires, setWires] = useState<BananaWire[]>([
    { id: 'w_init1', fromPinId: 'ps_12v', toPinId: 'res_1_p1', color: 'red' },
    { id: 'w_init2', fromPinId: 'res_1_p2', toPinId: 'led_1_p1', color: 'yellow' },
    { id: 'w_init3', fromPinId: 'led_1_p2', toPinId: 'sw_1_p1', color: 'blue' },
    { id: 'w_init4', fromPinId: 'sw_1_p2', toPinId: 'ps_gnd', color: 'black' },
  ]);

  // Dynamic Placed Components on the Board ("وضع أي شيء")
  const [components, setComponents] = useState<BoardComponent[]>([
    {
      id: 'res_1',
      type: 'resistor',
      name: 'مقاومة R1 (330Ω)',
      value: 330,
      unit: 'Ω',
      pins: [
        { id: 'res_1_p1', label: 'R1-1' },
        { id: 'res_1_p2', label: 'R1-2' },
      ],
    },
    {
      id: 'led_1',
      type: 'led',
      name: 'دايود LED أحمر',
      value: 2.0,
      unit: 'Vf',
      ledColor: 'red',
      pins: [
        { id: 'led_1_p1', label: 'أنود +' },
        { id: 'led_1_p2', label: 'كاثود -' },
      ],
    },
    {
      id: 'sw_1',
      type: 'switch',
      name: 'مفتاح SPST',
      value: 1,
      unit: '',
      state: true,
      pins: [
        { id: 'sw_1_p1', label: 'SW-1' },
        { id: 'sw_1_p2', label: 'SW-2' },
      ],
    },
    {
      id: 'lamp_1',
      type: 'lamp',
      name: 'مصباح 12V (10W)',
      value: 12,
      unit: 'V',
      pins: [
        { id: 'lamp_1_p1', label: 'L1-1' },
        { id: 'lamp_1_p2', label: 'L1-2' },
      ],
    },
    {
      id: 'motor_1',
      type: 'motor',
      name: 'محرك DC صغير',
      value: 12,
      unit: 'V',
      pins: [
        { id: 'motor_1_p1', label: 'M1 +' },
        { id: 'motor_1_p2', label: 'M1 -' },
      ],
    },
    {
      id: 'pot_1',
      type: 'pot',
      name: 'مقاومة متغيرة 10kΩ',
      value: 10000,
      unit: 'Ω',
      potPercentage: 50,
      pins: [
        { id: 'pot_1_p1', label: 'طرف A' },
        { id: 'pot_1_w', label: 'منزلق W' },
        { id: 'pot_1_p2', label: 'طرف B' },
      ],
    },
  ]);

  // Modal for Adding New Component
  const [addComponentModalOpen, setAddComponentModalOpen] = useState<boolean>(false);
  const [newCompType, setNewCompType] = useState<BoardComponent['type']>('resistor');
  const [newCompValue, setNewCompValue] = useState<number>(100);
  const [newCompLedColor, setNewCompLedColor] = useState<'red' | 'green' | 'blue' | 'yellow'>('green');

  // Sound Mute Toggle
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // All available Board Ports for wire & probe docking
  const allAvailablePorts = useMemo(() => {
    const list: { id: string; label: string; group: string; color: string }[] = [
      { id: 'ps_12v', label: '+12V DC (مستمر)', group: 'مزود الطاقة', color: 'bg-rose-600' },
      { id: 'ps_5v', label: '+5V DC (منظم)', group: 'مزود الطاقة', color: 'bg-orange-500' },
      { id: 'ps_minus12v', label: '-12V DC (سالب)', group: 'مزود الطاقة', color: 'bg-blue-600' },
      { id: 'ps_var', label: `VAR (${varRailVoltage.toFixed(1)}V متغير)`, group: 'مزود الطاقة', color: 'bg-amber-400' },
      { id: 'ps_gnd', label: 'GND (الأرضي 0V)', group: 'مزود الطاقة', color: 'bg-slate-900' },
      { id: 'am_in', label: 'مدخل الأميتر (Ammeter +)', group: 'جهاز الأميتر', color: 'bg-rose-500' },
      { id: 'am_out', label: 'مخرج الأميتر (Ammeter -)', group: 'جهاز الأميتر', color: 'bg-slate-800' },
      { id: 'vm_in', label: 'مدخل الفولتميتر (Voltmeter V+)', group: 'جهاز الفولتميتر', color: 'bg-sky-500' },
      { id: 'vm_com', label: 'أرضي الفولتميتر (Voltmeter COM-)', group: 'جهاز الفولتميتر', color: 'bg-slate-800' },
    ];

    components.forEach((c) => {
      c.pins.forEach((p) => {
        list.push({
          id: p.id,
          label: `${c.name} [${p.label}]`,
          group: c.name,
          color: 'bg-emerald-600',
        });
      });
    });

    return list;
  }, [components, varRailVoltage]);

  // Circuit Physics Solver using Ohm's & Kirchhoff's laws
  const circuitState = useMemo(() => {
    if (!isBoardPowerOn) {
      return {
        isPowerOn: false,
        isOpenCircuit: true,
        isShortCircuit: false,
        isOcpTripped: false,
        sourceVoltage_V: 0,
        totalCurrent_A: 0,
        totalResistance_ohm: 0,
        status: 'المصدر متوقف (Power OFF)',
        componentCurrents: {} as Record<string, number>,
        componentVoltages: {} as Record<string, number>,
      };
    }

    // Direct Short Circuit Wire check
    const isShortWire = wires.some((w) => {
      const p1 = w.fromPinId.toLowerCase();
      const p2 = w.toPinId.toLowerCase();
      const isSrc = p1.includes('12v') || p1.includes('5v') || p1.includes('var');
      const isGnd = p2.includes('gnd') || p2.includes('minus');
      const isSrc2 = p2.includes('12v') || p2.includes('5v') || p2.includes('var');
      const isGnd2 = p1.includes('gnd') || p1.includes('minus');
      return (isSrc && isGnd) || (isSrc2 && isGnd2);
    });

    if (isShortWire) {
      return {
        isPowerOn: true,
        isOpenCircuit: false,
        isShortCircuit: true,
        isOcpTripped: true,
        sourceVoltage_V: 0,
        totalCurrent_A: 0,
        totalResistance_ohm: 0.01,
        status: 'خطر: قصر كهربائي مباشر (Short Circuit)! فصلت دارة الحماية OCP التغذية لحماية المعمل.',
        componentCurrents: {} as Record<string, number>,
        componentVoltages: {} as Record<string, number>,
      };
    }

    // Check if source and GND are wired
    const hasSourceWire = wires.some(
      (w) =>
        w.fromPinId.startsWith('ps_') ||
        w.toPinId.startsWith('ps_')
    );
    const hasGndWire = wires.some(
      (w) =>
        w.fromPinId === 'ps_gnd' ||
        w.toPinId === 'ps_gnd'
    );

    if (!hasSourceWire || !hasGndWire) {
      return {
        isPowerOn: true,
        isOpenCircuit: true,
        isShortCircuit: false,
        isOcpTripped: false,
        sourceVoltage_V: fixedRail12V,
        totalCurrent_A: 0,
        totalResistance_ohm: 0,
        status: 'الدائرة مفتوحة (Open Loop): يرجى توصيل الأسلاك بين المصدر والحمل والأرضي.',
        componentCurrents: {} as Record<string, number>,
        componentVoltages: {} as Record<string, number>,
      };
    }

    // Calculate active load in circuit
    let totalR = 0;
    let forwardDropV = 0;
    const compCurrents: Record<string, number> = {};
    const compVoltages: Record<string, number> = {};

    components.forEach((c) => {
      // Check if component pins are connected with wires
      const isConnected = c.pins.some((p) =>
        wires.some((w) => w.fromPinId === p.id || w.toPinId === p.id)
      );

      if (isConnected) {
        if (c.type === 'resistor') {
          totalR += c.value;
        } else if (c.type === 'pot') {
          const potR = Math.max(10, c.value * ((c.potPercentage ?? 50) / 100));
          totalR += potR;
        } else if (c.type === 'lamp') {
          totalR += 14.4; // 12V 10W bulb resistance
        } else if (c.type === 'motor') {
          totalR += 24.0; // small DC motor internal winding
        } else if (c.type === 'buzzer') {
          totalR += 120.0; // piezo buzzer coil
        } else if (c.type === 'capacitor') {
          totalR += 12.0; // charging ESR
        } else if (c.type === 'inductor') {
          totalR += 4.5; // winding copper resistance
        } else if (c.type === 'transistor') {
          forwardDropV += 0.7; // Vbe drop
          totalR += 50.0;
        } else if (c.type === 'fuse') {
          if (c.state === false) {
            totalR += 9999999;
          } else {
            totalR += 0.1; // intact fuse resistance
          }
        } else if (c.type === 'diode') {
          forwardDropV += 0.7;
        } else if (c.type === 'led') {
          forwardDropV += 2.0;
        } else if (c.type === 'switch') {
          if (!c.state) {
            totalR += 9999999; // switch OPEN
          }
        }
      }
    });

    // Check if Ammeter is inserted in series
    const isAmmeterWired = wires.some(
      (w) => w.fromPinId === 'am_in' || w.toPinId === 'am_in' || w.fromPinId === 'am_out' || w.toPinId === 'am_out'
    );
    if (isAmmeterWired) {
      totalR += 0.05; // tiny internal ammeter shunt
    }

    // Determine active supply voltage from connected rail
    let activeSupplyV = fixedRail12V;
    const isVarWired = wires.some(w => w.fromPinId === 'ps_var' || w.toPinId === 'ps_var');
    const is5vWired = wires.some(w => w.fromPinId === 'ps_5v' || w.toPinId === 'ps_5v');
    const isMinus12Wired = wires.some(w => w.fromPinId === 'ps_minus12v' || w.toPinId === 'ps_minus12v');
    if (isVarWired) activeSupplyV = varRailVoltage;
    else if (is5vWired) activeSupplyV = fixedRail5V;
    else if (isMinus12Wired) activeSupplyV = 12.0;

    const netV = Math.max(0, activeSupplyV - forwardDropV);
    const iTotal = totalR > 0 ? netV / totalR : 0;

    components.forEach((c) => {
      compCurrents[c.id] = iTotal;
      if (c.type === 'resistor') {
        compVoltages[c.id] = parseFloat((iTotal * c.value).toFixed(2));
      } else if (c.type === 'lamp') {
        compVoltages[c.id] = parseFloat((iTotal * 14.4).toFixed(2));
      } else if (c.type === 'motor') {
        compVoltages[c.id] = parseFloat((iTotal * 24.0).toFixed(2));
      } else if (c.type === 'buzzer') {
        compVoltages[c.id] = parseFloat((iTotal * 120.0).toFixed(2));
      } else if (c.type === 'capacitor') {
        compVoltages[c.id] = parseFloat((iTotal * 12.0).toFixed(2));
      } else if (c.type === 'inductor') {
        compVoltages[c.id] = parseFloat((iTotal * 4.5).toFixed(2));
      } else if (c.type === 'transistor') {
        compVoltages[c.id] = parseFloat((iTotal * 50.0 + 0.7).toFixed(2));
      } else if (c.type === 'fuse') {
        compVoltages[c.id] = parseFloat((iTotal * 0.1).toFixed(2));
      } else if (c.type === 'led') {
        compVoltages[c.id] = iTotal > 0.001 ? 2.0 : 0.0;
      } else if (c.type === 'diode') {
        compVoltages[c.id] = iTotal > 0.001 ? 0.7 : 0.0;
      } else if (c.type === 'pot') {
        const potR = Math.max(10, c.value * ((c.potPercentage ?? 50) / 100));
        compVoltages[c.id] = parseFloat((iTotal * potR).toFixed(2));
      }
    });

    return {
      isPowerOn: true,
      isOpenCircuit: totalR > 1000000,
      isShortCircuit: false,
      isOcpTripped: false,
      sourceVoltage_V: activeSupplyV,
      totalCurrent_A: totalR > 1000000 ? 0 : parseFloat(iTotal.toFixed(4)),
      totalResistance_ohm: parseFloat(totalR.toFixed(1)),
      status:
        totalR > 1000000
          ? 'المفتاح أو القاطع مفتوح: لا يمر أي تيار في الدائرة.'
          : `الدائرة تعمل بصورة سليمة: الجهد = ${activeSupplyV.toFixed(1)}V، التيار = ${(iTotal * 1000).toFixed(1)} mA، المقاومة = ${totalR.toFixed(1)} Ω`,
      componentCurrents: compCurrents,
      componentVoltages: compVoltages,
    };
  }, [isBoardPowerOn, fixedRail12V, fixedRail5V, varRailVoltage, wires, components]);

  // Compute Node Voltages across the entire board for Probes
  const nodeVoltages = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {
      ps_12v: isBoardPowerOn && !circuitState.isOcpTripped ? fixedRail12V : 0,
      ps_5v: isBoardPowerOn && !circuitState.isOcpTripped ? fixedRail5V : 0,
      ps_minus12v: isBoardPowerOn && !circuitState.isOcpTripped ? -12.0 : 0,
      ps_var: isBoardPowerOn && !circuitState.isOcpTripped ? varRailVoltage : 0,
      ps_gnd: 0.0,
      am_in: isBoardPowerOn ? circuitState.sourceVoltage_V : 0,
      am_out: isBoardPowerOn ? Math.max(0, circuitState.sourceVoltage_V - 0.05) : 0,
      vm_in: 0.0,
      vm_com: 0.0,
    };

    components.forEach((c) => {
      const vDrop = circuitState.componentVoltages[c.id] ?? 0;
      const p1 = c.pins[0]?.id;
      const p2 = c.pins[1]?.id;
      if (p1 && p2) {
        if (circuitState.totalCurrent_A > 0.0001) {
          map[p1] = circuitState.sourceVoltage_V;
          map[p2] = Math.max(0, circuitState.sourceVoltage_V - vDrop);
        } else {
          map[p1] = 0;
          map[p2] = 0;
        }
      }
    });

    // Wire equivalence
    wires.forEach((w) => {
      const v1 = map[w.fromPinId];
      const v2 = map[w.toPinId];
      if (v1 !== undefined && v2 === undefined) map[w.toPinId] = v1;
      else if (v2 !== undefined && v1 === undefined) map[w.fromPinId] = v2;
    });

    return map;
  }, [isBoardPowerOn, fixedRail12V, fixedRail5V, varRailVoltage, circuitState, components, wires]);

  // Voltmeter live calculation between Red & Black probes
  const voltmeterReading_V = useMemo(() => {
    if (!vmPower) return 0.0;
    if (circuitState.isOcpTripped || !isBoardPowerOn) return 0.0;

    const hasVmInWire = wires.some(w => w.fromPinId === 'vm_in' || w.toPinId === 'vm_in');
    const hasVmComWire = wires.some(w => w.fromPinId === 'vm_com' || w.toPinId === 'vm_com');
    const probeRed = vmRedProbePin || (hasVmInWire ? 'vm_in' : null);
    const probeBlack = vmBlackProbePin || (hasVmComWire ? 'vm_com' : null);

    if (!probeRed || !probeBlack) return 0.0;

    const vRed = nodeVoltages[probeRed] ?? 0.0;
    const vBlack = nodeVoltages[probeBlack] ?? 0.0;
    let reading = vRed - vBlack;

    if (vmRelBaseline !== null) {
      reading -= vmRelBaseline;
    }

    return parseFloat(reading.toFixed(3));
  }, [vmPower, circuitState, isBoardPowerOn, vmRedProbePin, vmBlackProbePin, wires, nodeVoltages, vmRelBaseline]);

  // Voltmeter display formatted string
  const voltmeterDisplayStr = useMemo(() => {
    if (!vmPower) return 'OFF';
    if (vmHold) return `${voltmeterReading_V >= 0 ? '+' : ''}${voltmeterReading_V.toFixed(3)}`;

    if (vmRange === '200mV') {
      const mv = voltmeterReading_V * 1000;
      if (Math.abs(mv) > 200) return 'O.L';
      return `${mv >= 0 ? '+' : ''}${mv.toFixed(1)} mV`;
    }

    if (vmRange === '2V' && Math.abs(voltmeterReading_V) > 2.0) return 'O.L';
    if (vmRange === '20V' && Math.abs(voltmeterReading_V) > 20.0) return 'O.L';

    return `${voltmeterReading_V >= 0 ? '+' : ''}${voltmeterReading_V.toFixed(3)}`;
  }, [vmPower, vmHold, vmRange, voltmeterReading_V]);

  // Ammeter live calculation
  const ammeterReading_A = useMemo(() => {
    if (!amPower) return 0.0;
    if (circuitState.isOcpTripped || !isBoardPowerOn) return 0.0;
    return circuitState.totalCurrent_A;
  }, [amPower, circuitState, isBoardPowerOn]);

  const ammeterDisplayStr = useMemo(() => {
    if (!amPower) return 'OFF';
    if (amHold) return `${ammeterReading_A.toFixed(3)} A`;

    if (amRange === '200mA') {
      const ma = ammeterReading_A * 1000;
      if (ma > 200) return 'O.L';
      return `${ma.toFixed(1)} mA`;
    }

    return `${ammeterReading_A.toFixed(3)} A`;
  }, [amPower, amHold, amRange, ammeterReading_A]);

  // Handle Clicking on a Port/Terminal
  const handlePinClick = (pinId: string, pinLabel: string) => {
    if (audioEnabled) labAudio.playWireSnap();

    // 1. If currently selecting probe position
    if (activeProbeSelecting === 'red') {
      setVmRedProbePin(pinId);
      setActiveProbeSelecting(null);
      if (audioEnabled) labAudio.playContinuityBeep();
      return;
    }
    if (activeProbeSelecting === 'black') {
      setVmBlackProbePin(pinId);
      setActiveProbeSelecting(null);
      if (audioEnabled) labAudio.playContinuityBeep();
      return;
    }

    // 2. Wire connection logic
    if (!selectedStartPin) {
      setSelectedStartPin({ id: pinId, label: pinLabel });
    } else {
      if (selectedStartPin.id !== pinId) {
        const newWire: BananaWire = {
          id: 'wire_' + Date.now(),
          fromPinId: selectedStartPin.id,
          toPinId: pinId,
          color: activeWireColor,
        };
        setWires((prev) => [...prev, newWire]);
      }
      setSelectedStartPin(null);
    }
  };

  // Remove wire
  const handleDeleteWire = (wireId: string) => {
    if (audioEnabled) labAudio.playClick();
    setWires((prev) => prev.filter((w) => w.id !== wireId));
  };

  const handleClearWires = () => {
    if (audioEnabled) labAudio.playClick();
    setWires([]);
    setSelectedStartPin(null);
  };

  // Delete component from board
  const handleDeleteComponent = (compId: string) => {
    if (audioEnabled) labAudio.playClick();
    // remove component and any connected wires
    const compPins = components.find((c) => c.id === compId)?.pins.map((p) => p.id) || [];
    setWires((prev) => prev.filter((w) => !compPins.includes(w.fromPinId) && !compPins.includes(w.toPinId)));
    setComponents((prev) => prev.filter((c) => c.id !== compId));
  };

  // Add Component to Board Handler
  const handleAddComponent = () => {
    if (audioEnabled) labAudio.playRelayClick();
    const newId = `comp_${Date.now().toString(36)}`;

    let newComp: BoardComponent;
    if (newCompType === 'resistor') {
      newComp = {
        id: newId,
        type: 'resistor',
        name: `مقاومة (${newCompValue}Ω)`,
        value: newCompValue,
        unit: 'Ω',
        pins: [
          { id: `${newId}_p1`, label: 'طرف 1' },
          { id: `${newId}_p2`, label: 'طرف 2' },
        ],
      };
    } else if (newCompType === 'led') {
      newComp = {
        id: newId,
        type: 'led',
        name: `دايود LED ${newCompLedColor === 'red' ? 'أحمر' : newCompLedColor === 'green' ? 'أخضر' : newCompLedColor === 'blue' ? 'أزرق' : 'أصفر'}`,
        value: 2.0,
        unit: 'Vf',
        ledColor: newCompLedColor,
        pins: [
          { id: `${newId}_p1`, label: 'أنود +' },
          { id: `${newId}_p2`, label: 'كاثود -' },
        ],
      };
    } else if (newCompType === 'lamp') {
      newComp = {
        id: newId,
        type: 'lamp',
        name: `مصباح كهربائي 12V`,
        value: 12,
        unit: 'V',
        pins: [
          { id: `${newId}_p1`, label: 'L +' },
          { id: `${newId}_p2`, label: 'L -' },
        ],
      };
    } else if (newCompType === 'switch') {
      newComp = {
        id: newId,
        type: 'switch',
        name: `مفتاح SPST إضافي`,
        value: 1,
        unit: '',
        state: true,
        pins: [
          { id: `${newId}_p1`, label: 'SW A' },
          { id: `${newId}_p2`, label: 'SW B' },
        ],
      };
    } else if (newCompType === 'motor') {
      newComp = {
        id: newId,
        type: 'motor',
        name: `محرك DC صناعي`,
        value: 12,
        unit: 'V',
        pins: [
          { id: `${newId}_p1`, label: 'M +' },
          { id: `${newId}_p2`, label: 'M -' },
        ],
      };
    } else if (newCompType === 'pot') {
      newComp = {
        id: newId,
        type: 'pot',
        name: `مقاومة متغيرة (${newCompValue}Ω)`,
        value: newCompValue,
        unit: 'Ω',
        potPercentage: 50,
        pins: [
          { id: `${newId}_p1`, label: 'A' },
          { id: `${newId}_w`, label: 'Wiper' },
          { id: `${newId}_p2`, label: 'B' },
        ],
      };
    } else if (newCompType === 'capacitor') {
      newComp = {
        id: newId,
        type: 'capacitor',
        name: `مكثف كيميائي (${newCompValue}µF)`,
        value: newCompValue,
        unit: 'µF',
        pins: [
          { id: `${newId}_p1`, label: 'C +' },
          { id: `${newId}_p2`, label: 'C -' },
        ],
      };
    } else if (newCompType === 'inductor') {
      newComp = {
        id: newId,
        type: 'inductor',
        name: `ملف سلكي (${newCompValue}mH)`,
        value: newCompValue,
        unit: 'mH',
        pins: [
          { id: `${newId}_p1`, label: 'L 1' },
          { id: `${newId}_p2`, label: 'L 2' },
        ],
      };
    } else if (newCompType === 'diode') {
      newComp = {
        id: newId,
        type: 'diode',
        name: `دايود سيليكون 1N4007`,
        value: 0.7,
        unit: 'Vf',
        pins: [
          { id: `${newId}_p1`, label: 'أنود +' },
          { id: `${newId}_p2`, label: 'كاثود -' },
        ],
      };
    } else if (newCompType === 'buzzer') {
      newComp = {
        id: newId,
        type: 'buzzer',
        name: `بوق صوتي Piezo Buzzer`,
        value: 12,
        unit: 'V',
        pins: [
          { id: `${newId}_p1`, label: 'BZ +' },
          { id: `${newId}_p2`, label: 'BZ -' },
        ],
      };
    } else if (newCompType === 'transistor') {
      newComp = {
        id: newId,
        type: 'transistor',
        name: `ترانزستور NPN BC547`,
        value: 100,
        unit: 'hFE',
        pins: [
          { id: `${newId}_c`, label: 'C (جامع)' },
          { id: `${newId}_b`, label: 'B (قاعدة)' },
          { id: `${newId}_e`, label: 'E (باعث)' },
        ],
      };
    } else {
      newComp = {
        id: newId,
        type: 'fuse',
        name: `فيوز حماية (${newCompValue}A)`,
        value: newCompValue,
        unit: 'A',
        state: true,
        pins: [
          { id: `${newId}_p1`, label: 'In' },
          { id: `${newId}_p2`, label: 'Out' },
        ],
      };
    }

    setComponents((prev) => [...prev, newComp]);
    setAddComponentModalOpen(false);
  };

  // Academic Experiments Pre-wiring
  const applyPresetCircuit = (presetId: number) => {
    if (audioEnabled) labAudio.playRelayClick();
    setSelectedStartPin(null);

    switch (presetId) {
      case 1:
        // 1. Ohm's Law: 10V + 100Ω -> 0.1A
        setVarRailVoltage(10.0);
        setIsBoardPowerOn(true);
        setComponents([
          {
            id: 'res_100',
            type: 'resistor',
            name: 'مقاومة R (100Ω)',
            value: 100,
            unit: 'Ω',
            pins: [
              { id: 'res_100_p1', label: 'طرف 1' },
              { id: 'res_100_p2', label: 'طرف 2' },
            ],
          },
        ]);
        setWires([
          { id: 'w1', fromPinId: 'ps_var', toPinId: 'res_100_p1', color: 'red' },
          { id: 'w2', fromPinId: 'res_100_p2', toPinId: 'ps_gnd', color: 'black' },
        ]);
        setVmRedProbePin('res_100_p1');
        setVmBlackProbePin('res_100_p2');
        break;

      case 2:
        // 2. Series Resistors: 10V + 100Ω + 100Ω -> 0.05A
        setVarRailVoltage(10.0);
        setIsBoardPowerOn(true);
        setComponents([
          {
            id: 'res_s1',
            type: 'resistor',
            name: 'مقاومة R1 (100Ω)',
            value: 100,
            unit: 'Ω',
            pins: [
              { id: 'res_s1_p1', label: 'R1-1' },
              { id: 'res_s1_p2', label: 'R1-2' },
            ],
          },
          {
            id: 'res_s2',
            type: 'resistor',
            name: 'مقاومة R2 (100Ω)',
            value: 100,
            unit: 'Ω',
            pins: [
              { id: 'res_s2_p1', label: 'R2-1' },
              { id: 'res_s2_p2', label: 'R2-2' },
            ],
          },
        ]);
        setWires([
          { id: 'w1', fromPinId: 'ps_var', toPinId: 'res_s1_p1', color: 'red' },
          { id: 'w2', fromPinId: 'res_s1_p2', toPinId: 'res_s2_p1', color: 'blue' },
          { id: 'w3', fromPinId: 'res_s2_p2', toPinId: 'ps_gnd', color: 'black' },
        ]);
        setVmRedProbePin('res_s1_p1');
        setVmBlackProbePin('res_s2_p2');
        break;

      case 3:
        // 3. Parallel Resistors: 10V + 100Ω || 100Ω -> 0.2A
        setVarRailVoltage(10.0);
        setIsBoardPowerOn(true);
        setComponents([
          {
            id: 'res_p1',
            type: 'resistor',
            name: 'مقاومة R1 (100Ω)',
            value: 100,
            unit: 'Ω',
            pins: [
              { id: 'res_p1_p1', label: 'R1-1' },
              { id: 'res_p1_p2', label: 'R1-2' },
            ],
          },
          {
            id: 'res_p2',
            type: 'resistor',
            name: 'مقاومة R2 (100Ω)',
            value: 100,
            unit: 'Ω',
            pins: [
              { id: 'res_p2_p1', label: 'R2-1' },
              { id: 'res_p2_p2', label: 'R2-2' },
            ],
          },
        ]);
        setWires([
          { id: 'w1', fromPinId: 'ps_var', toPinId: 'res_p1_p1', color: 'yellow' },
          { id: 'w2', fromPinId: 'ps_var', toPinId: 'res_p2_p1', color: 'yellow' },
          { id: 'w3', fromPinId: 'res_p1_p2', toPinId: 'ps_gnd', color: 'black' },
          { id: 'w4', fromPinId: 'res_p2_p2', toPinId: 'ps_gnd', color: 'black' },
        ]);
        setVmRedProbePin('res_p1_p1');
        setVmBlackProbePin('ps_gnd');
        break;

      case 4:
        // 4. Lamp & Switch
        setVarRailVoltage(12.0);
        setIsBoardPowerOn(true);
        setComponents([
          {
            id: 'lamp_t',
            type: 'lamp',
            name: 'مصباح 12V (10W)',
            value: 12,
            unit: 'V',
            pins: [
              { id: 'lamp_t_p1', label: 'طرف +' },
              { id: 'lamp_t_p2', label: 'طرف -' },
            ],
          },
          {
            id: 'sw_t',
            type: 'switch',
            name: 'مفتاح تشغيل',
            value: 1,
            unit: '',
            state: true,
            pins: [
              { id: 'sw_t_p1', label: 'SW-1' },
              { id: 'sw_t_p2', label: 'SW-2' },
            ],
          },
        ]);
        setWires([
          { id: 'w1', fromPinId: 'ps_12v', toPinId: 'sw_t_p1', color: 'red' },
          { id: 'w2', fromPinId: 'sw_t_p2', toPinId: 'lamp_t_p1', color: 'yellow' },
          { id: 'w3', fromPinId: 'lamp_t_p2', toPinId: 'ps_gnd', color: 'black' },
        ]);
        setVmRedProbePin('lamp_t_p1');
        setVmBlackProbePin('lamp_t_p2');
        break;

      default:
        break;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bench Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-600 text-white rounded-2xl shadow-lg shadow-emerald-600/25">
              <Layers className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                لوحة التيارات والمكونات وأجهزة القياس المخبرية
              </h1>
              <p className="text-xs text-emerald-400 font-mono">
                Physical Benchtop Voltmeter & Ammeter • Banana Jack Trainer Board • Modular Circuit Solver
              </p>
            </div>
          </div>
        </div>

        {/* Global Sound & Power Quick Toggles */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) labAudio.playBeep();
            }}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              audioEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title="كتم / تفعيل أصوات المعمل"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? 'الصوت مفعّل' : 'صامت'}</span>
          </button>

          <button
            onClick={() => {
              if (audioEnabled) labAudio.playSwitch();
              setIsBoardPowerOn(!isBoardPowerOn);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg cursor-pointer ${
              isBoardPowerOn
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isBoardPowerOn ? 'تغذية اللوحة: ON' : 'تغذية اللوحة: OFF'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: REALISTIC BENCHTOP VOLTMETER & AMMETER INSTRUMENTS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. BENCHTOP DIGITAL VOLTMETER (FLUKE / RIGOL LAB STYLE) */}
        <div className="bg-[#1c222d] border-4 border-[#0f141c] rounded-3xl shadow-2xl p-5 space-y-4 relative overflow-hidden select-none">
          {/* Top Chassis Bezel with Model & Calibration Badge */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-sm" />
              <span className="font-mono font-black text-sm text-slate-200 tracking-wider">
                PRECISION BENCHTOP VOLTMETER <span className="text-sky-400 text-xs">VM-8050</span>
              </span>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded shadow-inner">
              CALIBRATED · 6½ DIGIT
            </span>
          </div>

          {/* VFD Fluorescent Cyan Glowing Screen */}
          <div className="bg-[#03151b] border-2 border-[#093544] rounded-2xl p-4 shadow-inner space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-500 border-b border-cyan-950/80 pb-1">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${vmPower ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
                <span>DC VOLTAGE</span>
              </span>
              <span>RANGE: {vmRange}</span>
              {vmHold && <span className="text-amber-400 font-bold bg-amber-950 px-1.5 rounded">HOLD</span>}
              {vmRelBaseline !== null && <span className="text-purple-400 font-bold">REL △</span>}
            </div>

            {/* Main Digit Display */}
            <div className="flex items-baseline justify-between py-1">
              <div className="font-mono text-4xl sm:text-5xl font-black text-cyan-300 tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                {voltmeterDisplayStr}
              </div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-cyan-400">
                {vmRange === '200mV' ? 'mV' : 'V DC'}
              </span>
            </div>

            {/* High-speed Analog Bargraph Meter & Galvanometer Dial */}
            <div className="space-y-1.5 pt-1 border-t border-cyan-950/60">
              {/* Laboratory Moving-Coil Galvanometer Dial (Moving Needle) */}
              <div className="relative bg-[#021319] border border-cyan-900/60 rounded-xl p-1 h-20 overflow-hidden shadow-inner">
                <svg viewBox="0 0 200 85" className="w-full h-full">
                  <path d="M 25 75 A 75 75 0 0 1 175 75" fill="none" stroke="#0e3b43" strokeWidth="4" />
                  <path d="M 35 75 A 65 65 0 0 1 165 75" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="2,4" />
                  <text x="25" y="82" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle">-20V</text>
                  <text x="60" y="45" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle">-10V</text>
                  <text x="100" y="30" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">0V</text>
                  <text x="140" y="45" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle">+10V</text>
                  <text x="175" y="82" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle">+20V</text>
                  {(() => {
                    const angle = Math.min(50, Math.max(-50, (voltmeterReading_V / 20) * 50));
                    return (
                      <g transform={`rotate(${angle} 100 80)`} className="transition-transform duration-200">
                        <line x1="100" y1="80" x2="100" y2="24" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="100" cy="80" r="4.5" fill="#f43f5e" />
                        <circle cx="100" cy="80" r="1.5" fill="#ffffff" />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              <div className="flex justify-between text-[9px] font-mono text-cyan-600">
                <span>-20V</span>
                <span>-10V</span>
                <span>0V</span>
                <span>+10V</span>
                <span>+20V</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full border border-cyan-950 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-150"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((voltmeterReading_V + 20) / 40) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Front Panel Controls (Buttons & Range) */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => {
                if (audioEnabled) labAudio.playSwitch();
                setVmPower(!vmPower);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                vmPower
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300 shadow'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>تشغيل</span>
            </button>

            <button
              onClick={() => {
                if (audioEnabled) labAudio.playBeep();
                setVmHold(!vmHold);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                vmHold
                  ? 'bg-amber-950 border-amber-600 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>تثبيت HOLD</span>
            </button>

            <button
              onClick={() => {
                if (audioEnabled) labAudio.playDialClick();
                setVmRange((prev) => {
                  if (prev === 'AUTO') return '200mV';
                  if (prev === '200mV') return '2V';
                  if (prev === '2V') return '20V';
                  if (prev === '20V') return '200V';
                  return 'AUTO';
                });
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
            >
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              <span>المدى {vmRange}</span>
            </button>

            <button
              onClick={() => {
                if (audioEnabled) labAudio.playBeep();
                setVmRelBaseline(vmRelBaseline === null ? voltmeterReading_V : null);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                vmRelBaseline !== null
                  ? 'bg-purple-950 border-purple-600 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>تصفير REL</span>
            </button>
          </div>

          {/* REAL VOLTMETER PROBES SECTION */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400" />
                <span>مجسات الفحص المخبرية (Test Probes):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">ضع المجسين على أي نقطتين لقياس الجهد</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Red Probe (+) */}
              <div className="bg-slate-900 border border-rose-900/60 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-rose-600 border border-white flex items-center justify-center font-bold text-white text-[10px] shadow">
                    +
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-rose-300 block">المجس الأحمر (V/+)</span>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px] block">
                      {vmRedProbePin ? vmRedProbePin : 'غير موصل'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (audioEnabled) labAudio.playBeep();
                    setActiveProbeSelecting(activeProbeSelecting === 'red' ? null : 'red');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeProbeSelecting === 'red'
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
                  }`}
                >
                  {activeProbeSelecting === 'red' ? 'انقر على المنفذ...' : 'تحديد المنفذ'}
                </button>
              </div>

              {/* Black Probe (-) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-black border border-slate-400 flex items-center justify-center font-bold text-white text-[10px] shadow">
                    -
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-300 block">المجس الأسود (COM/-)</span>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px] block">
                      {vmBlackProbePin ? vmBlackProbePin : 'غير موصل'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (audioEnabled) labAudio.playBeep();
                    setActiveProbeSelecting(activeProbeSelecting === 'black' ? null : 'black');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeProbeSelecting === 'black'
                      ? 'bg-slate-400 text-black animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {activeProbeSelecting === 'black' ? 'انقر على المنفذ...' : 'تحديد المنفذ'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BENCHTOP DIGITAL AMMETER (PRECISION CURRENT METER) */}
        <div className="bg-[#1c222d] border-4 border-[#0f141c] rounded-3xl shadow-2xl p-5 space-y-4 relative overflow-hidden select-none">
          {/* Top Chassis Bezel with Model & Fuse Status */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm" />
              <span className="font-mono font-black text-sm text-slate-200 tracking-wider">
                PRECISION BENCHTOP AMMETER <span className="text-emerald-400 text-xs">AM-3020</span>
              </span>
            </div>
            <span className="text-[10px] font-mono bg-slate-900 text-amber-300 border border-slate-700 px-2 py-0.5 rounded shadow-inner">
              FUSE 10A / 200mA OK
            </span>
          </div>

          {/* Emerald Green Glowing VFD Screen */}
          <div className="bg-[#041a12] border-2 border-[#0c4431] rounded-2xl p-4 shadow-inner space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 border-b border-emerald-950/80 pb-1">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${amPower ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
                <span>DC CURRENT (IN-SERIES)</span>
              </span>
              <span>RANGE: {amRange}</span>
              {amHold && <span className="text-amber-400 font-bold bg-amber-950 px-1.5 rounded">HOLD</span>}
            </div>

            {/* Main Current Digit Readout */}
            <div className="flex items-baseline justify-between py-1">
              <div className="font-mono text-4xl sm:text-5xl font-black text-emerald-300 tracking-widest drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                {ammeterDisplayStr}
              </div>
              <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400">
                {amRange === '200mA' ? 'mA' : 'A DC'}
              </span>
            </div>

            {/* Current Load Bar Graph & Galvanometer Needle */}
            <div className="space-y-1.5 pt-1 border-t border-emerald-950/60">
              {/* Laboratory Moving-Coil Galvanometer Current Needle */}
              <div className="relative bg-[#02140d] border border-emerald-900/60 rounded-xl p-1 h-20 overflow-hidden shadow-inner">
                <svg viewBox="0 0 200 85" className="w-full h-full">
                  <path d="M 25 75 A 75 75 0 0 1 175 75" fill="none" stroke="#0d3d2c" strokeWidth="4" />
                  <path d="M 35 75 A 65 65 0 0 1 165 75" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2,4" />
                  <text x="25" y="82" fill="#34d399" fontSize="7" fontFamily="monospace" textAnchor="middle">0A</text>
                  <text x="60" y="45" fill="#34d399" fontSize="7" fontFamily="monospace" textAnchor="middle">0.25A</text>
                  <text x="100" y="30" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">0.5A</text>
                  <text x="140" y="45" fill="#34d399" fontSize="7" fontFamily="monospace" textAnchor="middle">0.75A</text>
                  <text x="175" y="82" fill="#34d399" fontSize="7" fontFamily="monospace" textAnchor="middle">1.0A</text>
                  {(() => {
                    const angle = -50 + Math.min(100, Math.max(0, (ammeterReading_A / 1.0) * 100));
                    return (
                      <g transform={`rotate(${angle} 100 80)`} className="transition-transform duration-200">
                        <line x1="100" y1="80" x2="100" y2="24" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="100" cy="80" r="4.5" fill="#10b981" />
                        <circle cx="100" cy="80" r="1.5" fill="#ffffff" />
                      </g>
                    );
                  })()}
                </svg>
              </div>

              <div className="flex justify-between text-[9px] font-mono text-emerald-600">
                <span>0A</span>
                <span>0.25A</span>
                <span>0.5A</span>
                <span>0.75A</span>
                <span>1.0A</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full border border-emerald-950 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-300 transition-all duration-150"
                  style={{
                    width: `${Math.min(100, Math.max(0, (ammeterReading_A / 1.0) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Front Panel Ammeter Controls */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => {
                if (audioEnabled) labAudio.playSwitch();
                setAmPower(!amPower);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                amPower
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-300 shadow'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>تشغيل</span>
            </button>

            <button
              onClick={() => {
                if (audioEnabled) labAudio.playBeep();
                setAmHold(!amHold);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                amHold
                  ? 'bg-amber-950 border-amber-600 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>تثبيت HOLD</span>
            </button>

            <button
              onClick={() => {
                if (audioEnabled) labAudio.playDialClick();
                setAmRange((prev) => (prev === 'AUTO' ? '200mA' : prev === '200mA' ? '10A' : 'AUTO'));
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>المدى {amRange}</span>
            </button>
          </div>

          {/* AMMETER BANANA TERMINALS FOR SERIES INSERTION */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>منافذ توصيل الأميتر بالتوالي (Series In-Line Jacks):</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">وصل السلك عبر [A_IN] و [A_OUT]</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Ammeter IN Terminal */}
              <div
                onClick={() => handlePinClick('am_in', 'مدخل الأميتر A_IN')}
                className={`p-2 rounded-xl bg-slate-900 border flex items-center justify-between cursor-pointer transition-all ${
                  selectedStartPin?.id === 'am_in' ? 'border-emerald-400 ring-2 ring-emerald-400' : 'border-rose-900/60 hover:border-rose-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-rose-600 border border-white" />
                  <span className="text-xs font-mono font-bold text-slate-200">A_IN (مدخل +)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">10A / 200mA</span>
              </div>

              {/* Ammeter OUT Terminal */}
              <div
                onClick={() => handlePinClick('am_out', 'مخرج الأميتر A_OUT')}
                className={`p-2 rounded-xl bg-slate-900 border flex items-center justify-between cursor-pointer transition-all ${
                  selectedStartPin?.id === 'am_out' ? 'border-emerald-400 ring-2 ring-emerald-400' : 'border-slate-800 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-black border border-slate-400" />
                  <span className="text-xs font-mono font-bold text-slate-200">A_OUT (مخرج -)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">COM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: QUICK ACADEMIC EXPERIMENT TEMPLATES
          ========================================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white">تجارب معيارية جاهزة للتحقق السريع (Quick Academic Presets):</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">توصيل تلقائي طبق الأصل للقوانين الجامعية</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => applyPresetCircuit(1)}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-right transition-all cursor-pointer"
          >
            <span className="text-[10px] text-sky-400 font-bold block">1. قانون أوم:</span>
            <span className="text-xs font-bold text-white block">10V + 100Ω</span>
            <span className="text-[10px] text-emerald-400 font-mono">I = 0.1A (100mA)</span>
          </button>

          <button
            onClick={() => applyPresetCircuit(2)}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-right transition-all cursor-pointer"
          >
            <span className="text-[10px] text-sky-400 font-bold block">2. مقاومتان توالي:</span>
            <span className="text-xs font-bold text-white block">10V + 100Ω + 100Ω</span>
            <span className="text-[10px] text-emerald-400 font-mono">I = 0.05A (50mA)</span>
          </button>

          <button
            onClick={() => applyPresetCircuit(3)}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-right transition-all cursor-pointer"
          >
            <span className="text-[10px] text-sky-400 font-bold block">3. مقاومتان توازي:</span>
            <span className="text-xs font-bold text-white block">10V + 100Ω || 100Ω</span>
            <span className="text-[10px] text-emerald-400 font-mono">I = 0.2A (200mA)</span>
          </button>

          <button
            onClick={() => applyPresetCircuit(4)}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 text-right transition-all cursor-pointer"
          >
            <span className="text-[10px] text-amber-400 font-bold block">4. مصباح ومفتاح:</span>
            <span className="text-xs font-bold text-white block">12V Lamp + Switch</span>
            <span className="text-[10px] text-emerald-400 font-mono">إضاءة حية مع التبديل</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: THE MAIN PHYSICAL GREEN PCB TRAINER BOARD WITH REAL PORTS
          ========================================================================= */}
      <div className="bg-[#0b3d2b] border-8 border-[#06241a] rounded-3xl p-6 shadow-2xl space-y-6 relative select-none">
        {/* Corner Metallic Brass Mounting Bolts */}
        <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-amber-200 border-2 border-amber-700 shadow-inner" />
        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-amber-200 border-2 border-amber-700 shadow-inner" />
        <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-amber-200 border-2 border-amber-700 shadow-inner" />
        <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-amber-200 border-2 border-amber-700 shadow-inner" />

        {/* Board Title Silkscreen */}
        <div className="text-center border-b-2 border-emerald-500/30 pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-wider">
            لوحة التيارات والمكونات الإلكترونية المخبرية • MODULAR EXPERIMENTAL TRAINER
          </h2>
          <p className="text-xs text-emerald-300 font-mono mt-0.5">
            Heavy-Duty Banana Binding Posts • Custom Component Matrix • Real-Time KVL/KCL Simulation
          </p>
        </div>

        {/* WIRING TOOLBAR & COMPONENT MANAGEMENT */}
        <div className="bg-slate-950/80 border border-emerald-600/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
          {/* Wire Color Chooser */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-300 font-mono font-bold">لون سلك التوصيل:</span>
            {(['red', 'black', 'blue', 'yellow', 'green', 'white'] as const).map((c) => (
              <button
                key={c}
                onClick={() => {
                  if (audioEnabled) labAudio.playClick();
                  setActiveWireColor(c);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                  c === 'red'
                    ? 'bg-rose-600'
                    : c === 'black'
                    ? 'bg-black'
                    : c === 'blue'
                    ? 'bg-blue-600'
                    : c === 'yellow'
                    ? 'bg-yellow-400'
                    : c === 'green'
                    ? 'bg-emerald-600'
                    : 'bg-white'
                } ${activeWireColor === c ? 'scale-125 border-white shadow-lg ring-2 ring-emerald-400' : 'border-transparent'}`}
                title={`سلك ${c}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddComponentModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مكون إلى اللوحة</span>
            </button>

            <button
              onClick={handleClearWires}
              className="bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>فك الأسلاك ({wires.length})</span>
            </button>
          </div>
        </div>

        {/* ACTIVE WIRE SELECTION ALERT */}
        {selectedStartPin && (
          <div className="bg-amber-950 border border-amber-500 p-3 rounded-2xl flex items-center justify-between text-xs text-amber-200 animate-pulse">
            <span>
              تم اختيار الطرف الأول: <strong className="text-white">{selectedStartPin.label}</strong>. انقر الآن على أي منفذ آخر لإتمام التوصيل بالسلك.
            </span>
            <button
              onClick={() => setSelectedStartPin(null)}
              className="text-xs text-amber-400 underline font-bold cursor-pointer"
            >
              إلغاء التحديد
            </button>
          </div>
        )}

        {/* ACTIVE PROBE SELECTION ALERT */}
        {activeProbeSelecting && (
          <div className="bg-sky-950 border border-sky-500 p-3 rounded-2xl flex items-center justify-between text-xs text-sky-200 animate-pulse">
            <span>
              وضع المجس: انقر على أي منفذ على اللوحة لوضع{' '}
              <strong className="text-white">
                {activeProbeSelecting === 'red' ? 'المجس الأحمر (+)' : 'المجس الأسود (-)'}
              </strong>.
            </span>
            <button
              onClick={() => setActiveProbeSelecting(null)}
              className="text-xs text-sky-400 underline font-bold cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        )}

        {/* 1. POWER SUPPLY MAIN RAIL ON THE PCB */}
        <div className="bg-[#052b1e] border-2 border-emerald-500/60 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-mono">
            <span className="font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>منافذ التغذية الرئيسية (MAIN POWER SUPPLY BUS):</span>
            </span>
            <span>{isBoardPowerOn ? '⚡ الجهد نشط' : '⚪ التغذية متوقفة'}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* +12V Terminal */}
            <div
              onClick={() => handlePinClick('ps_12v', '+12V DC')}
              className={`p-3 rounded-xl bg-slate-950 border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedStartPin?.id === 'ps_12v'
                  ? 'border-white ring-4 ring-rose-500 scale-105'
                  : 'border-rose-600 hover:border-white'
              }`}
            >
              <div>
                <span className="text-xs font-mono font-black text-rose-400 block">+12V DC</span>
                <span className="text-[10px] text-slate-400 font-mono">Fixed Regulated</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center shadow">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-950" />
              </div>
            </div>

            {/* +5V Terminal */}
            <div
              onClick={() => handlePinClick('ps_5v', '+5V DC')}
              className={`p-3 rounded-xl bg-slate-950 border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedStartPin?.id === 'ps_5v'
                  ? 'border-white ring-4 ring-orange-500 scale-105'
                  : 'border-orange-500 hover:border-white'
              }`}
            >
              <div>
                <span className="text-xs font-mono font-black text-orange-400 block">+5V DC</span>
                <span className="text-[10px] text-slate-400 font-mono">TTL Logic Rail</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center shadow">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-950" />
              </div>
            </div>

            {/* -12V Terminal */}
            <div
              onClick={() => handlePinClick('ps_minus12v', '-12V DC')}
              className={`p-3 rounded-xl bg-slate-950 border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedStartPin?.id === 'ps_minus12v'
                  ? 'border-white ring-4 ring-blue-500 scale-105'
                  : 'border-blue-600 hover:border-white'
              }`}
            >
              <div>
                <span className="text-xs font-mono font-black text-blue-400 block">-12V DC</span>
                <span className="text-[10px] text-slate-400 font-mono">Negative Rail</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-950" />
              </div>
            </div>

            {/* VAR Terminal (0-30V) with Knob */}
            <div
              onClick={() => handlePinClick('ps_var', `VAR (${varRailVoltage.toFixed(1)}V)`)}
              className={`p-3 rounded-xl bg-slate-950 border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedStartPin?.id === 'ps_var'
                  ? 'border-white ring-4 ring-amber-400 scale-105'
                  : 'border-amber-400 hover:border-white'
              }`}
            >
              <div>
                <span className="text-xs font-mono font-black text-amber-400 block">
                  VAR ({varRailVoltage.toFixed(1)}V)
                </span>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={varRailVoltage}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    if (audioEnabled) labAudio.playDialClick();
                    setVarRailVoltage(parseFloat(e.target.value));
                  }}
                  className="w-20 h-1 bg-slate-800 rounded accent-amber-400 cursor-pointer mt-1"
                />
              </div>
              <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center shadow">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-950" />
              </div>
            </div>

            {/* GND Ground Terminal */}
            <div
              onClick={() => handlePinClick('ps_gnd', 'GND (الأرضي)')}
              className={`p-3 rounded-xl bg-slate-950 border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedStartPin?.id === 'ps_gnd'
                  ? 'border-white ring-4 ring-slate-400 scale-105'
                  : 'border-slate-600 hover:border-white'
              }`}
            >
              <div>
                <span className="text-xs font-mono font-black text-slate-200 block">GND (0V)</span>
                <span className="text-[10px] text-slate-400 font-mono">Common Return</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-black border-2 border-slate-400 flex items-center justify-center shadow">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
            </div>
          </div>
        </div>

        {/* 1.5 BENCHTOP METERS DEDICATED PCB BINDING POSTS */}
        <div className="bg-[#052b1e] border-2 border-cyan-500/50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-mono">
            <span className="font-bold flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>منافذ أجهزة القياس المخبرية على اللوحة (BENCHTOP METERS BINDING POSTS):</span>
            </span>
            <span className="text-[11px] text-slate-300">توصيل سلكي مباشر للأميتر والفولتميتر كمعمل حقيقي</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Ammeter IN + (Red) */}
            <div
              onClick={() => handlePinClick('am_in', 'مدخل الأميتر (A+)')}
              className={`p-3 rounded-xl bg-slate-950 border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedStartPin?.id === 'am_in'
                  ? 'border-white ring-4 ring-rose-500 scale-105'
                  : 'border-rose-600 hover:border-white'
              }`}
            >
              <div>
                <span className="text-xs font-mono font-black text-rose-400 block">AMMETER (A+)</span>
                <span className="text-[10px] text-slate-400 font-mono">Current In (توالي)</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center shadow">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-950" />
              </div>
            </div>

            {/* Ammeter OUT - (Black) */}
            <div
              onClick={() => handlePinClick('am_out', 'مخرج الأميتر (A- / COM)')}
              className={`p-3 rounded-xl bg-slate-950 border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedStartPin?.id === 'am_out'
                  ? 'border-white ring-4 ring-slate-400 scale-105'
                  : 'border-slate-700 hover:border-white'
              }`}
            >
              <div>
                <span className="text-xs font-mono font-black text-slate-200 block">AMMETER (A-)</span>
                <span className="text-[10px] text-slate-400 font-mono">Current Out (توالي)</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-black border-2 border-slate-400 flex items-center justify-center shadow">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
            </div>

            {/* Voltmeter IN + (Sky Blue) */}
            <div
              onClick={() => handlePinClick('vm_in', 'مدخل الفولتميتر (V+)')}
              className={`p-3 rounded-xl bg-slate-950 border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedStartPin?.id === 'vm_in'
                  ? 'border-white ring-4 ring-sky-500 scale-105'
                  : 'border-sky-500 hover:border-white'
              }`}
            >
              <div>
                <span className="text-xs font-mono font-black text-sky-400 block">VOLTMETER (V+)</span>
                <span className="text-[10px] text-slate-400 font-mono">Voltage Probe (+)</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center shadow">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-950" />
              </div>
            </div>

            {/* Voltmeter COM - (Black) */}
            <div
              onClick={() => handlePinClick('vm_com', 'أرضي الفولتميتر (COM-)')}
              className={`p-3 rounded-xl bg-slate-950 border-2 cursor-pointer transition-all flex items-center justify-between ${
                selectedStartPin?.id === 'vm_com'
                  ? 'border-white ring-4 ring-slate-400 scale-105'
                  : 'border-slate-700 hover:border-white'
              }`}
            >
              <div>
                <span className="text-xs font-mono font-black text-slate-200 block">VOLTMETER (COM)</span>
                <span className="text-[10px] text-slate-400 font-mono">Voltage Return (-)</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-black border-2 border-slate-400 flex items-center justify-center shadow">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              </div>
            </div>
          </div>
        </div>

        {/* 2. PLACED COMPONENTS ON THE BOARD ("وضع أي شيء") */}
        <div className="bg-[#052b1e] border-2 border-emerald-500/60 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-mono">
            <span className="font-bold flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>مكونات الدائرة المركبة على اللوحة ({components.length} عناصر):</span>
            </span>
            <span className="text-slate-300">انقر على أطراف أي عنصر للتوصيل بسلك</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((comp) => {
              const bands = comp.type === 'resistor' ? getResistorColorBands(comp.value) : null;
              const isMotorSpinning =
                comp.type === 'motor' && (circuitState.componentCurrents[comp.id] ?? 0) > 0.02;
              const isLampLit =
                comp.type === 'lamp' && (circuitState.componentCurrents[comp.id] ?? 0) > 0.05;
              const isLedLit =
                comp.type === 'led' && (circuitState.componentCurrents[comp.id] ?? 0) > 0.002;

              return (
                <div
                  key={comp.id}
                  className="bg-slate-950 border border-emerald-600/60 rounded-2xl p-4 space-y-3 shadow-lg relative"
                >
                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteComponent(comp.id)}
                    className="absolute top-2 left-2 text-slate-500 hover:text-rose-400 text-xs p-1 cursor-pointer"
                    title="حذف هذا المكون من اللوحة"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{comp.name}</span>
                    <span className="text-xs font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {comp.value} {comp.unit}
                    </span>
                  </div>

                  {/* VISUAL COMPONENT GRAPHICS */}
                  {comp.type === 'resistor' && bands && (
                    <div className="py-2">
                      <div className="w-full h-8 bg-amber-100 rounded-full border-2 border-amber-800 flex items-center justify-around px-4 shadow">
                        <div className={`w-2.5 h-full ${bands[0]}`} />
                        <div className={`w-2.5 h-full ${bands[1]}`} />
                        <div className={`w-2.5 h-full ${bands[2]}`} />
                        <div className={`w-2.5 h-full ${bands[3]}`} />
                      </div>
                    </div>
                  )}

                  {comp.type === 'led' && (
                    <div className="text-center py-2">
                      <div
                        className={`w-10 h-10 rounded-full mx-auto border-2 transition-all flex items-center justify-center ${
                          isLedLit
                            ? comp.ledColor === 'red'
                              ? 'bg-rose-500 border-white shadow-[0_0_25px_rgba(244,63,94,0.9)] animate-pulse'
                              : comp.ledColor === 'green'
                              ? 'bg-emerald-500 border-white shadow-[0_0_25px_rgba(16,185,129,0.9)] animate-pulse'
                              : comp.ledColor === 'blue'
                              ? 'bg-blue-500 border-white shadow-[0_0_25px_rgba(59,130,246,0.9)] animate-pulse'
                              : 'bg-yellow-400 border-white shadow-[0_0_25px_rgba(250,204,21,0.9)] animate-pulse'
                            : 'bg-slate-800 border-slate-600'
                        }`}
                      >
                        <Zap className={`w-5 h-5 ${isLedLit ? 'text-white' : 'text-slate-600'}`} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {isLedLit ? 'مشتعل (ON)' : 'منطفئ (OFF)'}
                      </span>
                    </div>
                  )}

                  {comp.type === 'lamp' && (
                    <div className="text-center py-2">
                      <div
                        className={`w-12 h-12 rounded-full mx-auto border-2 transition-all flex items-center justify-center ${
                          isLampLit
                            ? 'bg-amber-400 border-white shadow-[0_0_30px_rgba(251,191,36,1)]'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <Zap className={`w-6 h-6 ${isLampLit ? 'text-slate-950 font-black' : 'text-slate-600'}`} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {isLampLit ? 'المصباح مضيء 💡' : 'المصباح منطفئ'}
                      </span>
                    </div>
                  )}

                  {comp.type === 'motor' && (
                    <div className="text-center py-2">
                      <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-600 mx-auto flex items-center justify-center relative overflow-hidden">
                        <div
                          className={`w-10 h-10 border-4 border-dashed border-sky-400 rounded-full transition-all ${
                            isMotorSpinning ? 'animate-spin' : ''
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-mono mt-1 block text-sky-400 font-bold">
                        {isMotorSpinning ? 'يدور بسرعة ~1800 RPM ⚙️' : 'المحرك متوقف'}
                      </span>
                    </div>
                  )}

                  {comp.type === 'switch' && (
                    <div className="text-center py-2">
                      <button
                        onClick={() => {
                          if (audioEnabled) labAudio.playSwitch();
                          setComponents((prev) =>
                            prev.map((c) => (c.id === comp.id ? { ...c, state: !c.state } : c))
                          );
                        }}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                          comp.state
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                            : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {comp.state ? 'مفتاح مغلق (ON)' : 'مفتاح مفتوح (OFF)'}
                      </button>
                    </div>
                  )}

                  {comp.type === 'pot' && (
                    <div className="py-2 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>المنزلق Wiper:</span>
                        <span className="text-amber-400 font-bold">{comp.potPercentage ?? 50}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={comp.potPercentage ?? 50}
                        onChange={(e) => {
                          if (audioEnabled) labAudio.playDialClick();
                          const val = parseInt(e.target.value, 10);
                          setComponents((prev) =>
                            prev.map((c) => (c.id === comp.id ? { ...c, potPercentage: val } : c))
                          );
                        }}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  )}

                  {comp.type === 'capacitor' && (
                    <div className="text-center py-2">
                      <div className="w-10 h-14 bg-sky-950 border-2 border-sky-400 rounded-lg mx-auto flex flex-col justify-between p-1 shadow-md relative">
                        <div className="w-full h-1 bg-sky-300 rounded" />
                        <span className="text-[9px] font-mono text-sky-300 font-bold">{comp.value}µF</span>
                        <div className="w-full h-2 bg-slate-800 rounded text-[7px] text-slate-400 flex items-center justify-center font-bold">---</div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">مكثف كيميائي مستقطب</span>
                    </div>
                  )}

                  {comp.type === 'inductor' && (
                    <div className="text-center py-2">
                      <div className="flex items-center justify-center gap-1 py-2">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className="w-3 h-8 border-2 border-amber-600 rounded-full bg-amber-950/40 shadow-sm" />
                        ))}
                      </div>
                      <span className="text-[10px] text-amber-400 font-mono block">ملف نحاسي {comp.value}mH</span>
                    </div>
                  )}

                  {comp.type === 'diode' && (
                    <div className="text-center py-2">
                      <div className="w-16 h-6 bg-slate-900 border border-slate-700 rounded-md mx-auto flex items-center justify-between px-1 shadow">
                        <span className="text-[8px] text-slate-400 font-mono font-bold">+</span>
                        <div className="text-xs text-sky-400">⮞|</div>
                        <div className="w-2 h-full bg-slate-300 rounded-r shadow-inner" title="Cathode Ring" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">دايود سيليكون 1N4007</span>
                    </div>
                  )}

                  {comp.type === 'buzzer' && (
                    <div className="text-center py-2">
                      <div className={`w-12 h-12 rounded-full border-2 mx-auto flex items-center justify-center transition-all ${
                        (circuitState.componentCurrents[comp.id] ?? 0) > 0.01
                          ? 'bg-rose-600 border-white shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-bounce'
                          : 'bg-slate-900 border-slate-700'
                      }`}>
                        <Volume2 className={`w-6 h-6 ${(circuitState.componentCurrents[comp.id] ?? 0) > 0.01 ? 'text-white' : 'text-slate-600'}`} />
                      </div>
                      <span className="text-[10px] font-mono mt-1 block text-slate-400">
                        {(circuitState.componentCurrents[comp.id] ?? 0) > 0.01 ? 'يصدر صوت تنبيه 🔊' : 'بوق صامت'}
                      </span>
                    </div>
                  )}

                  {comp.type === 'transistor' && (
                    <div className="text-center py-2">
                      <div className="w-12 h-10 bg-slate-900 border-2 border-slate-700 rounded-t-2xl mx-auto flex flex-col items-center justify-center shadow">
                        <span className="text-[8px] font-mono text-emerald-400 font-bold">BC547</span>
                        <span className="text-[7px] font-mono text-slate-400">NPN BJT</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">ترانزستور مكبر/مفتاح</span>
                    </div>
                  )}

                  {comp.type === 'fuse' && (
                    <div className="text-center py-2">
                      <div className="w-16 h-6 bg-slate-950/80 border border-slate-700 rounded-md mx-auto flex items-center justify-between px-1 shadow relative">
                        <div className="w-2 h-full bg-amber-400 rounded-l" />
                        <div className={`w-8 h-0.5 ${comp.state ? 'bg-amber-300' : 'bg-transparent border-dashed border-rose-500'}`} />
                        <div className="w-2 h-full bg-amber-400 rounded-r" />
                      </div>
                      <span className="text-[10px] font-mono mt-1 block text-slate-400">
                        {comp.state ? `فيوز سليم ${comp.value}A` : 'فيوز محترق (مفصول)!'}
                      </span>
                    </div>
                  )}

                  {/* BANANA JACK PORTS FOR THIS COMPONENT */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-around">
                    {comp.pins.map((pin) => {
                      const isSelected = selectedStartPin?.id === pin.id;
                      const isVmRed = vmRedProbePin === pin.id;
                      const isVmBlack = vmBlackProbePin === pin.id;

                      return (
                        <div
                          key={pin.id}
                          onClick={() => handlePinClick(pin.id, `${comp.name} [${pin.label}]`)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-white ring-2 ring-emerald-400 scale-110 shadow-lg'
                              : 'border-slate-700 hover:border-emerald-400'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-emerald-600 border border-white flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-slate-200">{pin.label}</span>

                          {/* Visual probe tags if probed */}
                          {isVmRed && (
                            <span className="w-3 h-3 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center border border-white ml-1">
                              +
                            </span>
                          )}
                          {isVmBlack && (
                            <span className="w-3 h-3 rounded-full bg-black text-white text-[9px] font-black flex items-center justify-center border border-slate-400 ml-1">
                              -
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. CONNECTED WIRES LIST */}
        <div className="bg-[#052b1e] border-2 border-emerald-500/60 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-mono">
            <span className="font-bold">الأسلاك الموصلة حالياً على اللوحة ({wires.length} أسلاك):</span>
            <span className="text-slate-400">انقر على علامة (×) لإزالة أي سلك</span>
          </div>

          {wires.length === 0 ? (
            <p className="text-xs text-emerald-200/60 text-center py-2 font-mono">
              لا توجد أسلاك موصلة حالياً. اختر لون السلك وانقر على أي طرفين للتوصيل بينهما.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {wires.map((w) => (
                <div
                  key={w.id}
                  className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2"
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      w.color === 'red'
                        ? 'bg-rose-600'
                        : w.color === 'black'
                        ? 'bg-black'
                        : w.color === 'blue'
                        ? 'bg-blue-600'
                        : w.color === 'yellow'
                        ? 'bg-yellow-400'
                        : w.color === 'green'
                        ? 'bg-emerald-600'
                        : 'bg-white'
                    }`}
                  />
                  <span className="text-white font-bold">
                    {w.fromPinId} ⟷ {w.toPinId}
                  </span>
                  <button
                    onClick={() => handleDeleteWire(w.id)}
                    className="text-rose-400 hover:text-rose-300 ml-1 cursor-pointer"
                    title="فك السلك"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: ADD ANY COMPONENT TO THE BOARD ("وضع أي شيء")
          ========================================================================= */}
      {addComponentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>إضافة مكون جديد إلى اللوحة</span>
              </h3>
              <button
                onClick={() => setAddComponentModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">نوع المكون:</label>
                <select
                  value={newCompType}
                  onChange={(e) => setNewCompType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="resistor">مقاومة كربونية (Resistor)</option>
                  <option value="pot">مقاومة متغيرة (Potentiometer)</option>
                  <option value="led">دايود ضوئي (LED)</option>
                  <option value="lamp">مصباح كهربائي 12V (Filament Lamp)</option>
                  <option value="switch">مفتاح تشغيل (SPST Switch)</option>
                  <option value="motor">محرك تيار مستمر (DC Motor)</option>
                  <option value="fuse">فيوز حماية (Safety Fuse)</option>
                  <option value="capacitor">مكثف كهربائي (Capacitor)</option>
                  <option value="inductor">ملف حثي (Inductor)</option>
                  <option value="diode">دايود سيليكون 1N4007 (Diode)</option>
                  <option value="buzzer">بوق صوتي 12V (Piezo Buzzer)</option>
                  <option value="transistor">ترانزستور NPN BC547 (Transistor)</option>
                </select>
              </div>

              {newCompType === 'resistor' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    قيمة المقاومة (بالأوم Ω):
                  </label>
                  <input
                    type="number"
                    value={newCompValue}
                    onChange={(e) => setNewCompValue(Math.max(1, parseFloat(e.target.value) || 100))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    placeholder="مثال: 100, 220, 1000"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[10, 47, 100, 220, 330, 470, 1000, 4700, 10000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setNewCompValue(v)}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                      >
                        {v}Ω
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {newCompType === 'capacitor' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    السعة (بالميكروفاراد µF):
                  </label>
                  <input
                    type="number"
                    value={newCompValue}
                    onChange={(e) => setNewCompValue(Math.max(1, parseFloat(e.target.value) || 100))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[10, 22, 47, 100, 220, 470, 1000].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setNewCompValue(v)}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                      >
                        {v}µF
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {newCompType === 'inductor' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    الحث (بالميللي هنري mH):
                  </label>
                  <input
                    type="number"
                    value={newCompValue}
                    onChange={(e) => setNewCompValue(Math.max(1, parseFloat(e.target.value) || 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[1, 5, 10, 22, 50, 100].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setNewCompValue(v)}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                      >
                        {v}mH
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {newCompType === 'fuse' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    تيار فصل الفيوز (بالأمبير A):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newCompValue}
                    onChange={(e) => setNewCompValue(Math.max(0.1, parseFloat(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setNewCompValue(v)}
                        className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                      >
                        {v}A
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {newCompType === 'led' && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">لون الدايود الضوئي:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['red', 'green', 'blue', 'yellow'] as const).map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setNewCompLedColor(col)}
                        className={`p-2 rounded-xl border text-xs font-bold capitalize ${
                          newCompLedColor === col
                            ? 'border-white bg-slate-800 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setAddComponentModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddComponent}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                تثبيت على اللوحة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
