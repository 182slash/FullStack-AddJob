import { useEffect, useRef } from 'react'

const LINE_COUNT  = 75
const SPEED       = 0.009 // Increased speed for more active movement

const WaveBackground = () => {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let t = 0

    const resize = () => {
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

      const mainAmplitude = height * 0.22;  
      const ribbonThickness = height * 0.45; 

      for (let l = 0; l < LINE_COUNT; l++) {
        const progress = (l / (LINE_COUNT - 1)) - 0.5
        
        ctx.beginPath()
        ctx.lineWidth = 1
        
        const alphaMult = 1 - Math.abs(progress) * 1.2
        ctx.strokeStyle = `rgba(79,195,247, ${0.25 * alphaMult})`

        const steps = 150 
        for (let s = 0; s <= steps; s++) {
          const xNorm = s / steps
          const x = xNorm * width

          // 1. Wave Interference (Undulation)
          // Combining sine and cosine moving in DIFFERENT directions at different speeds
          // This forces the wave to morph and bounce in place, rather than just sliding left/right.
          const mainWave = Math.sin(xNorm * Math.PI * 2.2 - t * 1.2) + 
                           Math.cos(xNorm * Math.PI * 3.5 + t * 0.8) * 0.4;
          
          // 2. The Twist (3D weaving effect)
          // By adding 'progress' to the time phase, each individual line moves slightly out of sync.
          // This causes the lines to cross over and weave through each other organically.
          const linePhase = progress * Math.PI * 3; 
          const spread = Math.cos(xNorm * Math.PI * 1.8 - t + linePhase) + 
                         Math.sin(xNorm * Math.PI * 2.5 + t * 1.5) * 0.3;
          
          // 3. Calculate final Y position
          const y = (height * 0.5) + 
                    (mainWave * mainAmplitude) + 
                    (progress * ribbonThickness * spread)

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
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}

export default WaveBackground