"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  History,
  ChevronRight,
  Trash2,
  Clock,
  FileText,
  X
} from "lucide-react";
import { GenerationResult } from "@/app/page";
import { useLanguage } from "@/lib/language-context";

export interface HistoryItem {
  id: string;
  timestamp: Date;
  requirement: string;
  result: GenerationResult;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onSelect, onDelete, onClear }: HistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  if (history.length === 0) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 border-slate-700 bg-slate-900/90 backdrop-blur-sm text-slate-300 hover:bg-slate-800 hover:text-white shadow-lg"
      >
        <History className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">{t.history}</span>
        <span className="ml-1 px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">
          {history.length}
        </span>
      </Button>

      {/* Slide-out Panel */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 
        bg-slate-900/95 backdrop-blur-md border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-violet-400" />
            <h2 className="font-semibold text-white">{t.history}</h2>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <Button
                onClick={onClear}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* History Items */}
        <div className="overflow-y-auto h-[calc(100vh-65px)] p-2">
          {history.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
              onSelect={() => {
                onSelect(item);
                setIsOpen(false);
              }}
              onDelete={() => onDelete(item.id)}
              t={t}
            />
          ))}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

interface HistoryCardProps {
  item: HistoryItem;
  onSelect: () => void;
  onDelete: () => void;
  t: any;
}

function HistoryCard({ item, onSelect, onDelete, t }: HistoryCardProps) {
  const timeAgo = getTimeAgo(item.timestamp, t);
  const preview = item.requirement.slice(0, 80) + (item.requirement.length > 80 ? '...' : '');

  return (
    <div className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg p-3 mb-2 cursor-pointer transition-all duration-200">
      <div onClick={onSelect}>
        {/* Time */}
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </div>

        {/* Preview */}
        <p className="text-sm text-slate-300 line-clamp-2 mb-2">
          {preview}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <FileText className="w-3 h-3" />
            {item.result.testCases.length} {t.cases}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-500 ml-auto group-hover:text-violet-400 transition-colors" />
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

function getTimeAgo(date: Date, t: any): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (diffInSeconds < 60) return t.timeAgoMoment;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${t.timeAgoMinutes}`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${t.timeAgoHours}`;
  return `${Math.floor(diffInSeconds / 86400)} ${t.timeAgoDays}`;
}
