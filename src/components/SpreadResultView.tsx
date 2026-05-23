import React, { useState, useEffect } from "react";
import { Sparkles, ArrowLeft, RefreshCw, Zap, Stars, HelpCircle, FileText } from "lucide-react";
import { SpreadConfig, TarotCard, HistoryRecord, TelegramUser } from "../types";
import { TAROT_CARDS } from "../data/tarotData";
import { triggerVibration, playFlipSound, playMagicalChime, playCelestialSuccessSound } from "../utils/magicEffects";
import TarotCardGraphic from "./TarotCardGraphic";

interface SpreadResultViewProps {
  spread: SpreadConfig;
  onBack: () => void;
  onSaveHistory: (record: HistoryRecord) => void;
  onConsumeEnergy: (amount: number) => void;
  userEnergy: number;
  user: TelegramUser;
}

interface DrawnCardInstance {
  card: TarotCard;
  isReversed: boolean;
  positionName: string;
  isFlipped: boolean; // showing front or back
}

export default function SpreadResultView({
  spread,
  onBack,
  onSaveHistory,
  onConsumeEnergy,
  userEnergy,
  user
}: SpreadResultViewProps) {

  const [step, setStep] = useState<"ready" | "shuffling" | "drawing" | "reading">("ready");
  
  // App state variables
  const [sessionRecordId, setSessionRecordId] = useState<string>("");
  const [shufflingCount, setShufflingCount] = useState(0);
  const [drawnCards, setDrawnCards] = useState<DrawnCardInstance[]>([]);
  const [activeDrawIndex, setActiveDrawIndex] = useState(0);
  const [userQuestion, setUserQuestion] = useState("");
  
  // Gemini AI reading states
  const [aiReading, setAiReading] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState("");

  // Helper to save current cards layout to server db
  const saveSpreadToBackend = (recId: string, cardsList: DrawnCardInstance[]) => {
    fetch("/api/save-reading", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: recId,
        user: user,
        spreadName: spread.name,
        userQuestion: userQuestion,
        selectedCards: cardsList.map(c => ({
          nameRu: c.card.nameRu,
          nameEn: c.card.nameEn,
          isReversed: c.isReversed,
          positionName: c.positionName
        }))
      })
    }).catch(err => console.error("Error saving reading to database:", err));
  };

  // Clean initialization or restart of spread
  const handleStartSession = () => {
    if (userEnergy < spread.energyCost) {
      triggerVibration("warning");
      alert("Недостаточно космической энергии! Дождитесь восстановления или заберите ежедневный бонус.");
      return;
    }

    triggerVibration("medium");
    // Spend energy point costs on start
    onConsumeEnergy(spread.energyCost);
    
    // Generate static session record ID
    const recId = `tarot_draw_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    setSessionRecordId(recId);

    // Switch to active shuffling stage
    setStep("shuffling");
    setShufflingCount(0);
    setDrawnCards([]);
    setActiveDrawIndex(0);
    setAiReading("");
    setErrorAi("");
  };

  // Run the card shuffling animation sequence
  const executeShuffleAction = () => {
    setShufflingCount(prev => prev + 1);
    triggerVibration("light");
    playFlipSound();

    if (shufflingCount >= 4) {
      // Select random Tarot Cards for layout positions
      setTimeout(() => {
        const pool = [...TAROT_CARDS];
        const chosen: DrawnCardInstance[] = [];

        for (let i = 0; i < spread.cardCount; i++) {
          if (pool.length === 0) break;
          const randomIndex = Math.floor(Math.random() * pool.length);
          const selectedCard = pool.splice(randomIndex, 1)[0];
          
          // Random 20% index probability of reversed drawing
          const isReversedVal = Math.random() < 0.20;

          chosen.push({
            card: selectedCard,
            isReversed: isReversedVal,
            positionName: spread.positions[i] || `Карта ${i + 1}`,
            isFlipped: false // start face down
          });
        }

        setDrawnCards(chosen);
        setStep("drawing");
        setActiveDrawIndex(0);
        triggerVibration("success");
        playMagicalChime();
      }, 700);
    }
  };

  // Flip individual card at index with physical haptic and audio synths
  const handleRevealCard = (index: number) => {
    if (drawnCards[index].isFlipped) return; // already solved

    // Ensure they reveal in order, or let them click any. Let's let them click any but trigger haptics.
    const updated = [...drawnCards];
    updated[index].isFlipped = true;
    setDrawnCards(updated);
    
    triggerVibration("light");
    playFlipSound();

    const allRevealed = updated.every(c => c.isFlipped);
    if (allRevealed) {
      setStep("reading");
      triggerVibration("success");
      playCelestialSuccessSound();
      
      const targetId = sessionRecordId || `tarot_draw_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      if (!sessionRecordId) {
        setSessionRecordId(targetId);
      }

      // Auto save record of layout inside local storage
      const record: HistoryRecord = {
        id: targetId,
        date: new Date().toISOString(),
        spreadType: spread.id,
        spreadName: spread.name,
        cards: updated.map(c => ({
          cardId: c.card.id,
          isReversed: c.isReversed,
          positionName: c.positionName
        }))
      };
      
      // Save it using prop
      onSaveHistory(record);

      // Save to server database
      saveSpreadToBackend(targetId, updated);
    }
  };

  // Fast Reveal All shortcut
  const handleRevealAll = () => {
    const updated = drawnCards.map(c => ({ ...c, isFlipped: true }));
    setDrawnCards(updated);
    setStep("reading");
    triggerVibration("success");
    playCelestialSuccessSound();

    const targetId = sessionRecordId || `tarot_draw_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    if (!sessionRecordId) {
      setSessionRecordId(targetId);
    }

    const record: HistoryRecord = {
      id: targetId,
      date: new Date().toISOString(),
      spreadType: spread.id,
      spreadName: spread.name,
      cards: updated.map(c => ({
        cardId: c.card.id,
        isReversed: c.isReversed,
        positionName: c.positionName
      }))
    };
    onSaveHistory(record);

    // Save to server database
    saveSpreadToBackend(targetId, updated);
  };

  // Call Gemini AI on Express server for Tarot Reading
  const handleGetAiReading = async () => {
    setLoadingAi(true);
    setErrorAi("");
    triggerVibration("medium");

    try {
      const response = await fetch("/api/tarot-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spreadName: spread.name,
          selectedCards: drawnCards.map(dc => ({
            nameRu: dc.card.nameRu,
            nameEn: dc.card.nameEn,
            isReversed: dc.isReversed,
            positionName: dc.positionName,
            uprightKeywords: dc.card.uprightKeywords,
            reversedKeywords: dc.card.reversedKeywords,
            description: dc.card.description
          })),
          userQuestion: userQuestion
        }),
      });

      if (!response.ok) {
        throw new Error("Не удалось получить мудрость оракула с сервера.");
      }

      const data = await response.json();
      setAiReading(data.reading || "Оракул ушел в глубокое молчание.");
      triggerVibration("success");
      playCelestialSuccessSound();

      // Trigger server update with reading Text
      if (sessionRecordId) {
        fetch("/api/save-reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: sessionRecordId,
            user: user,
            readingText: data.reading
          })
        }).catch(err => console.error("Error updating AI reading text to database:", err));
      }
    } catch (e: any) {
      console.error(e);
      setErrorAi(e.message || "Ошибка подключения к астральной сети.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in max-w-md mx-auto relative pb-10">
      
      {/* 1. Nav Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => { triggerVibration("light"); onBack(); }}
          className="p-2 border border-[#ffd700]/15 rounded-xl bg-[#0d041a]/40 text-[#e0d8cf] hover:text-[#ffd700] hover:border-[#ffd700]/30 transition-all duration-300 active:scale-95"
          disabled={loadingAi}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h2 className="font-serif font-semibold text-lg text-[#ffd700] tracking-wide">{spread.name}</h2>
          <span className="text-[#e0d8cf]/70 text-xs font-serif font-light">Таро-сессия • Слой судьбы</span>
        </div>
      </div>

      {/* STAGE A: READY & INPUT PATTERN */}
      {step === "ready" && (
        <div className="bg-[#0d041a]/60 backdrop-blur-md rounded-2xl border border-[#ffd700]/15 p-5 flex flex-col gap-5 text-center shadow-[0_0_40px_rgba(188,19,254,0.08)]">
          <div className="p-3.5 bg-[#050208]/80 rounded-2xl border border-[#ffd700]/10 w-fit mx-auto text-[#ffd700]">
            <Stars className="w-8 h-8 animate-pulse" />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-serif font-semibold text-base text-[#ffd700]">Готовы открыть предзнаменование?</h3>
            <p className="text-[#e0d8cf]/80 text-xs leading-relaxed px-2 font-serif font-light">
              Перед началом сеанса, Вы можете вписать конкретный вопрос. Это поможет верховному CosmoTarot AI более глубоко сонастроить космические силы.
            </p>
          </div>

          {/* Optional Question Input */}
          <div className="flex flex-col gap-2 text-left text-[#ffd700]">
            <label htmlFor="user-question-input" className="text-[10px] uppercase font-sans tracking-widest text-[#ffd700]/70 pl-1 font-semibold">О чем Вы желаете спросить карты?</label>
            <textarea
              id="user-question-input"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Пример: Стоит ли мне начинать новый рабочий проект на следующей неделе? Что ждет нас в отношениях?"
              className="w-full h-20 bg-[#050208]/80 border border-[#ffd700]/15 hover:border-[#ffd700]/30 focus:border-[#ffd700]/50 focus:outline-none rounded-xl p-3 text-xs text-[#e0d8cf] placeholder-gray-600 transition-all"
            />
          </div>

          {/* Energy and start triggers */}
          <div className="flex flex-col gap-3.5 pt-2">
            <button
              onClick={handleStartSession}
              className="w-full bg-gradient-to-r from-[#ffd700] to-amber-500 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-serif font-semibold text-xs py-3 rounded-xl transition-all shadow-[0_4px_20px_rgba(188,19,254,0.2)] active:scale-95 flex items-center justify-center gap-1.5 uppercase tracking-wider"
            >
              <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" /> Начать сессию (Расход: {spread.energyCost} XP)
            </button>
            <span className="text-[10px] text-gray-500 font-mono">Ваша энергия: {userEnergy} XP</span>
          </div>
        </div>
      )}

      {/* STAGE B: SHUFFLING STAGE DECK */}
      {step === "shuffling" && (
        <div className="bg-[#0d041a]/60 backdrop-blur-md rounded-2xl border border-[#ffd700]/15 p-6 flex flex-col items-center gap-6 text-center h-96 justify-center shadow-[0_0_40px_rgba(188,19,254,0.08)]">
          <span className="text-[10px] font-sans tracking-widest text-[#ffd700] uppercase font-semibold">Таинство Shuffling</span>
          
          {/* Animated physical cards stack translating side-to-side */}
          <div className="relative w-40 h-44 flex items-center justify-center">
            <div 
              className={`absolute w-24 h-36 bg-gradient-to-b from-[#120722] to-[#04010a] border border-[#ffd700]/25 rounded-lg shadow-xl transform ${
                shufflingCount > 0 ? "animate-shuffle-left" : "-rotate-3"
              }`} 
            />
            <div 
              className={`absolute w-24 h-36 bg-gradient-to-b from-[#120722] to-[#04010a] border border-[#ffd700]/20 rounded-lg shadow-xl transform ${
                shufflingCount > 1 ? "animate-shuffle-right" : "rotate-3 translate-x-1"
              }`} 
            />
            <div className="absolute w-24 h-36 bg-[#040108] border border-[#ffd700]/30 rounded-lg shadow-2xl flex items-center justify-center p-2 z-10">
              <div className="w-full h-full border border-[#bc13fe]/10 rounded flex items-center justify-center">
                <RefreshCw className={`w-8 h-8 text-[#ffd700]/40 ${shufflingCount > 0 ? "animate-spin" : ""}`} style={{ animationDuration: "5s" }} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-serif font-semibold text-sm text-[#ffd700]">Перемешайте сакральную деку</h3>
            <p className="text-[#e0d8cf]/80 text-[11px] leading-relaxed max-w-[260px] mx-auto font-serif font-light">
              Размешайте колоду пять раз подряд, насыщая ее своей внутренней ментальной вибрацией.
            </p>
          </div>

          <button
            onClick={executeShuffleAction}
            className="px-6 py-2 bg-[#050208] border border-[#ffd700]/30 hover:border-[#ffd700]/50 text-[#ffd700] font-mono text-xs font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2"
          >
            <RefreshCw size={13} className={shufflingCount > 0 ? "animate-spin" : ""} /> {shufflingCount === 0 ? "Первый замес" : `Перемешать деку (${shufflingCount}/5)`}
          </button>
        </div>
      )}

      {/* STAGE C: CARD SELECT DRAWING BOARD */}
      {step === "drawing" && (
        <div className="flex flex-col gap-6 text-center animate-fade-in-up">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-sans tracking-widest text-[#ffd700]/70 uppercase font-semibold">Вытягивание карт</span>
            <h3 className="font-serif font-semibold text-lg text-[#ffd700]">Прикоснитесь поочередно к закрытым картам</h3>
            <p className="text-[#e0d8cf]/80 text-xs font-serif font-light">Открывайте карты, созерцая их первородные значения.</p>
          </div>

          {/* Responsive Layout Grid of Tarot Spreads */}
          <div className="grid grid-cols-2 gap-4 pb-2">
            {drawnCards.map((inst, index) => (
              <div 
                key={index}
                onClick={() => handleRevealCard(index)}
                className="flex flex-col items-center gap-2 bg-[#0d041a]/40 rounded-2xl border border-[#ffd700]/10 p-3.5 transition-all hover:bg-[#0d041a]/60 hover:border-[#ffd700]/25"
              >
                <span className="text-[9px] font-serif font-light text-[#ffd700]/90 tracking-wider h-6 leading-tight flex items-center justify-center text-center px-1">
                  {inst.positionName}
                </span>

                <TarotCardGraphic
                  cardId={inst.card.id}
                  nameRu={inst.card.nameRu}
                  nameEn={inst.card.nameEn}
                  isReversed={inst.isReversed}
                  isFlipped={inst.isFlipped}
                  size="md"
                />

                {!inst.isFlipped && (
                  <span className="text-[9px] font-serif text-[#ffd700] flex items-center gap-1 animate-pulse mt-1 cursor-pointer font-light">
                    ✨ Открыть карту
                  </span>
                )}
                {inst.isFlipped && (
                  <span className="text-[9px] font-mono text-[#e0d8cf]/40 mt-1">Открыто</span>
                )}
              </div>
            ))}
          </div>

          {/* Quick Reveal button */}
          <button
            onClick={handleRevealAll}
            className="text-[10px] text-[#e0d8cf]/60 font-serif font-light underline hover:text-[#ffd700] mx-auto active:scale-95"
          >
            Открыть все карты мгновенно
          </button>
        </div>
      )}

      {/* STAGE D: THE DETAILED READINGS + AI GEMINI TEXT COORD */}
      {step === "reading" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          
          {/* Detailed list of flipped cards and meanings */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif font-semibold italic text-base text-[#ffd700] text-left pl-1">Выпавшее пророчество:</h3>
            
            <div className="flex flex-col gap-4.5">
              {drawnCards.map((inst, idx) => (
                <div 
                   key={idx}
                   className="bg-[#0d041a]/60 rounded-2xl border border-[#ffd700]/15 p-4.5 flex gap-4 text-left shadow-lg overflow-hidden relative"
                >
                  <div className="shrink-0 flex items-center">
                    <TarotCardGraphic
                      cardId={inst.card.id}
                      nameRu={inst.card.nameRu}
                      nameEn={inst.card.nameEn}
                      isReversed={inst.isReversed}
                      isFlipped={true}
                      size="sm"
                    />
                  </div>

                  <div className="flex flex-col grow justify-between">
                    <div>
                      <span className="text-[9px] font-serif font-light uppercase bg-[#ffd700]/10 border border-[#ffd700]/20 text-[#ffd700] px-2 py-0.5 rounded-md leading-none h-fit w-fit block mb-1">
                        {inst.positionName}
                      </span>
                      <h4 className="font-serif font-semibold text-sm text-[#ffd700] flex items-center gap-1.5 mt-1.5">
                        {inst.card.nameRu} {inst.isReversed && <span className="text-[10px] text-purple-300 animate-pulse">(Перевернутая)</span>}
                      </h4>
                      <p className="text-[#e0d8cf]/85 text-[11px] leading-relaxed mt-2 italic font-serif font-light">
                        "{inst.card.description}"
                      </p>
                    </div>

                    {/* Show quick structural keywords */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(inst.isReversed ? inst.card.reversedKeywords : inst.card.uprightKeywords).map((keyword, k) => (
                        <span key={k} className="text-[9px] font-serif font-light bg-[#050208]/90 border border-[#ffd700]/15 px-1.5 py-0.5 rounded text-[#ffd700]">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI INTERPRETATION CONTROL GLASSMORPHIC PANEL */}
          <div 
            id="ai-control-panel"
            className="relative overflow-hidden bg-gradient-to-b from-[#0d041a] to-[#050208] border border-[#ffd700]/25 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(188,19,254,0.12)]"
          >
            {/* Background sparkle loops */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent" />
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-[#ffd700]/5 rounded-full blur-2xl" />

            {/* If AI has NOT been fetched yet */}
            {!aiReading && !loadingAi && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#ffd700] animate-pulse" />
                  <span className="font-serif font-semibold tracking-wider text-[#ffd700]">COSMOTAROT AI</span>
                  <Sparkles className="w-5 h-5 text-[#ffd700] animate-pulse" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-serif font-semibold italic text-base text-[#ffd700]">Получить Сакральную Трактовку AI</h3>
                  <p className="text-[#e0d8cf]/80 text-xs px-2 leading-relaxed font-serif font-light">
                    Наш эзотерический оракул сопоставит все звёздные аспекты и выпавшие формулировки в полноценный глубокий разбор Вашей судьбы.
                  </p>
                </div>

                <button
                  onClick={handleGetAiReading}
                  className="w-full bg-gradient-to-r from-[#ffd700] to-amber-500 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-serif font-semibold text-xs py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(188,19,254,0.15)] active:scale-95 flex items-center justify-center gap-1.5 mt-1 uppercase tracking-wider"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" /> Сгенерировать AI трактовку
                </button>
              </div>
            )}

            {/* Loading / Crystal ball animation */}
            {loadingAi && (
              <div className="flex flex-col items-center gap-6 py-6 font-serif text-xs text-[#ffd700] font-light">
                {/* Glowing crystal ball loader simulation */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#bc13fe] to-indigo-950 border-2 border-[#ffd700]/40 shadow-[0_0_30px_rgba(188,19,254,0.8)] flex items-center justify-center animate-bounce">
                  <div className="absolute inset-1.5 rounded-full bg-slate-950/20 blur-[2px]" />
                  <Stars className="w-6 h-6 text-[#ffd700] animate-spin" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="animate-pulse">Оракул вглядывается в линии вероятностей...</span>
                  <span className="text-[9px] text-[#e0d8cf]/40 tracking-wide">Расчет слияния планет и стихий</span>
                </div>
              </div>
            )}

            {/* Error messaging state */}
            {errorAi && (
              <div className="flex flex-col items-center gap-3 py-2 text-center text-sm font-serif">
                <span className="text-red-400 font-bold">Ошибка астрального слияния</span>
                <p className="text-gray-400 text-xs">{errorAi}</p>
                <button
                  onClick={handleGetAiReading}
                  className="px-4 py-1.5 border border-[#EF4444]/30 hover:border-red-400 text-red-300 text-xs rounded-xl transition-all"
                >
                  Попробовать сонастройку еще раз
                </button>
              </div>
            )}

            {/* AI Text outputs */}
            {aiReading && (
              <div className="text-left font-sans text-xs text-slate-100 leading-relaxed max-h-[460px] overflow-y-auto pr-1 select-text scrollbar-thin">
                <div className="border-b border-[#ffd700]/20 pb-3 mb-4 text-center">
                  <span className="font-serif text-[10px] tracking-widest text-[#ffd700] font-medium block">САКРАЛЬНЫЕ КАНАЛЫ COSMOTAROT AI</span>
                  <span className="text-[10px] text-[#e0d8cf]/40 block mt-1">Толкование готово • Прочитайте в тишине</span>
                </div>
                
                {/* Parsed and beautifully spaced generated text sections style */}
                <div className="whitespace-pre-wrap space-y-3 prose prose-invert md-renders leading-loose markdown-body font-serif font-light text-[0.95rem]">
                  {aiReading}
                </div>

                <div className="border-t border-[#ffd700]/15 pt-3 mt-5 text-center flex items-center justify-center gap-1">
                  <span className="text-[8px] font-sans text-gray-500 uppercase tracking-widest">Спасибо за доверие</span>
                </div>
              </div>
            )}

          </div>

          {/* Bottom control links */}
          <div className="flex gap-4.5 justify-center py-4">
            <button
              onClick={handleStartSession}
              className="px-5 py-2 hover:bg-[#0d041a]/40 border border-[#ffd700]/15 text-[#e0d8cf] hover:text-[#ffd700] text-xs font-serif font-light rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            >
              <RefreshCw size={12} /> Раскласть заново
            </button>
          </div>

        </div>
      )}

      {/* Styled custom animations */}
      <style>{`
        @keyframes shuffle-left {
          0% { transform: rotate(-3deg) translateX(0px); }
          50% { transform: rotate(-15deg) translateX(-45px); }
          100% { transform: rotate(-3deg) translateX(0px); }
        }
        @keyframes shuffle-right {
          0% { transform: rotate(3deg) translateX(0px); }
          50% { transform: rotate(15deg) translateX(45px); }
          100% { transform: rotate(3deg) translateX(0px); }
        }
        .animate-shuffle-left {
          animation: shuffle-left 0.4s ease-in-out 1;
        }
        .animate-shuffle-right {
          animation: shuffle-right 0.4s ease-in-out 1;
        }
      `}</style>

    </div>
  );
}
