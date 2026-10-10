export interface User {
  id: string;
  phone: string;
  fullName: string;
  university: string;
  studyLevel: string;
  role: 'student' | 'owner';
  status: 'active' | 'expired' | 'suspended' | 'pending_activation';
  subscriptionType: 'مجاني' | 'فصلي' | 'سنوي' | 'VIP';
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AppSettings {
  ownerLocalPhone: string;
  ownerCountryCode: string;
  ownerInternationalPhone: string;
  allowSelfRegistration: boolean;
  freeTrialDays: number;
}

export interface ActivationCode {
  id: string;
  code: string;
  subscriptionType: 'فصلي' | 'سنوي' | 'VIP';
  durationDays: number;
  status: 'active' | 'used' | 'revoked';
  createdAt: string;
  usedAt?: string;
  usedByStudentId?: string;
  usedByStudentPhone?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorPhone: string;
  actorRole: string;
  action: string;
  details: string;
}

export interface EducationalResource {
  id: string;
  title: string;
  category: 'كتاب' | 'دليل عملي' | 'محاضرة' | 'ورقة بحثية';
  description: string;
  fileUrl: string;
  fileSize: string;
  pages?: number;
  createdAt: string;
}

export interface EducationalVideo {
  id: string;
  title: string;
  topic: string;
  url: string;
  duration: string;
  level: string;
  createdAt: string;
}

export interface EducationalLesson {
  id: string;
  title: string;
  subject: string;
  level: string;
  summary: string;
  content: string;
  videoUrl?: string;
  pdfUrl?: string;
  author: string;
  createdAt: string;
}

export type ComponentType =
  | 'dc_source'
  | 'ac_source'
  | 'resistor'
  | 'capacitor'
  | 'inductor'
  | 'switch'
  | 'lamp'
  | 'diode'
  | 'led'
  | 'npn_transistor'
  | 'relay'
  | 'fuse'
  | 'ground'
  | 'voltmeter'
  | 'ammeter';

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  label: string;
  value: number; // e.g. voltage, resistance in ohms, capacitance in uF, etc.
  unit: string;  // V, Ω, µF, mH, A
  state?: boolean; // For switches / relays
  isBlown?: boolean; // For fuses
  reading?: number; // Live voltage or current reading
}

export interface CircuitWire {
  id: string;
  fromId: string;
  fromPin: 'A' | 'B' | 'C' | 'GND' | '+' | '-';
  toId: string;
  toPin: 'A' | 'B' | 'C' | 'GND' | '+' | '-';
}

export interface CircuitSimulationState {
  isRunning: boolean;
  totalCurrent_mA: number;
  totalResistance_ohm: number;
  sourceVoltage_V: number;
  power_mW: number;
  warnings: string[];
  errors: string[];
  isShortCircuit: boolean;
  isOpenCircuit: boolean;
}

export interface Experiment {
  id: string;
  title: string;
  subject: 'كهرباء' | 'إلكترونيات' | 'منطق رقمي' | 'أردوينو' | 'روبوتات' | 'تحكم';
  academicLevel: 'سنة أولى' | 'سنة ثانية' | 'سنة ثالثة' | 'سنة رابعة';
  objective: string;
  theory: string;
  equations: string[];
  components: string[];
  steps: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  summary: string;
}
