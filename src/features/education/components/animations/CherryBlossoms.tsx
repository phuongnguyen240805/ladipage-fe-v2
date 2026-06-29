"use client";
import React, { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
  isFallen: boolean;
}

export default function CherryBlossoms() {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [fallenPetals, setFallenPetals] = useState<Petal[]>([]);

  useEffect(() => {
    let idCounter = 0;
    let mounted = true;
    const timeouts: number[] = [];

    const createPetal = () => {
      if (!mounted) return;
      
      const newPetal: Petal = {
        id: idCounter++,
        left: Math.random() * 100,
        size: Math.random() * 18 + 14,
        duration: Math.random() * 5 + 7,
        delay: Math.random() * 3,
        rotate: Math.random() * 360,
        isFallen: false,
      };
      
      setPetals(prev => [...prev, newPetal]);
      
      timeouts.push(window.setTimeout(() => {
        setPetals(prev => prev.filter(p => p.id !== newPetal.id));
        setFallenPetals(prev => [...prev, { ...newPetal, isFallen: true }]);
      }, newPetal.duration * 1000 + newPetal.delay * 1000));
    };

    for (let i = 0; i < 25; i++) {
      timeouts.push(window.setTimeout(() => createPetal(), i * 120));
    }

    const interval = window.setInterval(createPetal, 400);

    return () => {
      mounted = false;
      clearInterval(interval);
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, []);

  const handleMouseEnter = (petalId: number, isFallen: boolean) => (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (!target) return;

    target.classList.remove("petal-jump");
    void target.offsetWidth;
    target.classList.add("petal-jump");
  };

  return (
    <div style={{ 
      position: "fixed", 
      top: 0, 
      left: 0, 
      width: "100%", 
      height: "100%", 
      pointerEvents: "none", 
      overflow: "hidden", 
      zIndex: 9999 
    }}>
      {/* Hoa đang rơi */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          style={{
            position: "absolute",
            left: petal.left + "%",
            top: "-40px",
            width: petal.size + "px",
            height: petal.size + "px",
            animation: `fallPetals ${petal.duration}s linear ${petal.delay}s forwards`,
            cursor: "pointer",
            pointerEvents: "auto",
            transform: `rotate(${petal.rotate}deg)`,
          }}
        >
          <div className="petal-inner" onMouseEnter={handleMouseEnter(petal.id, false)}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <g transform="translate(50 50)">
                {/* 5 cánh hoa tròn, xếp thành vòng tròn, có khoảng hở */}
                <ellipse cx="0" cy="-16" rx="12" ry="16" fill="#FFB7C5" opacity="0.9" />
                <ellipse cx="15" cy="-5" rx="12" ry="16" fill="#FFB7C5" opacity="0.9" transform="rotate(72)" />
                <ellipse cx="10" cy="13" rx="12" ry="16" fill="#FFB7C5" opacity="0.9" transform="rotate(144)" />
                <ellipse cx="-10" cy="13" rx="12" ry="16" fill="#FFB7C5" opacity="0.9" transform="rotate(216)" />
                <ellipse cx="-15" cy="-5" rx="12" ry="16" fill="#FFB7C5" opacity="0.9" transform="rotate(288)" />
                {/* Nhụy đỏ ở giữa */}
                <circle cx="0" cy="0" r="5" fill="#E8314F" />
                <circle cx="0" cy="0" r="2.5" fill="#C41E3A" />
                {/* Các sợi nhụy nhỏ */}
                <line x1="0" y1="0" x2="-5" y2="-3" stroke="#E8314F" strokeWidth="0.7" />
                <line x1="0" y1="0" x2="5" y2="-3" stroke="#E8314F" strokeWidth="0.7" />
                <line x1="0" y1="0" x2="-4" y2="4" stroke="#E8314F" strokeWidth="0.7" />
                <line x1="0" y1="0" x2="4" y2="4" stroke="#E8314F" strokeWidth="0.7" />
                <line x1="0" y1="0" x2="0" y2="-6" stroke="#E8314F" strokeWidth="0.7" />
              </g>
            </svg>
          </div>
        </div>
      ))}

      {/* Hoa đã rơi */}
      {fallenPetals.map((petal) => (
        <div
          key={petal.id}
          style={{
            position: "absolute",
            left: petal.left + "%",
            bottom: "0px",
            width: petal.size * 0.8 + "px",
            height: petal.size * 0.8 + "px",
            cursor: "pointer",
            pointerEvents: "auto",
            transform: `rotate(${petal.rotate}deg)`,
            opacity: 0.5,
          }}
        >
          <div className="petal-inner" onMouseEnter={handleMouseEnter(petal.id, true)}>
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <g transform="translate(50 50)">
                <ellipse cx="0" cy="-16" rx="12" ry="16" fill="#FFB7C5" opacity="0.8" />
                <ellipse cx="15" cy="-5" rx="12" ry="16" fill="#FFB7C5" opacity="0.8" transform="rotate(72)" />
                <ellipse cx="10" cy="13" rx="12" ry="16" fill="#FFB7C5" opacity="0.8" transform="rotate(144)" />
                <ellipse cx="-10" cy="13" rx="12" ry="16" fill="#FFB7C5" opacity="0.8" transform="rotate(216)" />
                <ellipse cx="-15" cy="-5" rx="12" ry="16" fill="#FFB7C5" opacity="0.8" transform="rotate(288)" />
                <circle cx="0" cy="0" r="3.5" fill="#E8314F" />
              </g>
            </svg>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes fallPetals {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0.4;
          }
        }

        @keyframes petalJump {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
          30% {
            transform: translateY(-18px) scale(1.15) rotate(8deg);
          }
          60% {
            transform: translateY(-6px) scale(1.05) rotate(-3deg);
          }
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
          }
        }

        .petal-inner {
          width: 100%;
          height: 100%;
          transform-origin: center;
        }

        .petal-inner.petal-jump {
          animation: petalJump 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}