import { useGamification } from '../../context/GamificationContext';
import { Flame } from 'lucide-react';

const StreakCounter = ({ showLabel = true }) => {
    const { stats, loading } = useGamification();

    if (loading || !stats) {
        return (
            <div className="animate-pulse w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
        );
    }

    const { currentStreak, longestStreak } = stats;
    const isOnFire = currentStreak >= 3;

    return (
        <div className="flex items-center gap-2">
            <div
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold
          ${isOnFire
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
            >
                <Flame
                    className={`w-4 h-4 ${isOnFire ? 'animate-pulse' : ''}`}
                    fill={isOnFire ? 'currentColor' : 'none'}
                />
                <span>{currentStreak}</span>
                {isOnFire && (
                    <span className="absolute -top-1 -right-1 text-xs">🔥</span>
                )}
            </div>

            {showLabel && (
                <div className="text-sm">
                    <p className="font-medium theme-text-primary">
                        {currentStreak === 1 ? '1 day' : `${currentStreak} days`}
                    </p>
                    {longestStreak > currentStreak && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Best: {longestStreak} days
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default StreakCounter;
