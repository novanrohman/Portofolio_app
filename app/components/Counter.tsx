"use client";

import { useEffect, useRef, useState } from "react";

export default function Counter({
  target,
  duration = 1500,
  suffix = "",
  className = "",
}: {
  target: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let start = 0;

    const run = () => {
      const step = (now: number) => {
        if (!start) start = now;
        const progress = Math.min((now - start) / duration, 1);
        // easeOutQuad — smooth but still ticks through every stage visibly
        const eased = 1 - (1 - progress) * (1 - progress);
        setValue(Math.round(eased * target));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run();
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.4 }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  );
}
