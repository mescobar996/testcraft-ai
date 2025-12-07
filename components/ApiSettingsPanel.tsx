"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Webhook,
  Settings,
  ExternalLink,
  AlertCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Code,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: { generate: boolean; history: boolean };
  rate_limit_per_hour: number;
  total_requests: number;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered_at: string | null;
  last_status_code: number | null;
  total_deliveries: number;
  failed_deliveries: number;
  created_at: string;
}

export function ApiSettingsPanel() {
  const { user, session } = useAuth();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"keys" | "webhooks" | "docs">("keys");
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [creatingKey, setCreatingKey] = useState(false);
  
  // Webhooks state
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [loadingWebhooks, setLoadingWebhooks] = useState(false);
  const [creatingWebhook, setCreatingWebhook] = useState(false);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch API keys
  const fetchApiKeys = async () => {
    if (!session?.access_token) return;
    
    setLoadingKeys(true);
    try {
      const res = await fetch("/api/keys", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setApiKeys(data.keys || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
    } finally {
      setLoadingKeys(false);
    }
  };

  // Fetch webhooks
  const fetchWebhooks = async () => {
    if (!session?.access_token) return;
    
    setLoadingWebhooks(true);
    try {
      const res = await fetch("/api/webhooks", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
    } finally {
      setLoadingWebhooks(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchApiKeys();
      fetchWebhooks();
    }
  }, [isOpen, user]);

  // Create API key
  const handleCreateKey = async () => {
    if (!newKeyName.trim() || !session?.access_token) return;
    
    setCreatingKey(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: newKeyName }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setNewlyCreatedKey(data.key);
        setNewKeyName("");
        fetchApiKeys();
        showToast("API Key creada exitosamente", "success");
      } else {
        showToast(data.error || "Error al crear API Key", "error");
      }
    } catch (error) {
      showToast("Error al crear API Key", "error");
    } finally {
      setCreatingKey(false);
    }
  };

  // Delete API key
  const handleDeleteKey = async (keyId: string) => {
    if (!session?.access_token) return;
    
    try {
      const res = await fetch(`/api/keys?id=${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      if (res.ok) {
        fetchApiKeys();
        showToast("API Key eliminada", "success");
      }
    } catch (error) {
      showToast("Error al eliminar API Key", "error");
    }
  };

  // Toggle API key
  const handleToggleKey = async (keyId: string, isActive: boolean) => {
    if (!session?.access_token) return;
    
    try {
      const res = await fetch("/api/keys", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: keyId, is_active: isActive }),
      });
      
      if (res.ok) {
        fetchApiKeys();
      }
    } catch (error) {
      showToast("Error al actualizar API Key", "error");
    }
  };

  // Create webhook
  const handleCreateWebhook = async () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim() || !session?.access_token) return;
    
    setCreatingWebhook(true);
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: newWebhookName, url: newWebhookUrl }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setNewWebhookName("");
        setNewWebhookUrl("");
        fetchWebhooks();
        showToast("Webhook creado exitosamente", "success");
      } else {
        showToast(data.error || "Error al crear webhook", "error");
      }
    } catch (error) {
      showToast("Error al crear webhook", "error");
    } finally {
      setCreatingWebhook(false);
    }
  };

  // Delete webhook
  const handleDeleteWebhook = async (webhookId: string) => {
    if (!session?.access_token) return;
    
    try {
      const res = await fetch(`/api/webhooks?id=${webhookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      
      if (res.ok) {
        fetchWebhooks();
        showToast("Webhook eliminado", "success");
      }
    } catch (error) {
      showToast("Error al eliminar webhook", "error");
    }
  };

  // Toggle webhook
  const handleToggleWebhook = async (webhookId: string, isActive: boolean) => {
    if (!session?.access_token) return;
    
    try {
      const res = await fetch("/api/webhooks", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: webhookId, is_active: isActive }),
      });
      
      if (res.ok) {
        fetchWebhooks();
      }
    } catch (error) {
      showToast("Error al actualizar webhook", "error");
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast("Copiado al portapapeles", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Nunca";
    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700"
      >
        <Settings className="w-4 h-4 mr-2" />
        API
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">API & Integraciones</h2>
                  <p className="text-sm text-slate-400">Configura API keys y webhooks</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab("keys")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "keys"
                    ? "text-violet-400 border-b-2 border-violet-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Key className="w-4 h-4 inline mr-2" />
                API Keys
              </button>
              <button
                onClick={() => setActiveTab("webhooks")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "webhooks"
                    ? "text-violet-400 border-b-2 border-violet-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Webhook className="w-4 h-4 inline mr-2" />
                Webhooks
              </button>
              <button
                onClick={() => setActiveTab("docs")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "docs"
                    ? "text-violet-400 border-b-2 border-violet-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4 inline mr-2" />
                Documentación
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* API Keys Tab */}
              {activeTab === "keys" && (
                <div className="space-y-4">
                  {/* Create new key */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nombre de la API Key (ej: Mi App)"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="flex-1 bg-slate-800/50 border-slate-700 text-white"
                    />
                    <Button
                      onClick={handleCreateKey}
                      disabled={!newKeyName.trim() || creatingKey}
                      className="bg-violet-600 hover:bg-violet-500"
                    >
                      {creatingKey ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Newly created key warning */}
                  {newlyCreatedKey && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-yellow-400 font-medium text-sm">
                            ¡Guardá esta API Key ahora!
                          </p>
                          <p className="text-yellow-300/70 text-xs mt-1">
                            No podrás verla de nuevo después de cerrar este mensaje.
                          </p>
                          <div className="flex items-center gap-2 mt-3 bg-slate-800 rounded-lg p-2">
                            <code className="text-green-400 text-sm flex-1 font-mono break-all">
                              {newlyCreatedKey}
                            </code>
                            <button
                              onClick={() => copyToClipboard(newlyCreatedKey, "new-key")}
                              className="p-2 hover:bg-slate-700 rounded"
                            >
                              {copiedId === "new-key" ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>
                          <button
                            onClick={() => setNewlyCreatedKey(null)}
                            className="text-xs text-slate-400 hover:text-white mt-2"
                          >
                            Entendido, ya la guardé
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Keys list */}
                  {loadingKeys ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                    </div>
                  ) : apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No tenés API keys creadas</p>
                      <p className="text-sm mt-1">Creá una para empezar a usar la API</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {apiKeys.map((key) => (
                        <div
                          key={key.id}
                          className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Key className={`w-5 h-5 ${key.is_active ? "text-green-400" : "text-slate-500"}`} />
                              <div>
                                <p className="text-white font-medium">{key.name}</p>
                                <code className="text-slate-400 text-xs font-mono">
                                  {key.key_prefix}
                                </code>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={key.is_active ? "border-green-500/50 text-green-400" : "border-slate-600 text-slate-500"}
                              >
                                {key.is_active ? "Activa" : "Inactiva"}
                              </Badge>
                              <button
                                onClick={() => handleToggleKey(key.id, !key.is_active)}
                                className="p-2 hover:bg-slate-700 rounded"
                              >
                                {key.is_active ? (
                                  <ToggleRight className="w-5 h-5 text-green-400" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5 text-slate-500" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteKey(key.id)}
                                className="p-2 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                            <span>{key.total_requests} requests</span>
                            <span>Último uso: {formatDate(key.last_used_at)}</span>
                            <span>Límite: {key.rate_limit_per_hour}/hora</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Webhooks Tab */}
              {activeTab === "webhooks" && (
                <div className="space-y-4">
                  {/* Create new webhook */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Nombre del webhook (ej: Mi Servidor)"
                      value={newWebhookName}
                      onChange={(e) => setNewWebhookName(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="URL del webhook (https://...)"
                        value={newWebhookUrl}
                        onChange={(e) => setNewWebhookUrl(e.target.value)}
                        className="flex-1 bg-slate-800/50 border-slate-700 text-white"
                      />
                      <Button
                        onClick={handleCreateWebhook}
                        disabled={!newWebhookName.trim() || !newWebhookUrl.trim() || creatingWebhook}
                        className="bg-violet-600 hover:bg-violet-500"
                      >
                        {creatingWebhook ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Webhooks list */}
                  {loadingWebhooks ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                    </div>
                  ) : webhooks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Webhook className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No tenés webhooks configurados</p>
                      <p className="text-sm mt-1">Creá uno para recibir casos automáticamente</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {webhooks.map((webhook) => (
                        <div
                          key={webhook.id}
                          className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Webhook className={`w-5 h-5 ${webhook.is_active ? "text-green-400" : "text-slate-500"}`} />
                              <div>
                                <p className="text-white font-medium">{webhook.name}</p>
                                <p className="text-slate-400 text-xs truncate max-w-[300px]">
                                  {webhook.url}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {webhook.last_status_code && (
                                <Badge
                                  variant="outline"
                                  className={
                                    webhook.last_status_code < 300
                                      ? "border-green-500/50 text-green-400"
                                      : "border-red-500/50 text-red-400"
                                  }
                                >
                                  {webhook.last_status_code}
                                </Badge>
                              )}
                              <button
                                onClick={() => handleToggleWebhook(webhook.id, !webhook.is_active)}
                                className="p-2 hover:bg-slate-700 rounded"
                              >
                                {webhook.is_active ? (
                                  <ToggleRight className="w-5 h-5 text-green-400" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5 text-slate-500" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteWebhook(webhook.id)}
                                className="p-2 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                            <span>{webhook.total_deliveries} envíos</span>
                            <span>{webhook.failed_deliveries} fallidos</span>
                            <span>Último: {formatDate(webhook.last_triggered_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Documentation Tab */}
              {activeTab === "docs" && (
                <div className="space-y-6">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Code className="w-4 h-4 text-violet-400" />
                      Endpoint de Generación
                    </h3>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm">
                      <p className="text-green-400">POST /api/v1/generate</p>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Autenticación</h3>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-sm space-y-1">
                      <p className="text-slate-400"># Opción 1: Header Authorization</p>
                      <p className="text-blue-400">Authorization: Bearer tc_live_xxx...</p>
                      <p className="text-slate-400 mt-2"># Opción 2: Header X-API-Key</p>
                      <p className="text-blue-400">X-API-Key: tc_live_xxx...</p>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Ejemplo de Request</h3>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                      <pre className="text-slate-300">{`curl -X POST https://testcraft-ai-five.vercel.app/api/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: tc_live_xxx..." \\
  -d '{
    "requirement": "Como usuario quiero iniciar sesión con email y contraseña",
    "context": "App React con autenticación JWT",
    "format": "both"
  }'`}</pre>
                    </div>
                    <button
                      onClick={() => copyToClipboard(`curl -X POST https://testcraft-ai-five.vercel.app/api/v1/generate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: TU_API_KEY" \\
  -d '{"requirement": "Tu requisito aquí", "format": "both"}'`, "curl")}
                      className="mt-2 text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      {copiedId === "curl" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      Copiar ejemplo
                    </button>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Respuesta</h3>
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                      <pre className="text-slate-300">{`{
  "success": true,
  "data": {
    "testCases": [
      {
        "id": "TC-001",
        "title": "Login exitoso con credenciales válidas",
        "preconditions": "Usuario registrado en el sistema",
        "steps": ["Ir a la página de login", "..."],
        "expectedResult": "Usuario autenticado correctamente",
        "priority": "Alta",
        "type": "Positivo"
      }
    ],
    "gherkin": "Feature: Login\\n  Scenario: ...",
    "summary": "Se generaron 12 casos de prueba..."
  },
  "meta": {
    "generatedAt": "2025-01-01T00:00:00Z",
    "processingTimeMs": 3500,
    "testCaseCount": 12
  }
}`}</pre>
                    </div>
                  </div>

                  <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
                    <h3 className="text-violet-400 font-medium mb-2 flex items-center gap-2">
                      <Webhook className="w-4 h-4" />
                      Webhooks
                    </h3>
                    <p className="text-slate-300 text-sm">
                      Cuando configures un webhook, cada vez que generes casos de prueba 
                      (desde la web o la API), se enviará automáticamente un POST a tu URL 
                      con los resultados.
                    </p>
                    <p className="text-slate-400 text-xs mt-2">
                      Header de firma: <code className="text-violet-300">X-TestCraft-Signature: sha256=...</code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
