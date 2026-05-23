import React from "react";
import { ArrowLeft, Layers, Heart, Shield, Landmark, Orbit, HelpCircle, Activity } from "lucide-react";
import { SPREADS_CONFIG } from "../data/tarotData";
import { SpreadConfig, SpreadType } from "../types";
import { triggerVibration } from "../utils/magicEffects";

interface SpreadSelectionProps {
  onBack: () => void;
  onSelectSpread: (spread: SpreadConfig) => void;
  userEnergy: number;
}

export default function SpreadSelection({
  onBack,
  onSelectSpread,
  userEnergy
}: SpreadSelectionProps) {

  // Map icons to spreads visually
  const getSpreadIcon = (id: SpreadType) => {
    switch (id) {
      case "one_card":
        return <HelpCircle className="w-5 h-5 text-[#ffd700]" />;
      case "three_cards":
        return <Layers className="w-5 h-5 text-[#d49aff]" />;
      case "love_spread":
        return <Heart className="w-5 h-5 text-pink-400" />;
      case "finance_spread":
        return <Landmark className="w-5 h-5 text-emerald-400" />;
      case "future_spread":
        return <Orbit className="w-5 h-5 text-yellow-400" />;
      case "celtic_cross":
        return <Shield className="w-5 h-5 text-[#bc13fe]" />;
      default:
        return <Layers className="w-5 h-5 text-white" />;
    }
  };

  const handleSelect = (spread: SpreadConfig) => {
    triggerVibration("light");
    onSelectSpread(spread);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in max-w-md mx-auto">
      {/* Upper Navigation Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => { triggerVibration("light"); onBack(); }}
          className="p-2 border border-[#ffd700]/15 rounded-xl bg-[#0d041a]/40 text-[#e0d8cf] hover:text-[#ffd700] hover:border-[#ffd700]/30 transition-all duration-300 active:scale-95"
          aria-label="Назад"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h2 className="font-serif font-semibold italic text-xl text-[#ffd700] tracking-wide">Сакральные расклады</h2>
          <span className="text-[#e0d8cf]/70 text-xs font-serif font-light">Выберите схему для погружения в тайны будущего</span>
        </div>
      </div>

      {/* Spreads selection listings */}
      <div className="flex flex-col gap-4">
        {SPREADS_CONFIG.map((spread) => {
          const hasEnoughEnergy = userEnergy >= spread.energyCost;
          
          return (
            <div
              key={spread.id}
              onClick={() => handleSelect(spread)}
              className={`group relative overflow-hidden backdrop-blur-md rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-300 cursor-pointer ${
                hasEnoughEnergy 
                ? "bg-[#0d041a]/60 border-[#ffd700]/15 hover:border-[#ffd700]/35 hover:shadow-[0_4px_25px_-4px_rgba(188,19,254,0.06)] text-left" 
                : "bg-slate-950/25 border-red-500/5 hover:border-red-500/15 text-left opacity-75"
              }`}
            >
              {/* Backglow element on hover */}
              <div className="absolute -right-12 -bottom-12 w-24 h-24 bg-gradient-to-br from-[#bc13fe]/5 to-[#ffd700]/5 rounded-full blur-xl group-hover:scale-125 transition-all duration-500" />

              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#050208]/80 border border-[#ffd700]/10 group-hover:border-[#ffd700]/25 group-hover:bg-[#050208] transition-colors">
                    {getSpreadIcon(spread.id)}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-serif font-semibold text-base text-[#e0d8cf] group-hover:text-[#ffd700] transition-colors">
                      {spread.name}
                    </h3>
                    <span className="text-[10px] text-purple-300/80 tracking-wide font-sans mt-0.5">
                      Схема из {spread.cardCount} {spread.cardCount === 1 ? "карты" : spread.cardCount < 5 ? "карт" : "карт"} 
                    </span>
                  </div>
                </div>

                {/* Energy Indicator badge */}
                <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[10px] font-mono font-bold tracking-wider float-right shrink-0 ${
                  hasEnoughEnergy 
                  ? "bg-[#ffd700]/10 border-[#ffd700]/20 text-[#ffd700]" 
                  : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                  <Activity className="w-3" /> {spread.energyCost} ХР
                </div>
              </div>

              {/* Description body */}
              <p className="text-[#e0d8cf]/80 text-xs leading-relaxed pl-1 font-serif font-light">
                {spread.description}
              </p>

              {/* Spread-specific Positions overview */}
              <div className="pl-1 flex flex-wrap gap-1 mt-1 opacity-75">
                {spread.positions.slice(0, 3).map((pos, i) => (
                  <span key={i} className="text-[9px] font-serif font-light bg-[#050208]/80 border border-[#ffd700]/10 rounded px-2 py-0.5 text-[#e0d8cf]/80 shrink-0">
                    {pos.split(" ")[0]}
                  </span>
                ))}
                {spread.positions.length > 3 && (
                  <span className="text-[9px] font-serif bg-[#050208]/80 border border-[#ffd700]/15 rounded px-1.5 py-0.5 text-[#ffd700] font-medium shrink-0">
                    +{spread.positions.length - 3} позиций
                  </span>
                )}
              </div>

              {/* Energy missing warning alert */}
              {!hasEnoughEnergy && (
                <div className="text-[9px] text-red-400 font-mono mt-2 pl-1 flex items-center gap-1">
                  ✕ Недостаточно космической энергии (Требуется {spread.energyCost})
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
