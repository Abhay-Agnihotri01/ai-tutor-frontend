import { useEffect } from 'react';
import { X, Star, Sparkles } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';

const LevelUpModal = () => {
    const { showLevelUpModal, setShowLevelUpModal, levelUpData } = useGamification();

    useEffect(() => {
        if (showLevelUpModal) {
            // Auto-close after 5 seconds
            const timer = setTimeout(() => {
                setShowLevelUpModal(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showLevelUpModal, setShowLevelUpModal]);

    if (!showLevelUpModal || !levelUpData) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-1 shadow-2xl animate-bounce-in">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 text-center relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <Sparkles className="absolute top-4 left-4 w-8 h-8 text-amber-400 animate-pulse" />
                        <Sparkles className="absolute top-8 right-8 w-6 h-6 text-orange-400 animate-pulse delay-100" />
                        <Sparkles className="absolute bottom-12 left-8 w-5 h-5 text-yellow-400 animate-pulse delay-200" />
                        <Sparkles className="absolute bottom-6 right-6 w-7 h-7 text-amber-500 animate-pulse delay-300" />
                        <Star className="absolute top-1/4 right-1/4 w-4 h-4 text-orange-300 animate-spin-slow" />
                        <Star className="absolute bottom-1/3 left-1/4 w-3 h-3 text-yellow-300 animate-spin-slow" />
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => setShowLevelUpModal(false)}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>

                    {/* Content */}
                    <div className="relative z-10">
                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                            🎊 Congratulations! 🎊
                        </p>

                        <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
                            LEVEL UP!
                        </h2>

                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="text-4xl font-bold text-gray-300 dark:text-gray-600">
                                {levelUpData.oldLevel}
                            </div>
                            <div className="text-2xl">→</div>
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg animate-pulse">
                                    {levelUpData.newLevel}
                                </div>
                                <div className="absolute -inset-2 border-4 border-amber-400/50 rounded-full animate-ping" />
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            You've reached <span className="font-bold text-orange-500">Level {levelUpData.newLevel}</span>!<br />
                            Keep learning to unlock more achievements.
                        </p>

                        <button
                            onClick={() => setShowLevelUpModal(false)}
                            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg transition-shadow"
                        >
                            Awesome! 🚀
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelUpModal;
