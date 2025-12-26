/**
 * Animaciones reutilizables para mejorar UX
 * Optimizado para performance con GPU acceleration
 */

export const animations = {
  // Fade in suave
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: "easeOut" }
  },

  // Slide desde abajo (Mobile First)
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  },

  // Scale suave (para modales)
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2, ease: "easeOut" }
  },

  // Shake para errores
  shake: {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    }
  },

  // Pulse para notificaciones
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.3, repeat: 2 }
    }
  },

  // Stagger para listas (children)
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  // Item de lista
  listItem: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 }
  }
};

// Variantes Tailwind para animaciones CSS puras (más performantes)
export const cssAnimations = {
  fadeIn: "animate-in fade-in duration-200",
  slideUp: "animate-in slide-in-from-bottom-4 fade-in duration-300",
  slideDown: "animate-in slide-in-from-top-4 fade-in duration-300",
  scaleIn: "animate-in zoom-in-95 fade-in duration-200",
  spin: "animate-spin",
  pulse: "animate-pulse",
  bounce: "animate-bounce"
};

// Timing functions optimizadas
export const easings = {
  // Easing natural para interacciones
  easeOut: [0.22, 1, 0.36, 1],
  // Spring suave
  spring: { type: "spring", stiffness: 300, damping: 30 },
  // Elastic bounce
  elastic: { type: "spring", stiffness: 400, damping: 10 }
};
