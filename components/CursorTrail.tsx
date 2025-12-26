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
        return updated.slice(-5) // Solo 5 puntos sutiles
      })
    }

    const cleanupInterval = setInterval(() => {
      setDots(prevDots =>
        prevDots.filter(dot => Date.now() - dot.timestamp < 300)
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
        const opacity = Math.max(0, (1 - age / 300) * 0.2) // Muy sutil: max 20% opacity
        const scale = 1 - age / 600

        return (
          <div
            key={dot.id}
            className="absolute w-1 h-1 rounded-full bg-violet-400"
            style={{
              left: dot.x - 2,
              top: dot.y - 2,
              opacity: opacity,
              transform: `scale(${scale})`,
              transition: 'opacity 0.15s ease-out, transform 0.15s ease-out'
            }}
          />
        )
      })}
    </div>
  )
}
