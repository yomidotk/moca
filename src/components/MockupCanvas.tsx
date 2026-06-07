import React from 'react';
import type { AppState } from '../types';
import { PhoneFrame, TabletFrame, LaptopFrame } from './DeviceFrames';

interface MockupCanvasProps {
  state: AppState;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

function getShadowBoxShadow(shadowType: AppState['shadowType'], scale: number): string {
  if (shadowType === 'soft')
    return `0 ${40 * scale}px ${80 * scale}px rgba(0,0,0,0.55), 0 ${12 * scale}px ${24 * scale}px rgba(0,0,0,0.3)`;
  if (shadowType === 'hard')
    return `${8 * scale}px ${12 * scale}px 0px rgba(0,0,0,0.7)`;
  return 'none';
}

function getBackground(state: AppState): React.CSSProperties {
  if (state.bgType === 'solid') return { background: state.bgColor };
  if (state.bgType === 'gradient') return { background: state.bgGradient };
  if (state.bgType === 'custom' && state.bgCustomImage)
    return {
      backgroundImage: `url(${state.bgCustomImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  if (state.bgType === 'transparent') return { background: 'transparent' };
  return { background: '#1a1a2e' };
}

export const MockupCanvas: React.FC<MockupCanvasProps> = ({ state, canvasRef }) => {
  const scale = state.deviceScale;
  const boxShadow = getShadowBoxShadow(state.shadowType, scale);
  const hasText = !!(state.text.title || state.text.subtitle);
  const hPad = Math.max(12, Math.round(state.padding * 0.5));

  const frameProps = {
    screenshot: state.screenshot,
    boxShadow,
    aspectRatio: state.screenshotAspectRatio,
    deviceColor: state.deviceColor,
    scale,
  };

  const renderDevice = () => (
    <>
      {state.deviceType === 'phone' && (
        <PhoneFrame {...frameProps} cameraStyle={state.cameraStyle} />
      )}
      {state.deviceType === 'tablet' && (
        <TabletFrame {...frameProps} />
      )}
      {state.deviceType === 'laptop' && (
        <LaptopFrame {...frameProps} />
      )}
    </>
  );

  const bgStyle = getBackground(state);

  return (
    <div
      ref={canvasRef}
      style={{
        ...bgStyle,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        paddingTop: state.padding,
        paddingBottom: state.padding,
        paddingLeft: hPad,
        paddingRight: hPad,
        width: 'fit-content',
        borderRadius: 16,
        gap: hasText ? 12 : 0,
      }}
    >
      {hasText && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 4, padding: '0 4px', zIndex: 2, flexShrink: 0 }}>
          {state.text.title && (
            <h1
              style={{
                fontFamily: state.text.titleFont,
                color: state.text.titleColor,
                fontSize: 36,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 20px rgba(0,0,0,0.3)',
                margin: 0,
              }}
            >
              {state.text.title}
            </h1>
          )}
          {state.text.subtitle && (
            <p
              style={{
                fontFamily: state.text.subtitleFont,
                color: state.text.subtitleColor,
                fontSize: 17,
                fontWeight: 500,
                opacity: 0.85,
                textShadow: '0 1px 10px rgba(0,0,0,0.2)',
                margin: 0,
              }}
            >
              {state.text.subtitle}
            </p>
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
          perspective: 1500,
        }}
      >
        <div
          style={{
            transform: `rotateY(${state.deviceTilt}deg) rotateX(${Math.abs(state.deviceTilt) * 0.15}deg) rotateZ(${-state.deviceTilt * 0.05}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out',
          }}
        >
          {renderDevice()}
        </div>
      </div>
    </div>
  );
};
