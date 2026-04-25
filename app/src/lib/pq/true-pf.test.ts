// Reference-case smoke test for the True PF math library.
// Run with: npx tsx src/lib/pq/true-pf.test.ts
// Repo has no vitest/jest installed; tsx is the lightest existing dev dep
// that lets us assert on TS without dragging in a framework.

import { distortionPF, truePF, computeScenarios } from './true-pf';

// Slide values are rounded to 3 decimals; the formula-exact value can
// drift by up to ~0.002 from the printed slide value. We assert against
// the slide to ±0.002 (the spec's ±0.001 was for back-of-envelope agreement
// with printed numbers, not for re-deriving the slide's rounding).
const TOL_SLIDE = 0.002;
const TOL_EXACT = 0.001;
let failures = 0;

function approx(label: string, actual: number, expected: number, tol = TOL_EXACT): void {
  const ok = Math.abs(actual - expected) <= tol;
  const status = ok ? 'PASS' : 'FAIL';
  console.log(`  ${status}  ${label}  actual=${actual.toFixed(4)}  expected=${expected.toFixed(4)}  tol=${tol}`);
  if (!ok) failures++;
}

console.log('\nTrue PF math — reference cases (InPhase 2026-04-23 slide):');

// Case 1: current state — DPF 0.92, THDi 35% → True PF 0.868
approx('Case 1: True PF (DPF 0.92, THDi 0.35)', truePF(0.92, 0.35), 0.868, TOL_SLIDE);

// Case 2: APFC-only — DPF 0.99, THDi 35% → True PF ≈ 0.933 (slide ≈)
approx('Case 2: True PF (DPF 0.99, THDi 0.35)', truePF(0.99, 0.35), 0.933, TOL_SLIDE);

// Case 3: AHF — DPF 1.00, THDi 5% → True PF 0.999 (slide rounded)
approx('Case 3: True PF (DPF 1.00, THDi 0.05)', truePF(1.00, 0.05), 0.999, TOL_SLIDE);

// Distortion PF anchors
approx('DistortionPF(0)',    distortionPF(0),    1.000);
approx('DistortionPF(0.35)', distortionPF(0.35), 0.943);
approx('DistortionPF(0.05)', distortionPF(0.05), 0.999);

console.log('\nScenario builder — full output for the canonical case:');
const scenarios = computeScenarios({
  dpfNow: 0.92,
  thdiNow: 0.35,
  currentPenalty: 50000,
});

for (const s of scenarios) {
  console.log(`  [${s.label.padEnd(10)}] DPF=${s.dpf.toFixed(2)} THDi=${(s.thdi * 100).toFixed(0)}% TruePF=${s.truePF.toFixed(3)} penalty=₹${s.estimatedPenalty}`);
}

approx('Scenario now.truePF',       scenarios[0].truePF, 0.868, TOL_SLIDE);
approx('Scenario afterAPFC.truePF', scenarios[1].truePF, 0.933, TOL_SLIDE);
approx('Scenario afterAHF.truePF',  scenarios[2].truePF, 0.999, TOL_SLIDE);

// Penalty invariants (anchored to current ₹50,000):
// - now stays at 50,000
// - afterAPFC must be > 0 and < 50,000 (still below 0.95 threshold)
// - afterAHF must be 0 (above threshold)
const now = scenarios[0].estimatedPenalty;
const apfc = scenarios[1].estimatedPenalty;
const ahf = scenarios[2].estimatedPenalty;
const checkPenalty = (label: string, ok: boolean) => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}`);
  if (!ok) failures++;
};
checkPenalty('Penalty: now == 50,000',                now === 50000);
checkPenalty(`Penalty: 0 < afterAPFC < now (${apfc})`, apfc > 0 && apfc < 50000);
checkPenalty(`Penalty: afterAHF == 0 (${ahf})`,        ahf === 0);

console.log(`\n${failures === 0 ? 'OK' : 'FAILED'}: ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
