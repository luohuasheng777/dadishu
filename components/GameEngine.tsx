import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GridCell } from './GridCell';
import { Entity, AnimalType, GameState, FloatingText } from '../types';
import { 
  TOTAL_HOLES, INITIAL_HP, HP_PENALTY_MISS, HP_PENALTY_PANDA,
  SCORE_MOLE, SCORE_FOX, SCORE_PANDA,
  INITIAL_STAY_DURATION,
  MIN_STAY_DURATION, DIFFICULTY_RAMP_INTERVAL,
  INITIAL_SPAWN_COUNT, MAX_SPAWN_COUNT
} from '../constants';
import { Heart, Pause, Trophy } from 'lucide-react';

interface GameEngineProps {
  onGameOver: (score: number) => void;
  onExit: () => void;
}

export const GameEngine: React.FC<GameEngineProps> = ({ onGameOver, onExit }) => {
  const [grid, setGrid] = useState<(Entity | null)[]>(Array(TOTAL_HOLES).fill(null));
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(INITIAL_HP);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isDamaged, setIsDamaged] = useState(false);
  
  // Game Refs for mutable state in loop
  const gameStateRef = useRef<{
    grid: (Entity | null)[];
    score: number;
    hp: number;
    isPlaying: boolean;
    nextSpawnTime: number; // Used for the 1s delay
    isWaitingForWave: boolean;
    stayDuration: number;
    spawnCount: number;
    difficultyTimer: number;
    rampCounter: number;
  }>({
    grid: Array(TOTAL_HOLES).fill(null),
    score: 0,
    hp: INITIAL_HP,
    isPlaying: true,
    nextSpawnTime: 0,
    isWaitingForWave: false,
    stayDuration: INITIAL_STAY_DURATION,
    spawnCount: INITIAL_SPAWN_COUNT,
    difficultyTimer: 0,
    rampCounter: 0,
  });

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (type: 'hit' | 'bad' | 'pop' | 'escape' | 'damage') => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'hit') {
      // High pitch "ding"
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'bad') {
      // Low "buzz"
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'pop') {
      // Short "pop"
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'escape') {
      // Quick "woosh" slide down
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'damage') {
      // Heavy crunch / thud
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(80, now);
      osc2.frequency.exponentialRampToValueAtTime(30, now + 0.2);
      gain2.gain.setValueAtTime(0.4, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.start(now);
      osc.stop(now + 0.3);
      osc2.start(now);
      osc2.stop(now + 0.2);
    }
  };

  // Sync state to ref
  useEffect(() => {
    gameStateRef.current.grid = grid;
    gameStateRef.current.score = score;
    gameStateRef.current.hp = hp;
  }, [grid, score, hp]);

  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  const spawnEntity = () => {
    const { grid, spawnCount } = gameStateRef.current;
    const emptyIndices = grid.map((e, i) => e === null ? i : -1).filter(i => i !== -1);
    
    if (emptyIndices.length === 0) return;

    // Use specific spawn count, capped by available slots
    const count = Math.min(emptyIndices.length, spawnCount);
    
    const newGrid = [...grid];
    
    for (let i = 0; i < count; i++) {
        if (emptyIndices.length === 0) break;
        const randIdx = Math.floor(Math.random() * emptyIndices.length);
        const gridIdx = emptyIndices[randIdx];
        emptyIndices.splice(randIdx, 1);

        const roll = Math.random();
        let type = AnimalType.MOLE;
        if (roll > 0.9) type = AnimalType.PANDA;
        else if (roll > 0.7) type = AnimalType.FOX;

        const entity: Entity = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          spawnTime: performance.now(),
          duration: gameStateRef.current.stayDuration,
          isHit: false,
        };
        newGrid[gridIdx] = entity;
    }

    setGrid(newGrid);
    playSound('pop');
  };

  const gameLoop = useCallback((time: number) => {
    if (!previousTimeRef.current) previousTimeRef.current = time;
    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;

    const state = gameStateRef.current;

    if (!state.isPlaying || state.hp <= 0) {
      if (state.hp <= 0) return;
      requestRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // 1. Difficulty Ramp
    state.difficultyTimer += deltaTime;
    if (state.difficultyTimer > DIFFICULTY_RAMP_INTERVAL) {
      state.difficultyTimer = 0;
      state.rampCounter += 1;
      
      // Decrease stay duration
      state.stayDuration = Math.max(MIN_STAY_DURATION, state.stayDuration * 0.9);

      // Increase spawn count every 2 intervals (approx 10s)
      if (state.rampCounter % 2 === 0) {
        state.spawnCount = Math.min(MAX_SPAWN_COUNT, state.spawnCount + 1);
      }
    }

    // 2. Check Expirations & Clean Grid
    let gridChanged = false;
    let tookDamage = false;
    const currentGrid = [...state.grid];
    let activeCount = 0;
    
    // Identify active entities first for Panda logic
    const activeEntities = currentGrid.filter(e => e && !e.isHit && !e.isEscaping);
    const hasOnlyPandas = activeEntities.length > 0 && activeEntities.every(e => e?.type === AnimalType.PANDA);

    currentGrid.forEach((entity, index) => {
      if (!entity) return;

      if (entity.isHit) {
        // Hit entities are handled by click handler timeouts, but we count them as active visually
        activeCount++;
        return;
      }

      const age = time - entity.spawnTime;

      if (!entity.isEscaping) {
        // --- PHASE 1: ALIVE ---
        let shouldStartEscaping = age > entity.duration;

        // Panda Flee Logic: If only pandas are left, and they have been visible for at least 500ms
        if (!shouldStartEscaping && hasOnlyPandas && entity.type === AnimalType.PANDA && age > 500) {
           shouldStartEscaping = true;
        }

        if (shouldStartEscaping) {
          // Transition to escaping
          currentGrid[index] = { ...entity, isEscaping: true, escapeStartTime: time };
          gridChanged = true;
          playSound('escape');
        } else {
          activeCount++;
        }
      } else {
        // --- PHASE 2: ESCAPING ---
        // Animation duration is roughly 300ms.
        // We ensure we have an escapeStartTime, otherwise fallback to current time (shouldn't happen)
        const est = entity.escapeStartTime || time;
        if (time - est > 300) {
          // Animation complete, remove entity
          currentGrid[index] = null;
          gridChanged = true;

          // Apply Penalties
          if (entity.type === AnimalType.MOLE || entity.type === AnimalType.FOX) {
            setHp(prev => Math.max(0, prev - HP_PENALTY_MISS));
            tookDamage = true;
          }
        } else {
          activeCount++; // Still visible animating down
        }
      }
    });

    if (gridChanged) {
      setGrid(currentGrid);
    }

    if (tookDamage) {
      playSound('damage');
      setIsDamaged(true);
      setTimeout(() => setIsDamaged(false), 500);
    }

    // 3. Clean up floating texts
    setFloatingTexts(prev => prev.filter(ft => time - ft.createdAt < 1000));

    // 4. Wave Spawning Logic
    if (activeCount === 0) {
      if (!state.isWaitingForWave) {
        // Just finished a wave
        state.isWaitingForWave = true;
        state.nextSpawnTime = time + 1000; // 1 second delay
      } else {
        // Waiting... check time
        if (time > state.nextSpawnTime) {
          spawnEntity();
          state.isWaitingForWave = false;
        }
      }
    } else {
      // Animals exist, not waiting for wave
      state.isWaitingForWave = false;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  // Check Game Over
  useEffect(() => {
    if (hp <= 0) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      onGameOver(score);
    }
  }, [hp, score, onGameOver]);

  const handleEntityClick = (entity: Entity) => {
    // Prevent clicking if already hit or if it's currently escaping
    if (entity.isHit || entity.isEscaping) return;

    // Trigger Audio immediately
    if (entity.type === AnimalType.PANDA) {
      playSound('bad');
    } else {
      playSound('hit');
    }

    // Mark as hit
    setGrid(prev => prev.map(e => (e && e.id === entity.id) ? { ...e, isHit: true } : e));

    // Score Logic & Floating Text
    let scoreDelta = 0;
    let color = 'text-white';
    
    switch (entity.type) {
      case AnimalType.MOLE: 
        scoreDelta = SCORE_MOLE; 
        color = 'text-yellow-300';
        break;
      case AnimalType.FOX: 
        scoreDelta = SCORE_FOX; 
        color = 'text-orange-400';
        break;
      case AnimalType.PANDA: 
        scoreDelta = SCORE_PANDA; 
        color = 'text-red-500';
        break;
    }

    setScore(prev => Math.max(0, prev + scoreDelta));

    // Add Floating Text
    const cellIndex = grid.findIndex(e => e?.id === entity.id);
    if (cellIndex !== -1) {
      const text = scoreDelta > 0 ? `+${scoreDelta}` : `${scoreDelta}`;
      setFloatingTexts(prev => [
        ...prev, 
        { 
          id: Math.random().toString(), 
          cellIndex, 
          text, 
          color, 
          createdAt: performance.now() 
        }
      ]);
    }

    // Remove from grid after animation (200ms matches hit animation roughly)
    setTimeout(() => {
       setGrid(prev => prev.map(e => (e && e.id === entity.id) ? null : e));
    }, 200);
  };

  return (
    <div className={`flex flex-col h-full relative transition-colors duration-100 ${isDamaged ? 'bg-red-900/30 animate-shake' : ''}`} onClick={initAudio}>
      {/* Damage Flash Overlay */}
      {isDamaged && <div className="absolute inset-0 bg-red-500/30 pointer-events-none z-50 animate-flash-red"></div>}

      {/* HUD */}
      <div className={`flex items-center justify-between p-4 bg-[#8B4513] text-[#FFE4B5] shadow-lg z-10 transition-transform ${isDamaged ? 'bg-red-900' : ''}`}>
        <div className="flex items-center gap-1">
          <div className="relative w-8 h-8">
             <Heart className={`text-red-500 fill-current ${isDamaged ? 'animate-bounce' : ''}`} size={32} />
             <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white pt-1">
                {Math.ceil(hp)}
             </div>
          </div>
          <div className="w-24 h-4 bg-black/40 rounded-full overflow-hidden border border-[#FFE4B5]/30">
             <div 
               className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300" 
               style={{ width: `${(hp / INITIAL_HP) * 100}%` }}
             ></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" />
            <span className="text-2xl font-mono font-bold">{score}</span>
        </div>

        <button onClick={onExit} className="p-2 bg-[#A0522D] rounded-lg hover:bg-[#8B4513] border border-[#FFE4B5]/20">
            <Pause size={20} />
        </button>
      </div>

      {/* Game Grid Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-[#8B4513] p-4 rounded-[2rem] shadow-[0_10px_0_#5D2906] w-full max-w-md aspect-[3/4] grid grid-cols-3 grid-rows-5 gap-3 sm:gap-4 relative select-none">
             {/* Background Grass Texture Overlay */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] opacity-10 rounded-[1.5rem] pointer-events-none"></div>
             
             {grid.map((entity, index) => {
               // Check for floating text at this index
               const activeFloaters = floatingTexts.filter(ft => ft.cellIndex === index);

               return (
                 <div key={index} className="relative w-full h-full">
                    <GridCell 
                      entity={entity} 
                      onClick={handleEntityClick} 
                    />
                    
                    {/* Floating Scores */}
                    {activeFloaters.map(ft => (
                      <div 
                        key={ft.id}
                        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 text-4xl font-black drop-shadow-md stroke-text animate-float-up ${ft.color}`}
                      >
                        {ft.text}
                      </div>
                    ))}
                 </div>
               );
             })}
        </div>
      </div>
      <style>{`
        .animate-float-up {
          animation: floatUp 0.8s ease-out forwards;
        }
        @keyframes floatUp {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -100%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -200%) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};