import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const GamificationContext = createContext();

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};

export const GamificationProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [stats, setStats] = useState(null);
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showLevelUpModal, setShowLevelUpModal] = useState(false);
    const [levelUpData, setLevelUpData] = useState(null);

    // Fetch user stats
    const fetchStats = async () => {
        if (!token) return;

        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/gamification/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const newStats = response.data.data;

                // Check for level up
                if (stats && newStats.level > stats.level) {
                    setLevelUpData({
                        oldLevel: stats.level,
                        newLevel: newStats.level,
                        totalXp: newStats.totalXp
                    });
                    setShowLevelUpModal(true);
                }

                setStats(newStats);
            }
        } catch (error) {
            console.error('Error fetching gamification stats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user badges
    const fetchBadges = async () => {
        if (!token) return;

        try {
            const response = await axios.get(`${API_URL}/gamification/my-badges`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setBadges(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching badges:', error);
        }
    };

    // Refresh stats (called after XP-earning actions)
    const refreshStats = async () => {
        await fetchStats();
        await fetchBadges();
    };

    // Show XP notification
    const showXPGain = (amount, reason) => {
        const reasonText = {
            video_complete: 'Video completed!',
            quiz_pass: 'Quiz passed!',
            course_complete: 'Course completed!',
            first_course_complete: 'First course completed! 🎉',
            badge_earn: 'Badge earned!'
        }[reason] || 'XP earned!';

        toast.success(
            <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                    <p className="font-semibold">+{amount} XP</p>
                    <p className="text-sm opacity-80">{reasonText}</p>
                </div>
            </div>,
            { duration: 3000 }
        );

        // Refresh stats after gaining XP
        setTimeout(refreshStats, 500);
    };

    // Initialize on mount and when user changes
    useEffect(() => {
        if (user && token) {
            fetchStats();
            fetchBadges();
        } else {
            setStats(null);
            setBadges([]);
        }
    }, [user, token]);

    const value = {
        stats,
        badges,
        loading,
        refreshStats,
        showXPGain,
        showLevelUpModal,
        setShowLevelUpModal,
        levelUpData
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
};

export default GamificationContext;
