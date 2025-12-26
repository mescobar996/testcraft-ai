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
import { useLanguage } from "@/lib/language-context";

interface Integration {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  descriptionKey: string;
  helpUrl: string;
  fields: { key: string; labelKey: string; placeholderKey: string; type?: string; helpKey?: string }[];
}

const createIntegration = (t: any): Integration[] => [
  {
    id: "jira",
    name: "Jira",
    icon: "🔷",
    color: "from-blue-500 to-blue-600",
    connected: false,
    descriptionKey: "jiraDescription",
    helpUrl: "https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/",
    fields: [
      { key: "domain", labelKey: "organization", placeholderKey: "enterOrganization", helpKey: "organization" },
      { key: "email", labelKey: "emailLabel", placeholderKey: "emailPlaceholder" },
      { key: "apiToken", labelKey: "APIKey", placeholderKey: "enterAPIKey", type: "password", helpKey: "APIKey" },
      { key: "projectKey", labelKey: "projectKey", placeholderKey: "enterProjectKey", helpKey: "projectKey" },
    ],
  },
  {
    id: "trello",
    name: "Trello",
    icon: "📋",
    color: "from-sky-500 to-sky-600",
    connected: false,
    descriptionKey: "trelloDescription",
    helpUrl: "https://trello.com/power-ups/admin",
    fields: [
      { key: "apiKey", labelKey: "APIKey", placeholderKey: "enterAPIKey", helpKey: "APIKey" },
      { key: "token", labelKey: "accessToken", placeholderKey: "enterAccessToken", type: "password", helpKey: "accessToken" },
      { key: "boardId", labelKey: "boardID", placeholderKey: "enterBoardID", helpKey: "boardID" },
      { key: "listId", labelKey: "boardID", placeholderKey: "enterBoardID", helpKey: "boardID" },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    icon: "📝",
    color: "from-gray-600 to-gray-700",
    connected: false,
    descriptionKey: "notionDescription",
    helpUrl: "https://www.notion.so/my-integrations",
    fields: [
      { key: "apiKey", labelKey: "accessToken", placeholderKey: "enterAccessToken", type: "password", helpKey: "accessToken" },
      { key: "databaseId", labelKey: "workspace", placeholderKey: "enterWorkspace", helpKey: "workspace" },
    ],
  },
  {
    id: "github",
    name: "GitHub Issues",
    icon: "🐙",
    color: "from-purple-500 to-purple-600",
    connected: false,
    descriptionKey: "githubDescription",
    helpUrl: "https://github.com/settings/tokens",
    fields: [
      { key: "token", labelKey: "accessToken", placeholderKey: "enterAccessToken", type: "password", helpKey: "accessToken" },
      { key: "owner", labelKey: "organization", placeholderKey: "enterOrganization" },
      { key: "repo", labelKey: "repository", placeholderKey: "enterRepository" },
    ],
  },
  {
    id: "azure",
    name: "Azure DevOps",
    icon: "🔵",
    color: "from-blue-600 to-indigo-600",
    connected: false,
    descriptionKey: "azureDescription",
    helpUrl: "https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate",
    fields: [
      { key: "organization", labelKey: "organization", placeholderKey: "enterOrganization" },
      { key: "project", labelKey: "projectKey", placeholderKey: "enterProjectKey" },
      { key: "pat", labelKey: "accessToken", placeholderKey: "enterAccessToken", type: "password", helpKey: "accessToken" },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    icon: "💬",
    color: "from-green-500 to-emerald-500",
    connected: false,
    descriptionKey: "slackDescription",
    helpUrl: "https://api.slack.com/messaging/webhooks",
    fields: [
      { key: "webhookUrl", labelKey: "webhookURL", placeholderKey: "enterWebhookURL", type: "password", helpKey: "webhookURL" },
      { key: "channel", labelKey: "workspace", placeholderKey: "enterWorkspace", helpKey: "workspace" },
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
  const { t } = useLanguage();
  const [integrations, setIntegrations] = useState(createIntegration(t));
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
      showToast(`${t.emailRequired}: ${missingFields.map(f => t[f.labelKey as keyof typeof t] || f.labelKey).join(', ')}`, "error");
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

        showToast(`${selectedIntegration.name} ${t.connected}`, "success");
        setSelectedIntegration(null);
        setFormData({});
      } else {
        const error = await response.json();
        showToast(error.error || t.connectionError, "error");
      }
    } catch (error) {
      showToast(t.connectionError, "error");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    if (!selectedIntegration || !session?.access_token) return;

    // Primero guardar la configuración
    const missingFields = selectedIntegration.fields.filter(f => !formData[f.key]?.trim());
    if (missingFields.length > 0) {
      showToast(`${t.emailRequired}: ${missingFields.map(f => t[f.labelKey as keyof typeof t] || f.labelKey).join(', ')}`, "error");
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
        showToast(`✓ ${t.connected}${data.project?.name ? `: ${data.project.name}` : ''}`, "success");
      } else {
        const error = await response.json();
        showToast(error.error || t.connectionError, "error");
      }
    } catch (error) {
      showToast(t.connectionError, "error");
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
        showToast(t.notConfigured, "success");
      }
    } catch (error) {
      showToast(t.connectionError, "error");
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
          <h2 className="text-xl font-semibold text-white mb-2">{t.signInButton}</h2>
          <p className="text-slate-400 mb-4">{t.signInWithGoogle}</p>
          <Button onClick={onClose}>{t.cancel}</Button>
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
              <h2 className="text-lg font-semibold text-white">{t.integrationsTitle}</h2>
              <p className="text-sm text-slate-400">{t.integrationsSubtitle}</p>
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
                ← {t.cancel}
              </button>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{selectedIntegration.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedIntegration.name}</h3>
                  <p className="text-slate-400 text-sm">{t[selectedIntegration.descriptionKey as keyof typeof t]}</p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-slate-300">
                    <p>{t.exportDirectly}</p>
                    <a
                      href={selectedIntegration.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {t.documentation}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedIntegration.fields.map(field => (
                  <div key={field.key}>
                    <label className="text-sm text-slate-300 mb-1.5 block">
                      {t[field.labelKey as keyof typeof t] || field.labelKey}
                      {field.helpKey && (
                        <span className="text-slate-500 ml-2 text-xs">({t[field.helpKey as keyof typeof t] || field.helpKey})</span>
                      )}
                    </label>
                    <div className="relative">
                      <Input
                        type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                        value={formData[field.key] || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={t[field.placeholderKey as keyof typeof t] || field.placeholderKey}
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
                  {t.testConnection}
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
                  {t.saveIntegration}
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
                            <Check className="w-3 h-3" /> {t.connected}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm mb-4">{t[integration.descriptionKey as keyof typeof t]}</p>

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
                          {t.configureAPI}
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
                        {t.connected}
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
              {t.exportDirectly}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
