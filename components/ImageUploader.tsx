"use client";

import Image from 'next/image';
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  Camera,
  Wand2,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface ImageUploaderProps {
  onGenerateFromImage: (result: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function ImageUploader({ onGenerateFromImage, isLoading, setIsLoading }: ImageUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Por favor selecciona una imagen válida", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("La imagen debe ser menor a 10MB", "error");
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [showToast]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleGenerate = async () => {
    if (!selectedImage) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("context", context);
      formData.append("format", "both");

      const response = await fetch("/api/generate-from-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al generar casos de prueba");
      }

      const result = await response.json();
      onGenerateFromImage(result);
      setIsOpen(false);
      showToast("Casos generados desde imagen", "success");
      
      // Reset
      setSelectedImage(null);
      setPreviewUrl(null);
      setContext("");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Error al procesar", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="border-violet-500/50 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200"
      >
        <Camera className="w-4 h-4 mr-2" />
        Generar desde Imagen
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Generar desde Imagen</h2>
                  <p className="text-sm text-slate-400">Subí un screenshot y generamos los casos</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-2xl leading-none p-2"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Dropzone */}
              {!previewUrl ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 transition-all ${
                    dragActive
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-slate-700 hover:border-slate-600"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-white font-medium mb-1">
                      Arrastrá una imagen aquí
                    </p>
                    <p className="text-slate-400 text-sm mb-4">
                      o hacé click para seleccionar
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="border-slate-700 text-slate-300"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Seleccionar imagen
                    </Button>
                    <p className="text-xs text-slate-500 mt-3">
                      PNG, JPG, GIF o WebP • Máximo 10MB
                    </p>
                  </div>
                </div>
              ) : (
                /* Preview */
                <div className="relative w-full h-64 bg-slate-800 rounded-xl">
                  <Image
                    src={previewUrl!}
                    alt="Preview"
                    fill
                    className="object-contain rounded-xl"
                    unoptimized
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/60 rounded-lg text-xs text-white flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    {selectedImage?.name}
                  </div>
                </div>
              )}

              {/* Context input */}
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Contexto adicional (opcional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Ej: Es un formulario de login para una app bancaria, debe validar email y contraseña segura..."
                  className="w-full h-20 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 resize-none text-sm"
                />
              </div>

              {/* Tips */}
              <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-3">
                <p className="text-xs text-slate-400">
                  💡 <strong className="text-slate-300">Tips:</strong> Subí screenshots de formularios, 
                  pantallas de login, dashboards, o cualquier UI. La IA detectará los elementos 
                  y generará casos de prueba automáticamente.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800 bg-slate-800/30">
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="text-slate-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!selectedImage || isLoading}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analizando imagen...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generar Casos de Prueba
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
