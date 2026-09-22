import React from 'react';

interface InciteLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  badgeText?: string;
  withContainer?: boolean;
}

export const InciteLogo: React.FC<InciteLogoProps> = ({ 
  size = 28, 
  showText = true, 
  className = '',
  badgeText,
  withContainer = false
}) => {
  return (
    <div 
      className={`incite-brand-wrapper ${className}`} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: `${Math.max(8, Math.round(size * 0.35))}px`,
        userSelect: 'none' 
      }}
    >
      {/* Cosmic & Deep Ocean Exploration Emblem */}
      <div 
        style={{
          width: `${size}px`,
          height: `${size}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          borderRadius: withContainer ? '10px' : '0',
          background: withContainer ? '#141416' : 'transparent',
          border: withContainer ? '1px solid rgba(255,255,255,0.08)' : 'none',
          padding: withContainer ? `${Math.round(size * 0.12)}px` : '0'
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Deep Ocean to Cosmic Horizon Gradient */}
            <linearGradient id="cosmicOcean" x1="3" y1="3" x2="33" y2="33" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" /> {/* Oceanic Azure */}
              <stop offset="45%" stopColor="#06B6D4" /> {/* Deep Sea Cyan */}
              <stop offset="80%" stopColor="#6366F1" /> {/* Cosmic Indigo */}
              <stop offset="100%" stopColor="#10B981" /> {/* Aurora Emerald */}
            </linearGradient>

            {/* Radiant Celestial Starlight */}
            <linearGradient id="stellarGlow" x1="18" y1="4" x2="18" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#A5F3FC" />
            </linearGradient>

            {/* Planetary Horizon Shadow */}
            <linearGradient id="abyssHorizon" x1="18" y1="14" x2="18" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            <filter id="beaconAura" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* 1. The Deep Ocean Wave & Celestial Orbit (Vòng quỹ đạo vũ trụ / Làn sóng đại dương sâu) */}
          <path
            d="M5 24C5 24 10 16 18 16C26 16 31 24 31 24C27 29 22.5 31.5 18 31.5C13.5 31.5 9 29 5 24Z"
            fill="url(#cosmicOcean)"
            opacity="0.92"
          />

          {/* 2. Planetary Horizon Crescent / Ocean Abyss Arc */}
          <path
            d="M3 18C3 18 8.5 28 18 28C27.5 28 33 18 33 18C30.5 25.5 24.5 30 18 30C11.5 30 5.5 25.5 3 18Z"
            fill="#0284C7"
            opacity="0.6"
          />

          {/* 3. Celestial Orbital Ring / Astrolabe Compass Line */}
          <path
            d="M4 17C7.5 10 12.5 5 18 5C23.5 5 28.5 10 32 17"
            stroke="url(#cosmicOcean)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="0.5 3.5"
          />

          {/* 4. The Guiding Pulsar / Polaris Star of Discovery (Ngôi sao Bắc Đẩu / Hải đăng dẫn lối) */}
          <path
            d="M18 3C18 7.5 14.5 11 10 11C14.5 11 18 14.5 18 19C18 14.5 21.5 11 26 11C21.5 11 18 7.5 18 3Z"
            fill="url(#stellarGlow)"
            filter="url(#beaconAura)"
          />

          {/* 5. Center Core of Enlightenment */}
          <circle cx="18" cy="11" r="2" fill="#FFFFFF" />

          {/* 6. Multi-Agent Planetary Nodes / Constellation Swarm (3 vệ tinh khám phá) */}
          <circle cx="9" cy="8" r="1.4" fill="#38BDF8" />
          <circle cx="27" cy="8" r="1.4" fill="#818CF8" />
          <circle cx="18" cy="24" r="1.8" fill="#FFFFFF" />
          <circle cx="18" cy="24" r="3.2" stroke="#38BDF8" strokeWidth="0.8" opacity="0.7" />
        </svg>
      </div>

      {/* Modern Wordmark */}
      {showText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: `${Math.max(16, Math.round(size * 0.72))}px`,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              color: '#FFFFFF',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              lineHeight: 1
            }}
          >
            Incite
          </span>
          {badgeText && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                color: '#38BDF8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                textTransform: 'uppercase',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
