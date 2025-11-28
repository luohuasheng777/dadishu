import React, { useMemo } from 'react';
import { Entity, AnimalType } from '../types';

interface GridCellProps {
  entity: Entity | null;
  onClick: (entity: Entity) => void;
}

export const GridCell: React.FC<GridCellProps> = ({ entity, onClick }) => {
  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent double firing on touch devices if mixed
    if (entity && !entity.isHit && !entity.isEscaping) {
      onClick(entity);
    }
  };

  const content = useMemo(() => {
    if (!entity) return null;
    
    // Choose emoji or icon based on type
    let icon = '';
    let bgColor = '';
    
    switch (entity.type) {
      case AnimalType.MOLE:
        icon = '🐹';
        bgColor = 'filter drop-shadow-md';
        break;
      case AnimalType.FOX:
        icon = '🦊';
        bgColor = 'filter drop-shadow-lg'; // Fox is premium
        break;
      case AnimalType.PANDA:
        icon = '🐼';
        bgColor = '';
        break;
    }

    // Determine animation class
    let animClass = 'animate-pop-up';
    if (entity.isHit) {
      animClass = 'animate-hit';
    } else if (entity.isEscaping) {
      animClass = 'animate-pop-down';
    }

    return (
      <>
        <div className={`w-full h-full flex items-center justify-center text-5xl sm:text-6xl select-none transition-transform will-change-transform ${animClass}`}>
          <span className={bgColor}>{icon}</span>
        </div>
        
        {/* Hammer Animation Overlay */}
        {entity.isHit && (
          <div className="absolute inset-0 z-30 flex items-center justify-center animate-hammer pointer-events-none">
            <span className="text-7xl filter drop-shadow-xl -mt-8 -ml-4">🔨</span>
          </div>
        )}

        {/* Escape Dust Animation Overlay */}
        {entity.isEscaping && (
          <div className="absolute top-0 right-0 z-20 animate-float-away pointer-events-none">
             <span className="text-4xl opacity-80">💨</span>
          </div>
        )}
      </>
    );
  }, [entity]);

  return (
    <div 
      className="relative w-full aspect-square bg-[#3e2723] rounded-full border-b-4 border-r-2 border-white/10 shadow-[inset_0_4px_8px_rgba(0,0,0,0.6)] overflow-hidden cursor-pointer"
      onMouseDown={handleClick}
      onTouchStart={handleClick}
    >
      {/* Hole Depth Effect */}
      <div className="absolute inset-0 bg-black/30 rounded-full pointer-events-none"></div>
      
      {/* Dirt Mound at bottom (Visual flair) */}
      <div className="absolute bottom-[-10%] left-[-10%] right-[-10%] h-[40%] bg-[#5D4037] rounded-[50%] opacity-80 pointer-events-none"></div>

      {content}
    </div>
  );
};