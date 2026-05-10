/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { api } from '../api';
import { Trophy, Medal, Crown, Star, Flame, Zap, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { Avatar } from './ui/Avatar';

interface RankingUser {
  id: string | number;
  name: string;
  honey: number;
  level: number;
  avatar: string;
  badge?: string;
}

const TOP_PLAYERS: RankingUser[] = [
  { id: 1, name: "Sambal Queen", honey: 15420, level: 15, avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=sambal", badge: "Digital Pioneer" },
  { id: 2, name: "Kain Master", honey: 12850, level: 12, avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=kain", badge: "Sustainability Star" },
  { id: 3, name: "Village Baker", honey: 9200, level: 9, avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=baker", badge: "Local Hero" },
  { id: 4, name: "Market Leader", honey: 8100, level: 8, avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=honey", badge: "Growth Guru" },
  { id: 5, name: "Pandan Weaves", honey: 7500, level: 7, avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=pandan", badge: "Community pillar" },
];

export default function RankingBoard() {
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [dynamicRankings, setDynamicRankings] = React.useState<RankingUser[]>(TOP_PLAYERS);

  React.useEffect(() => {
    async function loadRank() {
      try {
        const data = await api.getProfile();
        const profile = data.businessProfile;
        setUserProfile(profile);
        
        if (profile) {
          const me: RankingUser = {
            id: profile.id,
            name: profile.business_name || profile.name || "You",
            honey: profile.honey || 0,
            level: Math.floor((profile.honey || 0) / 100) + 1,
            avatar: profile.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.name || 'honey'}`,
            badge: profile.honey > 5000 ? "Digital Pioneer" : profile.honey > 2500 ? "Sustainability Star" : "Micro-Learner"
          };
          
          // Combine top players and current user, sort by honey, take top 5
          const allPlayers = [...TOP_PLAYERS.filter(p => p.id !== profile.id), me];
          const sorted = allPlayers.sort((a, b) => b.honey - a.honey).slice(0, 5);
          setDynamicRankings(sorted);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadRank();

    const handleHoneyUpdate = () => {
      loadRank();
    };

    window.addEventListener('honey-updated', handleHoneyUpdate);
    window.addEventListener('profile-updated', handleHoneyUpdate);
    return () => {
      window.removeEventListener('honey-updated', handleHoneyUpdate);
      window.removeEventListener('profile-updated', handleHoneyUpdate);
    };
  }, []);

  const currentHoney = userProfile?.honey || 0;
  const currentLevel = Math.floor(currentHoney / 100) + 1;

  // Badge logic for current user
  const getUserBadge = () => {
    if (currentHoney > 5000) return "Digital Pioneer";
    if (currentHoney > 2500) return "Sustainability Star";
    return "Micro-Learner";
  };

  return (
    <div className="bg-theme-card rounded-[2.5rem] p-5 md:p-6 border-2 border-theme-border shadow-xl dark:shadow-none space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-display font-bold text-theme-text tracking-tight uppercase">Leaderboard 🏆</h3>
          <p className="text-[9px] text-theme-muted font-bold uppercase tracking-widest">Top Community Contributors</p>
        </div>
        <div className="w-10 h-10 bg-brand-honey rounded-xl flex items-center justify-center shadow-lg transform rotate-6">
          <Trophy className="w-5 h-5 text-brand-ink" />
        </div>
      </div>

      <div className="space-y-3">
        {dynamicRankings.map((player, index) => (
          <div 
            key={player.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-[2rem] transition-all group border-2",
              index === 0 ? "bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20" : 
              player.id === userProfile?.id ? "bg-brand-honey/10 border-brand-honey" : "bg-theme-bg/50 border-transparent hover:border-theme-border"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar 
                  src={player.avatar} 
                  alt={player.name} 
                  size="md" 
                  className="bg-white dark:bg-slate-800 group-hover:scale-110 transition-transform"
                />
                <div className={cn(
                  "absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg border-2 border-white dark:border-slate-800",
                  index === 0 ? "bg-brand-honey text-brand-ink" : index === 1 ? "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300" : index === 2 ? "bg-orange-200 text-orange-700" : "bg-theme-card text-theme-dim"
                )}>
                  {index + 1}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-theme-text">{player.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 bg-brand-honey/10 text-brand-honey text-[8px] font-black uppercase tracking-widest rounded-lg">Level {player.level}</span>
                  {player.badge && (
                    <span className="px-1.5 py-0.5 bg-brand-rose/10 text-brand-rose text-[8px] font-black uppercase tracking-widest rounded-lg">{player.badge}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-0.5">
                <span className="text-lg font-display font-bold text-theme-text dark:text-amber-400">{player.honey.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-theme-muted">pts</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
        <div className="bg-brand-ink dark:bg-slate-800 p-4 rounded-[2rem] flex items-center justify-between text-white shadow-xl relative overflow-hidden group">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Avatar 
                src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${userProfile?.name || 'honey'}`} 
                alt={userProfile?.business_name || userProfile?.name || "me"} 
                size="sm" 
                className="bg-transparent border-none shadow-none"
              />
            </div>
            <div>
              <p className="text-[8px] font-bold text-white/50 uppercase tracking-[0.3em]">Your Current Rank</p>
              <h4 className="text-base font-bold flex items-center gap-2">
                #{Math.max(6, 120 - Math.floor(currentHoney/50))} <span className="text-brand-honey text-xs">• Lvl {currentLevel}</span>
                <span className="px-1.5 py-0.5 bg-brand-honey/20 text-brand-honey text-[8px] font-black tracking-widest rounded-lg">{getUserBadge()}</span>
              </h4>
            </div>
          </div>
          <div className="text-right relative z-10">
             <div className="text-xl font-display font-bold text-brand-honey">{currentHoney} pts</div>
             <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Rewards</p>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
             <Crown className="w-16 h-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
