export interface MeterProfile {
  id: string;
  brand: string;
  model: string;
  fullName: string;
  tier: 'basic' | 'standard' | 'advanced' | 'power_quality';
  makeKey: string;
  modbus: {
    defaultSlaveId: number;
    baud: number;
    parity: 'N' | 'E' | 'O';
    stopBits: number;
    wordOrder: 'ABCD' | 'CDAB' | 'BADC' | 'DCBA';
  };
  gotchas: string[];
}

export const METER_PROFILES: MeterProfile[] = [
  {
    id: 'selec.mfm384.v1',
    brand: 'Selec',
    model: 'MFM384',
    fullName: 'Selec MFM384',
    tier: 'standard',
    makeKey: 'SELEC',
    modbus: { defaultSlaveId: 1, baud: 9600, parity: 'E', stopBits: 1, wordOrder: 'CDAB' },
    gotchas: [
      'Word order is CDAB (low-word first) — NOT the standard ABCD. Verify with a live clamp-meter cross-check on first install.',
      'Word order needs hardware confirmation — flag in site report.',
    ],
  },
  {
    id: 'rishabh.rish-3440-02s.v1',
    brand: 'Rishabh',
    model: 'RISH Master 3440',
    fullName: 'Rishabh RISH Master 3440',
    tier: 'advanced',
    makeKey: 'RISHABH',
    modbus: { defaultSlaveId: 1, baud: 9600, parity: 'E', stopBits: 1, wordOrder: 'ABCD' },
    gotchas: [
      'Energy unit is user-configurable (Wh / kWh / MWh). Must set to kWh explicitly during commissioning — default may be Wh, causing 1000× error in readings.',
      'CT/PT ratios must be programmed on-site via Modbus write registers before going live.',
    ],
  },
  {
    id: 'janitza.umg-96rm-e.v1',
    brand: 'Janitza',
    model: 'UMG 96RM-E',
    fullName: 'Janitza UMG 96RM-E',
    tier: 'power_quality',
    makeKey: 'JANITZA',
    modbus: { defaultSlaveId: 1, baud: 19200, parity: 'N', stopBits: 1, wordOrder: 'ABCD' },
    gotchas: [
      'MQTT is NOT native on meter firmware — requires a Class-1 gateway (e.g., SAN Telequip GW IoT G8M-485) or a Janitza GridVis bridge.',
      'Big-endian register format; some signed registers use unsigned + 32768 offset for negative values.',
      'IEC 61000-4-30 Class A status flag at register 35049 — read to confirm event capture quality.',
    ],
  },
  {
    id: 'conzerv.em6400-ng.v1',
    brand: 'Conzerv',
    model: 'EM6400 NG',
    fullName: 'Conzerv EM6400 NG',
    tier: 'standard',
    makeKey: 'SCHNEIDER',
    modbus: { defaultSlaveId: 1, baud: 19200, parity: 'E', stopBits: 1, wordOrder: 'CDAB' },
    gotchas: [
      'INT64 energy at register 3204: total_Wh = lower32 + (upper32 × 4,294,967,296). Do NOT read as two separate INT32 registers.',
      'Standard EM6400 NG has no per-phase THD — use EM6400 NG+ for per-phase THD data.',
    ],
  },
  {
    id: 'lnt.er300p.v1',
    brand: 'L&T',
    model: 'ER300P',
    fullName: 'L&T ER300P',
    tier: 'standard',
    makeKey: 'LNT',
    modbus: { defaultSlaveId: 1, baud: 9600, parity: 'E', stopBits: 1, wordOrder: 'ABCD' },
    gotchas: [
      'Use FC04 (not FC03) for the 30xxx instantaneous register block — FC03 returns zero or error.',
      'Registers are scaled UINT16 not float: ×0.01 for voltage, ×0.001 for current, ×0.1 for kW/kVA/kVAr.',
      'Slave address change requires full power cycle to take effect.',
      'No per-phase THD or kVA max demand registers available.',
    ],
  },
  {
    id: 'schneider.pm5320.v1',
    brand: 'Schneider',
    model: 'PowerLogic PM5320',
    fullName: 'Schneider PowerLogic PM5320',
    tier: 'advanced',
    makeKey: 'SCHNEIDER',
    modbus: { defaultSlaveId: 1, baud: 19200, parity: 'E', stopBits: 1, wordOrder: 'CDAB' },
    gotchas: [
      'Energy registers update every 5 seconds — polling faster than 5s will yield duplicate energy values.',
      '4-quadrant power factor range is −2.0 to +2.0 (unity = ±1.0, not ±2.0).',
    ],
  },
  {
    id: 'schneider.pm5560.v1',
    brand: 'Schneider',
    model: 'PowerLogic PM5560',
    fullName: 'Schneider PowerLogic PM5560 (HT Main)',
    tier: 'advanced',
    makeKey: 'SCHNEIDER',
    modbus: { defaultSlaveId: 1, baud: 19200, parity: 'E', stopBits: 1, wordOrder: 'CDAB' },
    gotchas: [
      'Acts as a Modbus TCP gateway — can host up to 31 downstream RS485 slave meters on unit IDs 100–247 via RS485 daisy-chain.',
      'Individual harmonic block address (beyond 63rd order) is undocumented — use Janitza UMG 96RM-E for PQ-tier harmonic analysis.',
    ],
  },
  {
    id: 'siemens.pac3220.v1',
    brand: 'Siemens',
    model: 'SENTRON PAC3220',
    fullName: 'Siemens SENTRON PAC3220',
    tier: 'advanced',
    makeKey: 'SIEMENS',
    modbus: { defaultSlaveId: 126, baud: 9600, parity: 'E', stopBits: 1, wordOrder: 'ABCD' },
    gotchas: [
      'Default slave address is 126 (not 1). Change to your site address before commissioning to avoid bus conflicts.',
      'Energy total is split across 8 tariff bins (T1–T8) — gateway must sum all 8 registers for true kWh total.',
      'Register address space caps at 2820 — do not poll beyond this address.',
    ],
  },
  {
    id: 'abb.m4m-30.v1',
    brand: 'ABB',
    model: 'M4M 30',
    fullName: 'ABB M4M 30',
    tier: 'advanced',
    makeKey: 'ABB',
    modbus: { defaultSlaveId: 247, baud: 9600, parity: 'E', stopBits: 1, wordOrder: 'ABCD' },
    gotchas: [
      'Default slave address is 247 (end-of-range). Change to 1 or a site-specific address before commissioning.',
      'Write-protect lock on the front panel must be physically unlocked before CT/PT commissioning writes succeed.',
      'Energy register at 0x5000 is unsigned INT64 with ÷100 scale factor (not float).',
    ],
  },
  {
    id: 'janitza.umg-604-pro.v1',
    brand: 'Janitza',
    model: 'UMG 604-PRO',
    fullName: 'Janitza UMG 604-PRO',
    tier: 'power_quality',
    makeKey: 'JANITZA',
    modbus: { defaultSlaveId: 1, baud: 19200, parity: 'N', stopBits: 1, wordOrder: 'ABCD' },
    gotchas: [
      'MQTT is NOT native on meter firmware — only available via Janitza GridVis software. Use Modbus TCP with a Class-1 gateway instead.',
      'Waveform export is via GridVis FTP/CBF format, not real-time Modbus streaming.',
      '19000-block register layout is identical to UMG 96RM-E — same gateway profile decoder applies.',
    ],
  },
  {
    id: 'schneider.em6400ng-cl1rs.v1',
    brand: 'Schneider',
    model: 'EM6400NG CL-1RS',
    fullName: 'Schneider EM6400NG CL-1RS',
    tier: 'standard',
    makeKey: 'SCHNEIDER',
    modbus: { defaultSlaveId: 1, baud: 9600, parity: 'E', stopBits: 1, wordOrder: 'CDAB' },
    gotchas: [
      'Class 1 accuracy (IEC 62053-21) — requires CT ratio programming via Modbus write registers before first reading.',
      'INT64 energy at register 3204: total_Wh = lower32 + (upper32 × 4,294,967,296). Do NOT read as two separate INT32 registers.',
      'Standard EM6400NG has no per-phase THD — use EM6400NG+ or Janitza UMG for per-phase THD.',
      'Default baud is 9600; ESX Panel Server Universal pairs at 9600 with even parity out-of-box.',
    ],
  },
  {
    id: 'schneider.em1200-cl1rs.v1',
    brand: 'Schneider',
    model: 'EM1200 CL-1RS',
    fullName: 'Schneider EM1200 CL-1RS',
    tier: 'basic',
    makeKey: 'SCHNEIDER',
    modbus: { defaultSlaveId: 1, baud: 9600, parity: 'E', stopBits: 1, wordOrder: 'CDAB' },
    gotchas: [
      'Basic sub-meter only — no max demand, no THD, no harmonic registers. Use EM6400NG for incomer or demand monitoring.',
      'Energy is accumulated total (kWh import only); no export register — unsuitable on solar or co-gen feeders.',
      'CT ratio must be programmed via Modbus write (register 0x0010) before commissioning. Default CT = 5A → scale error if left unconfigured.',
      'Word order is CDAB (Schneider convention). Floating-point values: register pair at base address = lower word, base+1 = upper word.',
    ],
  },
  {
    id: 'elmeasure.lg-5310.v1',
    brand: 'Elmeasure',
    model: 'LG 5310',
    fullName: 'Elmeasure LG 5310',
    tier: 'standard',
    makeKey: 'ELMEASURE',
    modbus: { defaultSlaveId: 1, baud: 9600, parity: 'E', stopBits: 1, wordOrder: 'ABCD' },
    gotchas: [
      'Single-direction energy counter only — no kWh export register. Do NOT use on solar or co-generation sites.',
      'Energy unit is user-configurable (Wh / kWh / MWh). Verify and set to kWh during commissioning.',
    ],
  },
];

export const METER_PROFILES_BY_TIER = {
  basic: METER_PROFILES.filter(p => p.tier === 'basic'),
  standard: METER_PROFILES.filter(p => p.tier === 'standard'),
  advanced: METER_PROFILES.filter(p => p.tier === 'advanced'),
  power_quality: METER_PROFILES.filter(p => p.tier === 'power_quality'),
};
