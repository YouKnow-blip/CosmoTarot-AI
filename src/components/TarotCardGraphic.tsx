import React from "react";

interface TarotCardGraphicProps {
  cardId: number;
  nameRu: string;
  nameEn: string;
  isReversed?: boolean;
  isFlipped?: boolean; // false = showing back, true = showing front
  size?: "sm" | "md" | "lg" | "xl";
  glowColor?: string; // custom neon theme trigger
}

export default function TarotCardGraphic({
  cardId,
  nameRu,
  nameEn,
  isReversed = false,
  isFlipped = false,
  size = "md",
  glowColor = "rgba(168, 85, 247, 0.4)" // Default purple glow
}: TarotCardGraphicProps) {
  
  // Mouse position states for 3D tilt & lighting
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [shine, setShine] = React.useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = React.useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to normalized space (-0.5 to 0.5)
    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;
    
    setTilt({
      x: -normY * 16, // max 16 degrees tilt
      y: normX * 16
    });
    
    setShine({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100)
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTilt({ x: 0, y: 0 });
  };

  // Size conversion helper
  const sizeClasses = {
    sm: "w-24 h-38 text-[10px]",
    md: "w-40 h-64 text-xs",
    lg: "w-56 h-88 text-sm",
    xl: "w-64 h-96 text-base"
  };

  // Convert cardId to Roman Numerals
  const getRomanNumeral = (id: number): string => {
    const roman = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
    return roman[id] || `${id}`;
  };

  // Render highly-detailed, beautiful vector SVG illustrations representing the mystical essence of each Major Arcana card
  const renderCardIllustration = (id: number) => {
    const strokeWidth = "1.5";
    const primaryColor = "#ffd700"; // Rich Editorial gold
    const accentColor = "#d49aff"; // Soft purple/neon pink
    const shadowColor = "#bc13fe";

    switch (id) {
      case 0: // The Fool (Дурак)
        return (
          <g transform="translate(15, 15)">
            <path d="M20,60 L50,15 L70,30 L100,20" stroke={primaryColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
            <circle cx="20" cy="60" r="4" fill={accentColor} />
            <circle cx="50" cy="15" r="4" fill={accentColor} />
            <line x1="20" y1="60" x2="35" y2="40" stroke={primaryColor} strokeWidth={strokeWidth} strokeDasharray="3,3" />
            {/* Celestial stepping point */}
            <path d="M10,80 Q30,75 50,85 T90,80" stroke="#818CF8" strokeWidth="2" fill="none" />
            <circle cx="85" cy="45" r="8" stroke={primaryColor} strokeWidth="1" fill="none" />
            <line x1="85" y1="32" x2="85" y2="58" stroke={primaryColor} strokeWidth="0.75" />
            <line x1="72" y1="45" x2="98" y2="45" stroke={primaryColor} strokeWidth="0.75" />
            {/* Stars */}
            <path d="M30,30 L32,35 L37,35 L33,38 L35,43 L30,40 L25,43 L27,38 L23,35 L28,35 Z" fill="#FDE047" transform="scale(0.8) translate(15, -10)" />
          </g>
        );
      case 1: // The Magician (Маг)
        return (
          <g transform="translate(15, 15)">
            {/* Infinity symbol above */}
            <path d="M35,20 Q42,12 50,20 T65,20 Q72,28 65,36 T50,28 Q42,36 35,20 Z" stroke={accentColor} strokeWidth="2" fill="none" />
            {/* Table or Altar profile */}
            <line x1="15" y1="75" x2="85" y2="75" stroke={primaryColor} strokeWidth="2" />
            <line x1="25" y1="75" x2="25" y2="90" stroke={primaryColor} strokeWidth="1.5" />
            <line x1="75" y1="75" x2="75" y2="90" stroke={primaryColor} strokeWidth="1.5" />
            {/* Wand or Staff */}
            <line x1="50" y1="30" x2="50" y2="65" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="27" r="5" fill="#60A5FA" className="animate-pulse" />
            {/* Elemental symbols representing Goblet, Sword, Pentacle floating */}
            <polygon points="25,55 35,55 30,65" stroke={primaryColor} fill="none" /> {/* Sword */}
            <circle cx="75" cy="60" r="6" stroke="#34D399" strokeWidth="1.5" fill="none" />
            <circle cx="75" cy="60" r="2" fill="#34D399" /> {/* Pentacle */}
          </g>
        );
      case 2: // High Priestess (Жрица)
        return (
          <g transform="translate(15, 15)">
            {/* Pillars Boaz (B) and Jachin (J) */}
            <rect x="15" y="25" width="10" height="60" fill="#1E293B" stroke={primaryColor} strokeWidth="1" />
            <rect x="75" y="25" width="10" height="60" fill="#F8FAFC" stroke={primaryColor} strokeWidth="1" />
            <text x="18" y="58" fill="#F8FAFC" className="font-sans font-bold text-[10px]">B</text>
            <text x="78" y="58" fill="#1E293B" className="font-sans font-bold text-[10px]">J</text>
            {/* Moon Crown above */}
            <circle cx="50" cy="30" r="7" stroke={accentColor} strokeWidth="1.5" fill="none" />
            <path d="M41,30 Q47,20 50,30 Q47,40 41,30 Z" fill={accentColor} />
            <path d="M59,30 Q53,20 50,30 Q53,40 59,30 Z" fill={accentColor} />
            {/* Rolled Scroll in the middle */}
            <rect x="37" y="50" width="26" height="15" rx="2" fill="none" stroke={primaryColor} strokeWidth="1.5" />
            <line x1="43" y1="55" x2="57" y2="55" stroke={primaryColor} strokeWidth="1" />
            <line x1="43" y1="60" x2="54" y2="60" stroke={primaryColor} strokeWidth="1" />
          </g>
        );
      case 3: // The Empress (Императрица)
        return (
          <g transform="translate(15, 15)">
            {/* Throne and Scepter */}
            <rect x="25" y="40" width="50" height="45" rx="6" fill="none" stroke={primaryColor} strokeWidth="1.5" />
            <line x1="28" y1="35" x2="18" y2="65" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
            <circle cx="28" cy="35" r="4" fill={accentColor} />
            {/* Stars forming a crown */}
            <circle cx="35" cy="18" r="1.5" fill="#FDE047" />
            <circle cx="42" cy="14" r="1.5" fill="#FDE047" />
            <circle cx="50" cy="12" r="1.5" fill="#FDE047" />
            <circle cx="58" cy="14" r="1.5" fill="#FDE047" />
            <circle cx="65" cy="18" r="1.5" fill="#FDE047" />
            {/* Shield with Venus Symbol */}
            <circle cx="50" cy="62" r="9" stroke={primaryColor} strokeWidth="1.5" fill="none" />
            <line x1="50" y1="71" x2="50" y2="78" stroke={primaryColor} strokeWidth="1.5" />
            <line x1="46" y1="75" x2="54" y2="75" stroke={primaryColor} strokeWidth="1.5" />
          </g>
        );
      case 4: // The Emperor (Император)
        return (
          <g transform="translate(15, 15)">
            {/* Cubical heavy slate style throne with Ram illustrations */}
            <rect x="22" y="32" width="56" height="54" stroke={primaryColor} strokeWidth="1.5" fill="none" />
            {/* Ram details */}
            <path d="M18,32 Q24,25 24,35" stroke={primaryColor} strokeWidth="1" fill="none" />
            <path d="M82,32 Q76,25 76,35" stroke={primaryColor} strokeWidth="1" fill="none" />
            {/* Scepter Ankh */}
            <line x1="30" y1="35" x2="30" y2="70" stroke={accentColor} strokeWidth="2.5" />
            <circle cx="30" cy="30" r="5" stroke={accentColor} strokeWidth="2.0" fill="none" />
            {/* Golden Orb inside hand representation */}
            <circle cx="70" cy="50" r="5.5" fill={primaryColor} />
            <line x1="70" y1="42" x2="70" y2="58" stroke="#000" strokeWidth="0.75" />
            <line x1="62" y1="50" x2="78" y2="50" stroke="#000" strokeWidth="0.75" />
          </g>
        );
      case 5: // The Hierophant (Иерофант)
        return (
          <g transform="translate(15, 15)">
            {/* Stained glass rays */}
            <line x1="50" y1="10" x2="10" y2="40" stroke="rgba(196, 181, 253, 0.4)" strokeWidth="1" />
            <line x1="50" y1="10" x2="90" y2="40" stroke="rgba(196, 181, 253, 0.4)" strokeWidth="1" />
            {/* Papal Cross Staff representing spiritual realms */}
            <line x1="50" y1="20" x2="50" y2="85" stroke={primaryColor} strokeWidth="2" />
            <line x1="38" y1="35" x2="62" y2="35" stroke={primaryColor} strokeWidth="2" />
            <line x1="42" y1="43" x2="58" y2="43" stroke={primaryColor} strokeWidth="2" />
            <line x1="45" y1="51" x2="55" y2="51" stroke={primaryColor} strokeWidth="2" />
            {/* Concentric Keys of Heaven crossed at base */}
            <line x1="35" y1="75" x2="65" y2="85" stroke={accentColor} strokeWidth="1.5" />
            <line x1="65" y1="75" x2="35" y2="85" stroke={accentColor} strokeWidth="1.5" />
            <circle cx="32" cy="74" r="3.5" stroke={accentColor} fill="none" />
            <circle cx="68" cy="74" r="3.5" stroke={accentColor} fill="none" />
          </g>
        );
      case 6: // The Lovers (Влюбленные)
        return (
          <g transform="translate(15, 15)">
            {/* Giant glowing star constellation above */}
            <path d="M50,10 L54,18 L62,18 L56,23 L58,31 L50,26 L42,31 L44,23 L38,18 L46,18 Z" fill="#FDE047" className="animate-pulse" />
            {/* Glowing neon heart with flames */}
            <path d="M50,45 C50,45 35,30 35,22 C35,16 41,12 47,16 C50,18 50,18 50,18 C50,18 50,18 53,16 C59,12 65,16 65,22 C65,30 50,45 50,45 Z" fill="none" stroke="#EF4444" strokeWidth="2" />
            {/* Interconnecting rays or paths */}
            <path d="M22,78 Q50,55 78,78" stroke={primaryColor} strokeWidth="1.5" strokeDasharray="3,3" fill="none" />
            {/* Silhouettes reaching */}
            <circle cx="25" cy="78" r="5" fill="#E2E8F0" />
            <line x1="25" y1="83" x2="25" y2="92" stroke="#E2E8F0" strokeWidth="1.5" />
            <circle cx="75" cy="78" r="5" fill="#E2E8F0" />
            <line x1="75" y1="83" x2="75" y2="92" stroke="#E2E8F0" strokeWidth="1.5" />
          </g>
        );
      case 7: // The Chariot (Колесница)
        return (
          <g transform="translate(15, 15)">
            {/* Canopy of stars */}
            <rect x="20" y="25" width="60" height="2" fill="#818CF8" />
            <line x1="25" y1="27" x2="25" y2="65" stroke={primaryColor} strokeWidth="1" />
            <line x1="75" y1="27" x2="75" y2="65" stroke={primaryColor} strokeWidth="1" />
            {/* Shields with astrological planetary symbols */}
            <rect x="25" y="55" width="50" height="25" rx="3" stroke={primaryColor} strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="67" r="7" stroke={accentColor} strokeWidth="1" fill="none" />
            <line x1="45" y1="67" x2="55" y2="67" stroke={accentColor} strokeWidth="1" />
            <line x1="50" y1="62" x2="50" y2="72" stroke={accentColor} strokeWidth="1" />
            {/* Spinning wheels represent cosmic accelerators */}
            <circle cx="18" cy="75" r="9" stroke={primaryColor} strokeWidth="1.5" fill="none" />
            <circle cx="82" cy="75" r="9" stroke={primaryColor} strokeWidth="1.5" fill="none" />
            <line x1="18" y1="66" x2="18" y2="84" stroke={primaryColor} strokeWidth="0.75" />
            <line x1="82" y1="66" x2="82" y2="84" stroke={primaryColor} strokeWidth="0.75" />
          </g>
        );
      case 8: // Strength (Сила)
        return (
          <g transform="translate(15, 15)">
            {/* Infinity loop above maiden */}
            <path d="M35,22 Q42,16 50,22 T65,22 Q72,28 65,34 T50,28 Q42,34 35,22 Z" stroke={primaryColor} strokeWidth="1.5" fill="none" />
            {/* Maiden holding a lion's jaws gently */}
            <path d="M22,70 Q50,45 78,70" stroke="#10B981" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M35,70 Q50,56 65,70" stroke={primaryColor} strokeWidth="1" fill="none" />
            {/* Lion head silhouette */}
            <circle cx="50" cy="72" r="14" stroke={accentColor} strokeWidth="1.5" strokeDasharray="4,2" fill="none" />
            <path d="M43,67 C48,65 52,65 57,67" stroke={primaryColor} strokeWidth="1" />
            <path d="M45,77 Q50,83 55,77" stroke={primaryColor} strokeWidth="1.5" fill="none" />
          </g>
        );
      case 9: // The Hermit (Отшельник)
        return (
          <g transform="translate(15, 15)">
            {/* Lonely cold cliff mountain vector */}
            <path d="M10,90 L40,50 L55,65 L80,35 L90,90" stroke="#475569" strokeWidth="1.5" fill="none" />
            {/* The Hermit's shining star lantern */}
            <circle cx="35" cy="30" r="12" stroke="rgba(253, 224, 71, 0.3)" strokeWidth="3" fill="rgba(253, 224, 71, 0.15)" className="animate-pulse" />
            <circle cx="35" cy="30" r="4" fill="#FDE047" />
            {/* Light ray beams */}
            <line x1="35" y1="12" x2="35" y2="48" stroke="#FDE047" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="17" y1="30" x2="53" y2="30" stroke="#FDE047" strokeWidth="1" strokeDasharray="2,2" />
            {/* Walking Staff of Wisdom */}
            <line x1="22" y1="20" x2="50" y2="85" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 10: // Wheel of Fortune (Колесо Фортуны)
        return (
          <g transform="translate(15, 15)">
            {/* Astronomical concentric rings */}
            <circle cx="50" cy="50" r="32" stroke={primaryColor} strokeWidth="2.5" fill="none" />
            <circle cx="50" cy="50" r="24" stroke={accentColor} strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="50" r="12" stroke={primaryColor} strokeWidth="1" fill="none" />
            <circle cx="50" cy="50" r="3" fill={primaryColor} />
            {/* Astrological glyph markers */}
            <line x1="50" y1="18" x2="50" y2="82" stroke={primaryColor} strokeWidth="1" />
            <line x1="18" y1="50" x2="82" y2="50" stroke={primaryColor} strokeWidth="1" />
            <line x1="27" y1="27" x2="73" y2="73" stroke={accentColor} strokeWidth="0.75" />
            <line x1="73" y1="27" x2="27" y2="73" stroke={accentColor} strokeWidth="0.75" />
            <path d="M48,10 L52,10 L50,18 Z" fill={primaryColor} /> {/* Top pointer of fate */}
          </g>
        );
      case 11: // Justice (Справедливость)
        return (
          <g transform="translate(15, 15)">
            {/* Centered thin glowing sword of truth */}
            <line x1="50" y1="15" x2="50" y2="80" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="38" y1="24" x2="62" y2="24" stroke="#60A5FA" strokeWidth="2" /> {/* Hilt */}
            {/* Balance scale hanging from the hilt */}
            <line x1="20" y1="40" x2="80" y2="40" stroke={primaryColor} strokeWidth="1.5" />
            <circle cx="50" cy="40" r="2.5" fill={primaryColor} />
            {/* Left cup */}
            <line x1="20" y1="40" x2="12" y2="60" stroke={primaryColor} strokeWidth="1" />
            <line x1="20" y1="40" x2="28" y2="60" stroke={primaryColor} strokeWidth="1" />
            <path d="M10,60 Q20,67 30,60 Z" fill="none" stroke={primaryColor} strokeWidth="1.5" />
            {/* Right cup */}
            <line x1="80" y1="40" x2="72" y2="60" stroke={primaryColor} strokeWidth="1" />
            <line x1="80" y1="40" x2="88" y2="60" stroke={primaryColor} strokeWidth="1" />
            <path d="M70,60 Q80,67 90,60 Z" fill="none" stroke={primaryColor} strokeWidth="1.5" />
          </g>
        );
      case 12: // The Hanged Man (Повешенный)
        return (
          <g transform="translate(15, 15)">
            {/* Glowing Tree of Life cross profile */}
            <line x1="50" y1="10" x2="50" y2="80" stroke="#10B981" strokeWidth="3" />
            <line x1="20" y1="22" x2="80" y2="22" stroke="#10B981" strokeWidth="3" />
            {/* Inverted hanging figure vector */}
            <line x1="50" y1="22" x2="50" y2="50" stroke={primaryColor} strokeWidth="2" />
            <path d="M50,50 L40,62 L50,74" fill="none" stroke={primaryColor} strokeWidth="2" />
            <path d="M50,50 L60,58 L50,66" fill="none" stroke={primaryColor} strokeWidth="1.5" />
            {/* Golden halo of awakening */}
            <circle cx="50" cy="74" r="9" stroke={accentColor} strokeWidth="1.5" fill="none" className="animate-pulse" />
            <circle cx="50" cy="74" r="2" fill={accentColor} />
          </g>
        );
      case 13: // Death (Смерть)
        return (
          <g transform="translate(15, 15)">
            {/* Grim Reaper horse banner symbol (White rose of birth/sunset) */}
            <circle cx="50" cy="35" r="16" stroke={primaryColor} strokeWidth="2" fill="none" />
            <path d="M34,35 C34,45 50,60 50,60 C50,60 66,45 66,35 C66,25 50,15 50,15 C50,15 34,25 34,35 Z" stroke={accentColor} strokeWidth="1" fill="none" />
            <path d="M42,32 Q50,45 58,32" stroke={primaryColor} strokeWidth="1" fill="none" />
            {/* Star with eclipse effect at top */}
            <circle cx="50" cy="35" r="4" fill="#000" />
            {/* Scythe blade contour reflecting change */}
            <path d="M15,85 L45,85 A25,25 0 0,1 68,60" stroke="#E2E8F0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <line x1="15" y1="55" x2="15" y2="88" stroke={primaryColor} strokeWidth="2" />
          </g>
        );
      case 14: // Temperance (Умеренность)
        return (
          <g transform="translate(15, 15)">
            {/* Two flowing chalices of alchemy (Water arc) */}
            <circle cx="30" cy="32" r="5" stroke={primaryColor} strokeWidth="1.5" fill="none" />
            <path d="M25,28 Q30,40 35,28" stroke={primaryColor} strokeWidth="1" fill="none" />
            
            <circle cx="70" cy="68" r="5" stroke={primaryColor} strokeWidth="1.5" fill="none" />
            <path d="M65,64 Q70,76 75,64" stroke={primaryColor} strokeWidth="1" fill="none" />
            {/* Dynamic S-curve of cosmic fluid flowing gold */}
            <path d="M30,32 Q50,32 50,50 T70,68" stroke="#60A5FA" strokeWidth="2" fill="none" className="animate-pulse" />
            {/* Angel's wings representation */}
            <path d="M10,40 Q28,20 40,42" stroke={accentColor} strokeWidth="1.5" fill="none" />
            <path d="M90,40 Q72,20 60,42" stroke={accentColor} strokeWidth="1.5" fill="none" />
          </g>
        );
      case 15: // The Devil (Дьявол)
        return (
          <g transform="translate(15, 15)">
            {/* Pentagram above with point down representing shadows */}
            <polygon points="50,12 55,24 40,16 60,16 45,24" stroke="#EF4444" strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="18" r="8" stroke="#EF4444" strokeWidth="0.5" fill="none" />
            {/* Horns icon */}
            <path d="M38,36 Q50,28 62,36 Q50,42 38,36 Z" fill="none" stroke={primaryColor} strokeWidth="1.5" />
            <path d="M38,36 Q30,22 34,26" stroke={primaryColor} strokeWidth="1.5" fill="none" />
            <path d="M62,36 Q70,22 66,26" stroke={primaryColor} strokeWidth="1.5" fill="none" />
            {/* Binding chains representing attachments */}
            <path d="M25,80 Q50,65 75,80" stroke={accentColor} strokeWidth="1" strokeDasharray="3,2" fill="none" />
            <rect x="42" y="65" width="16" height="5" rx="1" stroke={primaryColor} strokeWidth="1" fill="none" />
          </g>
        );
      case 16: // The Tower (Башня)
        return (
          <g transform="translate(15, 15)">
            {/* Tower structure */}
            <path d="M32,90 L38,30 L62,30 L68,90 Z" stroke={primaryColor} strokeWidth="2" fill="none" />
            <rect x="45" y="45" width="10" height="15" rx="1" stroke={primaryColor} strokeWidth="1" fill="none" />
            {/* Lightning bolt hitting and cracking the monolith */}
            <path d="M55,5 L42,32 L56,33 L45,55" stroke="#FBBF24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Falling sparks */}
            <circle cx="28" cy="48" r="1.5" fill="#EF4444" />
            <circle cx="72" cy="52" r="1.5" fill="#EF4444" />
            <circle cx="35" cy="65" r="1" fill="#FBBF24" />
            <circle cx="65" cy="70" r="1" fill="#FBBF24" />
          </g>
        );
      case 17: // The Star (Звезда)
        return (
          <g transform="translate(15, 15)">
            {/* Giant central 8-pointed star */}
            <path d="M50,15 L54,28 L67,28 L57,36 L61,49 L50,41 L39,49 L43,36 L33,28 L46,28 Z" fill="#FDE047" className="animate-pulse" />
            {/* Tiny satellite stars */}
            <polygon points="25,25 27,30 32,30 28,33 29,38 25,35 21,38 22,33 18,30 23,30" fill="#A78BFA" transform="scale(0.8) translate(-5, 0)" />
            <polygon points="75,25 77,30 82,30 78,33 79,38 75,35 71,38 72,33 68,30 73,30" fill="#A78BFA" transform="scale(0.8) translate(18, 0)" />
            <polygon points="50,65 52,70 57,70 53,73 54,78 50,75 46,78 47,73 43,70 48,70" fill="#A78BFA" transform="scale(0.8) translate(0, 18)" />
            {/* Stream lines of cosmic fluid */}
            <path d="M28,60 Q50,75 80,55" stroke="#60A5FA" strokeWidth="1.5" fill="none" />
            <path d="M22,68 Q50,82 78,64" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2,1" fill="none" />
          </g>
        );
      case 18: // The Moon (Луна)
        return (
          <g transform="translate(15, 15)">
            {/* Gateway pillars at edge */}
            <rect x="12" y="30" width="8" height="55" fill="none" stroke={primaryColor} strokeWidth="1.2" />
            <rect x="80" y="30" width="8" height="55" fill="none" stroke={primaryColor} strokeWidth="1.2" />
            {/* Moon crescent with radiating drops */}
            <path d="M50,15 A16,16 0 1,1 34,31 A12,12 0 1,0 50,15 Z" fill="#E2E8F0" />
            <circle cx="50" cy="31" r="16" stroke={accentColor} strokeWidth="1" fill="none" />
            {/* Drops */}
            <circle cx="50" cy="53" r="1.5" fill="#C084FC" />
            <circle cx="43" cy="58" r="1" fill="#C084FC" />
            <circle cx="57" cy="58" r="1" fill="#C084FC" />
            {/* Underworld crayfish reaching from portal waters */}
            <path d="M20,85 Q50,70 80,85" stroke="#3B82F6" strokeWidth="2" fill="none" />
            <path d="M15,91 Q50,78 85,91" stroke="#3B82F6" strokeWidth="1" fill="none" />
            <path d="M44,82 L47,76 Q50,72 53,76 L56,82" stroke={primaryColor} strokeWidth="1.5" fill="none" />
          </g>
        );
      case 19: // The Sun (Солнце)
        return (
          <g transform="translate(15, 15)">
            {/* Dynamic solar radiation beams */}
            <circle cx="50" cy="45" r="18" stroke={primaryColor} strokeWidth="2.5" fill="none" className="scale-105 origin-center animate-pulse" />
            <circle cx="50" cy="45" r="14" stroke={accentColor} strokeWidth="1.5" fill="none" />
            {/* Beams */}
            <line x1="50" y1="18" x2="50" y2="10" stroke={primaryColor} strokeWidth="1.5" />
            <line x1="50" y1="72" x2="50" y2="80" stroke={primaryColor} strokeWidth="1.5" />
            <line x1="23" y1="45" x2="15" y2="45" stroke={primaryColor} strokeWidth="1.5" />
            <line x1="77" y1="45" x2="85" y2="45" stroke={primaryColor} strokeWidth="1.5" />
            
            <line x1="31" y1="26" x2="25" y2="20" stroke={primaryColor} strokeWidth="1" />
            <line x1="69" y1="64" x2="75" y2="70" stroke={primaryColor} strokeWidth="1" />
            <line x1="31" y1="64" x2="25" y2="70" stroke={primaryColor} strokeWidth="1" />
            <line x1="69" y1="26" x2="75" y2="20" stroke={primaryColor} strokeWidth="1" />
            {/* Blooming organic sunflower symbols */}
            <circle cx="30" cy="80" r="4" fill="#F59E0B" />
            <circle cx="70" cy="80" r="4" fill="#F59E0B" />
            <path d="M20,85 Q50,77 80,85" stroke="#10B981" strokeWidth="1.5" fill="none" />
          </g>
        );
      case 20: // Judgement (Суд)
        return (
          <g transform="translate(15, 15)">
            {/* Cosmic golden trumpet projecting sound vibrations */}
            <path d="M48,12 L52,12 L54,34 L62,44 L38,44 L46,34 Z" fill="none" stroke={primaryColor} strokeWidth="1.5" />
            <line x1="50" y1="5" x2="50" y2="12" stroke={primaryColor} strokeWidth="1.5" />
            {/* Rays of vibration and awakening */}
            <path d="M22,54 Q50,42 78,54" stroke={accentColor} strokeWidth="1" strokeDasharray="2,2" fill="none" />
            <path d="M15,62 Q50,50 85,62" stroke={accentColor} strokeWidth="1" strokeDasharray="3,3" fill="none" />
            {/* Rising figures represented elegantly */}
            <rect x="25" y="72" width="12" height="15" rx="1" fill="none" stroke="#E2E8F0" strokeWidth="1.2" />
            <rect x="63" y="72" width="12" height="15" rx="1" fill="none" stroke="#E2E8F0" strokeWidth="1.2" />
            <rect x="44" y="68" width="12" height="18" rx="1" fill="none" stroke={primaryColor} strokeWidth="1.5" />
          </g>
        );
      case 21: // The World (Мир)
        return (
          <g transform="translate(15, 15)">
            {/* Laureate botanical oval matrix wreath */}
            <ellipse cx="50" cy="50" rx="28" ry="38" stroke="#10B981" strokeWidth="2" fill="none" strokeDasharray="5,2" />
            {/* Cosmic dancer vector form */}
            <circle cx="50" cy="28" r="4.5" fill="#E2E8F0" />
            <path d="M50,32.5 L50,56" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M40,42 L50,38 L60,40" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
            <path d="M42,68 L50,56 L58,62" fill="none" stroke={primaryColor} strokeWidth="2" />
            {/* Four celestial corner glyph elements represent elements */}
            <circle cx="15" cy="15" r="3" fill="#60A5FA" />
            <circle cx="85" cy="15" r="3" fill="#F43F5E" />
            <circle cx="15" cy="85" r="3" fill="#34D399" />
            <circle cx="85" cy="85" r="3" fill="#FBBF24" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className={`relative shrink-0 select-none rounded-xl overflow-hidden cursor-pointer ${sizeClasses[size]} group`}
      style={{
        perspective: "1000px",
        transform: isHovering ? "scale(1.04)" : "scale(1)",
        transition: isHovering ? "transform 0.1s ease-out" : "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Flip Container */}
      <div 
        className={`w-full h-full relative`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped 
            ? `rotateY(180deg) ${isHovering ? `rotateX(${tilt.x}deg) rotateY(${-tilt.y}deg)` : ""}` 
            : `rotateY(0deg) ${isHovering ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : ""}`,
          transition: isHovering ? "none" : "transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        }}
      >
        {/* CARD BACK SIDE (Visible when flipped false) */}
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#120722] via-[#090311] to-[#04010a] border border-[#ffd700]/30 rounded-xl flex flex-col items-center justify-between p-3"
          style={{
            backfaceVisibility: "hidden",
            boxShadow: `0 0 20px rgba(188, 19, 254, 0.15)`
          }}
        >
          {/* Card Border frame back */}
          <div className="absolute inset-1.5 border border-[#ffd700]/10 rounded-lg pointer-events-none" />

          {/* Golden starry symbols back side */}
          <div className="text-[9px] font-sans font-light tracking-widest text-[#ffd700]/70 uppercase">CÉLESTE TAROT</div>
          
          {/* Astronomical Orbit Rings drawing */}
          <div className="w-full flex items-center justify-center py-2 h-2/3">
            <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] text-[#ffd700]/20">
              {/* Outer constellations */}
              <circle cx="50" cy="50" r="46" stroke="rgba(255, 215, 0, 0.15)" strokeWidth="0.75" fill="none" />
              <circle cx="50" cy="50" r="43" stroke="rgba(255, 215, 0, 0.3)" strokeWidth="1" strokeDasharray="3,2" fill="none" />
              <circle cx="50" cy="50" r="34" stroke="rgba(188, 19, 254, 0.2)" strokeWidth="0.75" fill="none" />
              <circle cx="50" cy="50" r="22" stroke="rgba(255, 215, 0, 0.4)" strokeWidth="1.2" fill="none" />
              <circle cx="50" cy="50" r="8" fill="rgba(188, 19, 254, 0.05)" stroke="rgba(255, 215, 0, 0.3)" strokeWidth="1" />
              {/* Crossed lines representing celestial alignment */}
              <line x1="50" y1="4" x2="50" y2="96" stroke="rgba(255, 215, 0, 0.2)" strokeWidth="0.75" />
              <line x1="4" y1="50" x2="96" y2="50" stroke="rgba(255, 215, 0, 0.2)" strokeWidth="0.75" />
              <line x1="17" y1="17" x2="83" y2="83" stroke="rgba(188, 19, 254, 0.1)" strokeWidth="0.5" />
              <line x1="83" y1="17" x2="17" y2="83" stroke="rgba(188, 19, 254, 0.1)" strokeWidth="0.5" />
              {/* Rotating glowing core star simulation */}
              <polygon points="50,42 52,48 58,50 52,52 50,58 48,52 42,50 48,48" fill="#ffd700" />
            </svg>
          </div>

          <div className="text-[8px] font-mono tracking-widest text-[#ffd700]/30">★ ★ ★</div>

          {/* Dynamic golden shine reflection */}
          {isHovering && (
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-25 z-20 rounded-xl"
              style={{
                background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255, 215, 0, 0.7) 0%, transparent 55%)`
              }}
            />
          )}
        </div>

        {/* CARD FRONT SIDE (Visible when flipped true, inverted with Y rotation) */}
        <div 
          className={`absolute inset-0 w-full h-full bg-gradient-to-b from-[#0f071d] via-[#090412] to-[#040108] border-2 rounded-xl flex flex-col items-center justify-between p-2 select-none`}
          style={{
            backfaceVisibility: "hidden",
            transform: `rotateY(180deg) ${isReversed ? "rotate(180deg)" : "rotate(0deg)"}`,
            borderColor: isReversed ? "rgba(188, 19, 254, 0.45)" : "rgba(255, 215, 0, 0.45)",
            boxShadow: `0 0 22px ${isReversed ? "rgba(188, 19, 254, 0.12)" : "rgba(255, 215, 0, 0.12)"}`
          }}
        >
          {/* Neon inner frame */}
          <div className="absolute inset-1 border border-[#ffd700]/15 rounded-lg pointer-events-none" />
          <div className="absolute inset-[3px] border border-[#bc13fe]/10 rounded-lg pointer-events-none" />

          {/* Roman index */}
          <div className="text-[10px] font-serif font-semibold tracking-widest text-[#ffd700] mt-1 flex items-center gap-1.5">
            <span className="text-[7px] text-[#ffd700]/40">◆</span>
            {getRomanNumeral(cardId)}
            <span className="text-[7px] text-[#ffd700]/40">◆</span>
          </div>

          {/* SVG Canvas (Centered) */}
          <div className="w-full flex items-center justify-center grow max-h-[64%] touch-none">
            <svg viewBox="0 0 100 102" className="w-[85%] h-full">
              {renderCardIllustration(cardId)}
            </svg>
          </div>

          {/* Card Name label Footer */}
          <div className="w-full text-center pb-1 z-10">
            <div className="font-serif font-medium text-[11px] sm:text-xs tracking-wider text-[#ffd700] uppercase leading-tight">
              {nameRu}
            </div>
            <div className="font-mono text-[7px] tracking-widest text-[#e0d8cf]/60 uppercase mt-0.5">
              {nameEn} {isReversed && "(Перев.)"}
            </div>
          </div>

          {/* Dynamic golden shine reflection */}
          {isHovering && (
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-25 z-20 rounded-xl"
              style={{
                background: `radial-gradient(circle at ${100 - shine.x}% ${shine.y}%, rgba(255, 215, 0, 0.7) 0%, transparent 55%)`
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
