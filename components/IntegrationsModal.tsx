"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useToast } from "@/components/Toast";

interface Integration {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  description: string;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: "jira",
    name: "Jira",
    icon: "🔷",
    color: "from-blue-500 to-blue-600",
    connected: false,
    description: "Exporta casos de prueba directamente a Jira como issues o test cases",
    fields: [
      { key: "domain", label: "Dominio Jira", placeholder: "tu-empresa.atlassian.net" },
      { key: "email", label: "Email", placeholder: "tu@email.com" },
      { key: "apiToken", label: "API Token", placeholder: "Tu API token de Jira", type: "password" },
      { key: "projectKey", label: "Clave del Proyecto", placeholder: "PROJ" },
    ],
  },
  {
    id: "trello",
    name: "Trello",
    icon: "📋",
    color: "from-sky-500 to-sky-600",
    connected: false,
    description: "Crea tarjetas en Trello con los casos de prueba generados",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "Tu API Key de Trello" },
      { key: "token", label: "Token", placeholder: "Tu Token de Trello", type: "password" },
      { key: "boardId", label: "ID del Board", placeholder: "ID del tablero" },
      { key: "listId", label: "ID de la Lista", placeholder: "ID de la lista destino" },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    icon: "📝",
    color: "from-gray-600 to-gray-700",
    connected: false,
    description: "Sincroniza casos de prueba con una base de datos de Notion",
    fields: [
      { key: "apiKey", label: "Integration Token", placeholder: "secret_...", type: "password" },
      { key: "databaseId", label: "Database ID", placeholder: "ID de la base de datos" },
    ],
  },
  {
    id: "github",
    name: "GitHub Issues",
    icon: "🐙",
    color: "from-purple-500 to-purple-600",
    connected: false,
    description: "Crea issues en GitHub con los casos de prueba",
    fields: [
      { key: "token", label: "Personal Access Token", placeholder: "ghp_...", type: "password" },
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
    description: "Exporta a Azure DevOps Test Plans",
    fields: [
      { key: "organization", label: "Organización", placeholder: "tu-organizacion" },
      { key: "project", label: "Proyecto", placeholder: "nombre-proyecto" },
      { key: "pat", label: "Personal Access Token", placeholder: "Tu PAT", type: "password" },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    icon: "💬",
    color: "from-green-500 to-emerald-500",
    connected: false,
    description: "Envía notificaciones de casos generados a un canal de Slack",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", placeholder: "https://hooks.slack.com/...", type: "password" },
      { key: "channel", label: "Canal (opcional)", placeholder: "#qa-team" },
    ],
  },
];

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationsModal({ isOpen, onClose }: IntegrationsModalProps) {
  const { showToast } = useToast();
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleConnect = async () => {
    if (!selectedIntegration) return;
    
    // Validar campos requeridos
    const missingFields = selectedIntegration.fields.filter(f => !formData[f.key]?.trim());
    if (missingFields.length > 0) {
      showToast(`Completá todos los campos: ${missingFields.map(f => f.label).join(', ')}`, "error");
      return;
    }

    setIsConnecting(true);
    
    try {
      // Guardar en localStorage (en producción sería en backend/Supabase)
      const savedIntegrations = JSON.parse(localStorage.getItem('testcraft_integrations') || '{}');
      savedIntegrations[selectedIntegration.id] = {
        ...formData,
        connected: true,
        connectedAt: new Date().toISOString(),
      };
      localStorage.setItem('testcraft_integrations', JSON.stringify(savedIntegrations));
      
      // Actualizar estado
      setIntegrations(prev => prev.map(i => 
        i.id === selectedIntegration.id ? { ...i, connected: true } : i
      ));
      
      showToast(`${selectedIntegration.name} conectado exitosamente`, "success");
      setSelectedIntegration(null);
      setFormData({});
    } catch (error) {
      showToast("Error al conectar. Verificá las credenciales.", "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedIntegration) return;
    
    setIsTesting(true);
    
    // Simular test de conexión
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // En producción, aquí iría la llamada real a la API
    const success = Math.random() > 0.3; // 70% éxito para demo
    
    if (success) {
      showToast("Conexión exitosa ✓", "success");
    } else {
      showToast("Error de conexión. Verificá las credenciales.", "error");
    }
    
    setIsTesting(false);
  };

  const handleDisconnect = (integrationId: string) => {
    const savedIntegrations = JSON.parse(localStorage.getItem('testcraft_integrations') || '{}');
    delete savedIntegrations[integrationId];
    localStorage.setItem('testcraft_integrations', JSON.stringify(savedIntegrations));
    
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId ? { ...i, connected: false } : i
    ));
    
    showToast("Integración desconectada", "success");
  };

  // Cargar estado de integraciones al abrir
  useState(() => {
    const saved = JSON.parse(localStorage.getItem('testcraft_integrations') || '{}');
    setIntegrations(prev => prev.map(i => ({
      ...i,
      connected: !!saved[i.id]?.connected
    })));
  });

  if (!isOpen) return null;

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
          {selectedIntegration ? (
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

              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300">
                    Tus credenciales se guardan localmente en tu navegador. 
                    Para mayor seguridad, usá tokens con permisos mínimos.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedIntegration.fields.map(field => (
                  <div key={field.key}>
                    <label className="text-sm text-slate-300 mb-1.5 block">{field.label}</label>
                    <Input
                      type={field.type || "text"}
                      value={formData[field.key] || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
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
                  Conectar {selectedIntegration.name}
                </Button>
              </div>

              {/* Link a documentación */}
              <a
                href={`https://docs.example.com/integrations/${selectedIntegration.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-4"
              >
                <ExternalLink className="w-3 h-3" />
                Ver documentación de {selectedIntegration.name}
              </a>
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
        {!selectedIntegration && (
          <div className="p-4 border-t border-slate-800 bg-slate-800/30">
            <p className="text-xs text-slate-500 text-center">
              ¿Necesitás otra integración? <a href="#" className="text-violet-400 hover:underline">Solicitala aquí</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
