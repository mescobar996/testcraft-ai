"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Link2,
  Check,
  Loader2,
  ExternalLink,
  Settings,
  Unplug,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth-context";

interface Integration {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  description: string;
  helpUrl: string;
  fields: { key: string; label: string; placeholder: string; type?: string; help?: string }[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: "jira",
    name: "Jira",
    icon: "🔷",
    color: "from-blue-500 to-blue-600",
    connected: false,
    description: "Crea issues de test case directamente en tu proyecto de Jira",
    helpUrl: "https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/",
    fields: [
      { key: "domain", label: "Dominio Jira", placeholder: "tu-empresa.atlassian.net", help: "Sin https://" },
      { key: "email", label: "Email", placeholder: "tu@email.com" },
      { key: "apiToken", label: "API Token", placeholder: "Tu API token", type: "password", help: "Crear en Atlassian Account Settings" },
      { key: "projectKey", label: "Clave del Proyecto", placeholder: "PROJ", help: "Ej: PROJ, TEST, QA" },
    ],
  },
  {
    id: "trello",
    name: "Trello",
    icon: "📋",
    color: "from-sky-500 to-sky-600",
    connected: false,
    description: "Crea tarjetas con checklist de pasos en tu tablero de Trello",
    helpUrl: "https://trello.com/power-ups/admin",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "Tu API Key", help: "Obtener en trello.com/power-ups/admin" },
      { key: "token", label: "Token", placeholder: "Tu Token", type: "password", help: "Generar desde el link de API Key" },
      { key: "boardId", label: "ID del Board", placeholder: "abc123", help: "Está en la URL del tablero" },
      { key: "listId", label: "ID de la Lista", placeholder: "def456", help: "Agregar .json a la URL del tablero para ver IDs" },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    icon: "📝",
    color: "from-gray-600 to-gray-700",
    connected: false,
    description: "Sincroniza casos de prueba con una base de datos de Notion",
    helpUrl: "https://www.notion.so/my-integrations",
    fields: [
      { key: "apiKey", label: "Integration Token", placeholder: "secret_...", type: "password", help: "Crear en notion.so/my-integrations" },
      { key: "databaseId", label: "Database ID", placeholder: "abc123def456", help: "Compartir DB con tu integración primero" },
    ],
  },
  {
    id: "github",
    name: "GitHub Issues",
    icon: "🐙",
    color: "from-purple-500 to-purple-600",
    connected: false,
    description: "Crea issues etiquetados por tipo y prioridad en GitHub",
    helpUrl: "https://github.com/settings/tokens",
    fields: [
      { key: "token", label: "Personal Access Token", placeholder: "ghp_...", type: "password", help: "Con permisos: repo, issues" },
      { key: "owner", label: "Owner/Org", placeholder: "tu-usuario" },
      { key: "repo", label: "Repositorio", placeholder: "nombre-repo" },
    ],
  },
  {
    id: "azure",
    name: "Azure DevOps",
    icon: "🔵",
    color: "from-blue-600 to-indigo-600",
    connected: false,
    description: "Crea Test Cases en Azure DevOps Test Plans",
    helpUrl: "https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate",
    fields: [
      { key: "organization", label: "Organización", placeholder: "tu-organizacion" },
      { key: "project", label: "Proyecto", placeholder: "nombre-proyecto" },
      { key: "pat", label: "Personal Access Token", placeholder: "Tu PAT", type: "password", help: "Con permisos: Work Items (Read & Write)" },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    icon: "💬",
    color: "from-green-500 to-emerald-500",
    connected: false,
    description: "Recibe notificaciones cuando se generan nuevos casos de prueba",
    helpUrl: "https://api.slack.com/messaging/webhooks",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", placeholder: "https://hooks.slack.com/services/...", type: "password", help: "Crear Incoming Webhook en Slack" },
      { key: "channel", label: "Canal (opcional)", placeholder: "#qa-team", help: "Se usa el canal del webhook por defecto" },
    ],
  },
];

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationsModal({ isOpen, onClose }: IntegrationsModalProps) {
  const { showToast } = useToast();
  const { user, session } = useAuth();
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const loadIntegrations = useCallback(async () => {
    if (!session?.access_token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/integrations/config', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const connectedIds = data.integrations.map((i: any) => i.integration_id);
        
        setIntegrations(prev => prev.map(i => ({
          ...i,
          connected: connectedIds.includes(i.id)
        })));
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Cargar integraciones conectadas al abrir
  useEffect(() => {
    if (isOpen && user && session) {
      loadIntegrations();
    }
  }, [isOpen, user, session, loadIntegrations]);

  const handleConnect = async () => {
    if (!selectedIntegration || !session?.access_token) return;
    
    // Validar campos requeridos
    const missingFields = selectedIntegration.fields.filter(f => !formData[f.key]?.trim());
    if (missingFields.length > 0) {
      showToast(`Completá: ${missingFields.map(f => f.label).join(', ')}`, "error");
      return;
    }

    setIsConnecting(true);
    
    try {
      const response = await fetch('/api/integrations/config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integrationId: selectedIntegration.id,
          config: formData
        })
      });

      if (response.ok) {
        setIntegrations(prev => prev.map(i => 
          i.id === selectedIntegration.id ? { ...i, connected: true } : i
        ));
        
        showToast(`${selectedIntegration.name} conectado exitosamente`, "success");
        setSelectedIntegration(null);
        setFormData({});
      } else {
        const error = await response.json();
        showToast(error.error || "Error al conectar", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedIntegration || !session?.access_token) return;
    
    // Primero guardar la configuración
    const missingFields = selectedIntegration.fields.filter(f => !formData[f.key]?.trim());
    if (missingFields.length > 0) {
      showToast(`Completá: ${missingFields.map(f => f.label).join(', ')}`, "error");
      return;
    }

    setIsTesting(true);
    
    try {
      // Guardar primero
      await fetch('/api/integrations/config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integrationId: selectedIntegration.id,
          config: formData
        })
      });

      // Luego probar
      const response = await fetch(`/api/integrations/${selectedIntegration.id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        showToast(`✓ Conexión exitosa${data.project?.name ? `: ${data.project.name}` : ''}`, "success");
      } else {
        const error = await response.json();
        showToast(error.error || "Error de conexión", "error");
      }
    } catch (error) {
      showToast("Error al probar conexión", "error");
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!session?.access_token) return;
    
    try {
      const response = await fetch(`/api/integrations/config?integrationId=${integrationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        setIntegrations(prev => prev.map(i => 
          i.id === integrationId ? { ...i, connected: false } : i
        ));
        showToast("Integración desconectada", "success");
      }
    } catch (error) {
      showToast("Error al desconectar", "error");
    }
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Iniciá sesión</h2>
          <p className="text-slate-400 mb-4">Necesitás iniciar sesión para usar las integraciones.</p>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Integraciones</h2>
              <p className="text-sm text-slate-400">Conectá con tus herramientas de testing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            </div>
          ) : selectedIntegration ? (
            // Formulario de configuración
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSelectedIntegration(null);
                  setFormData({});
                }}
                className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1"
              >
                ← Volver a integraciones
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{selectedIntegration.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedIntegration.name}</h3>
                  <p className="text-slate-400 text-sm">{selectedIntegration.description}</p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-slate-300">
                    <p>Tus credenciales se guardan de forma segura en nuestra base de datos.</p>
                    <a 
                      href={selectedIntegration.helpUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ver cómo obtener credenciales
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedIntegration.fields.map(field => (
                  <div key={field.key}>
                    <label className="text-sm text-slate-300 mb-1.5 block">
                      {field.label}
                      {field.help && (
                        <span className="text-slate-500 ml-2 text-xs">({field.help})</span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="bg-slate-800/50 border-slate-700 text-white pr-10"
                      />
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(field.key)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          {showPasswords[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  variant="outline"
                  className="border-slate-700 text-slate-300"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Settings className="w-4 h-4 mr-2" />
                  )}
                  Probar Conexión
                </Button>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className={`bg-gradient-to-r ${selectedIntegration.color} hover:opacity-90 flex-1`}
                >
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Guardar y Conectar
                </Button>
              </div>
            </div>
          ) : (
            // Lista de integraciones
            <div className="grid md:grid-cols-2 gap-4">
              {integrations.map(integration => (
                <div
                  key={integration.id}
                  className={`bg-slate-800/50 border rounded-xl p-4 transition-all ${
                    integration.connected 
                      ? 'border-green-500/50' 
                      : 'border-slate-700 hover:border-violet-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <h3 className="text-white font-medium">{integration.name}</h3>
                        {integration.connected && (
                          <span className="text-xs text-green-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Conectado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-4">{integration.description}</p>
                  
                  <div className="flex gap-2">
                    {integration.connected ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedIntegration(integration)}
                          className="flex-1 border-slate-700 text-slate-300"
                        >
                          <Settings className="w-4 h-4 mr-1" />
                          Configurar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisconnect(integration.id)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Unplug className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSelectedIntegration(integration)}
                        className={`flex-1 bg-gradient-to-r ${integration.color} hover:opacity-90`}
                      >
                        <Link2 className="w-4 h-4 mr-1" />
                        Conectar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!selectedIntegration && !isLoading && (
          <div className="p-4 border-t border-slate-800 bg-slate-800/30">
            <p className="text-xs text-slate-500 text-center">
              Las credenciales se guardan encriptadas en tu cuenta
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
