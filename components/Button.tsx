import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'wood';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-xl font-bold text-lg shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all transform duration-100 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-yellow-400 text-yellow-900 hover:bg-yellow-300 border-2 border-yellow-600",
    secondary: "bg-blue-400 text-blue-900 hover:bg-blue-300 border-2 border-blue-600",
    danger: "bg-red-500 text-white hover:bg-red-400 border-2 border-red-700",
    wood: "bg-[#8B4513] text-[#FFE4B5] border-4 border-[#5D2906] hover:bg-[#A0522D] shadow-[0_4px_0_#3e1b04]",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
