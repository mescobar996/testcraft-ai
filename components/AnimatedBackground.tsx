"use client"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-[#0A0A0A]">
      {/* Gradient mesh sutil y elegante */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.08),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_50%)]" />

      {/* Dot pattern muy sutil */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, #8b5cf6 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Vignette suave */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/50 dark:to-black/50" />
    </div>
  )
}
