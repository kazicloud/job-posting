import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  const logoData = readFileSync(join(process.cwd(), 'public/images/kazicloud-logo.jpg'))
  const logoBase64 = `data:image/jpeg;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top orange bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: '#DC842C',
          }}
        />

        {/* Logo */}
        <img
          src={logoBase64}
          width={520}
          height={240}
          style={{ objectFit: 'contain' }}
        />

        {/* Tagline */}
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            fontWeight: 600,
            color: '#1a1a1a',
            letterSpacing: '-0.5px',
          }}
        >
          East Africa&apos;s #1 Job Platform
        </div>

        {/* Sub-tagline */}
        <div
          style={{
            marginTop: 12,
            fontSize: 22,
            color: '#6b7280',
          }}
        >
          Jobs in Kenya · Uganda · Rwanda · Tanzania
        </div>

        {/* Bottom orange bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: '#DC842C',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
