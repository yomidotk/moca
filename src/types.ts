export type DeviceType = 'phone' | 'tablet' | 'laptop';
export type ShadowType = 'none' | 'soft' | 'hard';
export type BgType = 'solid' | 'gradient' | 'custom' | 'transparent';
export type CameraStyle = 'notch' | 'punchhole';
export type DeviceColor = 'silver' | 'black';

export interface GradientOption {
  id: string;
  label: string;
  value: string;
}

export interface TextOverlay {
  title: string;
  subtitle: string;
  titleFont: string;
  subtitleFont: string;
  titleColor: string;
  subtitleColor: string;
}

export interface AppState {
  // Upload
  screenshot: string | null;
  /** Natural width / height of the uploaded screenshot. Drives device frame sizing. */
  screenshotAspectRatio: number;

  // Device
  deviceType: DeviceType;
  deviceColor: DeviceColor;
  cameraStyle: CameraStyle; // phone-only

  // Background
  bgType: BgType;
  bgColor: string;
  bgGradient: string;
  bgCustomImage: string | null;

  // Layout
  deviceScale: number; // 0.3 – 1.0
  deviceTilt: number;  // -30 to 30 degrees (3D Y-axis rotation)
  padding: number;     // px, 16–160

  // Shadow
  shadowType: ShadowType;

  // Text overlay
  text: TextOverlay;

  // Export loading state
  exporting: boolean;
}
