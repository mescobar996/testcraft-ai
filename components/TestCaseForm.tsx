"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Wand2, FileText, Info } from "lucide-react";

interface TestCaseFormProps {
  onGenerate: (requirement: string, context: string, format: string) => Promise<void>;
  isLoading: boolean;
}

const EXAMPLE_REQUIREMENT = `Como usuario registrado
Quiero poder iniciar sesión en la aplicación
Para acceder a mi cuenta personal

Criterios de aceptación:
- El usuario debe ingresar email y contraseña
- El email debe tener formato válido
- La contraseña debe tener mínimo 8 caracteres
- Después de 3 intentos fallidos, la cuenta se bloquea por 15 minutos
- Si las credenciales son correctas, redirigir al dashboard`;

export function TestCaseForm({ onGenerate, isLoading }: TestCaseFormProps) {
  const [requirement, setRequirement] = useState("");
  const [context, setContext] = useState("");
  const [format, setFormat] = useState("both");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement.trim()) return;
    await onGenerate(requirement, context, format);
  };

  const loadExample = () => {
    setRequirement(EXAMPLE_REQUIREMENT);
    setContext("Aplicación web de e-commerce. Base de datos PostgreSQL. Frontend en React.");
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-violet-400" />
          Requisito o Historia de Usuario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Requirement Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                Descripción del requisito *
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={loadExample}
                className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 text-xs"
              >
                Cargar ejemplo
              </Button>
            </div>
            <Textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Pegá aquí tu historia de usuario, requisito funcional o descripción de la funcionalidad a probar..."
              className="min-h-[200px] bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 resize-none"
            />
          </div>

          {/* Context Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              Contexto adicional
              <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Información adicional: tecnologías usadas, restricciones, reglas de negocio..."
              className="min-h-[80px] bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20 resize-none"
            />
          </div>

          {/* Format Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Formato de salida
            </label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="bg-slate-950/50 border-slate-700 text-white">
                <SelectValue placeholder="Seleccionar formato" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="both" className="text-white hover:bg-slate-800">
                  Tabla + Gherkin (Recomendado)
                </SelectItem>
                <SelectItem value="table" className="text-white hover:bg-slate-800">
                  Solo Tabla clásica
                </SelectItem>
                <SelectItem value="gherkin" className="text-white hover:bg-slate-800">
                  Solo Gherkin (BDD)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <Info className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              Mientras más detallado sea el requisito, mejores serán los casos de prueba generados. 
              Incluí criterios de aceptación, validaciones y reglas de negocio si las tenés.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!requirement.trim() || isLoading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando casos de prueba...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generar Casos de Prueba
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
