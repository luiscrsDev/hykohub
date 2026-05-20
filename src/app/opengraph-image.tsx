import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'HykoHub — Comunidade Maker de Impressão 3D'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f13 0%, #13131a 50%, #0f1420 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid background */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          display: 'flex',
        }} />

        {/* Glow top-left */}
        <div style={{
          position: 'absolute', top: -120, left: -120,
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Glow bottom-right */}
        <div style={{
          position: 'absolute', bottom: -120, right: -120,
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, zIndex: 1 }}>

          {/* Badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 100, padding: '8px 20px',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
            <span style={{ color: '#a5b4fc', fontSize: 18, fontWeight: 600, letterSpacing: '0.15em' }}>
              COMUNIDADE MAKER
            </span>
          </div>

          {/* Logo + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src="https://www.hykohub.com/logo.png" width={64} height={64} style={{ objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 72, fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-2px' }}>
                Hyko<span style={{ color: '#6366f1' }}>Hub</span>
              </span>
            </div>
          </div>

          {/* Tagline */}
          <span style={{ fontSize: 28, color: '#94a3b8', textAlign: 'center', maxWidth: 700, lineHeight: 1.4 }}>
            Aprenda, compre em grupo e transforme sua impressora em renda.
          </span>

          {/* Pills */}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {['Compras em grupo', 'Pool Comercial Pro', 'Comunidade'].map(label => (
              <div key={label} style={{
                display: 'flex',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 100, padding: '10px 20px',
                color: '#cbd5e1', fontSize: 18,
              }}>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* URL bottom */}
        <div style={{
          position: 'absolute', bottom: 36,
          color: 'rgba(148,163,184,0.6)', fontSize: 18, letterSpacing: '0.05em',
          display: 'flex',
        }}>
          www.hykohub.com
        </div>
      </div>
    ),
    { ...size }
  )
}
