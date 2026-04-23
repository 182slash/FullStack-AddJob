import { useEffect, useRef } from 'react'

const LINE_COUNT  = 45 // Increased for that dense ribbon look
const AMPLITUDE   = 100
const SPEED       = 0.008
const LINE_COLOR   = 'rgba(79,195,247,0.15)' // Your requested color

const WaveBackground = () => {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let t = 0

    const resize = () => {
      // Use devicePixelRatio for sharper lines on high-res screens
      const dpr = window.devicePixelRatio || 1
      canvas.width  = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      
      ctx.clearRect(0, 0, width, height)

      for (let l = 0; l < LINE_COUNT; l++) {
        // progress goes from -0.5 to 0.5 to center the bundle
        const progress = (l / (LINE_COUNT - 1)) - 0.5
        
        ctx.beginPath()
        ctx.lineWidth = 1
        // Lines near the edge of the ribbon are fainter
        const alphaMult = 1 - Math.abs(progress) * 1.5
        ctx.strokeStyle = `rgba(79,195,247, ${0.2 * alphaMult})`

        const steps = 120 // Smoothness of the line
        for (let s = 0; s <= steps; s++) {
          const xNorm = s / steps
          const x = xNorm * width

          // 1. The Core Wave: Determines the general path (Sine)
          const mainWave = Math.sin(xNorm * Math.PI * 2 + t)
          
          // 2. The Separation: This makes lines fan out and pinch
          // We use a cosine wave to vary the "spread" along the X axis
          const spread = Math.cos(xNorm * Math.PI * 1.5 + t * 0.5)
          
          // 3. The Vertical Position
          // We center it at height * 0.5 and add the wave components
          const y = (height * 0.5) + 
                    (mainWave * AMPLITUDE) + 
                    (progress * AMPLITUDE * 1.2 * spread)

          if (s === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      t += SPEED
      rafRef.current = requestAnimationFrame(draw)
    }
    
    draw()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}

export default WaveBackground