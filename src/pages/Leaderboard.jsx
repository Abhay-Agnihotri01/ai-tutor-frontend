import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Crown, User, Flame, Zap, ChevronDown } from 'lucide-react';

const Leaderboard = () => {
    const { token, user } = useAuth();
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentUserRank, setCurrentUserRank] = useState(null);
    const [period, setPeriod] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [period]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/gamification/leaderboard?period=${period}&limit=50`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (response.data.success) {
                setLeaderboard(response.data.data.leaderboard);
                setCurrentUserRank(response.data.data.currentUserRank);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        switch (rank) {
            case 1:
                return <Crown className="w-6 h-6 text-yellow-500" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Medal className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="w-6 text-center font-bold text-gray-500">{rank}</span>;
        }
    };

    const getRankStyle = (rank) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700';
            case 2:
                return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-300 dark:border-gray-600';
            case 3:
                return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-700';
            default:
                return 'theme-bg-secondary theme-border';
        }
    };

    return (
        <div className="min-h-screen theme-bg-primary py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <Trophy className="w-10 h-10 text-amber-500" />
                        <h1 className="text-3xl font-bold theme-text-primary">Leaderboard</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Top learners ranked by XP earned
                    </p>
                </div>

                {/* Period filter */}
                <div className="flex justify-center gap-2 mb-6">
                    {[
                        { value: 'all', label: 'All Time' },
                        { value: 'monthly', label: 'This Month' },
                        { value: 'weekly', label: 'This Week' }
                    ].map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setPeriod(option.value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${period === option.value
                                    ? 'bg-amber-500 text-white'
                                    : 'theme-bg-secondary theme-text-primary hover:bg-amber-100 dark:hover:bg-amber-900/30'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Current user rank */}
                {currentUserRank && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white text-center">
                        <p className="text-sm opacity-90">Your Rank</p>
                        <p className="text-3xl font-bold">#{currentUserRank}</p>
                    </div>
                )}

                {/* Leaderboard list */}
                <div className="space-y-3">
                    {loading ? (
                        [...Array(10)].map((_, i) => (
                            <div key={i} className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        ))
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No learners on the leaderboard yet.</p>
                            <p className="text-sm">Start learning to earn XP!</p>
                        </div>
                    ) : (
                        leaderboard.map((entry) => (
                            <div
                                key={entry.userId}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-transform hover:scale-[1.02]
                  ${getRankStyle(entry.rank)}
                  ${entry.isCurrentUser ? 'ring-2 ring-amber-500' : ''}`}
                            >
                                {/* Rank */}
                                <div className="w-8 flex justify-center">
                                    {getRankIcon(entry.rank)}
                                </div>

                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center overflow-hidden">
                                    {entry.user?.avatar ? (
                                        <img src={entry.user.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                    )}
                                </div>

                                {/* Name */}
                                <div className="flex-1">
                                    <p className="font-semibold theme-text-primary">
                                        {entry.user?.firstName} {entry.user?.lastName}
                                        {entry.isCurrentUser && <span className="text-amber-500 ml-2">(You)</span>}
                                    </p>
                                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Zap className="w-3 h-3" />
                                            Level {entry.level}
                                        </span>
                                        {entry.currentStreak > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Flame className="w-3 h-3 text-orange-500" />
                                                {entry.currentStreak}d streak
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* XP */}
                                <div className="text-right">
                                    <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                                        <Zap className="w-4 h-4" />
                                        {entry.totalXp.toLocaleString()}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">XP</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
