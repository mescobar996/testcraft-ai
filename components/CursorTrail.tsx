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
        // Agregar nuevo punto
        const updated = [...prevDots, newDot]
        // Limitar a 15 puntos
        return updated.slice(-15)
      })
    }

    // Limpiar puntos antiguos cada 100ms
    const cleanupInterval = setInterval(() => {
      setDots(prevDots =>
        prevDots.filter(dot => Date.now() - dot.timestamp < 500)
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
        const opacity = Math.max(0, 1 - age / 500)
        const scale = 1 - age / 1000

        return (
          <div
            key={dot.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: dot.x - 4,
              top: dot.y - 4,
              opacity: opacity,
              transform: `scale(${scale})`,
              background: index % 3 === 0
                ? 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, rgba(139, 92, 246, 0) 70%)'
                : index % 3 === 1
                ? 'radial-gradient(circle, rgba(217, 70, 239, 0.8) 0%, rgba(217, 70, 239, 0) 70%)'
                : 'radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, rgba(168, 85, 247, 0) 70%)',
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)',
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          />
        )
      })}
    </div>
  )
}
