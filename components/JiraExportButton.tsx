"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TestCase } from "@/app/page";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/components/Toast";
import {
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  X
} from "lucide-react";

interface JiraExportButtonProps {
  testCases: TestCase[];
}

interface JiraProject {
  key: string;
  name: string;
}

export function JiraExportButton({ testCases }: JiraExportButtonProps) {
  const { user, isPro } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const supabase = createClientComponentClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendResults, setSendResults] = useState<{
    success: boolean;
    created: number;
    failed: number;
    jiraLinks: string[];
  } | null>(null);

  const checkJiraConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/integrations/config', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (data.jira?.configured) {
        setIsConfigured(true);
        if (data.jira.projects && data.jira.projects.length > 0) {
          setProjects(data.jira.projects);
          setSelectedProjectKey(data.jira.projects[0].key);
        }
      }
    } catch (error) {
      console.error('Error checking Jira config:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (isModalOpen && user && isPro) {
      checkJiraConfig();
    }
  }, [isModalOpen, user, isPro, checkJiraConfig]);

  const handleSendToJira = async () => {
    if (!selectedProjectKey || testCases.length === 0) return;

    setIsSending(true);
    setSendResults(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast("No autorizado", "error");
        return;
      }

      const response = await fetch('/api/integrations/jira', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          testCases,
          projectKey: selectedProjectKey
        })
      });

      const data = await response.json();

      if (data.success) {
        const jiraLinks = data.results.map((r: any) => r.url);
        setSendResults({
          success: true,
          created: data.summary.created,
          failed: data.summary.failed,
          jiraLinks
        });

        showToast(
          `${data.summary.created} ${language === "es" ? "casos enviados a Jira" : "cases sent to Jira"}`,
          "success"
        );

        // Track analytics
        if (typeof window !== 'undefined') {
          const { trackExport } = await import('@/lib/analytics');
          trackExport(user?.id || null, 'gherkin');
        }
      } else {
        showToast(
          language === "es" ? "Error al enviar a Jira" : "Error sending to Jira",
          "error"
        );
      }
    } catch (error) {
      console.error('Error sending to Jira:', error);
      showToast(
        language === "es" ? "Error de conexión con Jira" : "Jira connection error",
        "error"
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!user || !isPro) {
    return (
      <button
        onClick={() => showToast(language === "es" ? "Requiere plan Pro" : "Requires Pro plan", "warning")}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-400 rounded-lg cursor-not-allowed text-sm"
      >
        <Send className="w-4 h-4" />
        {language === "es" ? "Enviar a Jira" : "Send to Jira"}
        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">Pro</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
      >
        <Send className="w-4 h-4" />
        {language === "es" ? "Enviar a Jira" : "Send to Jira"}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {language === "es" ? "Enviar a Jira" : "Send to Jira"}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {testCases.length} {language === "es" ? "casos de prueba" : "test cases"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                </div>
              ) : !isConfigured ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-white mb-4">
                    {language === "es"
                      ? "Jira no está configurado"
                      : "Jira is not configured"}
                  </p>
                  <a
                    href="/settings#integrations"
                    onClick={() => setIsModalOpen(false)}
                    className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {language === "es" ? "Configurar Jira" : "Configure Jira"}
                  </a>
                </div>
              ) : (
                <>
                  {/* Project Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {language === "es" ? "Selecciona el proyecto" : "Select project"}
                    </label>
                    <select
                      value={selectedProjectKey}
                      onChange={(e) => setSelectedProjectKey(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {projects.map(project => (
                        <option key={project.key} value={project.key}>
                          {project.name} ({project.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preview */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-2">
                      {language === "es" ? "Se crearán los siguientes issues:" : "The following issues will be created:"}
                    </p>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {testCases.slice(0, 10).map(tc => (
                        <li key={tc.id} className="text-sm text-slate-300 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            tc.type === "Positivo" ? "bg-green-400" :
                            tc.type === "Negativo" ? "bg-red-400" :
                            "bg-yellow-400"
                          }`} />
                          {tc.id} - {tc.title}
                        </li>
                      ))}
                      {testCases.length > 10 && (
                        <li className="text-xs text-slate-500">
                          +{testCases.length - 10} {language === "es" ? "más" : "more"}
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Send Results */}
                  {sendResults && (
                    <div className={`border rounded-lg p-4 ${
                      sendResults.success
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        {sendResults.success ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <p className="font-medium text-white">
                            {sendResults.created} {language === "es" ? "creados" : "created"}
                            {sendResults.failed > 0 && `, ${sendResults.failed} ${language === "es" ? "fallidos" : "failed"}`}
                          </p>
                        </div>
                      </div>

                      {sendResults.jiraLinks.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 mb-2">
                            {language === "es" ? "Issues creados:" : "Created issues:"}
                          </p>
                          {sendResults.jiraLinks.slice(0, 5).map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {link.split('/').pop()}
                            </a>
                          ))}
                          {sendResults.jiraLinks.length > 5 && (
                            <p className="text-xs text-slate-500">
                              +{sendResults.jiraLinks.length - 5} {language === "es" ? "más" : "more"}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSendToJira}
                      disabled={isSending || !selectedProjectKey}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white py-3 rounded-lg transition-colors"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {language === "es" ? "Enviando..." : "Sending..."}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {language === "es" ? "Enviar ahora" : "Send now"}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors"
                    >
                      {language === "es" ? "Cancelar" : "Cancel"}
                    </button>
                  </div>

                  {/* Info */}
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-xs text-blue-300">
                      💡 {language === "es"
                        ? "Los casos se crearán como Tasks en Jira con etiqueta 'testcraft'"
                        : "Cases will be created as Tasks in Jira with 'testcraft' label"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
