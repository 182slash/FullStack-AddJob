import { useEffect, useRef } from 'react'

const LINE_COUNT  = 75 // Increased significantly for a denser, more voluminous mesh
const SPEED       = 0.005 // Slightly slower so the massive wave feels elegant

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

      // DYNAMIC VOLUME: Instead of a fixed 100px, we scale it to the container height
      const mainAmplitude = height * 0.25;  // How far the wave swings up and down
      const ribbonThickness = height * 0.5; // How wide the "folds" of the ribbon get

      for (let l = 0; l < LINE_COUNT; l++) {
        // progress goes from -0.5 to 0.5 to center the bundle
        const progress = (l / (LINE_COUNT - 1)) - 0.5
        
        ctx.beginPath()
        ctx.lineWidth = 1
        
        // Slightly increased base opacity so it shows up better behind your cards
        const alphaMult = 1 - Math.abs(progress) * 1.2
        ctx.strokeStyle = `rgba(79,195,247, ${0.25 * alphaMult})`

        const steps = 150 // Smoothness of the line
        for (let s = 0; s <= steps; s++) {
          const xNorm = s / steps
          const x = xNorm * width

          // 1. The Core Wave: Sweeps across the whole screen
          const mainWave = Math.sin(xNorm * Math.PI * 2.5 + t)
          
          // 2. The Volume/Spread: Creates the 3D pinch and swell effect
          // Added a secondary sine wave to make the folds look more organic
          const spread = Math.cos(xNorm * Math.PI * 1.5 + t * 0.6) + 
                         Math.sin(xNorm * Math.PI * 0.5) * 0.4;
          
          // 3. The Vertical Position
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