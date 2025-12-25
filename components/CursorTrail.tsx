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
      {dots.map((dot) => {
        const age = Date.now() - dot.timestamp
        const opacity = Math.max(0, (1 - age / 400) * 0.15) // Muy sutil: max 15% opacity

        return (
          <div
            key={dot.id}
            className="absolute w-1 h-1 rounded-full bg-violet-500"
            style={{
              left: dot.x,
              top: dot.y,
              opacity: opacity,
              transition: 'opacity 0.1s ease-out'
            }}
          />
        )
      })}
    </div>
  )
}
