import { useRef, useState, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import type { AppState } from './types';
import { GRADIENTS, getBestDevice, getCompatibleDevices } from './constants';
import { Sidebar } from './components/Sidebar';
import { MockupCanvas } from './components/MockupCanvas';
import { DropZone } from './components/DropZone';
import './index.css';

/** Read the natural width/height of a data-URL image and return width/height ratio. */
function readAspectRatio(dataUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      resolve(ratio > 0 ? ratio : 9 / 19.5);
    };
    img.onerror = () => resolve(9 / 19.5);
    img.src = dataUrl;
  });
}

const DEFAULT_ASPECT = 9 / 19.5; // ~0.46 — typical portrait screenshot

const DEFAULT_STATE: AppState = {
  screenshot: null,
  screenshotAspectRatio: DEFAULT_ASPECT,
  deviceType: 'phone',
  deviceColor: 'silver',
  cameraStyle: 'punchhole',
  bgType: 'gradient',
  bgColor: '#1a1a2e',
  bgGradient: GRADIENTS[0].value,
  bgCustomImage: null,
  deviceScale: 1.0,
  deviceTilt: 0,
  padding: 40,
  shadowType: 'soft',
  text: {
    title: '',
    subtitle: '',
    titleFont: 'Inter',
    subtitleFont: 'Inter',
    titleColor: '#ffffff',
    subtitleColor: 'rgba(255,255,255,0.75)',
  },
  exporting: false,
};

const ZOOM_MIN = 0.2;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.1;

function clampZoom(z: number) {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(z * 100) / 100));
}

export default function App() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [workspaceZoom, setWorkspaceZoom] = useState(0.6);
  const canvasRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // ── State helpers ──────────────────────────────────────────────────────────
  const onChange = useCallback((patch: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  const handleScreenshotChange = useCallback(async (dataUrl: string) => {
    const ratio = await readAspectRatio(dataUrl);
    setState(prev => {
      const compatible = getCompatibleDevices(ratio);
      // Auto-switch to best device if current one can't display this image well
      const newDeviceType = compatible.has(prev.deviceType)
        ? prev.deviceType
        : getBestDevice(ratio);
      return {
        ...prev,
        screenshot: dataUrl,
        screenshotAspectRatio: ratio,
        deviceType: newDeviceType,
        cameraStyle: 'punchhole',
      };
    });
  }, []);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setState(prev => ({ ...prev, exporting: true }));

    // Access latest bgType via DOM approach — read from state snapshot via closure arg
    try {
      const isTransparent = canvasRef.current.style.background === 'transparent'
        || canvasRef.current.style.backgroundColor === 'transparent';

      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: false,
        // For transparent exports, override html-to-image's default white fill
        backgroundColor: isTransparent ? 'rgba(0,0,0,0)' : undefined,
      });
      const link = document.createElement('a');
      link.download = `moca-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setState(prev => ({ ...prev, exporting: false }));
    }
  }, []);

  // ── Workspace zoom (wheel + keyboard) ─────────────────────────────────────
  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setWorkspaceZoom(z => clampZoom(z + delta));
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setWorkspaceZoom(z => clampZoom(z + ZOOM_STEP));
        } else if (e.key === '-') {
          e.preventDefault();
          setWorkspaceZoom(z => clampZoom(z - ZOOM_STEP));
        } else if (e.key === '0') {
          e.preventDefault();
          setWorkspaceZoom(1.0);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const hasScreenshot = !!state.screenshot;
  const isTransparentBg = state.bgType === 'transparent';
  const zoomPct = Math.round(workspaceZoom * 100);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <Sidebar
        state={state}
        onChange={onChange}
        onScreenshotChange={handleScreenshotChange}
        onExport={handleExport}
      />

      {/* Workspace wrapper */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)',
        }}
      >
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* The canvas area: perfectly centered, no scrolling */}
        <main
          ref={workspaceRef}
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          {/* Scaled container */}
          <div
            style={{
              zoom: workspaceZoom,
              transition: 'zoom 0.15s ease-out',
            }}
          >
            {/* Drop-zone + canvas wrapper */}
            <div
              className="relative flex items-center justify-center"
            style={{
              borderRadius: 20,
              border: hasScreenshot ? 'none' : '2px dashed var(--color-border)',
              minWidth: 500,
              minHeight: 500,
            }}
          >
            {/* Checkerboard shown in workspace only when bgType === transparent */}
            {isTransparentBg && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 16,
                  backgroundImage:
                    'linear-gradient(45deg,rgba(180,180,180,0.12) 25%,transparent 25%),' +
                    'linear-gradient(-45deg,rgba(180,180,180,0.12) 25%,transparent 25%),' +
                    'linear-gradient(45deg,transparent 75%,rgba(180,180,180,0.12) 75%),' +
                    'linear-gradient(-45deg,transparent 75%,rgba(180,180,180,0.12) 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0,0 10px,10px -10px,-10px 0',
                  pointerEvents: 'none',
                }}
              />
            )}

            {/* The actual exportable mockup canvas */}
            <MockupCanvas state={state} canvasRef={canvasRef} />

            {/* Full-area drop zone when no screenshot */}
            {!hasScreenshot && (
              <DropZone onImageDrop={handleScreenshotChange} />
            )}
          </div>
          </div>
        </main>

        {/* ── Floating zoom controls ── */}
        <div
          className="absolute bottom-6 right-6 flex items-center gap-1"
          style={{
            background: 'rgba(15,18,28,0.85)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            backdropFilter: 'blur(12px)',
            padding: '4px 6px',
            zIndex: 20,
          }}
        >
          <button
            onClick={() => setWorkspaceZoom(z => clampZoom(z - ZOOM_STEP))}
            title="Zoom out (Ctrl −)"
            style={{
              width: 28, height: 28, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-subtle)',
              fontSize: 18, lineHeight: 1,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-subtle)')}
          >
            −
          </button>

          <button
            onClick={() => setWorkspaceZoom(1.0)}
            title="Reset zoom (Ctrl 0)"
            style={{
              minWidth: 48, height: 28, borderRadius: 8, padding: '0 6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: workspaceZoom === 1.0 ? 'var(--color-text-muted)' : 'var(--color-primary)',
              fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.02em', transition: 'color 0.15s',
              cursor: workspaceZoom === 1.0 ? 'default' : 'pointer',
            }}
          >
            {zoomPct}%
          </button>

          <button
            onClick={() => setWorkspaceZoom(z => clampZoom(z + ZOOM_STEP))}
            title="Zoom in (Ctrl +)"
            style={{
              width: 28, height: 28, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-subtle)',
              fontSize: 18, lineHeight: 1,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-subtle)')}
          >
            +
          </button>

          <div style={{ width: 1, height: 16, background: 'var(--color-border)', margin: '0 2px' }} />

          {/* Fit to 100% quick presets */}
          {[0.5, 0.75, 1.0].map(z => (
            <button
              key={z}
              onClick={() => setWorkspaceZoom(z)}
              title={`${Math.round(z * 100)}%`}
              style={{
                width: 28, height: 28, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                color: workspaceZoom === z ? 'var(--color-primary)' : 'var(--color-text-muted)',
                background: workspaceZoom === z ? 'var(--color-primary-glow)' : 'transparent',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (workspaceZoom !== z) e.currentTarget.style.color = 'var(--color-text)'; }}
              onMouseLeave={e => { if (workspaceZoom !== z) e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              {Math.round(z * 100)}
            </button>
          ))}
        </div>

        {/* Floating hint */}
        {hasScreenshot && (
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            Frame auto-fitted · Ctrl+scroll or use the zoom controls to resize the workspace view
          </div>
        )}
      </div>
    </div>
  );
}
