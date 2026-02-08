import { useGamification } from '../../context/GamificationContext';
import { Lock } from 'lucide-react';

const BadgeShowcase = ({ limit = 8, showAll = false }) => {
    const { badges, loading } = useGamification();

    if (loading) {
        return (
            <div className="grid grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                ))}
            </div>
        );
    }

    const displayBadges = showAll ? badges : badges.slice(0, limit);
    const earnedCount = badges.filter(b => b.earned).length;

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold theme-text-primary">Badges</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {earnedCount} / {badges.length}
                </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {displayBadges.map((badge) => (
                    <div
                        key={badge.id}
                        className={`relative group cursor-pointer transition-transform hover:scale-110`}
                        title={badge.earned ? `${badge.name} - Earned!` : `${badge.name} - ${badge.description}`}
                    >
                        <div
                            className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl 
                ${badge.earned
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg'
                                    : 'bg-gray-200 dark:bg-gray-700 opacity-50'
                                }`}
                        >
                            {badge.earned ? (
                                <span>{badge.icon}</span>
                            ) : (
                                <Lock className="w-5 h-5 text-gray-400" />
                            )}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            <p className="font-semibold">{badge.name}</p>
                            <p className="text-gray-300">{badge.description}</p>
                            {badge.earned && (
                                <p className="text-amber-400 mt-1">+{badge.xpReward} XP</p>
                            )}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>
                    </div>
                ))}
            </div>

            {!showAll && badges.length > limit && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                    +{badges.length - limit} more badges
                </p>
            )}
        </div>
    );
};

export default BadgeShowcase;
