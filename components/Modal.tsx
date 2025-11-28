import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFF8DC] w-full max-w-md rounded-3xl border-4 border-[#8B4513] shadow-2xl relative flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#DEB887] p-4 rounded-t-2xl border-b-4 border-[#8B4513] flex justify-between items-center relative">
          {/* Wood Screw Visuals */}
          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-[#5D2906] shadow-inner opacity-60"></div>
          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#5D2906] shadow-inner opacity-60"></div>

          <h2 className="text-2xl font-bold text-[#5D2906] flex-1 text-center tracking-wider">{title}</h2>
          <button 
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#8B4513] text-[#FFE4B5] p-1.5 rounded-lg hover:bg-[#A0522D] transition-colors"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-[#5D2906]">
          {children}
        </div>

        {/* Footer decoration */}
        <div className="bg-[#DEB887] h-4 rounded-b-2xl border-t-2 border-[#8B4513] opacity-80"></div>
      </div>
    </div>
  );
};
