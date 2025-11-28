import React, { useState, useMemo } from 'react';
import { UserProfile, Reward } from '../types';
import { Button } from './Button';
import { Trophy, Star, Lock, Check, Crown } from 'lucide-react';
import { getLeaderboard, claimRewardItem } from '../services/storage';

interface RewardsProps {
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
}

export const Rewards: React.FC<RewardsProps> = ({ userProfile, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'SCORE' | 'RANK'>('SCORE');

  const leaderboard = useMemo(() => getLeaderboard(userProfile.totalScore, userProfile.name || ''), [userProfile.totalScore, userProfile.name]);
  const userRank = leaderboard.find(e => e.isUser)?.rank || 999;

  // Define Rewards
  const scoreRewards: Reward[] = [
    { id: 'score_1', name: '木制锤子', description: '历史最高分达到 100', icon: '🔨', type: 'SCORE', requirement: 100, unlocked: userProfile.highScore >= 100, claimed: userProfile.claimedRewards.includes('score_1') },
    { id: 'score_2', name: '铁皮水桶', description: '历史最高分达到 500', icon: '🪣', type: 'SCORE', requirement: 500, unlocked: userProfile.highScore >= 500, claimed: userProfile.claimedRewards.includes('score_2') },
    { id: 'score_3', name: '黄金手套', description: '历史最高分达到 1000', icon: '🥊', type: 'SCORE', requirement: 1000, unlocked: userProfile.highScore >= 1000, claimed: userProfile.claimedRewards.includes('score_3') },
    { id: 'score_4', name: '牧场之星', description: '历史最高分达到 2000', icon: '⭐', type: 'SCORE', requirement: 2000, unlocked: userProfile.highScore >= 2000, claimed: userProfile.claimedRewards.includes('score_4') },
  ];

  const rankRewards: Reward[] = [
    { id: 'rank_1', name: '青铜徽章', description: '累计积分排名前 20', icon: '🥉', type: 'RANK', requirement: 20, unlocked: userRank <= 20, claimed: userProfile.claimedRewards.includes('rank_1') },
    { id: 'rank_2', name: '白银徽章', description: '累计积分排名前 10', icon: '🥈', type: 'RANK', requirement: 10, unlocked: userRank <= 10, claimed: userProfile.claimedRewards.includes('rank_2') },
    { id: 'rank_3', name: '黄金奖杯', description: '累计积分排名前 5', icon: '🏆', type: 'RANK', requirement: 5, unlocked: userRank <= 5, claimed: userProfile.claimedRewards.includes('rank_3') },
    { id: 'rank_4', name: '牧场霸主', description: '累计积分排名第 1', icon: '👑', type: 'RANK', requirement: 1, unlocked: userRank === 1, claimed: userProfile.claimedRewards.includes('rank_4') },
  ];

  const handleClaim = (reward: Reward) => {
    if (reward.unlocked && !reward.claimed) {
      const newProfile = claimRewardItem(reward.id);
      onUpdateProfile(newProfile);
    }
  };

  const currentRewards = activeTab === 'SCORE' ? scoreRewards : rankRewards;

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex rounded-xl bg-[#8B4513] p-1 mb-4">
        <button
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'SCORE' ? 'bg-[#FFD700] text-[#5D2906] shadow-md' : 'text-[#FFE4B5] hover:bg-[#A0522D]'}`}
          onClick={() => setActiveTab('SCORE')}
        >
          <div className="flex items-center justify-center gap-1"><Trophy size={16} /> 积分奖励</div>
        </button>
        <button
          className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'RANK' ? 'bg-[#FFD700] text-[#5D2906] shadow-md' : 'text-[#FFE4B5] hover:bg-[#A0522D]'}`}
          onClick={() => setActiveTab('RANK')}
        >
          <div className="flex items-center justify-center gap-1"><Crown size={16} /> 排行奖励</div>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="mb-4 bg-[#8B4513]/10 p-3 rounded-xl border border-[#8B4513]/20 flex justify-between items-center text-sm">
        {activeTab === 'SCORE' ? (
          <>
            <span className="font-bold">您的历史最高分:</span>
            <span className="text-xl font-black text-orange-600">{userProfile.highScore}</span>
          </>
        ) : (
          <>
            <span className="font-bold">您的当前排名:</span>
            <span className="text-xl font-black text-purple-600">#{userRank}</span>
          </>
        )}
      </div>

      {/* Rewards List */}
      <div className="flex-1 space-y-3">
        {currentRewards.map(reward => (
          <div key={reward.id} className={`relative bg-white rounded-xl p-3 border-b-4 ${reward.unlocked ? 'border-green-500' : 'border-gray-300 bg-gray-50'} flex items-center gap-3 transition-all`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 ${reward.unlocked ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-200 border-gray-300 grayscale'}`}>
              {reward.icon}
            </div>
            
            <div className="flex-1">
              <h4 className={`font-bold ${reward.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>{reward.name}</h4>
              <p className="text-xs text-gray-500">{reward.description}</p>
            </div>

            <div className="w-20">
              {reward.claimed ? (
                <div className="flex flex-col items-center text-green-600">
                  <Check size={24} strokeWidth={3} />
                  <span className="text-[10px] font-bold">已领取</span>
                </div>
              ) : reward.unlocked ? (
                <button 
                  onClick={() => handleClaim(reward)}
                  className="w-full py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg shadow-[0_2px_0_#15803d] active:shadow-none active:translate-y-0.5"
                >
                  领取
                </button>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Lock size={20} />
                  <span className="text-[10px]">{activeTab === 'SCORE' ? `${reward.requirement}分` : `前${reward.requirement}名`}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {activeTab === 'RANK' && (
        <div className="mt-6">
            <h3 className="font-bold text-[#8B4513] mb-2 text-center">🏆 全球牧场排行榜 (前5名)</h3>
            <div className="bg-white rounded-xl border-2 border-[#8B4513]/20 overflow-hidden">
                {leaderboard.slice(0, 5).map((entry, idx) => (
                    <div key={idx} className={`flex justify-between p-2 text-xs border-b last:border-0 ${entry.isUser ? 'bg-yellow-100 font-bold' : ''}`}>
                        <div className="w-8 font-bold text-gray-500">#{entry.rank}</div>
                        <div className="flex-1 text-center truncate px-2">{entry.name}</div>
                        <div className="w-12 text-right font-mono text-[#8B4513]">{entry.score}</div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
