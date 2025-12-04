"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Star,
  Edit3,
  Save,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { TestCase } from "@/app/page";
import { useToast } from "@/components/Toast";
import { useLanguage } from "@/lib/language-context";

interface EditableTestCaseProps {
  testCase: TestCase;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCopy: () => void;
  onFavorite: () => void;
  onUpdate: (updated: TestCase) => void;
  onRegenerate: (testCase: TestCase) => Promise<TestCase | null>;
  isCopied: boolean;
  isFavorited: boolean;
  canFavorite: boolean;
}

export function EditableTestCase({
  testCase,
  isExpanded,
  onToggleExpand,
  onCopy,
  onFavorite,
  onUpdate,
  onRegenerate,
  isCopied,
  isFavorited,
  canFavorite,
}: EditableTestCaseProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [editedCase, setEditedCase] = useState<TestCase>(testCase);

  const handleEdit = () => {
    setEditedCase(testCase);
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(editedCase);
    setIsEditing(false);
    showToast("Caso actualizado", "success");
  };

  const handleCancel = () => {
    setEditedCase(testCase);
    setIsEditing(false);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const regenerated = await onRegenerate(testCase);
      if (regenerated) {
        setEditedCase(regenerated);
        onUpdate(regenerated);
        showToast("Caso regenerado", "success", <RefreshCw className="w-4 h-4" />);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...editedCase.steps];
    newSteps[index] = value;
    setEditedCase({ ...editedCase, steps: newSteps });
  };

  const addStep = () => {
    setEditedCase({ ...editedCase, steps: [...editedCase.steps, ""] });
  };

  const removeStep = (index: number) => {
    const newSteps = editedCase.steps.filter((_, i) => i !== index);
    setEditedCase({ ...editedCase, steps: newSteps });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono">{testCase.id}</span>
          <span className="text-white font-medium text-left">{testCase.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`text-xs ${
              testCase.type === "Positivo"
                ? "border-green-500/50 text-green-400"
                : testCase.type === "Negativo"
                ? "border-red-500/50 text-red-400"
                : "border-yellow-500/50 text-yellow-400"
            }`}
          >
            {testCase.type}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs ${
              testCase.priority === "Alta"
                ? "border-red-500/50 text-red-400"
                : testCase.priority === "Media"
                ? "border-yellow-500/50 text-yellow-400"
                : "border-green-500/50 text-green-400"
            }`}
          >
            {testCase.priority}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3">
          {isEditing ? (
            // Edit Mode
            <>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">{t.preconditions}</label>
                <Textarea
                  value={editedCase.preconditions}
                  onChange={(e) => setEditedCase({ ...editedCase, preconditions: e.target.value })}
                  className="min-h-[60px] bg-slate-800/50 border-slate-700 text-white text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-2 block">{t.steps}</label>
                <div className="space-y-2">
                  {editedCase.steps.map((step, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="text-violet-400 font-mono text-sm mt-2">{i + 1}.</span>
                      <Textarea
                        value={step}
                        onChange={(e) => updateStep(i, e.target.value)}
                        className="min-h-[40px] bg-slate-800/50 border-slate-700 text-white text-sm resize-none flex-1"
                      />
                      <button
                        onClick={() => removeStep(i)}
                        className="p-1 text-slate-500 hover:text-red-400 mt-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <Button
                    onClick={addStep}
                    variant="ghost"
                    size="sm"
                    className="text-violet-400 hover:text-violet-300"
                  >
                    + Agregar paso
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">{t.expectedResult}</label>
                <Textarea
                  value={editedCase.expectedResult}
                  onChange={(e) => setEditedCase({ ...editedCase, expectedResult: e.target.value })}
                  className="min-h-[60px] bg-slate-800/50 border-slate-700 text-white text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-500">
                  <Save className="w-4 h-4 mr-2" />
                  {t.save}
                </Button>
                <Button onClick={handleCancel} variant="ghost" size="sm" className="text-slate-400">
                  <X className="w-4 h-4 mr-2" />
                  {t.cancel}
                </Button>
              </div>
            </>
          ) : (
            // View Mode
            <>
              {testCase.preconditions && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">{t.preconditions}</p>
                  <p className="text-sm text-slate-300">{testCase.preconditions}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-400 mb-2">{t.steps}</p>
                <ol className="space-y-1">
                  {testCase.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-violet-400 font-mono">{i + 1}.</span>
                      <span className="text-slate-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1">{t.expectedResult}</p>
                <p className="text-sm text-green-400">{testCase.expectedResult}</p>
              </div>

              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <Button onClick={onCopy} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-400" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      {t.copy}
                    </>
                  )}
                </Button>

                {canFavorite && (
                  <Button
                    onClick={onFavorite}
                    variant="ghost"
                    size="sm"
                    disabled={isFavorited}
                    className={isFavorited ? "text-yellow-400" : "text-slate-400 hover:text-yellow-400"}
                  >
                    <Star className={`w-4 h-4 mr-2 ${isFavorited ? "fill-yellow-400" : ""}`} />
                    {isFavorited ? t.saved : t.favorite}
                  </Button>
                )}

                <Button onClick={handleEdit} variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400">
                  <Edit3 className="w-4 h-4 mr-2" />
                  {t.edit}
                </Button>

                <Button
                  onClick={handleRegenerate}
                  variant="ghost"
                  size="sm"
                  disabled={isRegenerating}
                  className="text-slate-400 hover:text-violet-400"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Regenerando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {t.regenerate}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
