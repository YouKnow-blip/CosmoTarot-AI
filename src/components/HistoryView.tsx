import React, { useState } from "react";
import { ArrowLeft, Trash2, Calendar, FileText, Compass, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { HistoryRecord } from "../types";
import { TAROT_CARDS } from "../data/tarotData";
import { triggerVibration } from "../utils/magicEffects";

interface HistoryViewProps {
  history: HistoryRecord[];
  onClearHistory: () => void;
  onBack: () => void;
}

export default function HistoryView({
  history,
  onClearHistory,
  onBack
}: HistoryViewProps) {

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggleExpanded = (id: string) => {
    triggerVibration("light");
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleClear = () => {
    if (confirm("Вы действительно желаете навсегда стереть астральную память о прошлых раскладах? Это действие необратимо.")) {
      triggerVibration("heavy");
      onClearHistory();
    }
  };

  // Human date converter (Russian month format)
  const formatReadableDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hour = date.getHours().toString().padStart(2, "0");
      const min = date.getMinutes().toString().padStart(2, "0");
      return `${day} ${month} ${year}, ${hour}:${min}`;
    } catch (_) {
      return "Ранее";
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in max-w-md mx-auto relative pb-10">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-left">
          <button 
            onClick={() => { triggerVibration("light"); onBack(); }}
            className="p-2 border border-[#ffd700]/15 rounded-xl bg-[#0d041a]/40 text-[#e0d8cf] hover:text-[#ffd700] hover:border-[#ffd700]/30 transition-all duration-300 active:scale-95"
            aria-label="Назад"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h2 className="font-serif font-semibold text-lg text-[#ffd700] tracking-wide">Архив раскладов</h2>
            <span className="text-[#e0d8cf]/70 text-xs font-serif font-light">Хроники предсказаний Вашей судьбы</span>
          </div>
        </div>

        {/* Clear memory trigger */}
        {history.length > 0 && (
          <button 
            onClick={handleClear}
            className="p-2 border border-red-500/15 rounded-xl bg-red-950/30 text-rose-400 hover:bg-red-950/50 hover:text-red-300 hover:border-red-500/30 transition-all active:scale-95"
            title="Очистить архив"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. List or Empty State */}
      {history.length === 0 ? (
        <div className="bg-[#0d041a]/60 border border-[#ffd700]/15 rounded-2xl p-8 flex flex-col items-center justify-center gap-5 text-center min-h-[300px]">
          <div className="p-3.5 bg-[#050208] rounded-full border border-[#ffd700]/10 text-[#ffd700]/50">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-1.5 animate-pulse">
            <h3 className="font-serif font-semibold text-base text-[#ffd700]">Астральная память чиста</h3>
            <p className="text-[#e0d8cf]/70 text-xs font-serif font-light px-5 leading-relaxed">
              Вы еще не совершили ни одного расклада. Ваши сеансы прорицания будут запечатлены здесь, чтобы Вы могли возвращаться к ним в любой момент времени.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 max-h-[500px] overflow-y-auto pr-1">
          {history.map((record) => {
            const isExpanded = expandedId === record.id;
            
            return (
              <div 
                key={record.id}
                className="bg-[#0d041a]/60 rounded-2xl border border-[#ffd700]/15 hover:border-[#ffd700]/30 hover:shadow-[0_0_20px_rgba(188,19,254,0.05)] transition-all text-left overflow-hidden"
              >
                {/* Header item preview summary clickable */}
                <div 
                  onClick={() => handleToggleExpanded(record.id)}
                  className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[#ffd700] font-serif font-semibold text-sm">{record.spreadName}</span>
                    <span className="text-[10px] text-[#e0d8cf]/50 flex items-center gap-1 font-sans">
                      <Calendar className="w-3" /> {formatReadableDate(record.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-serif font-light tracking-wider text-[#ffd700] bg-[#050208] border border-[#ffd700]/15 px-2.5 py-1 rounded">
                      {record.cards.length} {record.cards.length === 1 ? "карточка" : "карты"}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>

                {/* Expanded state lists */}
                {isExpanded && (
                  <div className="border-t border-[#ffd700]/10 px-4.5 pb-4 pt-3.5 bg-[#050208]/40 flex flex-col gap-3 animate-fade-in text-xs text-[#e0d8cf]/80">
                    <span className="text-[9px] font-sans uppercase tracking-widest text-[#ffd700]/70 font-semibold">Выпавшие сакральные символы:</span>
                    
                    <div className="flex flex-col gap-2 pt-1">
                      {record.cards.map((c, idx) => {
                        const originalCard = TAROT_CARDS.find(tc => tc.id === c.cardId);
                        if (!originalCard) return null;
                        
                        return (
                          <div 
                            key={idx}
                            className="bg-[#0d041a]/40 border border-[#ffd700]/10 rounded-xl p-2.5 flex items-center justify-between gap-3"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] text-[#ffd700] font-serif font-light">{c.positionName}</span>
                              <span className="font-serif font-semibold text-[#e0d8cf] text-xs mt-0.5">{originalCard.nameRu}</span>
                            </div>
                            <span className={`text-[9.5px] font-serif font-light uppercase ${c.isReversed ? "text-[#bc13fe]" : "text-[#ffd700]"}`}>
                              {c.isReversed ? "Перевернутая" : "Прямая"}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer check log */}
                    <div className="text-[9px] font-mono text-gray-600 mt-2 text-center select-all">
                      UUID: {record.id}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
