import { useEffect, useRef, useState } from 'react'

const PEOPLE = [
  { name: 'Kevin',    role: 'Human Resources' },
  { name: 'Julio',    role: 'Network Engineer' },
  { name: 'Nico',     role: 'Finance Specialist' },
  { name: 'Sari',     role: 'UI/UX Designer' },
  { name: 'Dika',     role: 'Software Developer' },
  { name: 'Putri',    role: 'Marketing Manager' },
  { name: 'Hendra',   role: 'Data Analyst' },
  { name: 'Rina',     role: 'HR Specialist' },
  { name: 'Budi',     role: 'Project Manager' },
  { name: 'Dewi',     role: 'Content Writer' },
  { name: 'Fajar',    role: 'System Admin' },
  { name: 'Mega',     role: 'Graphic Designer' },
  { name: 'Aldi',     role: 'Business Analyst' },
  { name: 'Lina',     role: 'Data Scientist' },
  { name: 'Rizky',    role: 'Frontend Engineer' },
  { name: 'Bagas',    role: 'DevOps Engineer' },
]

const NODE_COLOR       = '#1e88e5'
const NODE_COLOR_HOV   = '#1565c0'
const LINE_COLOR       = '#1e88e5'
const PARTICLE_COLOR   = '#42a5f5'
const CONNECT_DIST     = 200
const NODE_R           = 24
const NODE_R_HOV       = 28

const NetworkBackground = () => {
  const canvasRef  = useRef(null)
  const stateRef   = useRef({ nodes: [], particles: [], hovered: null, raf: null })
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx    = canvas.getContext('2d')
    const state  = stateRef.current

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initNodes()
    }

    const initNodes = () => {
      const { width, height } = canvas
      state.nodes = PEOPLE.map(p => ({
        ...p,
        x:  Math.random() * (width  - 100) + 50,
        y:  Math.random() * (height - 100) + 50,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    /* ── particle pool ── */
    const spawnParticle = (a, b) => {
      state.particles.push({
        ax: a.x, ay: a.y,
        bx: b.x, by: b.y,
        t:  Math.random(),      // progress 0→1
        speed: 0.004 + Math.random() * 0.006,
        rev: Math.random() < 0.5,
      })
    }

    /* ── draw person icon ── */
    const drawPerson = (x, y, r, hov) => {
      const color    = hov ? NODE_COLOR_HOV : NODE_COLOR
      const headR    = r * 0.32
      const bodyW    = r * 0.46
      const bodyH    = r * 0.32

      /* outer ring */
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.strokeStyle = color
      ctx.lineWidth   = hov ? 2.5 : 1.5
      ctx.stroke()

      /* circle fill */
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = hov ? 'rgba(21,101,192,0.12)' : 'rgba(30,136,229,0.07)'
      ctx.fill()

      /* head */
      ctx.beginPath()
      ctx.arc(x, y - r * 0.18, headR, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      /* body */
      ctx.beginPath()
      ctx.ellipse(x, y + r * 0.48, bodyW, bodyH, 0, Math.PI, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      /* small dot at center for connector reference */
      if (!hov) {
        ctx.beginPath()
        ctx.arc(x, y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }
    }

    /* ── main loop ── */
    const animate = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      /* move nodes */
      for (const n of state.nodes) {
        n.x += n.vx; n.y += n.vy
        if (n.x < NODE_R || n.x > width  - NODE_R) n.vx *= -1
        if (n.y < NODE_R || n.y > height - NODE_R) n.vy *= -1
        n.x = Math.max(NODE_R, Math.min(width  - NODE_R, n.x))
        n.y = Math.max(NODE_R, Math.min(height - NODE_R, n.y))
      }

      /* ── connections ── */
      const pairs = []
      for (let i = 0; i < state.nodes.length; i++) {
        for (let j = i + 1; j < state.nodes.length; j++) {
          const a = state.nodes[i], b = state.nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d  = Math.sqrt(dx * dx + dy * dy)
          if (d < CONNECT_DIST) {
            const alpha = (1 - d / CONNECT_DIST) * 0.45
            /* line */
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(30,136,229,${alpha})`
            ctx.lineWidth   = 1
            ctx.stroke()

            /* connecting dots (hexagonal joints) */
            ctx.beginPath()
            ctx.arc((a.x + b.x) / 2, (a.y + b.y) / 2, 2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(30,136,229,${alpha * 0.8})`
            ctx.fill()

            pairs.push({ a, b })
          }
        }
      }

      /* ── particles (data flow) ── */
      /* spawn */
      if (Math.random() < 0.12 && pairs.length) {
        const pair = pairs[Math.floor(Math.random() * pairs.length)]
        spawnParticle(pair.a, pair.b)
      }

      /* update & draw particles */
      state.particles = state.particles.filter(p => {
        /* update source positions for live tracking */
        p.t += p.rev ? -p.speed : p.speed
        if (p.t > 1 || p.t < 0) return false   /* remove when done */

        const sx = p.rev ? p.bx : p.ax
        const sy = p.rev ? p.by : p.ay
        const ex = p.rev ? p.ax : p.bx
        const ey = p.rev ? p.ay : p.by
        const px = sx + (ex - sx) * p.t
        const py = sy + (ey - sy) * p.t

        /* trail */
        const grad = ctx.createRadialGradient(px, py, 0, px, py, 5)
        grad.addColorStop(0, 'rgba(66,165,245,0.9)')
        grad.addColorStop(1, 'rgba(66,165,245,0)')
        ctx.beginPath()
        ctx.arc(px, py, 5, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        /* dot */
        ctx.beginPath()
        ctx.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = PARTICLE_COLOR
        ctx.fill()
        return true
      })

      /* ── nodes (drawn on top) ── */
      for (const n of state.nodes) {
        const hov = n === state.hovered
        drawPerson(n.x, n.y, hov ? NODE_R_HOV : NODE_R, hov)
      }

      state.raf = requestAnimationFrame(animate)
    }
    animate()

    /* ── mouse ── */
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      let found = null
      for (const n of state.nodes) {
        const dx = mx - n.x, dy = my - n.y
        if (Math.sqrt(dx * dx + dy * dy) < NODE_R + 8) { found = n; break }
      }
      if (found !== state.hovered) {
        state.hovered = found
        setTooltip(found
          ? { name: found.name, role: found.role, x: found.x, y: found.y }
          : null
        )
      } else if (found) {
        setTooltip({ name: found.name, role: found.role, x: found.x, y: found.y })
      }
    }
    const onLeave = () => { state.hovered = null; setTooltip(null) }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(state.raf)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'all', opacity: 0.9 }}
      />
      {tooltip && (
        <div style={{
          position:          'absolute',
          left:              tooltip.x,
          top:               tooltip.y - NODE_R_HOV - 14,
          transform:         'translateX(-50%) translateY(-100%)',
          background:        'rgba(13,71,161,0.92)',
          backdropFilter:    'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color:             '#fff',
          padding:           '6px 14px',
          borderRadius:      20,
          fontSize:          '0.72rem',
          fontWeight:        600,
          whiteSpace:        'nowrap',
          pointerEvents:     'none',
          border:            '1px solid rgba(66,165,245,0.5)',
          zIndex:            10,
          letterSpacing:     '0.02em',
        }}>
          {tooltip.name}
          <span style={{ color: '#90caf9', margin: '0 5px' }}>|</span>
          {tooltip.role}
        </div>
      )}
    </div>
  )
}

export default NetworkBackground