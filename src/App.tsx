import React, { useState, useEffect } from "react";
import { Sparkles, Activity, Award } from "lucide-react";
import { TelegramUser, UserStats, HistoryRecord, SpreadConfig } from "./types";
import { getTelegramUser, getTelegramWebApp, triggerVibration, playMagicalChime } from "./utils/magicEffects";
import { SPREADS_CONFIG } from "./data/tarotData";

// Components imports
import MagicalBackground from "./components/MagicalBackground";
import MainDashboard from "./components/MainDashboard";
import SpreadSelection from "./components/SpreadSelection";
import SpreadResultView from "./components/SpreadResultView";
import NameCompatibilityView from "./components/NameCompatibilityView";
import ProfileView from "./components/ProfileView";
import HistoryView from "./components/HistoryView";
import AdminSpreadsView from "./components/AdminSpreadsView";

export default function App() {
  
  // 1. Core States
  const [activeView, setActiveView] = useState<"dashboard" | "spreads" | "compatibility" | "profile" | "history" | "one_card" | "admin">("dashboard");
  const [user, setUser] = useState<TelegramUser>(getTelegramUser());
  const [isPremium, setIsPremium] = useState<boolean>(false);
  
  // Secondary layout config
  const [selectedSpread, setSelectedSpread] = useState<SpreadConfig | null>(null);
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(false);

  // User numerical statistics
  const [stats, setStats] = useState<UserStats>({
    totalReadings: 0,
    favoriteCardId: null,
    experiencePoints: 340,
    level: 1,
    energy: 60,
    maxEnergy: 100,
    lastEnergyRefill: new Date().toISOString()
  });

  // Spread archives array
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // 2. Initialize and Load Local Persistence
  useEffect(() => {
    // Initialize & expand inside Telegram container
    try {
      const tg = getTelegramWebApp();
      if (tg) {
        tg.ready();
        tg.expand();
        // Bind the actual Telegram profile data instantly
        const freshUser = getTelegramUser();
        setUser(freshUser);
      }
    } catch (e) {
      console.warn("Telegram WebApp initialization error:", e);
    }

    // Read local histories
    try {
      const storedHistory = localStorage.getItem("cosmo_tarot_history");
      if (storedHistory) {
         setHistory(JSON.parse(storedHistory));
      }

      // Restore statistics
      const storedStats = localStorage.getItem("cosmo_tarot_stats");
      const storedPremium = localStorage.getItem("cosmo_tarot_premium");
      
      if (storedPremium) {
        setIsPremium(storedPremium === "true");
      }

      if (storedStats) {
        const parsedStats = JSON.parse(storedStats) as UserStats;
        
        // Automatic Idle energy tick restoration math (+1 energy every 5 mins)
        const lastRefillDate = new Date(parsedStats.lastEnergyRefill).getTime();
        const now = Date.now();
        const secondsDelta = Math.floor((now - lastRefillDate) / 1000);
        const earnedTicks = Math.floor(secondsDelta / 300); // 300s = 5 minutes
        
        const maxEnergyLimit = storedPremium === "true" ? 150 : 100;
        let newEnergy = parseFloat(parsedStats.energy.toString()) + earnedTicks;
        if (newEnergy > maxEnergyLimit) {
           newEnergy = maxEnergyLimit;
        }

        const calculatedStats: UserStats = {
          ...parsedStats,
          energy: Math.min(newEnergy, maxEnergyLimit),
          maxEnergy: maxEnergyLimit,
          // If we added tick, shift the refill timestamp forward
          lastEnergyRefill: earnedTicks > 0 ? new Date().toISOString() : parsedStats.lastEnergyRefill
        };

        setStats(calculatedStats);
      } else {
        // First setup defaults
        const defaults: UserStats = {
          totalReadings: 0,
          favoriteCardId: null,
          experiencePoints: 120,
          level: 1,
          energy: 60,
          maxEnergy: 100,
          lastEnergyRefill: new Date().toISOString()
        };
        setStats(defaults);
        localStorage.setItem("cosmo_tarot_stats", JSON.stringify(defaults));
      }

      // Daily limit claims flags
      const lastDailyClaimStr = localStorage.getItem("cosmo_tarot_last_daily_claim");
      if (lastDailyClaimStr) {
        const lastDate = new Date(lastDailyClaimStr);
        const today = new Date();
        const matchedDay = lastDate.getDate() === today.getDate() && 
                           lastDate.getMonth() === today.getMonth() && 
                           lastDate.getFullYear() === today.getFullYear();
        setDailyClaimed(matchedDay);
      }

    } catch (e) {
      console.error("Diagnostic - local storage corrupted resetting default models:", e);
    }
  }, []);

  // Update localStorage helper on statistic triggers
  const saveStats = (updated: UserStats) => {
    setStats(updated);
    localStorage.setItem("cosmo_tarot_stats", JSON.stringify(updated));
  };

  // 3. User interactions handlers
  const handleUpdateMockUser = (updatedData: Partial<TelegramUser>) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
  };

  const handleTogglePremium = () => {
    triggerVibration("medium");
    const nextPremium = !isPremium;
    setIsPremium(nextPremium);
    localStorage.setItem("cosmo_tarot_premium", String(nextPremium));
    
    // Scale maxEnergy caps
    const updatedStats = {
      ...stats,
      maxEnergy: nextPremium ? 150 : 100,
      energy: Math.min(stats.energy + (nextPremium ? 50 : 0), nextPremium ? 150 : 100)
    };
    saveStats(updatedStats);
  };

  const handleClaimDailyBonus = () => {
    if (dailyClaimed) return;
    
    triggerVibration("success");
    playMagicalChime();

    const maxEnergyLimit = isPremium ? 150 : 100;
    const nextEnergy = Math.min(stats.energy + 25, maxEnergyLimit);
    
    const updatedStats = {
      ...stats,
      energy: nextEnergy
    };
    
    saveStats(updatedStats);
    setDailyClaimed(true);
    localStorage.setItem("cosmo_tarot_last_daily_claim", new Date().toISOString());
  };

  // Triggered when a spread finishes and saves card positions to local storage
  const handleSaveHistory = (record: HistoryRecord) => {
    const nextHistory = [record, ...history];
    setHistory(nextHistory);
    localStorage.setItem("cosmo_tarot_history", JSON.stringify(nextHistory));

    // Dynamic experience points calculation & level ups!
    const earnedXP = record.spreadType === "celtic_cross" ? 45 : 20;
    const freshXP = stats.experiencePoints + earnedXP;
    
    // Level boundary caps at 200 XP increments
    const calculatedLevel = Math.floor(freshXP / 200) + 1;
    const previousDrawsTotal = stats.totalReadings + 1;

    // Detect favorite card over entire history
    let mostFrequentCardId = stats.favoriteCardId;
    try {
      const cardFrequencies: { [id: number]: number } = {};
      nextHistory.forEach(h => {
        h.cards.forEach(c => {
          cardFrequencies[c.cardId] = (cardFrequencies[c.cardId] || 0) + 1;
        });
      });

      let topFrequency = 0;
      Object.entries(cardFrequencies).forEach(([idStr, freq]) => {
        if (freq > topFrequency) {
          topFrequency = freq;
          mostFrequentCardId = parseInt(idStr);
        }
      });
    } catch (_) {}

    const updatedStats: UserStats = {
      ...stats,
      totalReadings: previousDrawsTotal,
      experiencePoints: freshXP,
      level: Math.max(calculatedLevel, stats.level),
      favoriteCardId: mostFrequentCardId
    };

    saveStats(updatedStats);
  };

  const handleConsumeEnergy = (amount: number) => {
    const newEnergy = Math.max(stats.energy - amount, 0);
    const updatedStats = {
      ...stats,
      energy: newEnergy,
      lastEnergyRefill: new Date().toISOString()
    };
    saveStats(updatedStats);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("cosmo_tarot_history");
  };

  return (
    <div id="cosmo-tarot-root" className="min-h-screen relative text-slate-100 flex flex-col antialiased">
      {/* Immersive animated starry backgrounds */}
      <MagicalBackground />

      {/* Primary viewport shell container */}
      <main id="app-viewport" className="grow flex flex-col justify-start py-6 px-4.5 sm:px-6 w-full max-w-lg mx-auto overflow-y-auto">
        
        {/* VIEW 1: MAIN DASHBOARD SCREEN */}
        {activeView === "dashboard" && (
          <MainDashboard
            user={user}
            stats={stats}
            isPremium={isPremium}
            dailyClaimed={dailyClaimed}
            onNavigate={(view) => {
              if (view === "one_card") {
                // Instantly open SpreadResult preloaded with Daily card layout
                const dailySetting = SPREADS_CONFIG.find(sc => sc.id === "one_card");
                if (dailySetting) {
                  setSelectedSpread(dailySetting);
                  setActiveView("one_card");
                }
              } else {
                setActiveView(view);
              }
            }}
            onClaimDailyBonus={handleClaimDailyBonus}
          />
        )}

        {/* VIEW 2: SPECIAL SPREAD LISTINGS SELECTION SCREEN */}
        {activeView === "spreads" && (
          <SpreadSelection
            userEnergy={stats.energy}
            onBack={() => setActiveView("dashboard")}
            onSelectSpread={(spread) => {
              setSelectedSpread(spread);
              setActiveView("one_card"); // redirect to active deal board
            }}
          />
        )}

        {/* VIEW 3: ACTIVE TAROT SHUFFLING & FLIPPING BOARD */}
        {activeView === "one_card" && selectedSpread && (
          <SpreadResultView
            spread={selectedSpread}
            userEnergy={stats.energy}
            onConsumeEnergy={handleConsumeEnergy}
            onSaveHistory={handleSaveHistory}
            user={user}
            onBack={() => {
              setSelectedSpread(null);
              setActiveView("dashboard");
            }}
          />
        )}

        {/* VIEW 4: NAME COMPATIBILITY SCREEN */}
        {activeView === "compatibility" && (
          <NameCompatibilityView
            userEnergy={stats.energy}
            onConsumeEnergy={handleConsumeEnergy}
            onBack={() => setActiveView("dashboard")}
          />
        )}

        {/* VIEW 5: USER STATISTICS & ENCYCLOPEDIA GRIMOIRE SCREEN */}
        {activeView === "profile" && (
          <ProfileView
            user={user}
            stats={stats}
            isPremium={isPremium}
            onUpdateMockUser={handleUpdateMockUser}
            onTogglePremium={handleTogglePremium}
            onBack={() => setActiveView("dashboard")}
          />
        )}

        {/* VIEW 6: PREVIOUSLY SAVED HISTORICAL PLACEMENTS SCREEN */}
        {activeView === "history" && (
          <HistoryView
            history={history}
            onClearHistory={handleClearHistory}
            onBack={() => setActiveView("dashboard")}
          />
        )}

        {/* VIEW 7: ADMIN CHANNELS PANEL */}
        {activeView === "admin" && (
          <AdminSpreadsView
            user={user}
            onBack={() => setActiveView("dashboard")}
          />
        )}

      </main>
    </div>
  );
}
