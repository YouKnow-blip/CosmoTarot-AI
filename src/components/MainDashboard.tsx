import React from "react";
import { Sparkles, Calendar, Layers, Heart, User, History, Zap } from "lucide-react";
import { TelegramUser, UserStats } from "../types";
import { triggerVibration } from "../utils/magicEffects";

interface MainDashboardProps {
  user: TelegramUser;
  stats: UserStats;
  onNavigate: (view: "dashboard" | "spreads" | "compatibility" | "profile" | "history" | "one_card" | "admin") => void;
  isPremium: boolean;
  onClaimDailyBonus: () => void;
  dailyClaimed: boolean;
}

export default function MainDashboard({
  user,
  stats,
  onNavigate,
  isPremium,
  onClaimDailyBonus,
  dailyClaimed
}: MainDashboardProps) {

  const handleCardClick = (target: "dashboard" | "spreads" | "compatibility" | "profile" | "history" | "one_card" | "admin") => {
    triggerVibration("medium");
    onNavigate(target);
  };

  const isUserAdmin = (username?: string) => {
    if (!username) return false;
    const clean = username.trim().toLowerCase().replace(/^@/, "");
    return clean === "youknowskii";
  };

  const percentEnergy = (stats.energy / stats.maxEnergy) * 100;

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in p-1 max-w-md mx-auto">
      {/* 1. Header Profile & Mystical Astral Level */}
      <div 
        className="relative overflow-hidden bg-gradient-to-r from-[#1a0b2e]/60 via-[#0d041a]/60 to-[#050208]/60 backdrop-blur-md border border-[#ffd700]/25 rounded-2xl p-5 flex items-center justify-between gap-4"
        style={{ boxShadow: "0 8px 32px 0 rgba(188, 19, 254, 0.12)" }}
      >
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img 
              referrerPolicy="no-referrer"
              src={user.photoUrl} 
              alt={user.firstName} 
              className="w-13 h-13 rounded-full border-2 border-[#ffd700] object-cover"
            />
            {isPremium && (
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#ffd700] to-amber-500 text-[8px] font-bold text-slate-950 px-1 py-0.5 rounded-full border border-slate-950 shadow-md flex items-center gap-0.5">
                <Sparkles size={6} /> VIP
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[#e2e8f0]/70 text-xs">Мир Вам,</span>
              <span className="text-[#ffd700] text-[10px] font-serif italic tracking-wider bg-[#ffd700]/10 px-1.5 py-0.5 rounded border border-[#ffd700]/20">Уровень {stats.level}</span>
            </div>
            <h1 className="font-serif font-semibold text-lg text-[#e0d8cf] tracking-wide leading-tight mt-0.5">
              {user.firstName}
            </h1>
            <span className="text-purple-300/80 text-[10px] tracking-wide mt-0.5">
              {stats.experiencePoints} XP • Посвященный первой ступени
            </span>
          </div>
        </div>

        {/* Energy bar ring */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1">
            <Zap className={`w-3.5 h-3.5 ${stats.energy > 20 ? "text-[#ffd700]" : "text-red-400 animate-pulse"}`} fill="currentColor" />
            <span className="font-mono text-sm font-bold text-white">{stats.energy}<span className="text-white/40 text-[10px]">/{stats.maxEnergy}</span></span>
          </div>
          <div className="w-20 bg-slate-950/60 h-1.5 rounded-full overflow-hidden border border-[#ffd700]/10">
            <div 
              className="bg-gradient-to-r from-[#ffd700] to-[#bc13fe] h-full rounded-full transition-all duration-500"
              style={{ width: `${percentEnergy}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Floating Daily Guidance Deck (Large Hero CTA) */}
      <div 
        className="group relative bg-[#0d041a]/60 backdrop-blur-md border border-[#ffd700]/30 hover:border-[#ffd700]/50 rounded-2xl p-6 flex flex-col items-center gap-5 text-center overflow-hidden cursor-pointer transition-all duration-300"
        onClick={() => handleCardClick("one_card")}
        style={{ boxShadow: "0 0 30px rgba(188, 19, 254, 0.12)" }}
      >
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffd700]/40 to-transparent" />
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#ffd700]/5 rounded-full blur-2xl" />

        {/* Dynamic Card of the Day illustration */}
        <div className="relative w-36 h-24 flex items-center justify-center pt-2">
          {/* Card stack spread styled natively */}
          <div className="absolute w-12 h-20 bg-gradient-to-b from-[#120722] to-[#04010a] border border-[#ffd700]/25 rounded-md transform -rotate-12 translate-x-[-15px] translate-y-[5px] opacity-70 shadow-lg" />
          <div className="absolute w-12 h-20 bg-gradient-to-b from-[#120722] to-[#04010a] border border-[#ffd700]/25 rounded-md transform rotate-12 translate-x-[15px] translate-y-[5px] opacity-70 shadow-lg" />
          <div className="absolute w-12 h-21 bg-gradient-to-b from-[#120722] to-[#04010a] border-2 border-[#ffd700]/40 rounded-md shadow-2xl flex flex-col justify-between p-1 z-10 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(255,215,0,0.3)]">
            <div className="aspect-[1/1] mx-auto opacity-35 mt-1">
              <svg viewBox="0 0 40 40" className="w-5 h-5 text-[#ffd700]">
                <circle cx="20" cy="20" r="18" stroke="currentColor" fill="none" strokeWidth="0.5" />
                <polygon points="20,10 23,17 30,17 25,22 27,29 20,25 13,29 15,22 10,17 17,17" fill="currentColor" />
              </svg>
            </div>
            <span className="text-[6px] font-sans text-[#ffd700] text-center uppercase tracking-widest block font-semibold">CÉLESTE</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="text-[10px] font-serif tracking-widest text-[#ffd700] font-medium uppercase flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ffd700] animate-spin" style={{ animationDuration: "10s" }} /> ОРАКУЛ ДНЯ <Sparkles className="w-3 h-3 text-[#ffd700] animate-spin" style={{ animationDuration: "10s" }} />
          </div>
          <h2 className="font-serif font-semibold italic text-xl text-[#ffd700]">Узнать карту этого дня</h2>
          <p className="text-[#e0d8cf]/80 text-xs px-4 font-serif font-light">
            Твой ежедневный луч света. Сформулируй мысленно свой главный вопрос и притяни карту руководства силы.
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full bg-gradient-to-r from-[#ffd700] to-amber-500 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-semibold text-xs py-2.5 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider font-serif">
          <Calendar className="w-3.5 h-3.5" /> Открыть судьбоносную карту
        </div>
      </div>

      {/* 3. Bento Grid - Spreads, Compatibility, Profile, History */}
      <div className="grid grid-cols-2 gap-4">
        {/* Bento Option: Spreads */}
        <div 
          onClick={() => handleCardClick("spreads")}
          className="group relative h-40 bg-[#0d041a]/60 backdrop-blur-md border border-[#ffd700]/10 hover:border-[#ffd700]/30 rounded-2xl p-4.5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(188,19,254,0.15)]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-[#bc13fe]/10 rounded-xl group-hover:bg-[#bc13fe]/20 transition-all duration-300 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-sans uppercase bg-[#ffd700]/10 text-[#ffd700] px-1.5 py-0.5 rounded border border-[#ffd700]/20">6 схем</span>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <h3 className="font-serif font-semibold text-sm text-[#ffd700] group-hover:text-white transition-colors">Расклады Таро</h3>
            <p className="text-[#e0d8cf]/70 text-[10px] leading-tight font-serif font-light">
              Любовь, Финансы, Кельтский крест и Будущее.
            </p>
          </div>
        </div>

        {/* Bento Option: Compatibility */}
        <div 
          onClick={() => handleCardClick("compatibility")}
          className="group relative h-40 bg-[#0d041a]/60 backdrop-blur-md border border-[#ffd700]/10 hover:border-[#ffd700]/30 rounded-2xl p-4.5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(236,72,153,0.15)]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-pink-500/10 rounded-xl group-hover:bg-pink-500/20 transition-all duration-300 text-pink-400">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-sans uppercase bg-pink-500/15 text-pink-300 px-1.5 py-0.5 rounded border border-pink-500/20">Любовь</span>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <h3 className="font-serif font-semibold text-sm text-[#ffd700] group-hover:text-white transition-colors">Совместимость</h3>
            <p className="text-[#e0d8cf]/70 text-[10px] leading-tight font-serif font-light">
              Резонанс имен и слияние стихий энергий любви.
            </p>
          </div>
        </div>

        {/* Bento Option: History */}
        <div 
          onClick={() => handleCardClick("history")}
          className="group relative h-40 bg-[#0d041a]/60 backdrop-blur-md border border-[#ffd700]/10 hover:border-[#ffd700]/30 rounded-2xl p-4.5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(99,102,241,0.15)]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-all duration-300 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-sans uppercase bg-indigo-500/15 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">Архив</span>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <h3 className="font-serif font-semibold text-sm text-[#ffd700] group-hover:text-white transition-colors">История раскладов</h3>
            <p className="text-[#e0d8cf]/70 text-[10px] leading-tight font-serif font-light">
              История Ваших прошлых предзнаменований судьбы.
            </p>
          </div>
        </div>

        {/* Bento Option: Profile */}
        <div 
          onClick={() => handleCardClick("profile")}
          className="group relative h-40 bg-[#0d041a]/60 backdrop-blur-md border border-[#ffd700]/10 hover:border-[#ffd700]/30 rounded-2xl p-4.5 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(245,158,11,0.15)]"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/20 transition-all duration-300 text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <span className="text-[8px] font-sans uppercase bg-amber-500/15 text-[#ffd700] px-1.5 py-0.5 rounded border border-[#ffd700]/20">Премиум</span>
          </div>
          <div className="flex flex-col gap-1 mt-3">
            <h3 className="font-serif font-semibold text-sm text-[#ffd700] group-hover:text-white transition-colors">Профиль и Сила</h3>
            <p className="text-[#e0d8cf]/70 text-[10px] leading-tight font-serif font-light">
              Достижения, любимая карта и личные уровни магии.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Admin Mirror of Destinies gate */}
      {isUserAdmin(user.username) && (
        <div 
          onClick={() => handleCardClick("admin")}
          className="group relative overflow-hidden bg-gradient-to-r from-[#ffd700]/10 via-[#bc13fe]/10 to-indigo-950/25 border border-dashed border-[#ffd700]/40 rounded-2xl p-4.5 flex items-center justify-between gap-3 text-left cursor-pointer hover:border-[#ffd700] hover:shadow-[0_0_25px_rgba(255,215,0,0.15)] transition-all duration-300 active:scale-[0.98]"
        >
          <div className="flex flex-col">
            <span className="text-xs font-serif font-semibold text-[#ffd700] uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              🔮 ЗЕРКАЛО СУДЕБ (Админ)
            </span>
            <p className="text-[10px] text-[#e0d8cf]/80 mt-1 max-w-[245px] font-serif font-light leading-relaxed">
              Вам доступно вещание из священного эфира. Коснитесь, чтобы созерцать абсолютно все чужие сеансы и предсказания.
            </p>
          </div>
          <div className="p-2.5 bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-xl group-hover:scale-110 transition-transform duration-300 text-[#ffd700]">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Daily energy claims panel */}
      <div className="relative overflow-hidden bg-[#0d041a]/40 border border-[#ffd700]/15 rounded-2xl p-4 flex items-center justify-between gap-3 text-left">
        <div className="flex flex-col">
          <span className="text-xs font-serif font-semibold text-[#ffd700] flex items-center gap-1">✨ Ежедневный дар энергии</span>
          <p className="text-[10px] text-[#e0d8cf]/70 mt-0.5 max-w-[210px] font-serif font-light">Восполни силу на +25 космической энергии раз в день бесплатно.</p>
        </div>
        <button
          onClick={onClaimDailyBonus}
          disabled={dailyClaimed}
          className={`px-3 py-1.5 text-[10px] font-serif font-semibold rounded-lg transition-transform active:scale-95 ${
            dailyClaimed 
            ? "bg-slate-800 text-gray-500 cursor-not-allowed" 
            : "bg-[#bc13fe] text-white shadow-[0_0_12px_rgba(188,19,254,0.4)] animate-pulse"
          }`}
        >
          {dailyClaimed ? "Получено" : "Получить"}
        </button>
      </div>

      {/* Styled Footer for beautiful layout */}
      <p className="text-center font-serif text-[8.5px] tracking-widest text-[#ffd700]/40 uppercase mt-2">
        CosmoTarot v1.4.0 • Сплетено в созвездии AI
      </p>
    </div>
  );
}
