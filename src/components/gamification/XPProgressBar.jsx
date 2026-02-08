import { useGamification } from '../../context/GamificationContext';
import { Zap } from 'lucide-react';

const XPProgressBar = ({ compact = false }) => {
    const { stats, loading } = useGamification();

    if (loading || !stats) {
        return (
            <div className={`animate-pulse ${compact ? 'w-24 h-6' : 'w-full h-12'} bg-gray-200 dark:bg-gray-700 rounded-lg`} />
        );
    }

    const { totalXp, level, currentLevelXP, nextLevelXP, progressToNextLevel, xpToNextLevel } = stats;

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold">
                    <Zap className="w-3 h-3" />
                    <span>{totalXp}</span>
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Lv.{level}
                </div>
            </div>
        );
    }

    return (
        <div className="theme-bg-secondary rounded-xl p-4 border theme-border">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {level}
                    </div>
                    <div>
                        <p className="font-semibold theme-text-primary">Level {level}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {xpToNextLevel} XP to next level
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-md">
                    <Zap className="w-4 h-4" />
                    <span>{totalXp} XP</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressToNextLevel}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
            </div>

            <div className="flex justify-between mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span>{currentLevelXP} XP</span>
                <span>{nextLevelXP} XP</span>
            </div>
        </div>
    );
};

export default XPProgressBar;
