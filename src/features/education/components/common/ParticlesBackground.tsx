"use client";

import React, { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { useTheme } from "next-themes";

const ParticlesBackground = () => {
  const [init, setInit] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const isDark = resolvedTheme === "dark";

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: -1 },
      fpsLimit: 120,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: ["grab", "bubble"],
          },
          resize: { enable: true },
        },
        modes: {
          grab: {
            distance: 300, // Tăng khoảng cách để dễ "bắt" được các hạt thưa
            links: {
              opacity: 1,
              color: isDark ? "#FFFFFF" : "#1E40AF",
            },
          },
          bubble: {
            distance: 250,
            size: 24, // Hạt thưa thì cho to lên một chút khi hover nhìn sẽ "phê" hơn
            duration: 2,
            opacity: 1,
            color: isDark ? "#FFFFFF" : "#3B82F6",
          },
        },
      },
      particles: {
        color: {
          value: isDark
            ? ["#A5B4FC", "#FFFFFF", "#60A5FA"]
            : ["#2563EB", "#3B82F6"],
        },

        shadow: {
          enable: true,
          color: isDark ? "#6366F1" : "#3B82F6",
          blur: 10, // Tăng nhẹ độ tỏa sáng
        },

        links: {
          color: isDark ? "#818CF8" : "#3B82F6",
          distance: 220, // Tăng khoảng cách nối để các hạt thưa vẫn liên kết được với nhau
          enable: true,
          opacity: 0.3,
          width: 1,
        },
        move: {
          enable: true,
          speed: 0.5, // Chậm lại một chút để cảm giác bay bổng hơn
          direction: "none",
          outModes: { default: "bounce" },
        },
        number: {
          // GIẢM SỐ LƯỢNG HẠT XUỐNG CỰC THƯA
          density: { enable: true, width: 1000, height: 1000 },
          value: 28, // Chỉ để khoảng 18-20 hạt cho toàn màn hình
        },
        shape: {
          type: "char",
          options: {
            char: [
              { value: "🎓", font: "serif", weight: "10" },
              { value: "📖", font: "serif", weight: "10" },
              { value: "✏️", font: "serif", weight: "10" },
              { value: "💡", font: "serif", weight: "10" },
              { value: "A+", font: "serif", weight: "10" },
            ],
          },
        },
        size: {
          value: { min: 10, max: 18 },
        },
        opacity: {
          value: isDark ? 0.5 : 0.7, // Tăng độ sáng vì số lượng hạt đã ít đi
        },
      },
      detectRetina: true,
      background: { color: "transparent" },
    }),
    [isDark],
  );

  if (!init) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Particles id="tsparticles-edu" options={options} />
    </div>
  );
};

export default ParticlesBackground;
