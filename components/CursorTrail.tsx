"use client"

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  life: number
  color: string
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas para que ocupe toda la pantalla
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Colores del tema (violeta/fucsia)
    const colors = [
      'rgba(139, 92, 246, 0.6)',  // violet-500
      'rgba(217, 70, 239, 0.6)',  // fuchsia-500
      'rgba(168, 85, 247, 0.6)',  // purple-500
      'rgba(192, 132, 252, 0.6)', // purple-400
    ]

    // Manejar movimiento del mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }

      // Crear nuevas partículas
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 2,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }

      // Limitar número de partículas
      if (particlesRef.current.length > 100) {
        particlesRef.current = particlesRef.current.slice(-100)
      }
    }

    // Animar partículas
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Actualizar y dibujar partículas
      particlesRef.current = particlesRef.current.filter(particle => {
        // Actualizar posición
        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.life -= 0.02

        // Dibujar partícula
        if (particle.life > 0) {
          ctx.save()
          ctx.globalAlpha = particle.life
          ctx.fillStyle = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
          return true
        }
        return false
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
