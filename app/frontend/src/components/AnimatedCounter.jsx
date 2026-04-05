import React, { useEffect, useState } from 'react';

export default function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '', decimals = 0 }) {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (end === 0 || end === null || end === undefined) return;
    
    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = 0;
    const endValue = typeof end === 'string' ? parseFloat(end.replace(/[^0-9.]/g, '')) : end;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;
      
      setCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration]);

  const formatNumber = (num) => {
    if (decimals === 0) {
      return Math.floor(num).toLocaleString('en-IN');
    }
    return num.toFixed(decimals).toLocaleString('en-IN');
  };

  // If end is a string with special formatting (like "₹7.27L+"), return it as is after animation
  if (typeof end === 'string' && (end.includes('L+') || end.includes('K+') || end.includes('+'))) {
    return (
      <span>
        {isAnimating ? (
          <span className="tabular-nums">{formatNumber(count)}{suffix}</span>
        ) : (
          <span className="tabular-nums">{end}</span>
        )}
      </span>
    );
  }

  return (
    <span className="tabular-nums">
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
}
