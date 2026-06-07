import type { GradientOption, DeviceType } from './types';

export const GRADIENTS: GradientOption[] = [
  { id: 'aurora', label: 'Aurora', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 'sunset', label: 'Sunset', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'ocean', label: 'Ocean', value: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)' },
  { id: 'midnight', label: 'Midnight', value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { id: 'neon', label: 'Neon', value: 'linear-gradient(135deg, #12c2e9 0%, #c471ed 50%, #f64f59 100%)' },
  { id: 'golden', label: 'Golden', value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  { id: 'emerald', label: 'Emerald', value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { id: 'space', label: 'Space', value: 'radial-gradient(ellipse at top, #1b2735 0%, #090a0f 100%)' },
  { id: 'rose', label: 'Rose', value: 'linear-gradient(135deg, #f43f5e 0%, #7f1d1d 100%)' },
  { id: 'violet', label: 'Violet', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
];

export const FONTS = [
  'Inter',
  'Montserrat',
  'Georgia',
  'Courier New',
  'Arial Black',
];

/* ─── Device compatibility by aspect ratio ───────────────────────────────────
 *
 * Rule: Tablet and Laptop are NEVER locked against each other.
 * A rotated (landscape) tablet screenshot looks identical to a laptop
 * screenshot — the user should always be free to choose between them.
 *
 * Only Phone is locked when the image is clearly too wide for a phone,
 * and Laptop is locked only for clearly portrait images.
 *
 *   Phone   ≤ 0.75   — portrait tall (phone screens)
 *   Tablet  ≥ 0.50   — portrait tablet through landscape tablet (rotated)
 *   Laptop  ≥ 1.20   — landscape (could also be a rotated tablet — let user pick)
 *
 * Examples:
 *   0.46  iPhone tall   → Phone only
 *   0.56  9:16          → Phone + Tablet
 *   0.75  iPad portrait → Phone + Tablet
 *   1.00  Square        → Tablet only
 *   1.33  iPad landscape→ Tablet + Laptop  ← both unlocked (can't tell!)
 *   1.60  MacBook       → Tablet + Laptop  ← both unlocked
 *   1.78  16:9          → Tablet + Laptop  ← both unlocked
 * ─────────────────────────────────────────────────────────────────────────── */

export function getCompatibleDevices(aspectRatio: number): Set<DeviceType> {
  const devices = new Set<DeviceType>();
  // Phone: portrait images (tall, narrow)
  if (aspectRatio <= 0.75) devices.add('phone');
  // Tablet: any reasonable image — portrait tablet, landscape tablet (rotated), etc.
  if (aspectRatio >= 0.5)  devices.add('tablet');
  // Laptop: landscape — but ALSO covers rotated tablet, so never locked if tablet is selectable
  if (aspectRatio >= 1.2)  devices.add('laptop');
  return devices;
}

/** Returns the single best-fit device for this ratio (used for auto-switching). */
export function getBestDevice(aspectRatio: number): DeviceType {
  if (aspectRatio <= 0.75) return 'phone';
  if (aspectRatio <  1.2)  return 'tablet';
  return 'laptop';
}

/** Human-readable reason why a device type is locked for this aspect ratio. */
export function getIncompatibilityReason(device: DeviceType, aspectRatio: number): string {
  const r = aspectRatio.toFixed(2);
  if (device === 'phone'  && aspectRatio > 0.75) return `Too wide for Phone (${r}:1) — try Tablet or Laptop`;
  if (device === 'tablet' && aspectRatio < 0.5)  return `Too portrait for Tablet (${r}:1) — try Phone`;
  if (device === 'laptop' && aspectRatio < 1.2)  return `Too portrait for Laptop (${r}:1) — try Tablet`;
  return '';
}
