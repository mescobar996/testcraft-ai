import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractJSON<T>(text: string): T {
  try {
    // Intentar parsear directamente primero
    return JSON.parse(text.trim());
  } catch (e) {
    // Si falla, intentar extraer el contenido entre bloques de código JSON
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || 
                     text.match(/```\s*([\s\S]*?)\s*```/) ||
                     text.match(/{[\s\S]*}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (innerError) {
        console.error("Error al parsear JSON extraído:", innerError);
        throw new Error("No se pudo extraer un JSON válido de la respuesta");
      }
    }
    throw new Error("No se encontró contenido JSON en la respuesta");
  }
}
