import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Search, Calendar, User, AlignLeft, AlertCircle, ChevronDown, ChevronUp, Sparkles, HelpCircle } from "lucide-react";
import { TelegramUser, SpreadConfig } from "../types";
import { TAROT_CARDS } from "../data/tarotData";
import { triggerVibration } from "../utils/magicEffects";
import TarotCardGraphic from "./TarotCardGraphic";

interface SavedSpread {
  id: string;
  username: string;
  firstName: string;
  spreadName: string;
  userQuestion?: string;
  selectedCards: {
    nameRu: string;
    nameEn: string;
    isReversed: boolean;
    positionName: string;
  }[];
  readingText?: string;
  timestamp: string;
}

interface AdminSpreadsViewProps {
  user: TelegramUser;
  onBack: () => void;
}

export default function AdminSpreadsView({ user, onBack }: AdminSpreadsViewProps) {
  const [spreads, setSpreads] = useState<SavedSpread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const cleanUsername = (user.username || "").trim().toLowerCase().replace(/^@/, "");
  const isAdmin = cleanUsername === "youknowskii";

  const fetchSpreads = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    triggerVibration("light");

    try {
      const resp = await fetch(`/api/admin/all-spreads?username=${encodeURIComponent(user.username || "")}`);
      if (!resp.ok) {
        if (resp.status === 403) {
          throw new Error("Астральный фильтр отклонил доступ. Код 403.");
        }
        throw new Error("Не удалось загрузить списки раскладов.");
      }
      const data = await resp.json();
      setSpreads(data.spreads || []);
      // Auto expand the first newest spread to look alive
      if (data.spreads && data.spreads.length > 0) {
        setExpandedIds((prev) => ({ ...prev, [data.spreads[0].id]: true }));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Глобальный сбой астрального зеркала.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpreads();
  }, [user.username]);

  const toggleExpand = (id: string) => {
    triggerVibration("light");
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRefresh = () => {
    fetchSpreads();
  };

  // Format readable timestamp
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("ru-RU", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (_) {
      return "Неземное время";
    }
  };

  const filteredSpreads = spreads.filter((s) => {
    const term = searchQuery.toLowerCase();
    return (
      s.username.toLowerCase().includes(term) ||
      s.firstName.toLowerCase().includes(term) ||
      s.spreadName.toLowerCase().includes(term) ||
      (s.userQuestion || "").toLowerCase().includes(term)
    );
  });

  if (!isAdmin) {
    return (
      <div className="w-full flex flex-col gap-6 animate-fade-in max-w-md mx-auto relative text-center py-12">
        <div className="p-4 bg-red-950/20 border-2 border-dashed border-red-500/30 rounded-2xl w-fit mx-auto text-rose-400">
          <AlertCircle className="w-10 h-10 animate-bounce" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-serif font-bold text-lg text-rose-400">Доступ заблокирован</h2>
          <p className="text-[#e0d8cf]/70 text-xs px-6 font-serif font-light leading-relaxed">
            Данный экран доступен исключительно Верховному оракулу с ником <span className="font-mono text-[#ffd700] hover:underline">@YouKnowSkii</span> в Telegram.
          </p>
        </div>
        <button
          onClick={onBack}
          className="mx-auto mt-4 px-6 py-2 border border-[#ffd700]/15 rounded-xl bg-[#0d041a]/40 text-[#ffd700] hover:bg-[#ffd700]/10 transition-all font-serif text-xs"
        >
          Вернуться на главную обитель
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in max-w-md mx-auto relative pb-10">
      
      {/* Navigation Header */}
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
            <h2 className="font-serif font-semibold text-lg text-[#ffd700] tracking-wide flex items-center gap-1.5">
              Зеркало Судеб <Sparkles className="w-4 h-4 text-[#ffd700] animate-pulse" />
            </h2>
            <span className="text-[#e0d8cf]/70 text-xs font-serif font-light">Свод чужих сеансов прорицания</span>
          </div>
        </div>

        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 border border-[#ffd700]/15 rounded-xl bg-[#0d041a]/40 text-[#ffd700] hover:bg-[#ffd700]/10 transition-all active:scale-95"
          title="Синхронизировать эфир"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats Quick Counter */}
      <div className="grid grid-cols-2 gap-3.5 bg-[#0d041a]/40 border border-[#ffd700]/15 rounded-xl p-3 text-left">
        <div className="flex flex-col">
          <span className="text-[9px] font-sans uppercase tracking-wider text-[#ffd700]/60">Всего сессий в БД</span>
          <span className="text-xl font-mono font-bold text-white mt-0.5">{spreads.length}</span>
        </div>
        <div className="flex flex-col border-l border-[#ffd700]/15 pl-4">
          <span className="text-[9px] font-sans uppercase tracking-wider text-[#ffd700]/60">Найдено фильтром</span>
          <span className="text-xl font-mono font-bold text-[#ffd700] mt-0.5">{filteredSpreads.length}</span>
        </div>
      </div>

      {/* Interactive Search Field */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input 
          type="text"
          placeholder="Искать по нику, имени или раскладу..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#050208]/80 border border-[#ffd700]/15 hover:border-[#ffd700]/30 focus:border-[#ffd700]/50 focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#e0d8cf] placeholder-gray-600 transition-all"
        />
      </div>

      {/* Main List Box */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="relative w-10 h-10 rounded-full border-2 border-[#ffd700]/30 border-t-[#ffd700] animate-spin" />
          <span className="text-xs font-serif font-light text-[#e0d8cf]/70 animate-pulse">Считывание астральных логов...</span>
        </div>
      ) : error ? (
        <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6 text-center select-none">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <span className="text-xs font-serif font-semibold text-rose-400 block">{error}</span>
          <button 
            onClick={handleRefresh}
            className="mt-3.5 px-4 py-1.5 border border-red-500/30 text-rose-300 text-[11px] font-serif rounded-lg hover:bg-red-950/40"
          >
            Попробовать снова
          </button>
        </div>
      ) : filteredSpreads.length === 0 ? (
        <div className="bg-[#0d041a]/60 border border-[#ffd700]/15 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center min-h-[250px]">
          <div className="p-3 bg-[#050208] rounded-full border border-[#ffd700]/15 text-[#ffd700]/40">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-serif font-semibold text-sm text-[#ffd700]">История сессий пуста</h3>
            <p className="text-[#e0d8cf]/70 text-[11px] font-serif font-light px-6 leading-relaxed mt-0.5">
              {searchQuery ? "По данному фильтру совпадений в эфире не найдено." : "В космической базе данных еще нет сохраненных разборов пользователей."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredSpreads.map((item) => {
            const isExpanded = !!expandedIds[item.id];
            return (
              <div 
                key={item.id}
                className="bg-[#0d041a]/60 rounded-2xl border border-[#ffd700]/15 hover:border-[#ffd700]/30 hover:shadow-[0_0_20px_rgba(255,215,0,0.03)] transition-all overflow-hidden text-left"
              >
                {/* Header item summary */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 cursor-pointer select-none flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[#ffd700] font-serif font-semibold text-xs bg-[#ffd700]/10 border border-[#ffd700]/25 px-1.5 py-0.5 rounded">
                          {item.firstName}
                        </span>
                        {item.username && item.username !== "anonymous" ? (
                          <span className="text-xs text-sky-400 font-mono font-medium hover:underline">
                            @{item.username}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500 font-mono">Гость</span>
                        )}
                      </div>
                      <span className="text-white text-sm font-serif font-medium mt-1">{item.spreadName}</span>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1.5">
                      <span className="text-[9px] text-[#e0d8cf]/40 font-mono block">
                        {formatTime(item.timestamp)}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Show question overview if present */}
                  {item.userQuestion && (
                    <p className="text-[11px] text-[#e0d8cf]/70 line-clamp-1 italic font-serif pl-1 border-l border-purple-500/30">
                      Вопрос: &quot;{item.userQuestion}&quot;
                    </p>
                  )}
                </div>

                {/* Expanded active details lists */}
                {isExpanded && (
                  <div className="border-t border-[#ffd700]/10 px-4.5 pb-4 pt-4 bg-[#050208]/40 flex flex-col gap-4 animate-fade-in text-xs text-[#e0d8cf]/80">
                    
                    {/* Full detailed Question */}
                    {item.userQuestion && (
                      <div className="bg-[#0d041a]/40 border border-[#ffd700]/10 rounded-xl p-3 text-left">
                        <span className="text-[9px] font-sans uppercase tracking-widest text-[#ffd700]/70 font-semibold block mb-1">Вопрос пользователя к картам:</span>
                        <p className="font-serif italic text-xs text-[#ffd700]/90 leading-relaxed pl-1.5 border-l border-[#ffd700]/40">
                          &quot;{item.userQuestion}&quot;
                        </p>
                      </div>
                    )}

                    {/* Flipped symbols layout lists */}
                    <div className="flex flex-col gap-2.5">
                      <span className="text-[9px] font-sans uppercase tracking-widest text-[#ffd700]/70 font-semibold">Список выпавших арканов:</span>
                      <div className="flex flex-col gap-2">
                        {item.selectedCards.map((c, idx) => {
                          const originalCard = TAROT_CARDS.find(tc => tc.nameRu === c.nameRu || tc.nameEn === c.nameEn);
                          
                          return (
                            <div 
                              key={idx}
                              className="bg-[#0d041a]/40 border border-[#ffd700]/10 rounded-xl p-2.5 flex items-center justify-between gap-3 text-left"
                            >
                              <div className="flex items-center gap-3">
                                {originalCard && (
                                  <div className="shrink-0 scale-90 -my-1 -mx-0.5">
                                    <TarotCardGraphic
                                      cardId={originalCard.id}
                                      nameRu={originalCard.nameRu}
                                      nameEn={originalCard.nameEn}
                                      isReversed={c.isReversed}
                                      isFlipped={true}
                                      size="sm"
                                    />
                                  </div>
                                )}
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[9px] text-[#ffd700] font-serif font-light">{c.positionName}</span>
                                  <span className="font-serif font-semibold text-[#e0d8cf] text-[11px]">{c.nameRu}</span>
                                </div>
                              </div>
                              <span className={`text-[9px] font-serif font-light uppercase px-1.5 py-0.5 rounded ${c.isReversed ? "bg-purple-950/30 text-[#bc13fe] border border-[#bc13fe]/20" : "bg-yellow-950/30 text-[#ffd700] border border-[#ffd700]/20"}`}>
                                {c.isReversed ? "Перев." : "Прямая"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Interpretation text component display */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-sans uppercase tracking-widest text-[#ffd700]/70 font-semibold">Ответ Оракула (AI Трактовка):</span>
                      <div className="bg-[#0d041a]/40 border border-[#ffd700]/10 rounded-xl p-3.5 max-h-[250px] overflow-y-auto font-serif text-[11px] leading-relaxed text-[#e0d8cf] whitespace-pre-wrap select-text scrollbar-thin">
                        {item.readingText ? (
                          item.readingText
                        ) : (
                          <span className="text-gray-600 block text-center py-2 font-light italic">
                            Сессия завершена без запроса текстовой AI расшифровки оракула.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[8px] font-mono text-gray-600 text-center select-all">
                      UUID: {item.id}
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
