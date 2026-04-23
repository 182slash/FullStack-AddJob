import { useEffect, useRef } from 'react'

const LINE_COUNT  = 18
const AMPLITUDE   = 55
const SPEED        = 0.0012
const LINE_COLOR   = 'rgba(79,195,247,0.18)'

const WaveBackground = () => {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let t = 0

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      for (let l = 0; l < LINE_COUNT; l++) {
        const progress  = l / (LINE_COUNT - 1)           // 0 → 1
        const baseY     = height * 0.2 + progress * height * 0.6
        const phaseShift = progress * Math.PI * 2.5
        const amp       = AMPLITUDE * Math.sin(progress * Math.PI) // taper at edges

        ctx.beginPath()

        const steps = 200
        for (let s = 0; s <= steps; s++) {
          const x  = (s / steps) * width
          const nx = x / width   // normalized 0→1

          /* multi-frequency wave — matches the flowing organic look */
          const y = baseY
            + amp * Math.sin(nx * Math.PI * 3 + t + phaseShift)
            + (amp * 0.4) * Math.sin(nx * Math.PI * 5.5 - t * 1.3 + phaseShift * 0.7)
            + (amp * 0.2) * Math.sin(nx * Math.PI * 8   + t * 0.8 + phaseShift * 1.4)

          s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }

        /* vary opacity per line — darker in the dense middle */
        const alpha = 0.08 + 0.22 * Math.sin(progress * Math.PI)
        ctx.strokeStyle = `rgba(79,195,247,${alpha})`
        ctx.lineWidth   = 1
        ctx.stroke()
      }

      t += SPEED
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', opacity: 1 }}
      />
    </div>
  )
}

export default WaveBackground