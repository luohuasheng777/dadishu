import { UserProfile, LeaderboardEntry } from '../types';
import { STORAGE_KEY } from '../constants';

const DEFAULT_PROFILE: UserProfile = {
  name: null,
  highScore: 0,
  totalScore: 0,
  claimedRewards: [],
};

export const getProfile = (): UserProfile => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? { ...DEFAULT_PROFILE, ...JSON.parse(data) } : DEFAULT_PROFILE;
};

export const saveProfile = (profile: UserProfile) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

export const updateScore = (score: number) => {
  const profile = getProfile();
  const newHighScore = Math.max(profile.highScore, score);
  const newTotalScore = profile.totalScore + score;
  
  const newProfile = {
    ...profile,
    highScore: newHighScore,
    totalScore: newTotalScore,
  };
  saveProfile(newProfile);
  return newProfile;
};

export const claimRewardItem = (rewardId: string) => {
  const profile = getProfile();
  if (!profile.claimedRewards.includes(rewardId)) {
    const newProfile = {
      ...profile,
      claimedRewards: [...profile.claimedRewards, rewardId],
    };
    saveProfile(newProfile);
    return newProfile;
  }
  return profile;
};

// Mock leaderboard generator
const MOCK_NAMES = [
  "FarmerJoe", "MoleHunter", "FastFingers", "GreenThumb", "BarnOwl",
  "DaisyCow", "HappySheep", "CrazyGoat", "ChickenRun", "PiggyBank",
  "TractorBoy", "SunnyDay", "RainyNight", "StormChaser", "WindWalker"
];

export const getLeaderboard = (userTotalScore: number, userName: string): LeaderboardEntry[] => {
  // Generate consistent-ish random scores based on day or just random for now
  const entries: LeaderboardEntry[] = MOCK_NAMES.map((name, index) => ({
    name,
    score: Math.floor(Math.random() * 5000) + 1000,
    rank: 0,
    isUser: false,
  }));

  // Add user
  entries.push({
    name: userName || "未登记玩家",
    score: userTotalScore,
    rank: 0,
    isUser: true,
  });

  // Sort descending
  entries.sort((a, b) => b.score - a.score);

  // Assign ranks
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
};
