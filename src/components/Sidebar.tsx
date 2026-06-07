import React, { useRef } from 'react';
import type { AppState, DeviceType, ShadowType, BgType, CameraStyle, DeviceColor } from '../types';
import { GRADIENTS, FONTS, getCompatibleDevices, getIncompatibilityReason } from '../constants';
import { DropZone } from './DropZone';

/* ─── Icons ─────────────────────────────────────────────────── */
const PhoneIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <rect x="5" y="2" width="14" height="20" rx="3" />
    <path d="M12 18h.01" strokeLinecap="round" />
  </svg>
);
const TabletIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <rect x="3" y="2" width="18" height="20" rx="3" />
    <path d="M12 18h.01" strokeLinecap="round" />
  </svg>
);
const LaptopIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <rect x="2" y="4" width="20" height="14" rx="2" />
    <path d="M1 20h22" strokeLinecap="round" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
/* ─── Small reusable pieces ─────────────────────────────────── */
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid var(--color-border)' }}>
    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
      {children}
    </span>
  </div>
);

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  displayValue: string;
  onChange: (v: number) => void;
}
const Slider: React.FC<SliderProps> = ({ label, value, min, max, step = 1, displayValue, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-center">
      <span className="text-xs font-medium" style={{ color: 'var(--color-text-subtle)' }}>{label}</span>
      <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>{displayValue}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
  </div>
);

/* ─── Main Sidebar ─────────────────────────────────────────── */
interface SidebarProps {
  state: AppState;
  onChange: (patch: Partial<AppState>) => void;
  onScreenshotChange: (dataUrl: string) => void; // separate so aspect ratio can be computed
  onExport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, onChange, onScreenshotChange, onExport }) => {
  const bgImageRef = useRef<HTMLInputElement>(null);

  const setDevice = (d: DeviceType) => onChange({ deviceType: d });
  const setShadow = (s: ShadowType) => onChange({ shadowType: s });
  const setBgType = (t: BgType) => onChange({ bgType: t });
  const setCameraStyle = (c: CameraStyle) => onChange({ cameraStyle: c });
  const setDeviceColor = (c: DeviceColor) => onChange({ deviceColor: c });

  const handleBgImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ bgType: 'custom', bgCustomImage: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const devices: { id: DeviceType; label: string; Icon: React.FC }[] = [
    { id: 'phone', label: 'Phone', Icon: PhoneIcon },
    { id: 'tablet', label: 'Tablet', Icon: TabletIcon },
    { id: 'laptop', label: 'Laptop', Icon: LaptopIcon },
  ];

  const shadows: { id: ShadowType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'soft', label: 'Soft' },
    { id: 'hard', label: 'Hard' },
  ];

  const bgTabs: { id: BgType; label: string }[] = [
    { id: 'solid', label: 'Solid' },
    { id: 'gradient', label: 'Gradient' },
    { id: 'custom', label: 'Image' },
    { id: 'transparent', label: 'None' },
  ];

  const cameraOptions: { id: CameraStyle; label: string }[] = [
    { id: 'notch', label: '⬛ Dynamic Island' },
    { id: 'punchhole', label: '● Punch-hole' },
  ];

  const colorOptions: { id: DeviceColor; label: string; swatch: string }[] = [
    { id: 'silver', label: 'Silver', swatch: 'linear-gradient(135deg, #c8c8ce 0%, #888890 100%)' },
    { id: 'black', label: 'Black', swatch: 'linear-gradient(135deg, #3a3a40 0%, #0c0c0e 100%)' },
  ];

  return (
    <aside
      className="flex flex-col h-full overflow-y-auto"
      style={{
        width: 300,
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid var(--color-border)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2.5">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Moca"
            className="w-9 h-9 rounded-xl flex-shrink-0"
            style={{ objectFit: 'cover' }}
          />
          <div>
            <h1 className="text-base font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
              Moca
            </h1>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              Beautiful device mockups
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-5 py-5 flex-1">

        {/* ── Screenshot ── */}
        <div className="flex flex-col gap-3">
          <SectionLabel>Screenshot</SectionLabel>
          <DropZone onImageDrop={onScreenshotChange} compact />
          {state.screenshot && (
            <div className="flex items-center gap-2">
              <img
                src={state.screenshot}
                alt="thumb"
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                style={{ border: '1px solid var(--color-border)' }}
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-subtle)' }}>Screenshot loaded</span>
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  Ratio {state.screenshotAspectRatio.toFixed(2)} : 1 — frame auto-fitted
                </span>
              </div>
              <button
                onClick={() => onChange({ screenshot: null })}
                className="text-xs px-2 py-1 rounded-lg transition-colors flex-shrink-0"
                style={{ color: 'var(--color-danger)', background: 'rgba(244,63,94,0.1)' }}
              >
                Remove
              </button>
            </div>
          )}

          {/* Hint when no screenshot */}
          {!state.screenshot && (
            <div
              className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-[11px]"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--color-text-muted)' }}
            >
              <span style={{ color: 'var(--color-primary)', fontSize: 14, lineHeight: 1 }}>✦</span>
              <span>The device frame will automatically resize to fit your screenshot perfectly.</span>
            </div>
          )}
        </div>

        {/* ── Device Frame ── */}
        <div className="flex flex-col gap-3">
          <SectionLabel>Device Frame</SectionLabel>
          <div className="flex gap-2">
            {devices.map(({ id, label, Icon }) => {
              // Only restrict when a screenshot is loaded
              const compatible = state.screenshot
                ? getCompatibleDevices(state.screenshotAspectRatio)
                : new Set<DeviceType>(['phone', 'tablet', 'laptop']);
              const isDisabled = !compatible.has(id);
              const reason = isDisabled
                ? getIncompatibilityReason(id, state.screenshotAspectRatio)
                : '';
              const isActive = state.deviceType === id;

              return (
                <button
                  key={id}
                  onClick={() => !isDisabled && setDevice(id)}
                  title={isDisabled ? reason : label}
                  aria-disabled={isDisabled}
                  className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all duration-200 relative"
                  style={{
                    background: isActive
                      ? 'var(--color-primary-glow)'
                      : isDisabled
                        ? 'rgba(255,255,255,0.02)'
                        : 'var(--color-surface)',
                    border: `1px solid ${
                      isActive
                        ? 'var(--color-primary)'
                        : isDisabled
                          ? 'rgba(255,255,255,0.06)'
                          : 'var(--color-border)'
                    }`,
                    color: isActive
                      ? 'var(--color-primary)'
                      : isDisabled
                        ? 'rgba(255,255,255,0.2)'
                        : 'var(--color-text-subtle)',
                    transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.45 : 1,
                  }}
                >
                  <Icon />
                  <span className="text-[11px] font-semibold">{label}</span>
                  {/* Lock badge when incompatible */}
                  {isDisabled && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 5, right: 5,
                        width: 14, height: 14,
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8,
                      }}
                    >
                      🔒
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Frame color */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Frame Color
            </span>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--color-surface)' }}>
              {colorOptions.map(({ id, label, swatch }) => (
                <button
                  key={id}
                  onClick={() => setDeviceColor(id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    background: state.deviceColor === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: state.deviceColor === id ? 'var(--color-text)' : 'var(--color-text-muted)',
                    outline: state.deviceColor === id ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: swatch,
                      border: '1px solid rgba(255,255,255,0.15)',
                      flexShrink: 0,
                    }}
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Camera style — phone only */}
          {state.deviceType === 'phone' && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                Camera Style
              </span>
              <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--color-surface)' }}>
                {cameraOptions.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setCameraStyle(id)}
                    className="flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      background: state.cameraStyle === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      color: state.cameraStyle === id ? 'var(--color-text)' : 'var(--color-text-muted)',
                      outline: state.cameraStyle === id ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compatibility hint — only when a screenshot is loaded */}
          {state.screenshot && (() => {
            const compatible = getCompatibleDevices(state.screenshotAspectRatio);
            const lockedCount = 3 - compatible.size;
            if (lockedCount === 0) return null;
            const r = state.screenshotAspectRatio;
            const shape = r < 0.76 ? 'Portrait' : r < 1.4 ? 'Square-ish' : 'Landscape';
            return (
              <div
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-[10px]"
                style={{
                  background: 'rgba(245,158,11,0.07)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  color: 'rgba(245,158,11,0.8)',
                }}
              >
                <span style={{ fontSize: 12 }}>⚠</span>
                <span>
                  {shape} ({r.toFixed(2)}:1) — {lockedCount} device{lockedCount > 1 ? 's' : ''} locked. Hover locked buttons to learn why.
                </span>
              </div>
            );
          })()}
        </div>

        {/* ── Background ── */}
        <div className="flex flex-col gap-3">
          <SectionLabel>Background</SectionLabel>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--color-surface)' }}>
            {bgTabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setBgType(id)}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{
                  background: state.bgType === id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: state.bgType === id ? 'var(--color-text)' : 'var(--color-text-muted)',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {state.bgType === 'solid' && (
            <label
              className="flex items-center gap-3 cursor-pointer p-2.5 rounded-xl transition-all"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: state.bgColor, border: '1px solid var(--color-border)' }} />
              <span className="text-xs flex-1" style={{ color: 'var(--color-text-subtle)' }}>{state.bgColor}</span>
              <input type="color" value={state.bgColor} onChange={e => onChange({ bgColor: e.target.value })} className="opacity-0 absolute w-0 h-0" />
            </label>
          )}

          {state.bgType === 'gradient' && (
            <div className="grid grid-cols-5 gap-2">
              {GRADIENTS.map(g => (
                <button
                  key={g.id}
                  title={g.label}
                  onClick={() => onChange({ bgGradient: g.value })}
                  className="h-10 rounded-xl transition-all duration-200"
                  style={{
                    background: g.value,
                    outline: state.bgGradient === g.value ? '2px solid var(--color-primary)' : '2px solid transparent',
                    outlineOffset: 2,
                    transform: state.bgGradient === g.value ? 'scale(1.08)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          )}

          {state.bgType === 'custom' && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => bgImageRef.current?.click()}
                className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border)', color: 'var(--color-text-subtle)' }}
              >
                {state.bgCustomImage ? '🖼 Change background image' : '📁 Select background image'}
              </button>
              <input ref={bgImageRef} type="file" accept="image/*" className="hidden" onChange={handleBgImage} />
              {state.bgCustomImage && (
                <img src={state.bgCustomImage} alt="bg" className="w-full h-16 object-cover rounded-xl" style={{ border: '1px solid var(--color-border)' }} />
              )}
            </div>
          )}

          {state.bgType === 'transparent' && (
            <div
              className="flex items-center gap-3 p-2.5 rounded-xl"
              style={{ border: '1px solid var(--color-border)' }}
            >
              {/* Checkerboard swatch */}
              <div
                className="w-8 h-8 rounded-lg flex-shrink-0"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg,#555 25%,transparent 25%),' +
                    'linear-gradient(-45deg,#555 25%,transparent 25%),' +
                    'linear-gradient(45deg,transparent 75%,#555 75%),' +
                    'linear-gradient(-45deg,transparent 75%,#555 75%)',
                  backgroundSize: '8px 8px',
                  backgroundPosition: '0 0,0 4px,4px -4px,-4px 0',
                  backgroundColor: '#888',
                  border: '1px solid var(--color-border)',
                }}
              />
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                Transparent — exports as PNG with alpha channel
              </span>
            </div>
          )}
        </div>

        {/* ── Canvas Layout ── */}
        <div className="flex flex-col gap-3">
          <SectionLabel>Canvas Layout</SectionLabel>
          <Slider
            label="Device Size"
            value={state.deviceScale}
            min={0.3} max={1.0} step={0.01}
            displayValue={`${Math.round(state.deviceScale * 100)}%`}
            onChange={v => onChange({ deviceScale: v })}
          />
          <Slider
            label="Device Tilt"
            value={state.deviceTilt}
            min={-30} max={30} step={1}
            displayValue={`${state.deviceTilt > 0 ? '+' : ''}${state.deviceTilt}°`}
            onChange={v => onChange({ deviceTilt: v })}
          />
          <Slider
            label="Padding"
            value={state.padding}
            min={16} max={160} step={4}
            displayValue={`${state.padding}px`}
            onChange={v => onChange({ padding: v })}
          />
        </div>

        {/* ── Shadow ── */}
        <div className="flex flex-col gap-3">
          <SectionLabel>Device Shadow</SectionLabel>
          <div className="flex gap-2">
            {shadows.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setShadow(id)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  background: state.shadowType === id ? 'var(--color-primary-glow)' : 'var(--color-surface)',
                  border: `1px solid ${state.shadowType === id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  color: state.shadowType === id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Text Overlays ── */}
        <div className="flex flex-col gap-3">
          <SectionLabel>Text Overlays</SectionLabel>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Title</span>
            <input
              type="text"
              value={state.text.title}
              onChange={e => onChange({ text: { ...state.text, title: e.target.value } })}
              placeholder="Your headline here…"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
            <div className="flex gap-2">
              <select
                value={state.text.titleFont}
                onChange={e => onChange({ text: { ...state.text, titleFont: e.target.value } })}
                className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-subtle)' }}
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <input
                type="color" value={state.text.titleColor}
                onChange={e => onChange({ text: { ...state.text, titleColor: e.target.value } })}
                className="w-9 h-8 rounded-lg cursor-pointer"
                style={{ border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>

          {/* Subtitle */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Subtitle</span>
            <input
              type="text"
              value={state.text.subtitle}
              onChange={e => onChange({ text: { ...state.text, subtitle: e.target.value } })}
              placeholder="A short supporting line…"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
            <div className="flex gap-2">
              <select
                value={state.text.subtitleFont}
                onChange={e => onChange({ text: { ...state.text, subtitleFont: e.target.value } })}
                className="flex-1 px-2 py-1.5 rounded-lg text-xs outline-none"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-subtle)' }}
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <input
                type="color" value={state.text.subtitleColor}
                onChange={e => onChange({ text: { ...state.text, subtitleColor: e.target.value } })}
                className="w-9 h-8 rounded-lg cursor-pointer"
                style={{ border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* ── Export ── */}
      <div className="px-5 pb-6 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button
          id="export-btn"
          onClick={onExport}
          disabled={state.exporting}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300"
          style={{
            background: state.exporting ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            boxShadow: state.exporting ? 'none' : '0 4px 24px rgba(99,102,241,0.45)',
            transform: state.exporting ? 'scale(0.98)' : 'scale(1)',
            cursor: state.exporting ? 'not-allowed' : 'pointer',
          }}
        >
          <DownloadIcon />
          {state.exporting ? 'Generating…' : 'Download PNG'}
        </button>
        <p className="text-center text-[10px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
          High-resolution 2× export
        </p>
      </div>
    </aside>
  );
};
