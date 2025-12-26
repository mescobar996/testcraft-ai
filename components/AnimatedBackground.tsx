"use client"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradiente base vibrante */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950" />

      {/* Mesh gradient VIBRANTE con blobs grandes */}
      <div className="absolute inset-0">
        <div className="absolute -top-20 -left-20 w-[800px] h-[800px] bg-purple-500 rounded-full mix-blend-screen filter blur-[150px] opacity-40 animate-blob" />
        <div className="absolute -top-20 -right-20 w-[700px] h-[700px] bg-violet-600 rounded-full mix-blend-screen filter blur-[150px] opacity-35 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/4 w-[900px] h-[900px] bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[150px] opacity-40 animate-blob animation-delay-4000" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-pink-500 rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-blob animation-delay-3000" />
      </div>

      {/* Grid pattern vibrante */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Glow effects vibrantes */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-violet-500/30 rounded-full filter blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-1/3 w-[600px] h-[600px] bg-fuchsia-500/30 rounded-full filter blur-[100px] animate-pulse-slow animation-delay-1000" />

      {/* Líneas de luz brillantes */}
      <div className="absolute inset-0 opacity-25">
        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_20px_rgba(139,92,246,0.6)] animate-shimmer" />
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent shadow-[0_0_20px_rgba(217,70,239,0.6)] animate-shimmer animation-delay-2000" />
        <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-shimmer animation-delay-4000" />
      </div>

      {/* Partículas flotantes brillantes */}
      <div className="absolute top-20 left-[10%] w-2 h-2 bg-violet-400 rounded-full shadow-[0_0_15px_rgba(139,92,246,1)] animate-float" />
      <div className="absolute top-40 right-[20%] w-2.5 h-2.5 bg-fuchsia-400 rounded-full shadow-[0_0_15px_rgba(217,70,239,1)] animate-float animation-delay-1000" />
      <div className="absolute bottom-32 left-[30%] w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_15px_rgba(168,85,247,1)] animate-float animation-delay-2000" />
      <div className="absolute bottom-48 right-[15%] w-2.5 h-2.5 bg-violet-400 rounded-full shadow-[0_0_15px_rgba(139,92,246,1)] animate-float animation-delay-3000" />
    </div>
  )
}
