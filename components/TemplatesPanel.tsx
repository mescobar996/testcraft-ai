"use client";

import { useState } from "react";
import { 
  LogIn, 
  UserPlus, 
  ShoppingCart, 
  CreditCard, 
  Search, 
  Upload,
  Mail,
  Lock,
  FileText,
  Settings,
  Bell,
  Share2,
  Download,
  Trash2,
  Edit,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Template {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
  requirement: string;
  context: string;
}

const templates: Template[] = [
  // Autenticación
  {
    id: "login",
    name: "Login",
    icon: <LogIn className="w-4 h-4" />,
    category: "Autenticación",
    requirement: `Como usuario registrado, quiero poder iniciar sesión en la aplicación con mi email y contraseña para acceder a mi cuenta.

Criterios de aceptación:
- El formulario debe tener campos para email y contraseña
- El email debe tener formato válido
- La contraseña debe tener mínimo 8 caracteres
- Mostrar mensaje de error si las credenciales son incorrectas
- Redirigir al dashboard después de login exitoso
- Opción "Recordarme" para mantener la sesión
- Link a "Olvidé mi contraseña"`,
    context: "Aplicación web con autenticación JWT. Base de datos PostgreSQL."
  },
  {
    id: "register",
    name: "Registro",
    icon: <UserPlus className="w-4 h-4" />,
    category: "Autenticación",
    requirement: `Como visitante, quiero poder registrarme en la aplicación para crear una cuenta nueva.

Criterios de aceptación:
- Campos requeridos: nombre, email, contraseña, confirmar contraseña
- Email debe ser único en el sistema
- Contraseña: mínimo 8 caracteres, 1 mayúscula, 1 número, 1 símbolo
- Las contraseñas deben coincidir
- Enviar email de verificación después del registro
- Mostrar términos y condiciones con checkbox obligatorio
- Validación en tiempo real de cada campo`,
    context: "Aplicación web. Envío de emails con SendGrid. Validación frontend y backend."
  },
  {
    id: "password-reset",
    name: "Recuperar Contraseña",
    icon: <Lock className="w-4 h-4" />,
    category: "Autenticación",
    requirement: `Como usuario, quiero poder recuperar mi contraseña si la olvidé.

Criterios de aceptación:
- Ingresar email para solicitar recuperación
- Enviar email con link de recuperación (válido por 24 horas)
- El link debe ser de un solo uso
- Formulario para ingresar nueva contraseña
- Validar que la nueva contraseña cumpla los requisitos
- Confirmar cambio exitoso y redirigir a login`,
    context: "Token de recuperación con expiración. Emails transaccionales."
  },
  // E-commerce
  {
    id: "cart",
    name: "Carrito de Compras",
    icon: <ShoppingCart className="w-4 h-4" />,
    category: "E-commerce",
    requirement: `Como comprador, quiero poder agregar productos a mi carrito de compras para realizar una compra.

Criterios de aceptación:
- Agregar productos con cantidad específica
- Modificar cantidad de productos en el carrito
- Eliminar productos del carrito
- Mostrar subtotal por producto y total general
- Aplicar códigos de descuento
- Persistir carrito si el usuario cierra el navegador
- Mostrar disponibilidad de stock en tiempo real
- Calcular costos de envío según ubicación`,
    context: "E-commerce con inventario en tiempo real. Múltiples métodos de envío."
  },
  {
    id: "checkout",
    name: "Proceso de Pago",
    icon: <CreditCard className="w-4 h-4" />,
    category: "E-commerce",
    requirement: `Como comprador, quiero poder completar el pago de mi compra de forma segura.

Criterios de aceptación:
- Ingresar dirección de envío y facturación
- Seleccionar método de envío
- Elegir método de pago (tarjeta, PayPal, transferencia)
- Validar tarjeta de crédito en tiempo real
- Mostrar resumen de compra antes de confirmar
- Procesar pago de forma segura (PCI compliant)
- Enviar confirmación por email
- Generar número de orden único`,
    context: "Integración con Stripe. Cumplimiento PCI-DSS. Emails transaccionales."
  },
  // Búsqueda y Filtros
  {
    id: "search",
    name: "Búsqueda",
    icon: <Search className="w-4 h-4" />,
    category: "Búsqueda",
    requirement: `Como usuario, quiero poder buscar contenido en la aplicación para encontrar lo que necesito rápidamente.

Criterios de aceptación:
- Campo de búsqueda accesible desde cualquier página
- Búsqueda por palabras clave
- Sugerencias de autocompletado mientras escribo
- Mostrar resultados relevantes ordenados por relevancia
- Resaltar términos buscados en los resultados
- Mostrar cantidad de resultados encontrados
- Búsqueda sin resultados muestra sugerencias alternativas
- Historial de búsquedas recientes`,
    context: "Búsqueda full-text con Elasticsearch. Índice actualizado en tiempo real."
  },
  {
    id: "filters",
    name: "Filtros Avanzados",
    icon: <Filter className="w-4 h-4" />,
    category: "Búsqueda",
    requirement: `Como usuario, quiero poder filtrar resultados para encontrar exactamente lo que busco.

Criterios de aceptación:
- Filtrar por categoría, precio, fecha, rating
- Múltiples filtros combinables
- Mostrar cantidad de resultados por cada opción de filtro
- Limpiar filtros individual o todos a la vez
- URL actualiza con filtros aplicados (compartible)
- Filtros persisten al navegar entre páginas
- Ordenar resultados por diferentes criterios`,
    context: "Listado con paginación. Filtros en tiempo real sin recargar página."
  },
  // Gestión de Archivos
  {
    id: "upload",
    name: "Subir Archivos",
    icon: <Upload className="w-4 h-4" />,
    category: "Archivos",
    requirement: `Como usuario, quiero poder subir archivos a la plataforma.

Criterios de aceptación:
- Drag & drop para subir archivos
- También permitir selección manual con botón
- Tipos permitidos: JPG, PNG, PDF, DOC, DOCX
- Tamaño máximo: 10MB por archivo
- Mostrar progreso de subida
- Validar tipo y tamaño antes de subir
- Previsualizar imágenes antes de confirmar
- Subida múltiple (hasta 5 archivos simultáneos)
- Cancelar subida en progreso`,
    context: "Almacenamiento en AWS S3. Validación de archivos en backend."
  },
  {
    id: "download",
    name: "Descargar/Exportar",
    icon: <Download className="w-4 h-4" />,
    category: "Archivos",
    requirement: `Como usuario, quiero poder descargar o exportar mis datos en diferentes formatos.

Criterios de aceptación:
- Exportar a PDF, Excel, CSV
- Seleccionar qué datos incluir en la exportación
- Descargar archivos individuales o en lote (ZIP)
- Mostrar progreso en exportaciones grandes
- Notificar cuando la descarga esté lista
- Historial de exportaciones realizadas`,
    context: "Generación de archivos en servidor. Descargas grandes procesadas en background."
  },
  // Notificaciones
  {
    id: "notifications",
    name: "Notificaciones",
    icon: <Bell className="w-4 h-4" />,
    category: "Comunicación",
    requirement: `Como usuario, quiero recibir notificaciones sobre actividad relevante.

Criterios de aceptación:
- Centro de notificaciones accesible desde el header
- Badge con cantidad de notificaciones no leídas
- Tipos: info, éxito, advertencia, error
- Marcar como leída individual o todas
- Eliminar notificaciones
- Configurar preferencias (qué notificaciones recibir)
- Notificaciones push en navegador (opcional)
- Historial de notificaciones`,
    context: "WebSockets para tiempo real. Push notifications con Service Workers."
  },
  {
    id: "email",
    name: "Envío de Emails",
    icon: <Mail className="w-4 h-4" />,
    category: "Comunicación",
    requirement: `Como usuario, quiero poder enviar emails desde la plataforma.

Criterios de aceptación:
- Componer email con destinatario, asunto y cuerpo
- Editor de texto enriquecido (negrita, cursiva, listas)
- Adjuntar archivos (máximo 25MB total)
- Guardar como borrador
- Previsualizar antes de enviar
- Confirmar envío exitoso
- Historial de emails enviados`,
    context: "Integración con SendGrid/SES. Templates de email predefinidos."
  },
  // CRUD
  {
    id: "create",
    name: "Crear Registro",
    icon: <FileText className="w-4 h-4" />,
    category: "CRUD",
    requirement: `Como usuario, quiero poder crear nuevos registros en el sistema.

Criterios de aceptación:
- Formulario con todos los campos necesarios
- Campos obligatorios marcados con asterisco
- Validación en tiempo real de cada campo
- Mensajes de error claros y específicos
- Confirmar creación exitosa
- Opción de crear otro registro después de guardar
- Cancelar y volver sin guardar (confirmar si hay cambios)`,
    context: "Formulario con validación frontend y backend. Base de datos relacional."
  },
  {
    id: "edit",
    name: "Editar Registro",
    icon: <Edit className="w-4 h-4" />,
    category: "CRUD",
    requirement: `Como usuario, quiero poder editar registros existentes.

Criterios de aceptación:
- Cargar datos actuales en el formulario
- Modificar cualquier campo editable
- Validar cambios antes de guardar
- Mostrar qué campos fueron modificados
- Confirmar guardado exitoso
- Historial de cambios (quién y cuándo editó)
- Cancelar edición (confirmar si hay cambios sin guardar)`,
    context: "Auditoría de cambios. Bloqueo optimista para edición concurrente."
  },
  {
    id: "delete",
    name: "Eliminar Registro",
    icon: <Trash2 className="w-4 h-4" />,
    category: "CRUD",
    requirement: `Como usuario, quiero poder eliminar registros que ya no necesito.

Criterios de aceptación:
- Confirmar antes de eliminar (modal de confirmación)
- Mostrar qué se va a eliminar y consecuencias
- Eliminación suave (soft delete) con posibilidad de restaurar
- Eliminación en lote (múltiples registros)
- No permitir eliminar si hay dependencias
- Confirmar eliminación exitosa
- Papelera con registros eliminados (30 días)`,
    context: "Soft delete con campo deleted_at. Verificación de integridad referencial."
  },
  // Configuración
  {
    id: "settings",
    name: "Configuración de Cuenta",
    icon: <Settings className="w-4 h-4" />,
    category: "Usuario",
    requirement: `Como usuario, quiero poder configurar mi cuenta y preferencias.

Criterios de aceptación:
- Editar información personal (nombre, email, teléfono)
- Cambiar contraseña (requiere contraseña actual)
- Subir/cambiar foto de perfil
- Configurar preferencias de notificaciones
- Seleccionar idioma y zona horaria
- Configurar privacidad de perfil
- Descargar mis datos (GDPR)
- Eliminar cuenta permanentemente`,
    context: "Cumplimiento GDPR. Almacenamiento seguro de datos personales."
  },
  {
    id: "share",
    name: "Compartir Contenido",
    icon: <Share2 className="w-4 h-4" />,
    category: "Social",
    requirement: `Como usuario, quiero poder compartir contenido con otros usuarios o en redes sociales.

Criterios de aceptación:
- Compartir por email (ingresar destinatarios)
- Compartir en redes sociales (Facebook, Twitter, LinkedIn)
- Generar link para compartir
- Configurar permisos (solo ver, comentar, editar)
- Link con expiración opcional
- Proteger con contraseña (opcional)
- Ver quién accedió al contenido compartido`,
    context: "Links únicos con tokens. Integración con APIs de redes sociales."
  }
];

const categories = [...new Set(templates.map(t => t.category))];

interface TemplatesPanelProps {
  onSelectTemplate: (requirement: string, context: string) => void;
}

export function TemplatesPanel({ onSelectTemplate }: TemplatesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredTemplates = selectedCategory 
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <span className="font-medium text-white">Templates Predefinidos</span>
          <span className="text-xs text-slate-400">({templates.length} disponibles)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={`text-xs ${
                selectedCategory === null
                  ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                  : "border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              Todos
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs ${
                  selectedCategory === category
                    ? "bg-violet-500/20 border-violet-500/50 text-violet-300"
                    : "border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template.requirement, template.context)}
                className="flex items-center gap-2 p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-violet-500/50 rounded-lg transition-all duration-200 text-left group"
              >
                <div className="text-slate-400 group-hover:text-violet-400 transition-colors">
                  {template.icon}
                </div>
                <span className="text-sm text-slate-300 group-hover:text-white truncate">
                  {template.name}
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500 text-center">
            Hacé click en un template para cargar el requisito automáticamente
          </p>
        </div>
      )}
    </div>
  );
}
