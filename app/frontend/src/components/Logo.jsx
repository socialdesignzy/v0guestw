import React from 'react';

export default function Logo({ className = '', isWhite = false, size = 'md' }) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const height = sizeClasses[size] || sizeClasses.md;
  const textSize = textSizes[size] || textSizes.md;
  const gradientId = `gGradient-${size}-${isWhite}`;
  const highlightId = `gHighlight-${size}-${isWhite}`;
  const shadowId = `gShadow-${size}-${isWhite}`;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Stylized Geometric 'G' SVG */}
      <svg
        width={size === 'sm' ? '24' : size === 'lg' ? '40' : size === 'xl' ? '48' : '32'}
        height={size === 'sm' ? '24' : size === 'lg' ? '40' : size === 'xl' ? '48' : '32'}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={height}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isWhite ? "#ffffff" : "#003366"} stopOpacity="1" />
            <stop offset="30%" stopColor={isWhite ? "#f0f0f0" : "#004F9F"} stopOpacity="1" />
            <stop offset="60%" stopColor={isWhite ? "#ffffff" : "#0066CC"} stopOpacity="1" />
            <stop offset="100%" stopColor={isWhite ? "#e0e0e0" : "#007FFF"} stopOpacity="1" />
          </linearGradient>
          <linearGradient id={highlightId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isWhite ? "#ffffff" : "#3399FF"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isWhite ? "#f5f5f5" : "#66CCFF"} stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={shadowId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isWhite ? "#cccccc" : "#003366"} stopOpacity="0.6" />
            <stop offset="100%" stopColor={isWhite ? "#aaaaaa" : "#004F9F"} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Main G shape - proper letter G with geometric folded style */}
        {/* Outer C shape forming the G */}
        <path
          d="M 20 15 Q 10 15 10 25 L 10 75 Q 10 85 20 85 L 70 85 Q 85 85 85 70 L 85 50 Q 85 45 80 45 L 60 45 L 60 55 L 75 55 Q 80 55 80 50 L 80 60 Q 80 65 75 65 L 20 65 Q 15 65 15 60 L 15 40 Q 15 30 25 30 L 70 30 Q 80 30 80 40 L 80 35 Q 80 25 70 25 L 20 25 Q 15 25 15 30 Q 15 20 20 15 Z"
          fill={`url(#${gradientId})`}
          stroke={isWhite ? "#ffffff" : "#0066CC"}
          strokeWidth="2.5"
        />
        
        {/* Horizontal bar of G (the opening/hook) */}
        <path
          d="M 60 40 L 85 40 L 85 50 L 60 50 Z"
          fill={`url(#${gradientId})`}
          stroke={isWhite ? "#ffffff" : "#0066CC"}
          strokeWidth="2.5"
        />
        
        {/* Inner shadow for 3D effect - left side */}
        <path
          d="M 20 20 L 20 80 L 25 80 L 25 20 Z"
          fill={`url(#${shadowId})`}
          opacity="0.4"
        />
        
        {/* Top highlight */}
        <path
          d="M 20 15 Q 10 15 10 25 L 15 25 Q 15 20 20 20 L 70 20 Q 75 20 75 25 L 70 25 Q 70 20 20 20 Z"
          fill={`url(#${highlightId})`}
          opacity="0.5"
        />
        
        {/* Horizontal bar highlight */}
        <path
          d="M 60 40 L 85 40 L 85 45 L 60 45 Z"
          fill={`url(#${highlightId})`}
          opacity="0.6"
        />
      </svg>
      
      {/* "uestWorker" text */}
      <span
        className={`${textSize} font-bold italic ${
          isWhite
            ? 'text-white'
            : 'bg-gradient-to-r from-[#007FFF] to-[#3399FF] bg-clip-text text-transparent'
        }`}
        style={{ fontFamily: 'sans-serif', letterSpacing: 'normal' }}
      >
        uestWorker
      </span>
    </div>
  );
}
