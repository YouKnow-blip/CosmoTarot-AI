import React, { useState } from "react";
import { ArrowLeft, Heart, Sparkles, RefreshCw, Star, Compass } from "lucide-react";
import { triggerVibration, playFlipSound, playMagicalChime, playCelestialSuccessSound } from "../utils/magicEffects";
import { CompatibilityResult } from "../types";

interface NameCompatibilityViewProps {
  onBack: () => void;
  onConsumeEnergy: (amount: number) => void;
  userEnergy: number;
}

export default function NameCompatibilityView({
  onBack,
  onConsumeEnergy,
  userEnergy
}: NameCompatibilityViewProps) {

  const [nameOne, setNameOne] = useState("");
  const [nameTwo, setNameTwo] = useState("");

  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  
  // Gemini AI reading states
  const [aiReading, setAiReading] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState("");

  // Deterministic algorithm yielding consistent results for identical name inputs
  const calculateCompatibilityScores = (n1: string, n2: string) => {
    const s1 = n1.trim().toLowerCase();
    const s2 = n2.trim().toLowerCase();
    
    let sum1 = 0;
    let sum2 = 0;
    
    // Character byte sums
    for (let i = 0; i < s1.length; i++) sum1 += s1.charCodeAt(i);
    for (let i = 0; i < s2.length; i++) sum2 += s2.charCodeAt(i);
    
    // Seeded random number generator
    const seed = sum1 + sum2;
    const pseudoRandom = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return Math.floor((x - Math.floor(x)) * 41) + 55; // ranges 55% - 95%
    };

    const overallScore = pseudoRandom(1.5);
    const loveRatio = pseudoRandom(3.8);
    const spiritualRatio = pseudoRandom(7.4);

    // Astro elemental combinations
    const elementsList = [
      "Огонь и Воздух (Яркое пламя страсти)",
      "Земля и Огонь (Твердое основание и созидание)",
      "Вода и Воздух (Тонкие душевные течения)",
      "Земля и Вода (Благодатная почва для союза)",
      "Огонь и Огонь (Слияние двух пылких сердец)",
      "Вода и Вода (Бездонный океан чувственности)"
    ];
    const elementIndex = seed % elementsList.length;
    const elementsMatch = elementsList[elementIndex];

    const summaries = [
      "Ваши имена соприкасаются подобно небесным светилам во время парада планет. Глубокий резонанс разума.",
      "Союз, в котором эмоции переплетаются с надежной поддержкой. Это сбалансированное сплетение судеб.",
      "Этот союз благословлен Венерой и Нептуном. Сильная мистическая тяга и обоюдное духовное озарение.",
      "Редкое соединение душ, когда партнеры понимают взаимные порывы без лишних слов. Космический такт."
    ];
    const summary = summaries[seed % summaries.length];

    const recommendations = [
      "Чаще делитесь сокровенными переживаниями и избегайте утаивания мелких обид.",
      "Найдите совместное творческое увлечение, в котором слияние Ваших мыслей родит шедевр.",
      "Доверяйте тонкой интуиции друг друга, отпуская излишний рациональный контроль."
    ];

    return {
      nameOne: n1,
      nameTwo: n2,
      percentage: overallScore,
      lovePercentage: loveRatio,
      spiritualPercentage: spiritualRatio,
      elementsMatch,
      summary,
      recommendations,
      magicalAspect: `Доминирующая вибрация числа: ${(seed % 9) + 1} (Влияние планеты ` + 
        ["Солнце", "Луна", "Юпитер", "Раху", "Меркурий", "Венера", "Кету", "Сатурн", "Марс"][seed % 9] + ")"
    };
  };

  const handleCalculateMatch = () => {
    if (!nameOne.trim() || !nameTwo.trim()) {
      triggerVibration("warning");
      alert("Пожалуйста, заполните оба имени вопрошаемых.");
      return;
    }

    if (userEnergy < 15) {
      triggerVibration("warning");
      alert("Недостаточно энергии для мистической совместимости (Требуется 15 XP)");
      return;
    }

    triggerVibration("heavy");
    onConsumeEnergy(15);
    
    setCalculating(true);
    setResult(null);
    setAiReading("");
    setErrorAi("");
    playFlipSound();

    // Satisfying celestial spinning wheel animation delays
    setTimeout(() => {
      const mathScore = calculateCompatibilityScores(nameOne, nameTwo);
      setResult(mathScore);
      setCalculating(false);
      triggerVibration("success");
      playMagicalChime();
    }, 2800);
  };

  // Connect to Express Gemini-API compatibility route
  const handleGetAiCompatibility = async () => {
    if (!result) return;

    setLoadingAi(true);
    setErrorAi("");
    triggerVibration("medium");

    try {
      const response = await fetch("/api/compatibility-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameOne: result.nameOne,
          nameTwo: result.nameTwo,
          score: result.percentage,
          details: {
            lovePercentage: result.lovePercentage,
            spiritualPercentage: result.spiritualPercentage,
            elementsMatch: result.elementsMatch
          }
        })
      });

      if (!response.ok) {
        throw new Error("Не удалось получить мудрость оракула с сервера.");
      }

      const data = await response.json();
      setAiReading(data.reading || "Духовный оракул остался в глубоком молчании.");
      triggerVibration("success");
      playCelestialSuccessSound();
    } catch (e: any) {
      console.error(e);
      setErrorAi(e.message || "Ошибка соединения с астральной любовной сетью.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleReset = () => {
    triggerVibration("light");
    setNameOne("");
    setNameTwo("");
    setResult(null);
    setAiReading("");
    setErrorAi("");
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in max-w-md mx-auto relative pb-10">
      
      {/* 1. Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => { triggerVibration("light"); onBack(); }}
          className="p-2 border border-[#ffd700]/15 rounded-xl bg-[#0d041a]/40 text-[#e0d8cf] hover:text-[#ffd700] hover:border-[#ffd700]/30 transition-all duration-300 active:scale-95"
          disabled={calculating || loadingAi}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h2 className="font-serif font-semibold text-lg text-[#ffd700] tracking-wide">Резонанс имен</h2>
          <span className="text-[#e0d8cf]/70 text-xs font-serif font-light">Анализ совместимости и союза судеб</span>
        </div>
      </div>

      {/* STAGE A: FORM INPUTS OR SPIN WHEEL */}
      {!result && !calculating && (
        <div className="bg-[#0d041a]/60 backdrop-blur-md rounded-2xl border border-[#ffd700]/15 p-5.5 flex flex-col gap-5 text-left shadow-[0_0_45px_0_rgba(188,19,254,0.08)]">
          <div className="flex items-center gap-2 border-b border-[#ffd700]/10 pb-3">
            <Heart className="w-5 h-5 text-[#ffd700]" fill="currentColor" />
            <span className="font-serif font-semibold text-sm text-[#ffd700]">Ввод персональных знаков</span>
          </div>

          <div className="flex flex-col gap-4">
            {/* Input 1 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name-one-input" className="text-[10px] font-sans tracking-widest text-[#ffd700]/70 uppercase pl-1 font-semibold">Ваше имя</label>
              <input
                id="name-one-input"
                type="text"
                value={nameOne}
                onChange={(e) => setNameOne(e.target.value)}
                placeholder="Например: Екатерина"
                className="w-full bg-[#050208]/80 border border-[#ffd700]/15 hover:border-[#ffd700]/30 focus:border-[#ffd700]/50 focus:outline-none p-3 rounded-xl text-xs text-[#e0d8cf]"
              />
            </div>

            {/* Input 2 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name-two-input" className="text-[10px] font-sans tracking-widest text-[#ffd700]/70 uppercase pl-1 font-semibold">Имя Вашего партнера</label>
              <input
                id="name-two-input"
                type="text"
                value={nameTwo}
                onChange={(e) => setNameTwo(e.target.value)}
                placeholder="Например: Александр"
                className="w-full bg-[#050208]/80 border border-[#ffd700]/15 hover:border-[#ffd700]/30 focus:border-[#ffd700]/50 focus:outline-none p-3 rounded-xl text-xs text-[#e0d8cf]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3.5 pt-2 text-center">
            <button
              onClick={handleCalculateMatch}
              className="w-full bg-gradient-to-r from-[#ffd700] to-amber-500 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-serif font-semibold text-xs py-3 rounded-xl transition-all shadow-[0_4px_20px_rgba(188,19,254,0.15)] active:scale-95 flex items-center justify-center gap-1.5 uppercase tracking-wider"
            >
              <Heart className="w-3.5 h-3.5" fill="currentColor" /> Начать расчет (15 XP)
            </button>
            <span className="text-[10px] text-gray-500 font-mono">Ваша энергия: {userEnergy} XP</span>
          </div>
        </div>
      )}

      {/* STAGE B: SPIN CYCLE LOADER */}
      {calculating && (
        <div className="bg-[#0d041a]/60 backdrop-blur-md rounded-2xl border border-[#ffd700]/15 p-8 flex flex-col items-center gap-6 justify-center h-[340px]">
          {/* Constellation circle spinner with absolute ring lines */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#ffd700]/30 animate-spin" style={{ animationDuration: "14s" }} />
            <div className="absolute inset-1.5 rounded-full border border-[#bc13fe]/20 animate-spin" style={{ animationDuration: "6s", animationDirection: "reverse" }} />
            <div className="absolute inset-3 rounded-full border-2 border-dashed border-[#ffd700]/40 animate-spin" style={{ animationDuration: "3s" }} />
            
            <Compass className="w-10 h-10 text-[#ffd700] animate-pulse" />
          </div>

          <div className="flex flex-col gap-1.5 text-center">
            <span className="font-serif text-[10px] tracking-widest text-[#ffd700] animate-pulse">РАСЧЕТ ЛЮБОВНОЙ МАТРИЦЫ...</span>
            <span className="text-[#e0d8cf]/70 font-serif text-xs font-light">Подгоняем планетарные резонансы имен</span>
          </div>
        </div>
      )}

      {/* STAGE C: ASTRO COMPATIBILITY RESULT */}
      {result && !calculating && (
        <div className="flex flex-col gap-5 text-center animate-fade-in flex-wrap">
          
          {/* Main Percentage ring card */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#0d041a] to-[#050208] border border-[#ffd700]/25 rounded-2xl p-6 shadow-xl flex flex-col items-center gap-4">
            
            <span className="text-[10px] font-serif text-[#ffd700]/70 tracking-widest uppercase font-light">ИТОГОВЫЙ РЕЗОНАНС СОЮЗА</span>
            
            {/* Spinning Neon circular ring diagram */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 rotate-[-90deg]">
                <circle cx="50" cy="50" r="42" stroke="rgba(255, 215, 0, 0.05)" strokeWidth="4" fill="none" />
                <circle 
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="url(#pinkPurpleGrad)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${result.percentage * 2.64} 264`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                
                {/* Gradients */}
                <defs>
                  <linearGradient id="pinkPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffd700" />
                    <stop offset="100%" stopColor="#bc13fe" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="flex flex-col items-center select-none">
                <span className="font-serif font-semibold text-3xl text-[#ffd700]">{result.percentage}%</span>
                <span className="font-serif text-[9px] text-[#e0d8cf]/40 tracking-wider uppercase mt-1">совпадение</span>
              </div>
            </div>

            {/* Names banner */}
            <div className="flex items-center gap-3 mt-1.5 font-serif font-semibold text-lg text-[#e0d8cf]">
              <span className="text-[#ffd700]">{result.nameOne}</span>
              <Heart className="w-5 h-5 text-rose-500 animate-pulse" fill="currentColor" />
              <span className="text-[#ffd700]">{result.nameTwo}</span>
            </div>

            {/* Planetary Aspect Badge */}
            <div className="text-[9px] font-serif font-light bg-[#ffd700]/10 border border-[#ffd700]/20 text-[#ffd700] px-3 py-1 rounded-full">
              {result.magicalAspect}
            </div>
          </div>

          {/* Metric breakdown (Love vs Spiritual) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Love match */}
            <div className="bg-[#0d041a]/60 border border-[#ffd700]/15 rounded-2xl p-4 text-left">
              <span className="text-[9px] font-serif text-[#ffd700] tracking-wider font-light block">ЛЮБОВНЫЙ ОГОНЬ</span>
              <span className="font-serif font-semibold text-lg text-[#e0d8cf] block mt-1">{result.lovePercentage}%</span>
              <div className="w-full bg-[#050208] h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-gradient-to-r from-[#ffd700] to-[#bc13fe] h-full rounded-full" style={{ width: `${result.lovePercentage}%` }} />
              </div>
            </div>

            {/* Spiritual connection */}
            <div className="bg-[#0d041a]/60 border border-[#ffd700]/15 rounded-2xl p-4 text-left">
              <span className="text-[9px] font-serif text-[#ffd700] tracking-wider font-light block">ДУХОВНЫЙ ТАКТ</span>
              <span className="font-serif font-semibold text-lg text-[#e0d8cf] block mt-1">{result.spiritualPercentage}%</span>
              <div className="w-full bg-[#050208] h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-gradient-to-r from-[#ffd700] to-[#bc13fe] h-full rounded-full" style={{ width: `${result.spiritualPercentage}%` }} />
              </div>
            </div>
          </div>

          {/* Elemental merge and recommendations info */}
          <div className="bg-[#0d041a]/40 rounded-2xl border border-[#ffd700]/10 p-4.5 text-left flex flex-col gap-3.5">
            <div>
              <span className="text-[9px] font-serif text-[#ffd700] uppercase tracking-widest block font-medium">Слияние Стихий</span>
              <span className="text-xs font-serif font-semibold text-[#e0d8cf] block mt-1">{result.elementsMatch}</span>
            </div>

            <div className="border-t border-[#ffd700]/10 pt-2.5">
              <span className="text-[9px] font-serif text-[#e0d8cf]/40 uppercase tracking-widest block">Кармическая суть союза</span>
              <p className="text-[#e0d8cf]/85 text-xs mt-1.5 leading-relaxed italic font-serif font-light">
                "{result.summary}"
              </p>
            </div>
          </div>

          {/* AI SPECIAL ANALYSIS BUTTON WIDGET */}
          <div className="relative overflow-hidden bg-gradient-to-b from-[#0d041a] to-[#050208] border border-[#ffd700]/25 rounded-2xl p-6.5 text-center shadow-[0_0_30px_rgba(188,19,254,0.12)]">
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ffd700]/40 to-transparent" />
            
            {!aiReading && !loadingAi && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-serif font-semibold text-base text-[#ffd700] flex items-center justify-center gap-1 italic">
                    <Sparkles className="w-4 h-4 text-[#ffd700] animate-spin" style={{ animationDuration: "8s" }} /> CosmoTarot Любовный Оракул
                  </h3>
                  <p className="text-[#e0d8cf]/80 text-xs px-2 leading-relaxed font-serif font-light">
                    Позвольте нашему оракулу провести нумерологический расспрос по именам **{result.nameOne}** и **{result.nameTwo}**, сотворив полноценный астро-любовный разбор Ваших душ.
                  </p>
                </div>

                <button
                  onClick={handleGetAiCompatibility}
                  className="w-full bg-gradient-to-r from-[#ffd700] to-amber-500 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-serif font-semibold text-xs py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(188,19,254,0.15)] active:scale-95 flex items-center justify-center gap-1.5 mt-1 uppercase tracking-wider"
                >
                  <Sparkles size={12} /> Сгенерировать AI Любовный Анализ
                </button>
              </div>
            )}

            {/* Loading AI spinner */}
            {loadingAi && (
              <div className="flex flex-col items-center gap-5 py-4 font-serif text-xs text-[#ffd700] font-light">
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-[#bc13fe] to-indigo-950 border border-[#ffd700]/30 shadow-[0_0_20px_rgba(188,19,254,0.6)] flex items-center justify-center animate-spin">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="animate-pulse">Любовный оракул настраивает нити Венеры...</span>
                  <span className="text-[9px] text-[#e0d8cf]/40">Соединение тонких тел и буквенных знаков</span>
                </div>
              </div>
            )}

            {/* Error AI */}
            {errorAi && (
              <div className="flex flex-col items-center gap-3 py-1 font-serif">
                <span className="text-red-400 font-bold text-xs">Ошибка соединения оракула</span>
                <p className="text-gray-400 text-[11px]">{errorAi}</p>
                <button
                  onClick={handleGetAiCompatibility}
                  className="px-4 py-1.5 border border-[#EF4444]/30 hover:border-red-400 text-red-300 text-xs rounded-xl"
                >
                  Повторить сонастройку
                </button>
              </div>
            )}

            {/* Show AI matching texts */}
            {aiReading && (
              <div className="text-left font-sans text-xs text-slate-100 leading-relaxed max-h-[420px] overflow-y-auto pr-1 select-text scrollbar-thin">
                <div className="border-b border-[#ffd700]/20 pb-2.5 mb-4 text-center">
                  <span className="font-serif text-[10px] tracking-widest text-[#ffd700] font-medium block">РЕЗОНАНСНЫЕ ДИАГРАММЫ СОВМЕСТИМОСТИ</span>
                  <span className="text-[10px] text-[#e0d8cf]/40 block mt-1">Любовный шепот оракула готов</span>
                </div>
                <div className="whitespace-pre-wrap space-y-3 prose prose-invert md-renders leading-loose markdown-body font-serif font-light text-[0.95rem]">
                  {aiReading}
                </div>
              </div>
            )}

          </div>

          {/* Reset button to do standard matches starting over */}
          <button
            onClick={handleReset}
            className="px-5 py-2 mx-auto hover:bg-[#0d041a]/40 border border-[#ffd700]/15 text-[#e0d8cf] hover:text-[#ffd700] text-xs font-serif font-light rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
          >
            <RefreshCw size={12} /> Рассчитать другие имена
          </button>

        </div>
      )}

    </div>
  );
}
