"use client";

interface AppIconProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  withGlow?: boolean;
}

const sizes = {
  xs: { wrapper: "w-6 h-6", icon: "w-3 h-3", radius: "rounded-md" },
  sm: { wrapper: "w-8 h-8", icon: "w-4 h-4", radius: "rounded-lg" },
  md: { wrapper: "w-10 h-10", icon: "w-5 h-5", radius: "rounded-xl" },
  lg: { wrapper: "w-12 h-12", icon: "w-6 h-6", radius: "rounded-xl" },
  xl: { wrapper: "w-16 h-16", icon: "w-8 h-8", radius: "rounded-2xl" },
};

export function AppIcon({ size = "md", className = "", withGlow = false }: AppIconProps) {
  const { wrapper, icon, radius } = sizes[size];

  return (
    <div className={`relative ${className}`}>
      {withGlow && (
        <div className={`absolute -inset-1 bg-gradient-to-br from-violet-500 to-indigo-600 ${radius} blur opacity-30 animate-pulse`} />
      )}
      <div className={`${wrapper} ${radius} bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 relative`}>
        <svg 
          viewBox="0 0 24 24" 
          className={icon}
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>
    </div>
  );
}

// Exportar también como SVG standalone para usar en otros contextos
export function AppIconSVG({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
