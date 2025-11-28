import React, { useState, useEffect } from 'react';
import { GameState, UserProfile } from './types';
import { getProfile, saveProfile, updateScore } from './services/storage';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { Rewards } from './components/Rewards';
import { GameEngine } from './components/GameEngine';
import { Play, Info, Gift, User, ArrowLeft, Share2 } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  
  // Modal States
  const [showInstructions, setShowInstructions] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  // Registration Input
  const [tempName, setTempName] = useState('');

  // Countdown
  const [countdown, setCountdown] = useState(3);

  // Score Tracking for Game Over
  const [lastScore, setLastScore] = useState(0);

  // Initialize Profile on Mount
  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const handleStartClick = () => {
    if (!profile.name) {
      setShowRegister(true);
    } else {
      startCountdown();
    }
  };

  const handleRegister = () => {
    if (tempName.trim().length > 0) {
      const newProfile = { ...profile, name: tempName.trim() };
      setProfile(newProfile);
      saveProfile(newProfile);
      setShowRegister(false);
      startCountdown();
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("游戏链接已复制，快去分享给好友吧！");
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Sound helper
  const playCountdownBeep = (count: number) => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    // Create a new context for menu/countdown sounds to ensure it works outside game engine loop
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Pitch goes up on "Go!" (0)
    if (count > 0) {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
    }
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + (count > 0 ? 0.2 : 0.5));
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + (count > 0 ? 0.2 : 0.5));
  };

  const startCountdown = () => {
    setGameState(GameState.COUNTDOWN);
    setCountdown(3);
    
    // Play initial sound
    playCountdownBeep(3);
    
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next === 0) {
            // Play "Go!" sound
            playCountdownBeep(0);
        } else if (next > 0) {
            // Play normal countdown sound
            playCountdownBeep(next);
        }

        if (prev === 1) {
          clearInterval(interval);
          // Small delay to let "1" show or show "GO" if we wanted
          setTimeout(() => {
             setGameState(GameState.PLAYING);
          }, 500); 
          return 0; // Display "Go" or similar ideally, but logic here switches state
        }
        return next;
      });
    }, 1000);
  };

  const handleGameOver = (score: number) => {
    setLastScore(score);
    const updated = updateScore(score);
    setProfile(updated);
    setGameState(GameState.GAME_OVER);
  };

  const handleBackToMenu = () => {
    setGameState(GameState.MENU);
  };

  // Dynamic Background Logic
  const isMenu = gameState === GameState.MENU;
  // Farm for Menu, Green Grassland for Game/Countdown/GameOver
  const bgImage = isMenu 
    ? "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80')" 
    : "url('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80')";

  return (
    <div 
      className="h-full w-full flex flex-col bg-cover bg-center transition-all duration-700 ease-in-out" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), ${bgImage}` 
      }}
    >
      
      {/* --- MENU SCREEN --- */}
      {gameState === GameState.MENU && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8 animate-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-6xl font-black text-yellow-400 stroke-text drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] tracking-wider">
              牧场<br/><span className="text-white">打地鼠</span>
            </h1>
            <p className="text-white font-bold text-lg bg-[#8B4513]/80 px-4 py-1 rounded-full inline-block">
              {profile.name ? `欢迎回来, ${profile.name}!` : '准备好保护牧场了吗？'}
            </p>
          </div>

          <div className="w-full max-w-xs space-y-4">
            <Button variant="primary" className="w-full text-2xl h-16" onClick={handleStartClick}>
              <Play size={28} fill="currentColor" /> 开始游戏
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button variant="wood" className="w-full px-2" onClick={() => setShowInstructions(true)}>
                <Info size={18} /> 说明
              </Button>
              <Button variant="wood" className="w-full px-2" onClick={() => setShowRewards(true)}>
                <Gift size={18} /> 奖励
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- COUNTDOWN SCREEN --- */}
      {gameState === GameState.COUNTDOWN && (
        <div className="flex-1 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="text-9xl font-black text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-bounce">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}

      {/* --- PLAYING SCREEN --- */}
      {gameState === GameState.PLAYING && (
        <GameEngine onGameOver={handleGameOver} onExit={handleBackToMenu} />
      )}

      {/* --- GAME OVER SCREEN --- */}
      {gameState === GameState.GAME_OVER && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-md z-50 animate-in fade-in">
          <div className="bg-[#FFF8DC] p-8 rounded-3xl border-8 border-[#8B4513] text-center space-y-6 w-full max-w-sm shadow-2xl transform rotate-1">
            <h2 className="text-4xl font-black text-[#5D2906]">游戏结束!</h2>
            
            <div className="space-y-2">
              <p className="text-[#8B4513] font-bold">本局得分</p>
              <p className="text-6xl font-black text-orange-500">{lastScore}</p>
            </div>

            <div className="flex justify-between text-sm text-[#8B4513]/80 font-bold border-t-2 border-[#8B4513]/20 pt-4">
               <span>历史最高: {profile.highScore}</span>
               <span>累计积分: {profile.totalScore}</span>
            </div>

            <div className="space-y-3 pt-4">
              <Button variant="primary" className="w-full" onClick={handleStartClick}>
                再来一局
              </Button>
              <div className="grid grid-cols-2 gap-3">
                 <Button variant="secondary" className="w-full" onClick={handleBackToMenu}>
                   返回菜单
                 </Button>
                 <Button variant="wood" className="w-full" onClick={handleShare}>
                   <Share2 size={18} /> 分享
                 </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Instructions */}
      <Modal isOpen={showInstructions} onClose={() => setShowInstructions(false)} title="游戏说明">
        <div className="space-y-4 text-lg">
          <p>👨‍🌾 <span className="font-bold">牧场主任务:</span> 保护你的胡萝卜免受入侵者的侵害！</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><span className="font-bold text-orange-600">地鼠 (🐹):</span> 点击获得 <span className="font-bold">+5分</span>。</li>
            <li><span className="font-bold text-red-600">狐狸 (🦊):</span> 稀有！点击获得 <span className="font-bold">+10分</span>。</li>
            <li><span className="font-bold text-gray-600">熊猫 (🐼):</span> 国宝不能打！误伤 <span className="font-bold">-5分</span>。</li>
          </ul>
          <div className="bg-red-100 p-3 rounded-lg border border-red-300">
            <p className="text-red-800 font-bold text-sm">⚠️ 注意生命值:</p>
            <p className="text-sm">如果地鼠或狐狸逃跑了，你将失去 <span className="font-bold">0.5颗红心</span>。生命值归零时游戏结束！</p>
            <p className="text-sm mt-2 text-green-700 font-bold">💡 提示: 如果场上只剩熊猫，它们会因为害羞而逃走，不用担心！</p>
          </div>
        </div>
      </Modal>

      {/* Rewards */}
      <Modal isOpen={showRewards} onClose={() => setShowRewards(false)} title="荣誉与奖励">
        <Rewards userProfile={profile} onUpdateProfile={setProfile} />
      </Modal>

      {/* Registration */}
      <Modal isOpen={showRegister} onClose={() => setShowRegister(false)} title="牧场登记">
        <div className="space-y-6">
          <p className="text-center text-[#5D2906]">在开始工作前，请在工卡上写下你的名字。</p>
          <div className="space-y-2">
             <label className="block text-sm font-bold text-[#8B4513]">您的名字:</label>
             <input 
                type="text" 
                maxLength={10}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-4 border-[#DEB887] bg-white focus:outline-none focus:border-[#8B4513] text-xl font-bold text-center"
                placeholder="例如: 闪电手杰克"
             />
          </div>
          <Button 
            variant="primary" 
            className="w-full" 
            onClick={handleRegister}
            disabled={!tempName.trim()}
          >
            登记并开始
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default App;