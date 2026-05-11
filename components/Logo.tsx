import React from 'react';

interface LogoProps {
  size?: number | string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 48, className = "" }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Crescent/Frame shapes */}
        <path 
           d="M25 40C20 50 20 70 35 80" 
           stroke="#0F62FE" 
           strokeWidth="3" 
           strokeLinecap="round" 
        />
        <path 
           d="M75 40C80 50 80 70 65 80" 
           stroke="#0F62FE" 
           strokeWidth="3" 
           strokeLinecap="round" 
        />

        {/* Book at the bottom */}
        <path 
          d="M30 75C30 75 40 70 50 75C60 70 70 75 70 75V68C70 68 60 63 50 68C40 63 30 68 30 68V75Z" 
          fill="#0F62FE" 
        />
        <path 
          d="M30 72C30 72 40 67 50 72C60 67 70 72 70 72V67C70 67 60 62 50 67C40 62 30 67 30 67V72Z" 
          fill="#00D1FF" 
        />
        <path d="M50 67V75" stroke="#101010" strokeWidth="1" />
        
        {/* Feather Pen (Qalam) centered */}
        <path 
          d="M50 65L50 20C50 20 42 35 50 45C58 35 50 20 50 20" 
          fill="#002D9C" 
        />
        {/* Pen Nib detail */}
        <path d="M48.5 60H51.5L50 68L48.5 60Z" fill="#002D9C" />
        <path d="M50 60V68" stroke="white" strokeWidth="0.5" />

        {/* Stars on the right */}
        {/* Large star */}
        <path d="M62 60L63.5 63L66.5 63L64 65L65 68L62 66.5L59 68L60 65L57.5 63L60.5 63L62 60Z" fill="#101010" />
        {/* Medium star */}
        <path d="M68 53L69 55L71 55L69.5 56.5L70 58.5L68 57.5L66 58.5L66.5 56.5L65 55L67 55L68 53Z" fill="#101010" />
        {/* Small star */}
        <path d="M64 48L64.5 49.2L65.7 49.3L64.8 50.2L65 51.5L64 51L63 51.5L63.2 50.2L62.3 49.3L63.5 49.2L64 48Z" fill="#101010" />
      </svg>
    </div>
  );
};
