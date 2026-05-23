import React, { useEffect, useState } from "react";

export default function MagicalBackground() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

  useEffect(() => {
    // Generate static random floating points
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div id="magical-bg" className="fixed inset-0 overflow-hidden bg-[#050208] -z-50 select-none" style={{ background: "radial-gradient(circle at 50% 50%, #1a0b2e 0%, #050208 100%)" }}>
      {/* Deep cosmic purple and gold editorial glowing nebulae */}
      <div 
        id="nebula-purple" 
        className="absolute -top-[100px] -left-[100px] w-[400px] h-[400px] rounded-full bg-[#bc13fe] opacity-10 blur-[120px] animate-pulse"
        style={{ animationDuration: "12s" }}
      />
      <div 
        id="nebula-gold" 
        className="absolute -bottom-[100px] -right-[100px] w-[500px] h-[500px] rounded-full bg-[#ffd700] opacity-5 blur-[150px] animate-pulse"
        style={{ animationDuration: "18s" }}
      />
      <div 
        id="nebula-blue" 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-950/10 blur-[160px]"
      />

      {/* Twinkling star field */}
      <div id="stars-overlay-1" className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      <div id="stars-overlay-2" className="absolute inset-0 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:48px_48px] opacity-10 animate-pulse" style={{ animationDuration: "4s" }} />

      {/* Floating luminous dust particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-purple-300/40 blur-[0.5px] animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float ${p.duration}s ease-in-out infinite alternate`,
            opacity: Math.random() * 0.5 + 0.3
          }}
        />
      ))}

      {/* Custom styles injected directly to prevent additional css files */}
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0px) translateX(0px) scale(0.9);
            opacity: 0.2;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-40px) translateX(20px) scale(1.1);
            opacity: 0.3;
          }
        }
        .animate-float {
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
