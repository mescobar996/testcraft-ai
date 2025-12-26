"use client"

import { useEffect, useState } from 'react'

interface TrailDot {
  id: number
  x: number
  y: number
  timestamp: number
}

export function CursorTrail() {
  const [dots, setDots] = useState<TrailDot[]>([])

  useEffect(() => {
    let dotId = 0

    const handleMouseMove = (e: MouseEvent) => {
      const newDot: TrailDot = {
        id: dotId++,
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      }

      setDots(prevDots => {
        const updated = [...prevDots, newDot]
        return updated.slice(-8) // Solo 8 puntos muy sutiles
      })
    }

    const cleanupInterval = setInterval(() => {
      setDots(prevDots =>
        prevDots.filter(dot => Date.now() - dot.timestamp < 400)
      )
    }, 100)

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(cleanupInterval)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {dots.map((dot, index) => {
        const age = Date.now() - dot.timestamp
        const opacity = Math.max(0, (1 - age / 400) * 0.6) // Vibrante: max 60% opacity
        const scale = 1 - age / 800

        return (
          <div
            key={dot.id}
            className="absolute w-3 h-3 rounded-full"
            style={{
              left: dot.x - 6,
              top: dot.y - 6,
              opacity: opacity,
              transform: `scale(${scale})`,
              background: index % 3 === 0
                ? 'radial-gradient(circle, rgba(139, 92, 246, 0.9) 0%, rgba(139, 92, 246, 0) 70%)'
                : index % 3 === 1
                ? 'radial-gradient(circle, rgba(217, 70, 239, 0.9) 0%, rgba(217, 70, 239, 0) 70%)'
                : 'radial-gradient(circle, rgba(168, 85, 247, 0.9) 0%, rgba(168, 85, 247, 0) 70%)',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)',
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          />
        )
      })}
    </div>
  )
}
