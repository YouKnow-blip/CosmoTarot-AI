import React, { useState } from "react";
import { ArrowLeft, Award, Sparkles, BookOpen, User, Edit3, Check, ToggleLeft, ToggleRight, Heart, Star } from "lucide-react";
import { TelegramUser, UserStats } from "../types";
import { TAROT_CARDS } from "../data/tarotData";
import { triggerVibration } from "../utils/magicEffects";

interface ProfileViewProps {
  user: TelegramUser;
  stats: UserStats;
  isPremium: boolean;
  onUpdateMockUser: (updatedUser: Partial<TelegramUser>) => void;
  onTogglePremium: () => void;
  onBack: () => void;
}

export default function ProfileView({
  user,
  stats,
  isPremium,
  onUpdateMockUser,
  onTogglePremium,
  onBack
}: ProfileViewProps) {

  const [activeTab, setActiveTab] = useState<"stats" | "grimoire" | "dev">("stats");
  
  // Dev mode editing helper states
  const [editingName, setEditingName] = useState(user.firstName);
  const [editingUsername, setEditingUsername] = useState(user.username || "");
  const [isSaved, setIsSaved] = useState(false);

  // Encyclopedia filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);

  const handleSaveDevMode = () => {
    triggerVibration("success");
    onUpdateMockUser({
      firstName: editingName,
      username: editingUsername
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const achievementsList = [
    {
      id: "first_sight",
      name: "Первое прозрение",
      desc: "Завершите Ваше первое гадание и соприкоснитесь с силами Таро.",
      icon: <Star className="w-5 h-5 text-amber-400" />,
      unlocked: stats.totalReadings >= 1
    },
    {
      id: "tarot_seeker",
      name: "Посвященный искатель",
      desc: "Проведите свыше 5 детальных раскладов судеб.",
      icon: <Award className="w-5 h-5 text-indigo-400" />,
      unlocked: stats.totalReadings >= 5
    },
    {
      id: "zodiac_harmony",
      name: "Слияние Стихий",
      desc: "Проверьте совместимость имен с партнером для разбора связи душ.",
      icon: <Heart className="w-5 h-5 text-pink-500" fill={stats.totalReadings >= 2 ? "currentColor" : "none" } />,
      unlocked: true // Mocked unlocked for fun engagement
    },
    {
      id: "limitless_spirit",
      name: "Космический Патрон",
      desc: "Активируйте Premium VIP-пакет для безлимитной связи с оракулом.",
      icon: <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />,
      unlocked: isPremium
    }
  ];

  // Selected card inside Grimoire representation
  const activeGrimoireCard = TAROT_CARDS.find(c => c.id === selectedCardId);

  // Filter encyclopedia items
  const filteredGrimoire = TAROT_CARDS.filter(c => 
    c.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in max-w-md mx-auto relative pb-10">
      
      {/* 1. Header Navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => { triggerVibration("light"); onBack(); }}
          className="p-2 border border-[#ffd700]/15 rounded-xl bg-[#0d041a]/40 text-[#e0d8cf] hover:text-[#ffd700] hover:border-[#ffd700]/30 transition-all duration-300 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h2 className="font-serif font-semibold text-lg text-[#ffd700] tracking-wide">Портал Силы</h2>
          <span className="text-[#e0d8cf]/70 text-xs font-serif font-light">Прогресс эзотерических уровней и знаний</span>
        </div>
      </div>

      {/* 2. Visual Tab Controllers */}
      <div className="grid grid-cols-3 gap-1 bg-[#050208]/90 p-1.5 rounded-xl border border-[#ffd700]/15 shrink-0">
        <button
          onClick={() => { triggerVibration("light"); setActiveTab("stats"); }}
          className={`py-2 text-[10px] font-serif tracking-wider font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "stats" ? "bg-gradient-to-r from-[#ffd700] to-amber-500 text-slate-950 shadow-md" : "text-[#e0d8cf]/60 hover:text-[#ffd700]"
          }`}
        >
          <User className="w-3.5 h-3.5" /> Прогресс
        </button>
        <button
          onClick={() => { triggerVibration("light"); setActiveTab("grimoire"); }}
          className={`py-2 text-[10px] font-serif tracking-wider font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "grimoire" ? "bg-gradient-to-r from-[#ffd700] to-amber-500 text-slate-950 shadow-md" : "text-[#e0d8cf]/60 hover:text-[#ffd700]"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" /> Гримуар
        </button>
        <button
          onClick={() => { triggerVibration("light"); setActiveTab("dev"); }}
          className={`py-2 text-[10px] font-serif tracking-wider font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "dev" ? "bg-gradient-to-r from-[#ffd700] to-amber-500 text-slate-950 shadow-md" : "text-[#e0d8cf]/60 hover:text-[#ffd700]"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" /> Тест
        </button>
      </div>

      {/* TAB 1: STATS & PROGRESS & BADGES */}
      {activeTab === "stats" && (
        <div className="flex flex-col gap-5 animate-fade-in">
          {/* Avatar profiling capsule */}
          <div className="bg-[#0d041a]/60 border border-[#ffd700]/15 p-5 rounded-2xl flex flex-col items-center gap-3.5 text-center shadow-[0_0_40px_rgba(188,19,254,0.06)] relative overflow-hidden">
            <div className="relative">
              <img 
                referrerPolicy="no-referrer"
                src={user.photoUrl} 
                alt={user.firstName}
                className="w-20 h-20 rounded-full border-2 border-[#ffd700] object-cover shadow-[0_0_20px_rgba(255,215,0,0.25)]"
              />
              {isPremium && (
                <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#ffd700] to-amber-500 text-slate-950 font-serif font-semibold px-2 py-1 rounded-full border border-[#0d041a] text-[8px] tracking-wider shadow-lg flex items-center gap-0.5">
                  <Sparkles size={8} /> VIP-АККОРД
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <h3 className="font-serif font-semibold text-lg text-[#ffd700]">{user.firstName}</h3>
              <span className="text-[#e0d8cf]/60 text-xs font-sans">@{user.username || "tg_watcher"}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full border-t border-[#ffd700]/10 pt-4 mt-1">
              <div className="text-left font-serif pl-2">
                <span className="text-[#ffd700]/70 text-[10px] font-sans font-semibold block uppercase">Всего раскладов</span>
                <span className="font-semibold text-[#e0d8cf] text-lg mt-1 block">{stats.totalReadings} раз</span>
              </div>
              <div className="text-left font-serif pl-2 border-l border-[#ffd700]/10">
                <span className="text-[#ffd700]/70 text-[10px] font-sans font-semibold block uppercase">Любимый Аркан</span>
                <span className="font-serif font-semibold text-[#ffd700] text-sm mt-1.5 block leading-tight truncate">
                  {stats.favoriteCardId !== null ? TAROT_CARDS[stats.favoriteCardId].nameRu : "Не определен"}
                </span>
              </div>
            </div>
          </div>

          {/* Core Achievements items */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif font-semibold text-base text-[#ffd700] text-left pl-1">Признание Вселенной (Достижения)</h3>
            
            <div className="flex flex-col gap-3">
              {achievementsList.map((ach) => (
                <div 
                  key={ach.id}
                  className={`border p-4 rounded-xl flex items-center gap-4 text-left transition-all ${
                    ach.unlocked 
                    ? "bg-[#0d041a]/40 border-[#ffd700]/15 shadow-[0_4px_15px_-5px_rgba(188,19,254,0.06)]" 
                    : "bg-slate-950/20 border-slate-950/40 opacity-45 select-none"
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${ach.unlocked ? "bg-[#050208]/80 border border-[#ffd700]/15" : "bg-[#050208] border border-slate-950"}`}>
                    {ach.icon}
                  </div>
                  <div className="flex flex-col gap-0.5 grow">
                    <h4 className={`font-serif font-semibold text-sm ${ach.unlocked ? "text-[#ffd700]" : "text-gray-500"}`}>{ach.name}</h4>
                    <p className={`text-[11px] leading-tight font-serif font-light ${ach.unlocked ? "text-[#e0d8cf]/70" : "text-gray-600"}`}>{ach.desc}</p>
                  </div>
                  {ach.unlocked && (
                    <span className="text-[#ffd700] font-serif font-light text-[9px] bg-[#ffd700]/10 px-1.5 py-0.5 rounded border border-[#ffd700]/25">Unlocked</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRIMOIRE / TAROT BOOK OF SECRETS */}
      {activeTab === "grimoire" && (
        <div className="flex flex-col gap-4 animate-fade-in text-left">
          
          {/* Card search inputs */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по Старшим Арканам..."
              className="w-full bg-[#050208]/80 border border-[#ffd700]/15 hover:border-[#ffd700]/30 focus:border-[#ffd700]/50 focus:outline-none p-3.5 rounded-xl text-xs text-[#e0d8cf] font-serif font-light"
            />
          </div>

          {/* Grid list of major arcana */}
          {!selectedCardId ? (
            <div className="grid grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredGrimoire.map((card) => (
                <div
                  key={card.id}
                  onClick={() => { triggerVibration("light"); setSelectedCardId(card.id); }}
                  className="bg-[#0d041a]/60 border border-[#ffd700]/15 hover:border-[#ffd700]/35 hover:shadow-[0_4px_20px_-4px_rgba(188,19,254,0.06)] rounded-xl p-3 flex flex-col gap-2.5 cursor-pointer text-left transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-[9px] text-[#ffd700] font-light bg-[#ffd700]/10 px-1.5 py-0.5 rounded border border-[#ffd700]/20">#{card.id}</span>
                    <span className="font-sans text-[8px] text-purple-400/80 uppercase">{card.nameEn}</span>
                  </div>
                  <h4 className="font-serif font-semibold text-sm text-[#e0d8cf] group-hover:text-[#ffd700]">{card.nameRu}</h4>
                  <p className="text-[#e0d8cf]/60 text-[11px] leading-tight line-clamp-2 italic font-serif font-light">
                    "{card.description}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* Opened Card Detail Encyclopedia sheet */
            activeGrimoireCard && (
              <div className="bg-[#0d041a]/80 backdrop-blur-md rounded-2xl border border-[#ffd700]/25 p-5.5 flex flex-col gap-5.5 animate-fade-in text-left relative">
                
                {/* Close sheet */}
                <button
                  onClick={() => { triggerVibration("light"); setSelectedCardId(null); }}
                  className="px-3 py-1 bg-[#050208] border border-[#ffd700]/15 rounded-xl text-[10px] text-[#e0d8cf] hover:text-[#ffd700] w-fit font-serif font-light block transition-transform active:scale-95"
                >
                  ← Вернуться к списку
                </button>

                <div className="flex gap-4 border-b border-[#ffd700]/10 pb-4">
                  <div className="shrink-0 flex items-center justify-center p-1 bg-[#050208] rounded-xl border border-[#ffd700]/10 shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-[110px] h-[110px] text-[#ffd700]">
                      {/* Simple illustration symbol preview inside encyclo */}
                      <circle cx="50" cy="50" r="45" stroke="rgba(255,215,0,0.1)" strokeWidth="1" fill="none" />
                      <text x="50" y="55" textAnchor="middle" fill="#ffd700" className="font-serif font-semibold text-xl">#{activeGrimoireCard.id}</text>
                    </svg>
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <h3 className="font-serif font-semibold text-lg text-[#ffd700] leading-tight">{activeGrimoireCard.nameRu}</h3>
                    <span className="font-sans text-[9px] tracking-wider text-[#ffd700]/60 uppercase">{activeGrimoireCard.nameEn} • Старший Аркан</span>
                    <p className="text-[#e0d8cf]/80 text-[11px] leading-relaxed italic font-serif font-light">
                       "{activeGrimoireCard.description}"
                    </p>
                  </div>
                </div>

                {/* Meanings areas accordion list */}
                <div className="flex flex-col gap-4">
                  {/* General */}
                  <div className="flex flex-col gap-1 pr-1 border-l-2 border-[#ffd700] pl-2.5">
                    <span className="text-[9px] font-serif text-[#ffd700] font-medium uppercase tracking-wider">Общее предзнаменование</span>
                    <p className="text-[#e0d8cf]/80 text-xs leading-relaxed font-serif font-light">{activeGrimoireCard.meaningGeneral}</p>
                  </div>

                  {/* Love */}
                  <div className="flex flex-col gap-1 pr-1 border-l-2 border-pink-500 pl-2.5">
                    <span className="text-[9px] font-sans text-pink-400 font-bold uppercase tracking-wider">Любовь и Отношения</span>
                    <p className="text-[#e0d8cf]/80 text-xs leading-relaxed font-serif font-light">{activeGrimoireCard.meaningLove}</p>
                  </div>

                  {/* Finance */}
                  <div className="flex flex-col gap-1 pr-1 border-l-2 border-emerald-500 pl-2.5">
                    <span className="text-[9px] font-sans text-emerald-400 font-bold uppercase tracking-wider">Материальные Потоки (Карьера/Финансы)</span>
                    <p className="text-[#e0d8cf]/80 text-xs leading-relaxed font-serif font-light">{activeGrimoireCard.meaningFinance}</p>
                  </div>

                  {/* Advice */}
                  <div className="bg-[#0d041a]/60 border border-[#ffd700]/15 rounded-xl p-3.5 text-xs text-[#e0d8cf] leading-normal font-serif font-light">
                    <span className="font-sans text-[9px] tracking-widest text-[#ffd700]/70 uppercase block font-semibold mb-1">СОВЕТНЫЕ ДИРЕКТИВЫ СВЫШЕ:</span>
                    "{activeGrimoireCard.advice}"
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* TAB 3: DEVELOPER MOCK PROFILE PREVIEW CONFIGURATOR */}
      {activeTab === "dev" && (
        <div className="bg-[#0d041a]/60 backdrop-blur-md rounded-2xl border border-[#ffd700]/15 p-5 flex flex-col gap-5 text-left animate-fade-in font-serif">
          <div className="flex items-center gap-2 border-b border-[#ffd700]/10 pb-3">
            <User className="w-4 h-4 text-[#ffd700]" />
            <h3 className="font-serif font-semibold text-sm text-[#ffd700]">Тестирование профиля</h3>
          </div>

          <p className="text-[#e0d8cf]/80 text-[11px] leading-relaxed font-serif font-light">
            Поскольку Telegram WebApp API локально неактивно напрямую, Вы можете отредактировать имя и никнейм ниже, чтобы убедиться в отзывчивости интерфейса!
          </p>

          <div className="flex flex-col gap-4">
            {/* Input Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dev-name-input" className="text-[9px] font-sans text-[#ffd700]/70 uppercase pl-0.5 font-semibold">Имя пользователя (Тест)</label>
              <input
                id="dev-name-input"
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="w-full bg-[#050208]/80 border border-[#ffd700]/15 hover:border-[#ffd700]/30 focus:border-[#ffd700]/50 focus:outline-none p-2.5 rounded-xl text-xs text-[#e0d8cf] font-serif font-light"
              />
            </div>

            {/* Input UserName */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="dev-username-input" className="text-[9px] font-sans text-[#ffd700]/70 uppercase pl-0.5 font-semibold">Username в Telegram (@)</label>
              <input
                id="dev-username-input"
                type="text"
                value={editingUsername}
                onChange={(e) => setEditingUsername(e.target.value)}
                className="w-full bg-[#050208]/80 border border-[#ffd700]/15 hover:border-[#ffd700]/30 focus:border-[#ffd700]/50 focus:outline-none p-2.5 rounded-xl text-xs text-[#e0d8cf] font-serif font-light"
              />
            </div>

            {/* VIP Toggles */}
            <div className="flex items-center justify-between border-t border-[#ffd700]/10 pt-3 mt-1 cursor-pointer" onClick={onTogglePremium}>
              <div className="flex flex-col text-left gap-0.5">
                <span className="text-xs font-serif font-semibold text-[#e0d8cf] flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-[#ffd700] fill-current" /> Статус Premium VIP</span>
                <span className="text-[9px] text-gray-500 font-sans">Увеличивает макс. лимит энергии до 150 ед.</span>
              </div>
              <div>
                {isPremium ? (
                  <ToggleRight className="w-10 h-10 text-amber-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-gray-600" />
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveDevMode}
            className="w-full bg-gradient-to-r from-[#ffd700] to-amber-500 text-slate-950 font-serif font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1 uppercase tracking-wider"
          >
            {isSaved ? <Check size={14} className="text-green-600" /> : <Edit3 size={13} />}
            {isSaved ? "Профиль обновлен!" : "Применить тестовые данные"}
          </button>
        </div>
      )}

    </div>
  );
}
