"use client"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradiente base mejorado */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Mesh gradient animado con múltiples capas */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-[500px] h-[500px] bg-violet-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-[500px] h-[500px] bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000" />
        <div className="absolute bottom-0 right-20 w-[400px] h-[400px] bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-3000" />
      </div>

      {/* Grid pattern mejorado */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Glow effects pulsantes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full filter blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full filter blur-3xl animate-pulse-slow animation-delay-1000" />

      {/* Líneas de luz */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-shimmer" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent animate-shimmer animation-delay-2000" />
      </div>
    </div>
  )
}
