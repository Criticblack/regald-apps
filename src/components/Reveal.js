'use client';
import { useState, useEffect, useRef } from 'react';

export default function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); o.disconnect(); }
    }, { threshold: 0.08 });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(24px)',
      transition: `all 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`, ...style,
    }}>{children}</div>
  );
}
