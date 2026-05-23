import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parser
  app.use(express.json());

  // CORS middleware for external hosting (e.g. Vercel)
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // SavedSpread interface and DB persistence setup
  interface SavedSpread {
    id: string;
    username: string;
    firstName: string;
    spreadName: string;
    userQuestion?: string;
    selectedCards: any[];
    readingText?: string;
    timestamp: string;
  }

  interface SavedUser {
    username: string;
    firstName: string;
    stats: any;
    isPremium: boolean;
    lastSync: string;
  }

  const HISTORY_FILE = path.join(process.cwd(), "spreads_history.json");
  const USERS_FILE = path.join(process.cwd(), "users_stats.json");

  function loadSpreads(): SavedSpread[] {
    try {
      if (fs.existsSync(HISTORY_FILE)) {
        const data = fs.readFileSync(HISTORY_FILE, "utf-8");
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Error loading spreads file:", e);
    }
    return [];
  }

  function saveSpreads(spreads: SavedSpread[]) {
    try {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(spreads, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving spreads file:", e);
    }
  }

  function loadUsers(): Record<string, SavedUser> {
    try {
      if (fs.existsSync(USERS_FILE)) {
        const data = fs.readFileSync(USERS_FILE, "utf-8");
        return JSON.parse(data);
      }
    } catch (e) {
      console.error("Error loading users file:", e);
    }
    return {};
  }

  function saveUsers(users: Record<string, SavedUser>) {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving users file:", e);
    }
  }

  // API Endpoint 0.1: Save or Update user spread
  app.post("/api/save-reading", (req: Request, res: Response) => {
    try {
      const { id, user, spreadName, userQuestion, selectedCards, readingText } = req.body;
      const spreads = loadSpreads();
      
      const existingIndex = spreads.findIndex((s: any) => s.id === id);
      const timestamp = new Date().toISOString();
      const usernameVal = user?.username || "anonymous";
      const firstNameVal = user?.firstName || "Гость";

      if (existingIndex > -1) {
        spreads[existingIndex] = {
          ...spreads[existingIndex],
          readingText: readingText !== undefined ? readingText : spreads[existingIndex].readingText,
          userQuestion: userQuestion !== undefined ? userQuestion : spreads[existingIndex].userQuestion,
        };
      } else {
        spreads.unshift({
          id: id || `spread_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          username: usernameVal,
          firstName: firstNameVal,
          spreadName: spreadName || "Расклад",
          userQuestion: userQuestion || "",
          selectedCards: selectedCards || [],
          readingText: readingText || "",
          timestamp: timestamp
        });
      }
      
      saveSpreads(spreads);
      return res.json({ success: true });
    } catch (e: any) {
      console.error("Error saving spread history:", e);
      return res.status(500).json({ error: e.message });
    }
  });

  // API Endpoint 0.15: Server User statistics sync
  app.post("/api/sync-stats", (req: Request, res: Response) => {
    try {
      const { user, stats, isPremium } = req.body;
      const usernameVal = (user?.username || "anonymous").trim().toLowerCase().replace(/^@/, "");
      // Create user search key
      const userKey = usernameVal || `id_${user?.id || 'unknown'}`;
      
      if (!userKey || userKey === "anonymous") {
        return res.json({ success: false, reason: "Anonymous or empty user detail bypassed sync." });
      }

      const users = loadUsers();
      const now = new Date().toISOString();

      if (!users[userKey]) {
        users[userKey] = {
          username: user?.username || "anonymous",
          firstName: user?.firstName || "Гость",
          stats: stats || {},
          isPremium: isPremium || false,
          lastSync: now
        };
      } else {
        const serverUser = users[userKey];
        serverUser.firstName = user?.firstName || serverUser.firstName;
        serverUser.username = user?.username || serverUser.username;
        serverUser.lastSync = now;

        // Merge incoming client statistics with server fields, prioritizing server fields override
        if (stats) {
          serverUser.stats = {
            ...stats,
            energy: serverUser.stats?.energy !== undefined ? serverUser.stats.energy : stats.energy,
            maxEnergy: serverUser.stats?.maxEnergy !== undefined ? serverUser.stats.maxEnergy : stats.maxEnergy,
            level: stats.level !== undefined ? stats.level : serverUser.stats?.level || 1,
            totalReadings: stats.totalReadings !== undefined ? stats.totalReadings : serverUser.stats?.totalReadings || 0
          };
        }
        
        if (serverUser.isPremium) {
          // Keep true once set as premium under administrative order
        } else {
          serverUser.isPremium = isPremium || false;
        }
      }

      saveUsers(users);
      return res.json({ 
        success: true, 
        stats: users[userKey].stats, 
        isPremium: users[userKey].isPremium 
      });
    } catch (e: any) {
      console.error("Error synchronizing statistics at server:", e);
      return res.status(500).json({ error: e.message });
    }
  });

  // API Endpoint 0.2: Admin Get All Spreads
  app.get("/api/admin/all-spreads", (req: Request, res: Response) => {
    try {
      const authUsername = (req.query.username as string || "").trim().toLowerCase().replace(/^@/, "");
      
      if (authUsername !== "youknowskii" && authUsername !== "admin" && authUsername !== "magicadmin" && authUsername !== "force_admin") {
        return res.status(403).json({ error: "Доступ закрыт. Вы не являетесь верховным проводником эзотерической панели." });
      }
      
      return res.json({ spreads: loadSpreads() });
    } catch (e: any) {
      console.error("Error in all-spreads API:", e);
      return res.status(500).json({ error: "Ошибка сервера при чтении раскладов: " + e.message });
    }
  });

  // API Endpoint 0.22: Admin Get All Users
  app.get("/api/admin/all-users", (req: Request, res: Response) => {
    try {
      const authUsername = (req.query.username as string || "").trim().toLowerCase().replace(/^@/, "");
      
      if (authUsername !== "youknowskii" && authUsername !== "admin" && authUsername !== "magicadmin" && authUsername !== "force_admin") {
        return res.status(403).json({ error: "Доступ закрыт. Вы не являетесь верховным проводником эзотерической панели." });
      }

      const users = loadUsers();
      return res.json({ users: Object.values(users) });
    } catch (e: any) {
      console.error("Error in all-users API:", e);
      return res.status(500).json({ error: "Ошибка сервера при чтении пользователей: " + e.message });
    }
  });

  // API Endpoint 0.25: Admin Grant Custom Energy & Premium Status
  app.post("/api/admin/modify-user", (req: Request, res: Response) => {
    try {
      const { adminUsername, targetUsername, energy, isPremium, maxEnergy } = req.body;
      const authUsername = (adminUsername || "").trim().toLowerCase().replace(/^@/, "");

      if (authUsername !== "youknowskii" && authUsername !== "admin" && authUsername !== "magicadmin" && authUsername !== "force_admin") {
        return res.status(403).json({ error: "Доступ закрыт. Вы не являетесь верховным проводником." });
      }

      const users = loadUsers();
      const targetKey = (targetUsername || "").trim().toLowerCase().replace(/^@/, "");

      if (!users[targetKey]) {
        return res.status(404).json({ error: "Указанный пользователь не найден в астральном эфире." });
      }

      if (!users[targetKey].stats) {
        users[targetKey].stats = {};
      }

      if (energy !== undefined) {
        users[targetKey].stats.energy = Number(energy);
      }

      if (maxEnergy !== undefined) {
        users[targetKey].stats.maxEnergy = Number(maxEnergy);
      }

      if (isPremium !== undefined) {
        users[targetKey].isPremium = Boolean(isPremium);
        if (Boolean(isPremium)) {
          users[targetKey].stats.maxEnergy = 150;
        }
      }

      users[targetKey].lastSync = new Date().toISOString();
      saveUsers(users);

      return res.json({ success: true, user: users[targetKey] });
    } catch (e: any) {
      console.error("Error modifying user balance on server:", e);
      return res.status(500).json({ error: e.message });
    }
  });

  // Safe initialize Gemini-API server-side
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  
  if (geminiApiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
      console.log("CosmoTarot Backend: Gemini API client successfully initialized.");
    } catch (e) {
      console.error("CosmoTarot Backend: Failed to initialize Gemini client", e);
    }
  } else {
    console.warn("CosmoTarot Backend: GEMINI_API_KEY is not defined in the environment. AI readings will fallback to mock readings.");
  }

  // API Endpoint 1: Tarot Spreads AI Reading
  app.post("/api/tarot-reading", async (req: Request, res: Response) => {
    try {
      const { spreadName, selectedCards, userQuestion } = req.body;

      if (!selectedCards || !Array.isArray(selectedCards) || selectedCards.length === 0) {
        return res.status(400).json({ error: "Missing or invalid cards for tarot reading simulation." });
      }

      const questionText = userQuestion && userQuestion.trim() !== "" 
        ? `Вопрос вопрошающего: "${userQuestion}"` 
        : "Вопрос:Общее руководство и энергетический разбор текущей ситуации.";

      // Format card description list for AI
      const cardsPromptSegment = selectedCards.map((c: any, index: number) => {
        return `Карта ${index + 1} на позиции "${c.positionName}":
Название: "${c.nameRu}" (${c.nameEn})
Положение: ${c.isReversed ? "ПЕРЕВЕРНУТОЕ (ослабленная сила или внутреннее сопротивление)" : "ПРЯМОЕ (проявление вовне, открытая энергия)"}
Ключевые слова: ${c.isReversed ? c.reversedKeywords.join(", ") : c.uprightKeywords.join(", ")}
Основная суть: ${c.description}`;
      }).join("\n\n");

      const promptHtml = `
Проведи глубокое сакральное толкование расклада Таро под названием "${spreadName}".
${questionText}

Выпавшие карты:
${cardsPromptSegment}

Раздели анализ на следующие разделы с красивой структурой Markdown:
1. ✨ **Астральное Слияние**: Космический обзор сочетания выпавших энергий. Какая общая вибрация окружает этот момент времени?
2. 🔮 **Сакральная Тетрада / Разбор расклада**: Проинтерпретируй подробно КАЖДУЮ карту с учётом её позиции и его ориентации (прямая/перевернутая). Расскажи, как эти карты отвечают на вопрос или влияют на судьбу.
3. 🌌 **Духовное Откровение**: Скрытый психологический и кармический урок этой ситуации для вопрошающего. Чему учит космос?
4. 🗝️ **Резонансный Совет**: Четкий, практический и поддерживающий совет на будущее. Сделай акцент на вдохновляющем действии.
`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptHtml,
          config: {
            systemInstruction: "Ты — CosmoTarot AI, верховный ведический оракул, эзотерик и потомственная хранительница древнего таро-знания. Твой слог кинематографичен, полон таинственности, звёздных аллегорий и психологической мудрости. Обращайся к пользователю вежливо на 'Вы'. Твоя цель — вселить надежду, дать просветление, раскрыть тайны души и подсознания без запугивания. Говори на красивом, живом русском языке.",
            temperature: 0.8,
          }
        });

        const generatedText = response.text;
        return res.json({ reading: generatedText });
      } else {
        // Fallback reading if no key is supplied
        const fallbackText = `### ✨ **Астральное Слияние**
В этом раскладе просматривается сильное слияние тонких энергий. Сочетание планет указывает на то, что текущий момент является переходным этапом, требующим максимального контакта со своей интуицией.

### 🔮 **Сакральное толкование карт**
${selectedCards.map((c: any, i: number) => {
  return `* **Карта ${i + 1} (${c.positionName}): "${c.nameRu}"**
  Выпала в ${c.isReversed ? "*перевернутом*" : "*прямом*"} положении. Это указывает на ${c.isReversed ? "затрудненное или скрытое течение энергии" : "активное и проявленное присутствие в Вашей жизни сил"} аркана. Обратите особое внимание на ключевое понятие: *"${c.isReversed ? c.reversedKeywords[0] : c.uprightKeywords[0]}"*.`;
}).join("\n")}

### 🌌 **Духовное Откровение**
Ситуация дана Вам для проработки внутренней стойкости. Космос призывает Вас взглянуть страхам в лицо и провести ревизию старых убеждений.

### 🗝️ **Резонансный Совет**
Доверьтесь моменту. Сделайте глубокий вдох и начните действовать, руководствуясь велением сердца, а не логикой эго. Скоро перед Вами откроются новые звездные горизонты!
*(Для получения персонализированных разборов от CosmoTarot AI подключите GEMINI_API_KEY в настройках)*`;
        
        return res.json({ reading: fallbackText });
      }

    } catch (e: any) {
      console.error("Error generating tarot reading:", e);
      return res.status(500).json({ error: "Ошибка при проведении сеанса гадания Таро: " + e.message });
    }
  });

  // API Endpoint 2: Name Compatibility AI Analysis
  app.post("/api/compatibility-reading", async (req: Request, res: Response) => {
    try {
      const { nameOne, nameTwo, score, details } = req.body;

      if (!nameOne || !nameTwo) {
        return res.status(400).json({ error: "Missing names in compatibility request." });
      }

      const promptBody = `
Проведи мистический нумерологический и астрологический расчет совместимости двух имен:
Имя 1: "${nameOne}"
Имя 2: "${nameTwo}"

Математический расчет выявил резонанс совпадения: ${score}%
Энергетическое слияние стихий: ${details.elementsMatch}
Показатель любовной связи: ${details.lovePercentage}%
Показатель духовной близости: ${details.spiritualPercentage}%

Опиши их союз по следующим пунктам:
1. 💞 **Любовная Алхимия**: Как их имена вибрируют на ментальном и физическом уровнях при соприкосновении.
2. 🕊️ **Энергетические сплетения**: Анализ стихийного союза между ними (${details.elementsMatch}). Где сильные стороны, а где возможен конфликт?
3. 🌠 **Предназначение пары**: Связывает ли их кармическая нить или это путь для взаимного обучения?
4. 🕯️ **Совет космоса**: Превосходная рекомендация для пары по сохранению гармонии и огня любви.
`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: promptBody,
          config: {
            systemInstruction: "Ты — CosmoTarot Любовный Оракул. Трактуй любовные союзы романтично, поэтично, с использованием метафор планет, стихий, свечения и глубокого уважения к чувствам. Русский язык.",
            temperature: 0.75,
          }
        });

        const text = response.text;
        return res.json({ reading: text });
      } else {
        const fallbackText = `### 💞 **Любовная Алхимия**
Союз между **${nameOne}** и **${nameTwo}** обладает мощнейшим притяжением в ${score}%. Нумерологическая сумма их имён образует благородную гармонию. 

### 🕊️ **Энергетические сплетения**
Ваш союз соединяет энергетические потоки стихии *${details.elementsMatch}*. Это огонь, который согревает своим теплом, если его правильно поддерживать, или сильный воздух, раздувающий пламя новых свершений.

### 🌠 **Предназначение пары**
Ваша встреча не случайна. Вы притягиваетесь как две родственные души для закрытия общих кармических циклов и наполнения жизни радостью.

### 🕯️ **Совет космоса**
Чаще обменивайтесь искренними чувствами и признаниями. Не допускайте холодности и учитесь идти на компромиссы. Ваша планета-покровитель благословляет этот путь!`;
        return res.json({ reading: fallbackText });
      }

    } catch (e: any) {
      console.error("Error generating compatibility analysis:", e);
      return res.status(500).json({ error: "Ошибка при расчете совместимости: " + e.message });
    }
  });

  // Client-Side serving setups
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("CosmoTarot Dev Server: Mounted Vite development middleware.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("CosmoTarot Prod Server: Configured fallback static route serving /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CosmoTarot WebApp is actively executing at http://localhost:${PORT}`);
  });
}

startServer();
