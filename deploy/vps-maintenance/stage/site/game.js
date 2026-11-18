(() => {
  'use strict'

  const canvas = document.getElementById('bg')
  const ctx = canvas.getContext('2d', { alpha: false })
  const coordsEl = document.getElementById('coords')

  const CELL = 6          // px per cell
  const SEED_DENSITY = 0.15   // slightly reduced initial density
  const RESEED_INTERVAL = 2200  // ms between ignition waves
  const MAX_AGE = 28      // frames before full char-out
  const STEP_EVERY = 4    // only advance simulation every N render frames

  let cols, rows, total
  let current, next, ages
  let imageData, pixels
  let lastReseed = 0
  let frameCount = 0
  let animId

  // ── Resize ──────────────────────────────────────────────────────────────
  function resize() {
    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width  = W
    canvas.height = H
    cols  = Math.ceil(W / CELL)
    rows  = Math.ceil(H / CELL)
    total = cols * rows

    current   = new Uint8Array(total)
    next      = new Uint8Array(total)
    ages      = new Float32Array(total)
    imageData = ctx.createImageData(W, H)
    pixels    = imageData.data

    // Dark background base
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i]     = 13
      pixels[i + 1] = 13
      pixels[i + 2] = 13
      pixels[i + 3] = 255
    }

    seed(Math.floor(cols / 2), Math.floor(rows / 2), SEED_DENSITY)
  }

  // ── Seeding ──────────────────────────────────────────────────────────────
  function seed(cx, cy, density) {
    // Seed uniformly across the full grid — Conway needs ~25-35% to sustain
    for (let i = 0; i < total; i++) {
      if (Math.random() < density) {
        current[i] = 1
      }
    }
  }

  function seedCluster(cx, cy, size) {
    const patterns = [
      // R-pentomino — long-lived explosive
      [[-1,0],[0,0],[0,-1],[1,-1],[0,1]],
      // Glider
      [[0,-1],[1,0],[-1,1],[0,1],[1,1]],
      // Acorn — very long evolution
      [[0,0],[1,0],[-2,1],[1,1],[2,1],[3,1],[4,1]],
      // Pi-heptomino
      [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]],
      // Thunderbird
      [[-1,0],[0,0],[1,0],[0,1],[0,2],[0,3]],
      // Cross / plus
      [[0,-1],[-1,0],[0,0],[1,0],[0,1]],
      // L-shape
      [[0,0],[0,1],[0,2],[1,2]],
      // S-tetromino
      [[0,0],[1,0],[-1,1],[0,1]],
      // Diagonal scatter
      [[0,0],[1,1],[2,2],[-1,-1],[2,0],[0,2]],
      // Dense random burst
      null
    ]
    const chosen = patterns[Math.floor(Math.random() * patterns.length)]

    if (chosen) {
      for (const [dx, dy] of chosen) {
        const x = Math.min(cols - 1, Math.max(0, cx + dx))
        const y = Math.min(rows - 1, Math.max(0, cy + dy))
        current[y * cols + x] = 1
        ages[y * cols + x] = 0
      }
    } else {
      // Small random scatter
      for (let i = 0; i < size; i++) {
        const sx = Math.min(cols - 1, Math.max(0, cx + Math.floor((Math.random() - 0.5) * 14)))
        const sy = Math.min(rows - 1, Math.max(0, cy + Math.floor((Math.random() - 0.5) * 14)))
        current[sy * cols + sx] = 1
        ages[sy * cols + sx] = 0
      }
    }
  }

  // ── Simulation step ──────────────────────────────────────────────────────
  function step() {
    for (let y = 0; y < rows; y++) {
      const yp = (y - 1 + rows) % rows
      const yn = (y + 1) % rows
      for (let x = 0; x < cols; x++) {
        const xp = (x - 1 + cols) % cols
        const xn = (x + 1) % cols

        const n = current[yp * cols + xp] + current[yp * cols + x]  + current[yp * cols + xn]
                + current[y  * cols + xp]                            + current[y  * cols + xn]
                + current[yn * cols + xp] + current[yn * cols + x]  + current[yn * cols + xn]

        const idx = y * cols + x
        const alive = current[idx]

        if (alive) {
          if (n === 2 || n === 3) {
            next[idx] = 1
            ages[idx] = Math.min(ages[idx] + 1, MAX_AGE)
          } else {
            next[idx] = 0
            // age continues to decay visually, not reset
          }
        } else {
          if (n === 3) {
            next[idx] = 1
            ages[idx] = 0
          } else {
            next[idx] = 0
            ages[idx] *= 0.82   // decay charred residue
          }
        }
      }
    }
    // Swap buffers
    const tmp = current
    current = next
    next = tmp
  }

  // ── Color mapping ────────────────────────────────────────────────────────
  // Returns [r, g, b, a] for a given age (0 = newborn, MAX_AGE = oldest alive)
  // Dead cells still have decaying age for "charred" afterglow
  function cellColor(alive, age) {
    if (age < 0.5) return null   // fully faded, skip

    const t = age / MAX_AGE       // 0..1

    let r, g, b, a

    if (alive) {
      if (t < 0.15) {
        // Leading edge: bright lilac
        const f = t / 0.15
        r = Math.round(222 - f * 52)
        g = Math.round(183 - f * 92)
        b = 255
        a = 0.55 + f * 0.45
      } else if (t < 0.45) {
        // Active glow: violet to deep purple
        const f = (t - 0.15) / 0.30
        r = 170 - Math.round(f * 55)
        g = 91 - Math.round(f * 40)
        b = 255 - Math.round(f * 45)
        a = 0.9
      } else {
        // Established: deep purple
        const f = (t - 0.45) / 0.55
        r = 115 - Math.round(f * 65)
        g = 51 - Math.round(f * 32)
        b = 210 - Math.round(f * 105)
        a = 0.85 - f * 0.15
      }
    } else {
      // Fading purple afterglow
      const decay = age / MAX_AGE
      r = Math.round(60 * decay)
      g = Math.round(25 * decay)
      b = Math.round(98 * decay)
      a = decay * 0.6
    }

    return [r, g, b, Math.round(Math.min(1, a) * 255)]
  }

  // ── Render ───────────────────────────────────────────────────────────────
  function render() {
    const W = canvas.width

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx  = y * cols + x
        const alive = current[idx] === 1
        const age   = ages[idx]
        const color = cellColor(alive, age)

        // Paint each cell as a CELL×CELL block into the pixel buffer
        const px0 = x * CELL
        const py0 = y * CELL

        for (let dy = 0; dy < CELL; dy++) {
          const row = (py0 + dy) * W + px0
          for (let dx = 0; dx < CELL; dx++) {
            const pi = (row + dx) * 4
            if (color) {
              const [cr, cg, cb, ca] = color
              const bg = 13
              const inv = 255 - ca
              pixels[pi]     = Math.round((bg * inv + cr * ca) / 255)
              pixels[pi + 1] = Math.round((bg * inv + cg * ca) / 255)
              pixels[pi + 2] = Math.round((bg * inv + cb * ca) / 255)
              pixels[pi + 3] = 255
            } else {
              pixels[pi]     = 13
              pixels[pi + 1] = 13
              pixels[pi + 2] = 13
              pixels[pi + 3] = 255
            }
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  // ── Animation loop ───────────────────────────────────────────────────────
  function loop(timestamp) {
    // Scatter several random ignition points across the full canvas
    if (timestamp - lastReseed > RESEED_INTERVAL) {
      const count = 3 + Math.floor(Math.random() * 4)  // 3–6 new spots
      for (let i = 0; i < count; i++) {
        const cx = Math.floor(Math.random() * cols)
        const cy = Math.floor(Math.random() * rows)
        seedCluster(cx, cy, 10)
      }
      lastReseed = timestamp
    }

    frameCount++
    if (frameCount % STEP_EVERY === 0) step()
    render()
    animId = requestAnimationFrame(loop)
  }

  // ── Input: click/touch to ignite ─────────────────────────────────────────
  function onPointer(e) {
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const cx = Math.floor((clientX - rect.left) / CELL)
    const cy = Math.floor((clientY - rect.top)  / CELL)
    seedCluster(cx, cy, 15)
  }

  // ── Coords display ───────────────────────────────────────────────────────
  function updateCoords(e) {
    if (!coordsEl) return
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight
    const lat = ((0.5 - y) * 180).toFixed(1)
    const lon = ((x - 0.5) * 360).toFixed(1)
    const latDir = lat >= 0 ? 'N' : 'S'
    const lonDir = lon >= 0 ? 'E' : 'W'
    coordsEl.textContent = `${Math.abs(lat)}°${latDir} / ${Math.abs(lon)}°${lonDir}`
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  resize()

  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(animId)
    resize()
    animId = requestAnimationFrame(loop)
  })
  ro.observe(document.documentElement)

  window.addEventListener('click',      onPointer, { passive: true })
  window.addEventListener('touchstart', onPointer, { passive: true })
  window.addEventListener('mousemove',  updateCoords, { passive: true })

  animId = requestAnimationFrame(loop)
})()
