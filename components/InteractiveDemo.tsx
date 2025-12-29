"use client";

import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, FileText, Download } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function InteractiveDemo() {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState("");

  const demoRequirement = t.demoRequirement;

  const demoOutput = [
    {
      title: t.demoCase1Title,
      type: "positivo",
      steps: [
        t.demoCase1Step1,
        t.demoCase1Step2,
        t.demoCase1Step3,
        t.demoCase1Step4
      ]
    },
    {
      title: t.demoCase2Title,
      type: "negativo",
      steps: [
        t.demoCase2Step1,
        t.demoCase2Step2,
        t.demoCase2Step3
      ]
    },
    {
      title: t.demoCase3Title,
      type: "borde",
      steps: [
        t.demoCase3Step1,
        t.demoCase3Step2
      ]
    }
  ];

  useEffect(() => {
    const sequence = async () => {
      // Step 0: Mostrar input vacío
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 1: Empezar a escribir
      setStep(1);
      setIsTyping(true);

      // Simular typing
      for (let i = 0; i <= demoRequirement.length; i++) {
        setTypedText(demoRequirement.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      setIsTyping(false);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Generar (loading)
      setStep(2);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Mostrar resultados
      setStep(3);
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Reiniciar loop
      setStep(0);
      setTypedText("");
    };

    sequence();
    const interval = setInterval(sequence, 13000); // Total duration

    return () => clearInterval(interval);
  }, [demoRequirement]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "positivo": return "text-green-400";
      case "negativo": return "text-red-400";
      case "borde": return "text-yellow-400";
      default: return "text-slate-400";
    }
  };

  return (
    <div className="relative">
      {/* Header con badge */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="px-3 py-1 bg-violet-500/10 border border-violet-500/30 rounded-full text-violet-400 text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {t.interactiveDemo}
        </div>
      </div>

      {/* Demo Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Input Section */}
        <div className="p-6 border-b border-slate-800">
          <label className="block text-sm font-medium text-slate-400 mb-3">
            {t.requirementOrUserStory}
          </label>
          <div className="bg-slate-950 border border-slate-700 rounded-lg p-4 min-h-[100px] font-mono text-sm text-white">
            {typedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </div>

          {/* Generate Button */}
          <div className="mt-4 flex items-center gap-3">
            <button
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                step === 2
                  ? 'bg-violet-600 text-white'
                  : 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${step === 2 ? 'animate-spin' : ''}`} />
              {step === 2 ? t.generating : t.generateTestCases}
            </button>

            {step >= 2 && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                {t.demoAnalyzing}
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-300 font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t.demoGeneratedCases}
            </h3>
            {step === 3 && (
              <button className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                <Download className="w-3 h-3" />
                {t.demoExport}
              </button>
            )}
          </div>

          {step < 3 ? (
            <div className="text-center py-12 text-slate-600">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t.demoCasesWillAppear}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {demoOutput.map((testCase, index) => (
                <div
                  key={index}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-4 opacity-0 animate-fadeIn"
                  style={{ animationDelay: `${index * 200}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                        {testCase.title}
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-slate-800 ${getTypeColor(testCase.type)}`}>
                          {testCase.type}
                        </span>
                      </h4>
                      <ol className="text-sm text-slate-400 space-y-1">
                        {testCase.steps.map((paso, stepIndex) => (
                          <li key={stepIndex} className="flex gap-2">
                            <span className="text-slate-600 font-mono">{stepIndex + 1}.</span>
                            {paso}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              ))}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">3</div>
                  <div className="text-xs text-slate-500">{t.demoCasesGenerated}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">2.1s</div>
                  <div className="text-xs text-slate-500">{t.demoTime}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-400">100%</div>
                  <div className="text-xs text-slate-500">{t.demoCoverage}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA Below Demo */}
      <div className="mt-6 text-center">
        <p className="text-slate-400 text-sm mb-3">
          {t.demoCtaText}
        </p>
        <a
          href="#"
          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          {t.demoCtaButton}
        </a>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
