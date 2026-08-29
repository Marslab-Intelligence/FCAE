"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type HolographicWallProps = {
  intensity?: number;
  radius?: number;
  className?: string;
  fullScreen?: boolean;
};

// Pharaonic hieroglyphic symbols
const HIEROGLYPHS = [
  "𓄿",
  "𓇋",
  "𓅱",
  "𓃀",
  "𓊪",
  "𓆑",
  "𓅓",
  "𓈖",
  "𓂋",
  "𓉔",
  "𓎛",
  "𓐍",
  "𓄡",
  "𓋴",
  "𓈙",
  "𓈎",
  "𓎡",
  "𓎼",
  "𓏏",
  "𓂧",
];

export function HolographicWall({
  intensity = 0.4,
  radius = 200,
  className = "",
  fullScreen: _fullScreen = true,
}: HolographicWallProps) {
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [letters, setLetters] = useState<
    Array<{ char: string; x: number; y: number }>
  >([]);

  useEffect(() => {
    const generateGrid = () => {
      const width = typeof window !== "undefined" ? window.innerWidth : 1920;
      const height = typeof window !== "undefined" ? window.innerHeight : 1080;
      
      const cols = Math.ceil(width / 60);
      const rows = Math.ceil(height / 50);
      const spacingX = width / cols;
      const spacingY = height / rows;
      
      const newLetters: Array<{ char: string; x: number; y: number }> = [];

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          newLetters.push({
            char: HIEROGLYPHS[Math.floor(Math.random() * HIEROGLYPHS.length)],
            x: i * spacingX + spacingX / 2,
            y: j * spacingY + spacingY / 2,
          });
        }
      }
      setLetters(newLetters);
    };

    generateGrid();

    const handleResize = () => {
      generateGrid();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        // Disable wall glow when hovering over tables, cards, buttons, inputs, or sidebar navigation
        const isOverContent = target.closest(
          '.glass-card, .glass-panel, [class*="glass-"], table, tbody, thead, tr, td, th, button, a, input, select, textarea, label, [role="button"], aside, nav, header, [data-card]'
        );

        if (isOverContent) {
          setMousePosition(null);
          return;
        }
      }

      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseLeave = () => {
      setMousePosition(null);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Pharaonic hieroglyphs on the wall */}
      <div className="absolute inset-0">
        {letters.map((letter, index) => {
          const distance = mousePosition
            ? Math.sqrt(
                Math.pow(letter.x - mousePosition.x, 2) +
                  Math.pow(letter.y - mousePosition.y, 2)
              )
            : Infinity;

          const letterIntensity =
            mousePosition && distance < radius
              ? Math.max(0, 1 - distance / radius) * intensity
              : 0;

          const isNear = mousePosition && distance < radius;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0.05 }}
              animate={{
                opacity: isNear ? 0.75 : 0.05,
                scale: isNear ? 1.25 : 1,
                color: isNear
                  ? "var(--hieroglyph-hover-color, rgba(255, 215, 0, 0.85))"
                  : "var(--hieroglyph-color, rgba(255, 255, 255, 0.08))",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="absolute text-sm font-medium select-none transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: letter.x,
                top: letter.y,
                textShadow: isNear
                  ? `0 0 ${letterIntensity * 20}px var(--hieroglyph-hover-color, rgba(255, 215, 0, 0.6))`
                  : "none",
              }}
            >
              {letter.char}
            </motion.div>
          );
        })}
      </div>

      {/* Subtle cursor light halo - active only near mouse */}
      <AnimatePresence>
        {mousePosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: intensity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div
              className="absolute rounded-full"
              style={{
                left: mousePosition.x,
                top: mousePosition.y,
                width: `${radius * 1.8}px`,
                height: `${radius * 1.8}px`,
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(circle, var(--halo-color, rgba(255, 215, 0, 0.25)) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HolographicWall;
