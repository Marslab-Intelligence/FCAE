import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>(
    []
  );

  useEffect(() => {
    const styles = [...new Array(number || 20)].map(() => ({
      top: -5,
      left: Math.floor(Math.random() * 100) + "vw",
      animationDelay: Math.random() * 1 + 0.2 + "s",
      animationDuration: Math.floor(Math.random() * 8 + 2) + "s",
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <>
      {[...meteorStyles].map((style, idx) => (
        // Meteor Tail
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute h-0.5 w-0.5 rounded-full bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-215",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-1/2 before:w-12.5 before:h-px before:bg-linear-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={style}
        ></span>
      ))}
    </>
  );
};

// You will also need to add this animation to your tailwind.config.js or global CSS file:
/*
@keyframes meteor-effect {
  0% {
    transform: rotate(215deg) translateX(0);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: rotate(215deg) translateX(-500px);
    opacity: 0;
  }
}
*/