/**
 * Unified Circuit Physics Solver based on Ohm's and Kirchhoff's Laws (KVL & KCL)
 * Used across the Power Supply Board, Breadboard Workbench, Ammeters, and Voltmeters
 */

export interface TerminalRef {
  id: string; // e.g. 'PS_+5V', 'PS_+12V', 'PS_-12V', 'PS_+15V', 'PS_-15V', 'PS_GND', 'PS_VAR', 'COMP_res1_p1', etc.
  name: string;
  voltagePotential?: number; // relative to circuit ground (0V)
}

export interface WorkbenchComponent {
  id: string;
  type: 'resistor' | 'lamp' | 'switch' | 'fuse' | 'led' | 'ammeter' | 'voltmeter';
  name: string;
  value: number; // e.g. 100 for 100Ω, 12 for 12V lamp, 1.5 for 1.5A fuse
  unit: string;
  state?: boolean; // switch ON/OFF, fuse intact/blown
  pins: { id: string; label: string }[];
}

export interface JumperWire {
  id: string;
  fromPinId: string;
  toPinId: string;
  color: 'red' | 'black' | 'blue' | 'yellow' | 'green' | 'white';
}

export interface BranchResult {
  componentId: string;
  current_A: number;
  voltageDrop_V: number;
  power_W: number;
}

export interface SolverResult {
  isPowerOn: boolean;
  isOpenCircuit: boolean;
  isShortCircuit: boolean;
  isOcpTripped: boolean;
  sourceVoltage_V: number;
  sourceRailName: string;
  returnRailName: string;
  totalResistance_ohm: number;
  totalCurrent_A: number;
  totalPower_W: number;
  branchResults: Record<string, BranchResult>;
  voltmeterReading_V: number;
  ammeterReading_A: number;
  statusMessage: string;
  statusType: 'normal' | 'open' | 'short' | 'off';
}

/**
 * Solve a circuit driven by the AC/DC Power Supply board
 */
export function solvePowerSupplyCircuit(params: {
  isPowerOn: boolean;
  fuseIntact: boolean;
  varKnobVoltage: number; // 3.0 to 20.0V
  activeRails: {
    sourceRail: '+5V' | '+12V' | '-12V' | '+15V' | '-15V' | 'VAR' | 'NONE';
    returnRail: 'GND' | '-12V' | '-15V' | 'NONE';
  };
  components: WorkbenchComponent[];
  wires: JumperWire[];
  connectionTopology: 'series' | 'parallel' | 'single' | 'custom';
}): SolverResult {
  const { isPowerOn, fuseIntact, varKnobVoltage, activeRails, components, wires, connectionTopology } = params;

  // 1. If power supply switch is OFF or main fuse blown
  if (!isPowerOn || !fuseIntact) {
    return {
      isPowerOn: false,
      isOpenCircuit: false,
      isShortCircuit: false,
      isOcpTripped: false,
      sourceVoltage_V: 0.0,
      sourceRailName: activeRails.sourceRail,
      returnRailName: activeRails.returnRail,
      totalResistance_ohm: 0,
      totalCurrent_A: 0.0,
      totalPower_W: 0.0,
      branchResults: {},
      voltmeterReading_V: 0.0,
      ammeterReading_A: 0.0,
      statusMessage: !isPowerOn
        ? 'مزود الطاقة في وضع الإيقاف (OFF). التغذية مفصولة تماماً.'
        : 'فيوز الحماية الرئيسي محترق (FUSE BLOWN). يرجى استبدال الفيوز لإعادة التشغيل.',
      statusType: 'off',
    };
  }

  // 2. Determine potential difference between selected rails
  const getRailPotential = (rail: string): number => {
    switch (rail) {
      case '+5V': return 5.0;
      case '+12V': return 12.0;
      case '-12V': return -12.0;
      case '+15V': return 15.0;
      case '-15V': return -15.0;
      case 'VAR': return varKnobVoltage;
      case 'GND': return 0.0;
      default: return 0.0;
    }
  };

  const vSource = getRailPotential(activeRails.sourceRail);
  const vReturn = getRailPotential(activeRails.returnRail);
  const netSupplyVoltage = Math.abs(vSource - vReturn);

  // If no supply rails connected
  if (activeRails.sourceRail === 'NONE' || activeRails.returnRail === 'NONE') {
    return {
      isPowerOn: true,
      isOpenCircuit: true,
      isShortCircuit: false,
      isOcpTripped: false,
      sourceVoltage_V: netSupplyVoltage,
      sourceRailName: activeRails.sourceRail,
      returnRailName: activeRails.returnRail,
      totalResistance_ohm: 0,
      totalCurrent_A: 0.0,
      totalPower_W: 0.0,
      branchResults: {},
      voltmeterReading_V: 0.0,
      ammeterReading_A: 0.0,
      statusMessage: 'الدائرة مفتوحة: يرجى توصيل سلكين على الأقل (طرف التغذية وطرف الأرضي/الراجع).',
      statusType: 'open',
    };
  }

  // Check if wires exist connecting both source and return rails (Closed Circuit Check)
  const hasWireToSourceRail = wires.some(w => {
    const p1 = w.fromPinId.toLowerCase();
    const p2 = w.toPinId.toLowerCase();
    return (p1.startsWith('ps_') && !p1.includes('gnd') && !p1.includes('0v')) ||
           (p2.startsWith('ps_') && !p2.includes('gnd') && !p2.includes('0v'));
  });

  const hasWireToReturnRail = wires.some(w => {
    const p1 = w.fromPinId.toLowerCase();
    const p2 = w.toPinId.toLowerCase();
    return p1.includes('gnd') || p1.includes('minus') || p1.includes('0v') ||
           p2.includes('gnd') || p2.includes('minus') || p2.includes('0v');
  });

  if (wires.length === 0 || !hasWireToSourceRail || !hasWireToReturnRail) {
    return {
      isPowerOn: true,
      isOpenCircuit: true,
      isShortCircuit: false,
      isOcpTripped: false,
      sourceVoltage_V: netSupplyVoltage,
      sourceRailName: activeRails.sourceRail,
      returnRailName: activeRails.returnRail,
      totalResistance_ohm: 0,
      totalCurrent_A: 0.0,
      totalPower_W: 0.0,
      branchResults: {},
      voltmeterReading_V: 0.0,
      ammeterReading_A: 0.0,
      statusMessage: wires.length === 0
        ? 'الدائرة مفتوحة (Open Circuit): لا توجد أسلاك متصلة بمخارج مزود الطاقة.'
        : 'الدائرة مفتوحة (Open Circuit): مسار التغذية غير مكتمل (أحد الأسلاك مفصول أو غير متصل بالأرضي).',
      statusType: 'open',
    };
  }

  // Check switches in circuit
  const switches = components.filter(c => c.type === 'switch');
  const anyOpenSwitch = switches.some(s => s.state === false);

  if (anyOpenSwitch) {
    return {
      isPowerOn: true,
      isOpenCircuit: true,
      isShortCircuit: false,
      isOcpTripped: false,
      sourceVoltage_V: netSupplyVoltage,
      sourceRailName: activeRails.sourceRail,
      returnRailName: activeRails.returnRail,
      totalResistance_ohm: 0,
      totalCurrent_A: 0.0,
      totalPower_W: 0.0,
      branchResults: {},
      voltmeterReading_V: netSupplyVoltage, // Across open switch
      ammeterReading_A: 0.0,
      statusMessage: 'الدائرة مفتوحة: مفتاح التحكم في وضع الإيقاف (Switch OFF). لا يمر أي تيار.',
      statusType: 'open',
    };
  }

  // Direct short-circuit wire check (e.g. wire directly from source rail to return rail)
  const isDirectShortWire = wires.some(w => {
    const p1 = w.fromPinId.toLowerCase();
    const p2 = w.toPinId.toLowerCase();
    const isSource1 = p1.includes('ps_') && (p1.includes('var') || p1.includes('5v') || p1.includes('12v') || p1.includes('15v'));
    const isSource2 = p2.includes('ps_') && (p2.includes('var') || p2.includes('5v') || p2.includes('12v') || p2.includes('15v'));
    const isGnd1 = p1.includes('gnd') || p1.includes('return') || p1.includes('minus');
    const isGnd2 = p2.includes('gnd') || p2.includes('return') || p2.includes('minus');
    return (isSource1 && isGnd2) || (isSource2 && isGnd1);
  });

  // Calculate equivalent load resistance based on active components
  const activeResistors = components.filter(c => c.type === 'resistor');
  const activeLamps = components.filter(c => c.type === 'lamp');

  let totalR = 0;
  const branchMap: Record<string, BranchResult> = {};

  if (activeResistors.length === 0 && activeLamps.length === 0) {
    // No load components in path
    if (isDirectShortWire) {
      // Direct short circuit!
      return {
        isPowerOn: true,
        isOpenCircuit: false,
        isShortCircuit: true,
        isOcpTripped: true,
        sourceVoltage_V: 0.0,
        sourceRailName: activeRails.sourceRail,
        returnRailName: activeRails.returnRail,
        totalResistance_ohm: 0.01,
        totalCurrent_A: 0.0, // Clamped by OCP
        totalPower_W: 0.0,
        branchResults: {},
        voltmeterReading_V: 0.0,
        ammeterReading_A: 0.0,
        statusMessage: 'خطر: قصر كهربائي مباشر (Direct Short Circuit)! تم تفعيل حماية التيار الزائد OCP وفصل الخرج.',
        statusType: 'short',
      };
    } else {
      return {
        isPowerOn: true,
        isOpenCircuit: true,
        isShortCircuit: false,
        isOcpTripped: false,
        sourceVoltage_V: netSupplyVoltage,
        sourceRailName: activeRails.sourceRail,
        returnRailName: activeRails.returnRail,
        totalResistance_ohm: 0,
        totalCurrent_A: 0.0,
        totalPower_W: 0.0,
        branchResults: {},
        voltmeterReading_V: 0.0,
        ammeterReading_A: 0.0,
        statusMessage: 'الدائرة مفتوحة: لا توجد عناصر حمل موصلة (مقاومات أو مصابيح).',
        statusType: 'open',
      };
    }
  }

  // Calculate Total Resistance using Ohm's & Kirchhoff's laws
  if (connectionTopology === 'series' || (connectionTopology === 'single' && (activeResistors.length + activeLamps.length === 1))) {
    // Series: R_total = R1 + R2 + ... + Rn
    totalR = activeResistors.reduce((sum, r) => sum + r.value, 0);
    totalR += activeLamps.reduce((sum, l) => sum + (l.value > 0 ? (l.value * l.value) / 10 : 14.4), 0);
  } else if (connectionTopology === 'parallel') {
    // Parallel: 1 / R_total = 1/R1 + 1/R2 + ... + 1/Rn
    let conductanceSum = 0;
    activeResistors.forEach(r => {
      conductanceSum += 1 / Math.max(r.value, 0.01);
    });
    activeLamps.forEach(l => {
      const rLamp = l.value > 0 ? (l.value * l.value) / 10 : 14.4;
      conductanceSum += 1 / rLamp;
    });
    totalR = conductanceSum > 0 ? 1 / conductanceSum : 0;
  } else {
    // Freeform or mixed topology fallback
    totalR = activeResistors.reduce((sum, r) => sum + r.value, 0);
    totalR += activeLamps.reduce((sum, l) => sum + 14.4, 0);
  }

  // Short circuit threshold (< 0.5 ohm with voltage applied)
  if (totalR < 0.5 && netSupplyVoltage > 0) {
    return {
      isPowerOn: true,
      isOpenCircuit: false,
      isShortCircuit: true,
      isOcpTripped: true,
      sourceVoltage_V: 0.0,
      sourceRailName: activeRails.sourceRail,
      returnRailName: activeRails.returnRail,
      totalResistance_ohm: totalR,
      totalCurrent_A: 0.0,
      totalPower_W: 0.0,
      branchResults: {},
      voltmeterReading_V: 0.0,
      ammeterReading_A: 0.0,
      statusMessage: 'تحذير أمان: قصر كهربائي (R < 0.5Ω)! تم إيقاف التيار عبر دارة الحماية من التيار الزائد OCP.',
      statusType: 'short',
    };
  }

  // Ohm's Law: I_total = V / R_total
  const totalCurrent_A = totalR > 0 ? netSupplyVoltage / totalR : 0.0;
  const totalPower_W = netSupplyVoltage * totalCurrent_A;

  // Calculate Branch Currents & Voltages according to topology
  if (connectionTopology === 'series') {
    // Series: Same current through all components, voltage divides: V_i = I * R_i
    activeResistors.forEach(r => {
      const vDrop = totalCurrent_A * r.value;
      branchMap[r.id] = {
        componentId: r.id,
        current_A: totalCurrent_A,
        voltageDrop_V: vDrop,
        power_W: vDrop * totalCurrent_A,
      };
    });
    activeLamps.forEach(l => {
      const rLamp = l.value > 0 ? (l.value * l.value) / 10 : 14.4;
      const vDrop = totalCurrent_A * rLamp;
      branchMap[l.id] = {
        componentId: l.id,
        current_A: totalCurrent_A,
        voltageDrop_V: vDrop,
        power_W: vDrop * totalCurrent_A,
      };
    });
  } else if (connectionTopology === 'parallel') {
    // Parallel: Same voltage across all branches, current divides: I_i = V / R_i
    activeResistors.forEach(r => {
      const iBranch = netSupplyVoltage / Math.max(r.value, 0.01);
      branchMap[r.id] = {
        componentId: r.id,
        current_A: iBranch,
        voltageDrop_V: netSupplyVoltage,
        power_W: netSupplyVoltage * iBranch,
      };
    });
    activeLamps.forEach(l => {
      const rLamp = l.value > 0 ? (l.value * l.value) / 10 : 14.4;
      const iBranch = netSupplyVoltage / rLamp;
      branchMap[l.id] = {
        componentId: l.id,
        current_A: iBranch,
        voltageDrop_V: netSupplyVoltage,
        power_W: netSupplyVoltage * iBranch,
      };
    });
  } else {
    // Single component
    const comp = activeResistors[0] || activeLamps[0];
    if (comp) {
      branchMap[comp.id] = {
        componentId: comp.id,
        current_A: totalCurrent_A,
        voltageDrop_V: netSupplyVoltage,
        power_W: totalPower_W,
      };
    }
  }

  return {
    isPowerOn: true,
    isOpenCircuit: false,
    isShortCircuit: false,
    isOcpTripped: false,
    sourceVoltage_V: netSupplyVoltage,
    sourceRailName: activeRails.sourceRail,
    returnRailName: activeRails.returnRail,
    totalResistance_ohm: parseFloat(totalR.toFixed(2)),
    totalCurrent_A: parseFloat(totalCurrent_A.toFixed(4)),
    totalPower_W: parseFloat(totalPower_W.toFixed(3)),
    branchResults: branchMap,
    voltmeterReading_V: parseFloat(netSupplyVoltage.toFixed(2)),
    ammeterReading_A: parseFloat(totalCurrent_A.toFixed(4)),
    statusMessage: `الدائرة تعمل بصورة طبيعية (Normal Operation): الجهد ${netSupplyVoltage.toFixed(1)}V، المقاومة الكلية ${totalR.toFixed(1)}Ω، التيار الكلي ${totalCurrent_A.toFixed(3)}A`,
    statusType: 'normal',
  };
}

/**
 * Compute node potentials (V relative to GND) across all pins and rails for realistic Voltmeter probing
 */
export function computeNodeVoltages(params: {
  isPowerOn: boolean;
  varVoltageKnob: number;
  components: WorkbenchComponent[];
  wires: JumperWire[];
  solverResult: SolverResult;
}): Record<string, number> {
  const { isPowerOn, varVoltageKnob, components, wires, solverResult } = params;
  const nodes: Record<string, number> = {
    ps_5v: 5.0,
    ps_12v: 12.0,
    ps_minus12v: -12.0,
    ps_15v: 15.0,
    ps_minus15v: -15.0,
    ps_var: varVoltageKnob,
    ps_gnd: 0.0,
  };

  if (!isPowerOn || solverResult.isOcpTripped) {
    Object.keys(nodes).forEach(k => {
      if (k !== 'ps_gnd') nodes[k] = 0;
    });
    return nodes;
  }

  // Assign component voltages based on solver results
  components.forEach(comp => {
    const branch = solverResult.branchResults[comp.id];
    const p1 = comp.pins[0]?.id;
    const p2 = comp.pins[1]?.id;
    if (branch && p1 && p2) {
      // Find wire connecting to p1 or p2
      const wToP1 = wires.find(w => w.toPinId === p1 || w.fromPinId === p1);
      const isConnectedToSource = wToP1 && (
        wToP1.fromPinId.includes('var') || wToP1.fromPinId.includes('12v') || wToP1.fromPinId.includes('5v') ||
        wToP1.toPinId.includes('var') || wToP1.toPinId.includes('12v') || wToP1.toPinId.includes('5v')
      );
      if (isConnectedToSource) {
        nodes[p1] = solverResult.sourceVoltage_V;
        nodes[p2] = Math.max(0, solverResult.sourceVoltage_V - branch.voltageDrop_V);
      } else {
        nodes[p1] = branch.voltageDrop_V;
        nodes[p2] = 0.0;
      }
    } else if (p1 && p2) {
      nodes[p1] = 0;
      nodes[p2] = 0;
    }
  });

  // Propagate along ideal wires
  for (let pass = 0; pass < 3; pass++) {
    wires.forEach(w => {
      const v1 = nodes[w.fromPinId];
      const v2 = nodes[w.toPinId];
      if (v1 !== undefined && v2 === undefined) nodes[w.toPinId] = v1;
      else if (v2 !== undefined && v1 === undefined) nodes[w.fromPinId] = v2;
    });
  }

  return nodes;
}

/**
 * Measure potential difference between Red probe (+) and Black probe (-)
 */
export function measureProbeVoltage(
  probeRedPinId: string | null,
  probeBlackPinId: string | null,
  nodeVoltages: Record<string, number>,
  isPowerOn: boolean,
  isOcpTripped: boolean
): number {
  if (!probeRedPinId || !probeBlackPinId || !isPowerOn || isOcpTripped) return 0.0;
  const vRed = nodeVoltages[probeRedPinId] ?? 0.0;
  const vBlack = nodeVoltages[probeBlackPinId] ?? 0.0;
  return parseFloat((vRed - vBlack).toFixed(3));
}
