import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Search, Calendar, User, AlignLeft, AlertCircle, ChevronDown, ChevronUp, Sparkles, HelpCircle, Shield, Award, Zap, Star } from "lucide-react";
import { TelegramUser, SpreadConfig } from "../types";
import { TAROT_CARDS } from "../data/tarotData";
import { triggerVibration } from "../utils/magicEffects";
import TarotCardGraphic from "./TarotCardGraphic";
import { getApiUrl, getActiveApiBaseUrl } from "../utils/apiUrl";

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

interface SavedUser {
  username: string;
  firstName: string;
  stats: {
    energy: number;
    maxEnergy: number;
    totalReadings?: number;
    level?: number;
    experiencePoints?: number;
  };
  isPremium: boolean;
  lastSync: string;
}

interface AdminSpreadsViewProps {
  user: TelegramUser;
  onBack: () => void;
}

export default function AdminSpreadsView({ user, onBack }: AdminSpreadsViewProps) {
  const [activeTab, setActiveTab] = useState<"spreads" | "users">("spreads");
  const [spreads, setSpreads] = useState<SavedSpread[]>([]);
  const [users, setUsers] = useState<SavedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  
  // Custom manual energy value field states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [customEnergyValue, setCustomEnergyValue] = useState("");
  const [apiOverride, setApiOverride] = useState(localStorage.getItem("cosmo_tarot_api_override") || "");

  const cleanUsername = (user.username || "").trim().toLowerCase().replace(/^@/, "");
  const isAdmin = cleanUsername === "youknowskii";

  const fetchSpreads = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    triggerVibration("light");

    try {
      const resp = await fetch(getApiUrl(`/api/admin/all-spreads?username=${encodeURIComponent(user.username || "")}`));
      if (!resp.ok) {
        let serverError = "";
        try {
          const errData = await resp.json();
          serverError = errData.error || errData.message || "";
        } catch (_) {}

        if (resp.status === 403) {
          throw new Error(serverError || "Астральный фильтр отклонил доступ. Код 403.");
        }
        throw new Error(serverError || `Ошибка загрузки (${resp.status}): Не удалось прочитать списки раскладов.`);
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

  const fetchUsers = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError("");
    triggerVibration("light");

    try {
      const resp = await fetch(getApiUrl(`/api/admin/all-users?username=${encodeURIComponent(user.username || "")}`));
      if (!resp.ok) {
        let serverError = "";
        try {
          const errData = await resp.json();
          serverError = errData.error || errData.message || "";
        } catch (_) {}
        throw new Error(serverError || `Ошибка загрузки (${resp.status}): Не удалось прогрузить реестр душ.`);
      }
      const data = await resp.json();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Глобальный сбой астрального зеркала.");
    } finally {
      setLoading(false);
    }
  };

  const loadData = () => {
    if (activeTab === "spreads") {
      fetchSpreads();
    } else {
      fetchUsers();
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, user.username]);

  const toggleExpand = (id: string) => {
    triggerVibration("light");
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRefresh = () => {
    loadData();
  };

  // Modify user server-side helper (Grant Energy, Premium, MaxEnergy)
  const handleModifyUser = async (targetUserKey: string, payload: { energy?: number; isPremium?: boolean; maxEnergy?: number }) => {
    triggerVibration("medium");
    try {
      const resp = await fetch(getApiUrl("/api/admin/modify-user"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminUsername: user.username,
          targetUsername: targetUserKey,
          ...payload
        })
      });

      if (!resp.ok) {
        const errData = await resp.json();
        alert(errData.error || "Ошибка изменения состояния пользователя.");
        return;
      }

      // Success
      triggerVibration("success");
      fetchUsers(); // Refresh listings
      setEditingUserId(null);
    } catch (e: any) {
      alert("Сбой сети при изменении: " + e.message);
    }
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

  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(term) ||
      u.firstName.toLowerCase().includes(term)
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
              Панель Жреца <Shield className="w-4 h-4 text-[#ffd700] animate-pulse" />
            </h2>
            <span className="text-[#e0d8cf]/70 text-xs font-serif font-light">Свод судеб и управление энергией</span>
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

      {/* Tabs Switcher Grid */}
      <div className="grid grid-cols-2 p-1 bg-[#050208]/60 border border-[#ffd700]/15 rounded-xl">
        <button
          onClick={() => { triggerVibration("light"); setActiveTab("spreads"); setSearchQuery(""); }}
          className={`py-2 text-xs font-serif rounded-lg transition-all ${
            activeTab === "spreads" 
              ? "bg-[#ffd700]/12 text-[#ffd700] border border-[#ffd700]/25 font-semibold" 
              : "text-[#e0d8cf]/60 hover:text-white"
          }`}
        >
          🔮 Расклады судей ({spreads.length})
        </button>
        <button
          onClick={() => { triggerVibration("light"); setActiveTab("users"); setSearchQuery(""); }}
          className={`py-2 text-xs font-serif rounded-lg transition-all ${
            activeTab === "users" 
              ? "bg-[#ffd700]/12 text-[#ffd700] border border-[#ffd700]/25 font-semibold" 
              : "text-[#e0d8cf]/60 hover:text-white"
          }`}
        >
          👥 Пользователи ({users.length})
        </button>
      </div>

      {/* Quick Counter overview */}
      <div className="grid grid-cols-2 gap-3.5 bg-[#0d041a]/40 border border-[#ffd700]/15 rounded-xl p-3 text-left">
        <div className="flex flex-col">
          <span className="text-[9px] font-sans uppercase tracking-wider text-[#ffd700]/60">
            {activeTab === "spreads" ? "Всего сессий в БД" : "Пользователей в бд"}
          </span>
          <span className="text-xl font-mono font-bold text-white mt-0.5">
            {activeTab === "spreads" ? spreads.length : users.length}
          </span>
        </div>
        <div className="flex flex-col border-l border-[#ffd700]/15 pl-4">
          <span className="text-[9px] font-sans uppercase tracking-wider text-[#ffd700]/60">Найдено фильтром</span>
          <span className="text-xl font-mono font-bold text-[#ffd700] mt-0.5">
            {activeTab === "spreads" ? filteredSpreads.length : filteredUsers.length}
          </span>
        </div>
      </div>

      {/* Interactive Filter Control */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input 
          type="text"
          placeholder={activeTab === "spreads" ? "Искать по нику, имени или раскладу..." : "Искать пользователя по нику или имени..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#050208]/80 border border-[#ffd700]/15 hover:border-[#ffd700]/30 focus:border-[#ffd700]/50 focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-[#e0d8cf] placeholder-gray-600 transition-all"
        />
      </div>

      {/* Loading state indicator */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="relative w-10 h-10 rounded-full border-2 border-[#ffd700]/30 border-t-[#ffd700] animate-spin" />
          <span className="text-xs font-serif font-light text-[#e0d8cf]/70 animate-pulse">Сканирование логов судьбы...</span>
        </div>
      ) : error ? (
        <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <span className="text-xs font-serif font-semibold text-rose-400 block">{error}</span>
          <button 
            onClick={handleRefresh}
            className="mt-3.5 px-4 py-1.5 border border-red-500/30 text-rose-300 text-[11px] font-serif rounded-lg hover:bg-red-950/40"
          >
            Попробовать снова
          </button>
        </div>
      ) : activeTab === "spreads" ? (
        
        // SPREADS TAB LIST
        filteredSpreads.length === 0 ? (
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
                  <div 
                    onClick={() => toggleExpand(item.id)}
                    className="p-4 cursor-pointer select-none flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[#ffd700] font-serif font-semibold text-[10px] bg-[#ffd700]/10 border border-[#ffd700]/25 px-1.5 py-0.5 rounded">
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

                    {item.userQuestion && (
                      <p className="text-[11px] text-[#e0d8cf]/70 line-clamp-1 italic font-serif pl-1 border-l border-[#ffd700]/30">
                        Вопрос: &quot;{item.userQuestion}&quot;
                      </p>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-[#ffd700]/10 px-4.5 pb-4 pt-4 bg-[#050208]/40 flex flex-col gap-4 animate-fade-in text-xs text-[#e0d8cf]/80">
                      {item.userQuestion && (
                        <div className="bg-[#0d041a]/40 border border-[#ffd700]/10 rounded-xl p-3 text-left">
                          <span className="text-[9px] font-sans uppercase tracking-widest text-[#ffd700]/70 font-semibold block mb-1">Вопрос пользователя к картам:</span>
                          <p className="font-serif italic text-xs text-[#ffd700]/90 leading-relaxed pl-1.5 border-l border-[#ffd700]/40">
                            &quot;{item.userQuestion}&quot;
                          </p>
                        </div>
                      )}

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

                      <div className="text-[8px] font-mono text-gray-500 text-center select-all">
                        UUID: {item.id}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        
        // USERS TAB LIST WITH DIRECT ENERGY MANAGEMENT
        filteredUsers.length === 0 ? (
          <div className="bg-[#0d041a]/60 border border-[#ffd700]/15 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center min-h-[250px]">
            <div className="p-3 bg-[#050208] rounded-full border border-[#ffd700]/15 text-[#ffd700]/40">
              <User className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-serif font-semibold text-sm text-[#ffd700]">Пользователи не обнаружены</h3>
              <p className="text-[#e0d8cf]/70 text-[11px] font-serif font-light px-6 leading-relaxed mt-0.5">
                Кажется, проводники с такими реквизитами еще не синхронизировали свою астральную сущность с сервером.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4.5">
            {filteredUsers.map((client) => {
              const clientKey = client.username ? client.username.toLowerCase().replace(/^@/, "") : "";
              const currentEnergy = client.stats?.energy ?? 60;
              const maxEnergy = client.stats?.maxEnergy ?? 100;
              const isUserPrem = !!client.isPremium;
              const isSelf = clientKey === cleanUsername;

              return (
                <div 
                  key={clientKey}
                  className="bg-[#0d041a]/60 rounded-2xl border border-[#ffd700]/15 p-4 flex flex-col gap-4 text-left"
                >
                  {/* Top Stats of specific user */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-semibold text-white text-sm">
                          {client.firstName}
                        </span>
                        {isSelf && (
                          <span className="text-[8px] font-mono uppercase bg-red-950 text-red-400 border border-red-500/30 px-1 py-0.5 rounded leading-none">
                            ЭТО ВЫ
                          </span>
                        )}
                        {isUserPrem && (
                          <span className="flex items-center gap-0.5 text-[8.5px] font-sans font-bold uppercase bg-yellow-950/40 text-[#ffd700] border border-[#ffd700]/30 px-1.5 py-0.5 rounded leading-none">
                            <Star className="w-2.5 h-2.5 fill-current" /> Premium
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-sky-400 font-mono">
                        @{client.username}
                      </span>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-[9px] text-[#e0d8cf]/40 font-mono">
                        Синхр: {formatTime(client.lastSync)}
                      </span>
                      <span className="text-xs font-mono font-bold flex items-center gap-1 text-[#ffd700]">
                        <Zap className="w-3.5 h-3.5 text-[#ffd700] fill-current" /> {currentEnergy} / {maxEnergy}
                      </span>
                    </div>
                  </div>

                  {/* Level & Readings short list */}
                  <div className="grid grid-cols-2 gap-2 bg-[#050208]/40 border-y border-[#ffd700]/10 py-2.5 rounded-lg px-2">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-wider text-gray-500">Пройдено разборов</span>
                      <span className="text-xs font-mono font-bold text-[#e0d8cf]">{client.stats?.totalReadings ?? 0}</span>
                    </div>
                    <div className="flex flex-col border-l border-[#ffd700]/10 pl-3">
                      <span className="text-[8px] uppercase tracking-wider text-gray-500">Уровень души</span>
                      <span className="text-xs font-mono font-bold text-[#e0d8cf]">{client.stats?.level ?? 1} LVL</span>
                    </div>
                  </div>

                  {/* Direct Admin Control Buttons */}
                  <div className="flex flex-col gap-2 pt-1">
                    
                    {/* Grant predefined values list */}
                    <div className="flex flex-wrap gap-1.5 items-center justify-between">
                      <span className="text-[8.5px] font-sans uppercase text-[#ffd700]/70 font-semibold">ВЫДАТЬ ЭНЕРГИЮ:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleModifyUser(client.username, { energy: Math.min(currentEnergy + 10, maxEnergy) })}
                          className="px-2 py-1 bg-yellow-950/20 text-[#ffd700] border border-[#ffd700]/30 rounded text-[9.5px] hover:bg-yellow-950/40 transition active:scale-90"
                        >
                          +10 🔋
                        </button>
                        <button
                          onClick={() => handleModifyUser(client.username, { energy: Math.min(currentEnergy + 50, maxEnergy) })}
                          className="px-2 py-1 bg-yellow-950/20 text-[#ffd700] border border-[#ffd700]/30 rounded text-[9.5px] hover:bg-yellow-950/40 transition active:scale-90"
                        >
                          +50 🔋
                        </button>
                        <button
                          onClick={() => handleModifyUser(client.username, { energy: maxEnergy })}
                          className="px-2 py-1 bg-emerald-950/20 text-emerald-400 border border-emerald-500/30 rounded text-[9.5px] hover:bg-emerald-950/40 transition active:scale-90 font-mono font-bold"
                          title="Пополнить до максимума"
                        >
                          MAX
                        </button>
                      </div>
                    </div>

                    {/* Advanced parameters editor */}
                    <div className="flex items-center justify-between gap-2.5 bg-[#050208]/20 p-2 rounded-lg border border-[#ffd700]/10 mt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleModifyUser(client.username, { isPremium: !isUserPrem })}
                          className={`px-3 py-1.5 border rounded-lg text-xs font-serif transition-all active:scale-95 ${
                            isUserPrem 
                              ? "bg-purple-950/30 border-purple-500/40 text-[#bc13fe] hover:bg-purple-950/50" 
                              : "bg-[#0d041a]/40 border-[#ffd700]/30 text-[#ffd700] hover:bg-yellow-950/20"
                          }`}
                        >
                          {isUserPrem ? "👑 Забрать Premium" : "👑 Подарить Premium"}
                        </button>
                      </div>

                      {/* Manual edit trigger */}
                      {editingUserId === clientKey ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <input 
                            type="number"
                            placeholder="Энергия"
                            value={customEnergyValue}
                            onChange={(e) => setCustomEnergyValue(e.target.value)}
                            className="bg-[#050208] border border-[#ffd700]/30 rounded px-1.5 py-1 text-center w-14 text-xs font-mono text-[#ffd700] focus:outline-none"
                            min="0"
                            max="999"
                          />
                          <button
                            onClick={() => {
                              const amount = Number(customEnergyValue);
                              if (isNaN(amount) || amount < 0) return alert("Введите адекватное число.");
                              handleModifyUser(client.username, { energy: amount, maxEnergy: Math.max(maxEnergy, amount) });
                            }}
                            className="px-2 py-1 bg-[#ffd700] text-black text-[9px] rounded font-bold hover:bg-[#ffe55c]"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="px-1.5 py-1 text-gray-500 text-[9px] hover:text-white"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUserId(clientKey);
                            setCustomEnergyValue(String(currentEnergy));
                          }}
                          className="px-2 py-1.5 border border-dashed border-[#e0d8cf]/20 hover:border-[#ffd700]/40 text-[#e0d8cf]/70 hover:text-white rounded-lg text-[10px] font-sans"
                        >
                          Задать точное...
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )
      )}

      {/* 5. API Bridge settings (Astra Bridge) */}
      <div className="bg-[#0d041a]/60 backdrop-blur-md rounded-2xl border border-[#ffd700]/15 p-4 flex flex-col gap-3 text-left shadow-[0_0_25px_rgba(188,19,254,0.06)] mt-2">
        <h3 className="text-xs font-serif font-semibold text-[#ffd700] uppercase tracking-wider flex items-center gap-1.5 leading-none">
          <Sparkles className="w-3.5 h-3.5 text-[#ffd700] animate-pulse" /> Настройка Астрального Моста API (Vercel)
        </h3>
        <p className="text-[10px] text-[#e0d8cf]/70 font-serif leading-relaxed">
          Чтобы данные (расклады, пользователи, энергия) на Vercel синхронизировались в реальном времени, укажите адрес Вашего Cloud Run приложения (сервера API):
        </p>
        <div className="bg-[#050208]/85 border border-[#ffd700]/10 rounded-xl p-2 text-[10px] text-[#ffd700]/90 font-mono select-all flex justify-between items-center gap-1.5 break-all">
          <span className="truncate">https://ais-dev-eoiikp2nxekhxnce2yr25y-199260145316.europe-west1.run.app</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText("https://ais-dev-eoiikp2nxekhxnce2yr25y-199260145316.europe-west1.run.app");
              triggerVibration("success");
              alert("Адрес сервера скопирован в буфер обмена!");
            }}
            className="text-[9px] px-2 py-0.5 border border-[#ffd700]/30 rounded text-white bg-yellow-950/25 hover:bg-yellow-950/40 shrink-0 font-sans cursor-pointer active:scale-95 transition"
          >
            Скопировать
          </button>
        </div>
        <p className="text-[9px] text-rose-300 font-serif leading-none italic">
          ⚠️ Важно: Не вставляйте сюда ссылку на Telegram-бота или WebApp! Нужна только скопированная выше ссылка сервера.
        </p>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={apiOverride}
            onChange={(e) => setApiOverride(e.target.value)}
            placeholder="Вставьте скопированный адрес сервера сюда"
            className="grow bg-[#050208]/80 border border-[#ffd700]/20 rounded-xl px-3 py-2 text-xs text-[#e0d8cf] placeholder-gray-600 focus:outline-none focus:border-[#ffd700]/50 font-mono"
          />
          <button
            onClick={() => {
              const cleaned = apiOverride.trim();
              if (!cleaned) {
                alert("Укажите корректный URL адрес.");
                return;
              }
              if (cleaned.includes("t.me") || cleaned.includes("telegram")) {
                alert("Ошибка: Вы вставили ссылку на Telegram-бота/канал!\n\nСюда нужно вставить адрес сервера базы данных (скопируйте его кнопкой выше и вставьте).");
                return;
              }
              if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
                alert("Ошибка: Адрес сервера должен начинаться с https:// или http://");
                return;
              }
              localStorage.setItem("cosmo_tarot_api_override", cleaned);
              alert("Астральный мост успешно сохранен! Перезагрузка эфира...");
              window.location.reload();
            }}
            className="px-3 bg-gradient-to-r from-[#ffd700] to-amber-500 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-serif font-semibold text-xs rounded-xl active:scale-95 transition-all flex items-center shrink-0"
          >
            Сохранить
          </button>
        </div>
        <div className="flex justify-between items-center text-[9.5px] font-mono mt-0.5 text-[#e0d8cf]/50">
          <span className="truncate max-w-[200px]" title={getActiveApiBaseUrl()}>Активный: {getActiveApiBaseUrl()}</span>
          <button
            onClick={() => {
              localStorage.removeItem("cosmo_tarot_api_override");
              setApiOverride("");
              alert("Астральный мост сброшен на стандартное значение.");
              window.location.reload();
            }}
            className="text-[#ffd700] hover:text-white border-b border-dashed border-[#ffd700]/30 transition"
          >
            Сбросить на авто
          </button>
        </div>
      </div>

    </div>
  );
}
