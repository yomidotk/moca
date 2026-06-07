import React from 'react';
import type { CameraStyle, DeviceColor } from '../types';

const s = (value: number, scale: number) => Math.round(value * scale);

interface DeviceColorTheme {
  shellGradient: string;
  shellInsetShadow: string;
  buttonLeft: string;
  buttonRight: string;
  hingeGradient: string;
  baseGradient: string;
  baseShadow: string;
}

const DEVICE_COLORS: Record<DeviceColor, DeviceColorTheme> = {
  silver: {
    shellGradient: 'linear-gradient(160deg, #a0a0a8 0%, #5a5a60 40%, #3a3a3e 100%)',
    shellInsetShadow: 'inset 0 2px 4px rgba(255,255,255,0.18), inset 0 -2px 4px rgba(0,0,0,0.25)',
    buttonLeft: 'linear-gradient(to right, #6b6b70, #88888e)',
    buttonRight: 'linear-gradient(to left, #6b6b70, #88888e)',
    hingeGradient: 'linear-gradient(to bottom, #888, #aaa)',
    baseGradient: 'linear-gradient(to bottom, #aaaaae, #c8c8ce)',
    baseShadow: '0 8px 30px rgba(0,0,0,0.5)',
  },
  black: {
    shellGradient: 'linear-gradient(160deg, #3a3a40 0%, #1e1e22 45%, #0c0c0e 100%)',
    shellInsetShadow: 'inset 0 2px 4px rgba(255,255,255,0.06), inset 0 -2px 4px rgba(0,0,0,0.5)',
    buttonLeft: 'linear-gradient(to right, #1a1a1e, #2e2e34)',
    buttonRight: 'linear-gradient(to left, #1a1a1e, #2e2e34)',
    hingeGradient: 'linear-gradient(to bottom, #222, #333)',
    baseGradient: 'linear-gradient(to bottom, #1a1a1e, #2c2c32)',
    baseShadow: '0 8px 30px rgba(0,0,0,0.65)',
  },
};

/* ─────────────────────────────────────────────────────────────
   Each device frame dynamically sizes itself to the screenshot's
   aspect ratio. The SCREEN WIDTH is fixed per device type;
   the screen HEIGHT is derived as: screenW / aspectRatio.
   The device bezels / outer shell wrap around that screen.
───────────────────────────────────────────────────────────── */

/** Renders the screenshot (or placeholder) filling the screen area exactly. */
const ScreenFill: React.FC<{
  screenshot: string | null;
  placeholder: string;
}> = ({ screenshot, placeholder }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: '#f0f0f0',
      overflow: 'hidden',
    }}
  >
    {screenshot ? (
      <img
        src={screenshot}
        alt="Screenshot"
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill', // exact fit — frame IS the right ratio
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    ) : (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: 'linear-gradient(145deg, #e8eaf0, #f5f7fb)',
        }}
      >
        <div style={{ fontSize: 36, opacity: 0.18 }}>{placeholder}</div>
        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
          Upload a screenshot
        </p>
      </div>
    )}
    {/* Subtle glare */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 55%)',
      }}
    />
  </div>
);

/* ─── Phone Frame ────────────────────────────────────────────── */

// Fixed horizontal dimensions for the phone.
// Only height changes with the screenshot's aspect ratio.
const PHONE = {
  screenW: 290,       // width of the screenshot area
  shellPad: 10,       // outer aluminum shell adds this on all sides around the bezel
  bezelPad: 5,        // dark bezel adds this on all sides around the screen
  outerRadius: 48,
  bezelRadius: 42,
  screenRadius: 36,
} as const;

interface PhoneFrameProps {
  screenshot: string | null;
  boxShadow: string;
  aspectRatio: number;
  cameraStyle: CameraStyle;
  deviceColor: DeviceColor;
  scale: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  screenshot,
  boxShadow,
  aspectRatio,
  cameraStyle,
  deviceColor,
  scale,
}) => {
  const colors = DEVICE_COLORS[deviceColor];
  const safeRatio = aspectRatio > 0 && isFinite(aspectRatio) ? aspectRatio : 9 / 19.5;
  const screenW = s(PHONE.screenW, scale);
  const screenH = Math.round(screenW / safeRatio);
  const shellPad = s(PHONE.shellPad, scale);
  const bezelPad = s(PHONE.bezelPad, scale);
  const totalPad = shellPad + bezelPad;

  const deviceW = screenW + totalPad * 2;
  const deviceH = screenH + totalPad * 2;

  const bezelLeft = shellPad;
  const bezelTop = shellPad;
  const bezelW = deviceW - shellPad * 2;
  const bezelH = deviceH - shellPad * 2;

  const screenLeft = totalPad;
  const screenTop = totalPad;

  // Side-button positions (proportional to device height)
  const btn1Top = Math.round(deviceH * 0.19);
  const btn2Top = Math.round(deviceH * 0.26);
  const btn3Top = Math.round(deviceH * 0.33);
  const btnRTop = Math.round(deviceH * 0.22);
  const btnRH   = Math.round(deviceH * 0.14);

  const shellShadow = boxShadow !== 'none'
    ? `${boxShadow}, ${colors.shellInsetShadow}`
    : colors.shellInsetShadow;

  return (
    <div
      style={{
        position: 'relative',
        flexShrink: 0,
        width: deviceW,
        height: deviceH,
      }}
    >
      {/* Outer shell */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: s(PHONE.outerRadius, scale),
          background: colors.shellGradient,
          boxShadow: shellShadow,
        }}
      />

      {/* Side buttons – left */}
      {[btn1Top, btn2Top].map((top, i) => (
        <div key={i} style={{ position: 'absolute', left: -s(3, scale), top, width: s(3, scale), height: s(32, scale), borderRadius: `${s(3, scale)}px 0 0 ${s(3, scale)}px`, background: colors.buttonLeft }} />
      ))}
      <div style={{ position: 'absolute', left: -s(3, scale), top: btn3Top, width: s(3, scale), height: s(56, scale), borderRadius: `${s(3, scale)}px 0 0 ${s(3, scale)}px`, background: colors.buttonLeft }} />
      {/* Side button – right */}
      <div style={{ position: 'absolute', right: -s(3, scale), top: btnRTop, width: s(3, scale), height: btnRH, borderRadius: `0 ${s(3, scale)}px ${s(3, scale)}px 0`, background: colors.buttonRight }} />

      {/* Dark bezel */}
      <div
        style={{
          position: 'absolute',
          left: bezelLeft,
          top: bezelTop,
          width: bezelW,
          height: bezelH,
          borderRadius: s(PHONE.bezelRadius, scale),
          background: '#0a0a0e',
        }}
      />

      {/* Screen area – sized exactly to screenshot aspect ratio */}
      <div
        style={{
          position: 'absolute',
          left: screenLeft,
          top: screenTop,
          width: screenW,
          height: screenH,
          borderRadius: s(PHONE.screenRadius, scale),
          overflow: 'hidden',
        }}
      >
        <ScreenFill screenshot={screenshot} placeholder="📱" />

        {/* Camera – rendered on top of the screenshot */}
        {cameraStyle === 'notch' ? (
          <div
            style={{
              position: 'absolute',
              top: s(12, scale),
              left: '50%',
              transform: 'translateX(-50%)',
              width: s(120, scale),
              height: s(34, scale),
              borderRadius: s(18, scale),
              background: '#0a0a0e',
              zIndex: 10,
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: s(18, scale),
              left: '50%',
              transform: 'translateX(-50%)',
              width: s(14, scale),
              height: s(14, scale),
              borderRadius: '50%',
              background: '#0a0a0e',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.08)',
              zIndex: 10,
            }}
          />
        )}
      </div>
    </div>
  );
};

/* ─── Tablet Frame ───────────────────────────────────────────── */

const TABLET = {
  screenW: 490,
  shellPad: 3,     // thin metal edge
  bezelPad: 22,    // thick black inner bezel
  outerRadius: 28,
  screenRadius: 10,
} as const;

interface TabletFrameProps {
  screenshot: string | null;
  boxShadow: string;
  aspectRatio: number;
  deviceColor: DeviceColor;
  scale: number;
}

export const TabletFrame: React.FC<TabletFrameProps> = ({
  screenshot,
  boxShadow,
  aspectRatio,
  deviceColor,
  scale,
}) => {
  const colors = DEVICE_COLORS[deviceColor];
  const safeRatio = aspectRatio > 0 && isFinite(aspectRatio) ? aspectRatio : 3 / 4;
  const screenW = s(TABLET.screenW, scale);
  const screenH = Math.round(screenW / safeRatio);
  const shellPad = s(TABLET.shellPad, scale);
  const bezelPad = s(TABLET.bezelPad, scale);
  const totalPad = shellPad + bezelPad;
  const deviceW = screenW + totalPad * 2;
  const deviceH = screenH + totalPad * 2;

  const bezelW = deviceW - shellPad * 2;
  const bezelH = deviceH - shellPad * 2;

  const insetShadow = deviceColor === 'silver'
    ? 'inset 0 1px 3px rgba(255,255,255,0.2), inset 0 -2px 5px rgba(0,0,0,0.4)'
    : 'inset 0 1px 3px rgba(255,255,255,0.06), inset 0 -2px 5px rgba(0,0,0,0.55)';
  const shellShadow = boxShadow !== 'none' ? `${boxShadow}, ${insetShadow}` : insetShadow;

  return (
    <div
      style={{
        position: 'relative',
        flexShrink: 0,
        width: deviceW,
        height: deviceH,
      }}
    >
      {/* Outer shell */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: s(TABLET.outerRadius, scale),
          background: colors.shellGradient,
          boxShadow: shellShadow,
        }}
      />

      {/* Inner black bezel */}
      <div
        style={{
          position: 'absolute',
          left: shellPad,
          top: shellPad,
          width: bezelW,
          height: bezelH,
          borderRadius: s(TABLET.outerRadius - TABLET.shellPad, scale),
          background: '#111',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
        }}
      />

      {/* Side button */}
      <div style={{ position: 'absolute', right: -s(3, scale), top: Math.round(deviceH * 0.14), width: s(3, scale), height: s(48, scale), borderRadius: `0 ${s(3, scale)}px ${s(3, scale)}px 0`, background: colors.buttonRight }} />

      {/* Screen */}
      <div
        style={{
          position: 'absolute',
          left: totalPad,
          top: totalPad,
          width: screenW,
          height: screenH,
          borderRadius: s(TABLET.screenRadius, scale),
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <ScreenFill screenshot={screenshot} placeholder="⬛" />
      </div>

      {/* Front camera dot — sits on the black bezel */}
      <div
        style={{
          position: 'absolute',
          top: shellPad + (bezelPad / 2) - s(4, scale),
          left: '50%',
          transform: 'translateX(-50%)',
          width: s(8, scale),
          height: s(8, scale),
          borderRadius: '50%',
          background: '#222',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.05)',
          zIndex: 10,
        }}
      />
    </div>
  );
};

/* ─── Laptop Frame ───────────────────────────────────────────── */

const LAPTOP = {
  lidW: 700,
  screenInset: 14, // px from each edge of lid to screen
  outerRadius: 14,
  bezelRadius: 10,
  screenRadius: 6,
} as const;

interface LaptopFrameProps {
  screenshot: string | null;
  boxShadow: string;
  aspectRatio: number;
  deviceColor: DeviceColor;
  scale: number;
}

export const LaptopFrame: React.FC<LaptopFrameProps> = ({
  screenshot,
  boxShadow,
  aspectRatio,
  deviceColor,
  scale,
}) => {
  const colors = DEVICE_COLORS[deviceColor];
  const safeRatio = aspectRatio > 0 && isFinite(aspectRatio) ? aspectRatio : 16 / 10;
  const lidW = s(LAPTOP.lidW, scale);
  const screenInset = s(LAPTOP.screenInset, scale);
  const screenW = lidW - screenInset * 2;
  const screenH = Math.round(screenW / safeRatio);
  const lidH = screenH + screenInset * 2;

  const insetShadow = deviceColor === 'silver'
    ? 'inset 0 1px 3px rgba(255,255,255,0.15)'
    : 'inset 0 1px 3px rgba(255,255,255,0.05)';
  const lidShadow = boxShadow !== 'none' ? `${boxShadow}, ${insetShadow}` : insetShadow;

  return (
    <div
      style={{
        position: 'relative',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Lid */}
      <div style={{ position: 'relative', width: lidW, height: lidH }}>
        {/* Outer lid shell */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: s(LAPTOP.outerRadius, scale),
            background: colors.shellGradient,
            boxShadow: lidShadow,
          }}
        />
        {/* Inner bezel */}
        <div
          style={{
            position: 'absolute',
            inset: s(6, scale),
            borderRadius: s(LAPTOP.bezelRadius, scale),
            background: '#0a0a0e',
          }}
        />
        {/* Screen area */}
        <div
          style={{
            position: 'absolute',
            left: screenInset,
            top: screenInset,
            width: screenW,
            height: screenH,
            borderRadius: s(LAPTOP.screenRadius, scale),
            overflow: 'hidden',
          }}
        >
          <ScreenFill screenshot={screenshot} placeholder="💻" />
        </div>

      </div>

      {/* Hinge */}
      <div
        style={{
          width: lidW,
          height: s(6, scale),
          background: colors.hingeGradient,
          borderRadius: `0 0 ${s(3, scale)}px ${s(3, scale)}px`,
        }}
      />
      {/* Base / keyboard tray */}
      <div
        style={{
          width: lidW + s(20, scale),
          height: s(26, scale),
          borderRadius: `0 0 ${s(10, scale)}px ${s(10, scale)}px`,
          background: colors.baseGradient,
          boxShadow: colors.baseShadow,
        }}
      />
    </div>
  );
};
