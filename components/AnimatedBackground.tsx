"use client"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-purple-900 via-violet-950 to-black">
      {/* Gradient mesh morado elegante */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.15),transparent_50%)]" />

      {/* Dot pattern sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(168,85,247,0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Vignette oscuro en los bordes */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
    </div>
  )
}
