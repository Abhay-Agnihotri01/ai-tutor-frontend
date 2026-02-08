import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import {
    Plus, Tag, Copy, Trash2, ToggleLeft, ToggleRight,
    Calendar, Users, Percent, DollarSign, Gift, BarChart3,
    X, Check, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CouponManager = () => {
    const { token } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: 10,
        maxUses: '',
        validFrom: '',
        validTo: '',
        courseId: '',
        description: '',
        minPurchaseAmount: '',
        maxDiscountAmount: ''
    });

    useEffect(() => {
        fetchCoupons();
        fetchAnalytics();
    }, []);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/coupons`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setCoupons(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(`${API_URL}/coupons/analytics`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                `${API_URL}/coupons`,
                {
                    ...formData,
                    maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
                    minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : null,
                    maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
                    courseId: formData.courseId || null
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success('Coupon created successfully!');
                setShowModal(false);
                resetForm();
                fetchCoupons();
                fetchAnalytics();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create coupon');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to deactivate this coupon?')) return;

        try {
            await axios.delete(`${API_URL}/coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Coupon deactivated');
            fetchCoupons();
            fetchAnalytics();
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('Coupon code copied!');
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code });
    };

    const resetForm = () => {
        setFormData({
            code: '',
            type: 'percentage',
            value: 10,
            maxUses: '',
            validFrom: '',
            validTo: '',
            courseId: '',
            description: '',
            minPurchaseAmount: '',
            maxDiscountAmount: ''
        });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'percentage': return <Percent className="w-4 h-4" />;
            case 'fixed': return <DollarSign className="w-4 h-4" />;
            case 'free': return <Gift className="w-4 h-4" />;
            default: return <Tag className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen theme-bg-primary py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold theme-text-primary">Coupon Manager</h1>
                        <p className="text-gray-600 dark:text-gray-400">Create and manage promotional codes</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Coupon
                    </button>
                </div>

                {/* Analytics Cards */}
                {analytics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="theme-bg-secondary rounded-xl p-4 border theme-border">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Coupons</p>
                            <p className="text-2xl font-bold theme-text-primary">{analytics.totalCoupons}</p>
                        </div>
                        <div className="theme-bg-secondary rounded-xl p-4 border theme-border">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
                            <p className="text-2xl font-bold text-green-500">{analytics.activeCoupons}</p>
                        </div>
                        <div className="theme-bg-secondary rounded-xl p-4 border theme-border">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Redemptions</p>
                            <p className="text-2xl font-bold text-amber-500">{analytics.totalRedemptions}</p>
                        </div>
                        <div className="theme-bg-secondary rounded-xl p-4 border theme-border">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Discount Given</p>
                            <p className="text-2xl font-bold text-purple-500">₹{analytics.totalDiscountGiven?.toFixed(0) || 0}</p>
                        </div>
                    </div>
                )}

                {/* Coupons List */}
                <div className="theme-bg-secondary rounded-xl border theme-border overflow-hidden">
                    <div className="p-4 border-b theme-border">
                        <h2 className="font-semibold theme-text-primary">Your Coupons</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No coupons created yet</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 text-amber-500 hover:underline"
                            >
                                Create your first coupon
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y theme-divide">
                            {coupons.map((coupon) => (
                                <div key={coupon.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                    ${coupon.type === 'percentage' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                            coupon.type === 'fixed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                                'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                        }`}
                                    >
                                        {getTypeIcon(coupon.type)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <code className="font-mono font-bold theme-text-primary">{coupon.code}</code>
                                            <button
                                                onClick={() => copyCode(coupon.code)}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                            >
                                                <Copy className="w-3 h-3 text-gray-400" />
                                            </button>
                                            {!coupon.isActive && (
                                                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">Inactive</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {coupon.type === 'percentage' ? `${coupon.value}% off` :
                                                coupon.type === 'fixed' ? `₹${coupon.value} off` : 'Free'}
                                            {coupon.course && ` • ${coupon.course.title}`}
                                            {coupon.maxUses && ` • ${coupon.usedCount}/${coupon.maxUses} used`}
                                        </p>
                                    </div>

                                    {/* Usage */}
                                    <div className="text-right">
                                        <p className="font-semibold theme-text-primary">{coupon.usedCount}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">uses</p>
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-md theme-bg-secondary rounded-xl shadow-xl">
                            <div className="flex items-center justify-between p-4 border-b theme-border">
                                <h3 className="font-semibold theme-text-primary">Create Coupon</h3>
                                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-4 space-y-4">
                                {/* Code */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 theme-text-primary">Coupon Code</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder="SAVE20"
                                            className="flex-1 px-3 py-2 border theme-border rounded-lg theme-bg-primary theme-text-primary"
                                            required
                                            maxLength={50}
                                        />
                                        <button type="button" onClick={generateCode} className="px-3 py-2 border theme-border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                            Generate
                                        </button>
                                    </div>
                                </div>

                                {/* Type and Value */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 theme-text-primary">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-3 py-2 border theme-border rounded-lg theme-bg-primary theme-text-primary"
                                        >
                                            <option value="percentage">Percentage</option>
                                            <option value="fixed">Fixed Amount</option>
                                            <option value="free">Free Course</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 theme-text-primary">
                                            {formData.type === 'percentage' ? 'Discount %' : 'Amount (₹)'}
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.value}
                                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                            min="1"
                                            max={formData.type === 'percentage' ? 100 : 10000}
                                            className="w-full px-3 py-2 border theme-border rounded-lg theme-bg-primary theme-text-primary"
                                            required
                                            disabled={formData.type === 'free'}
                                        />
                                    </div>
                                </div>

                                {/* Max Uses */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 theme-text-primary">Max Uses (leave empty for unlimited)</label>
                                    <input
                                        type="number"
                                        value={formData.maxUses}
                                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                                        min="1"
                                        placeholder="Unlimited"
                                        className="w-full px-3 py-2 border theme-border rounded-lg theme-bg-primary theme-text-primary"
                                    />
                                </div>

                                {/* Valid Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 theme-text-primary">Valid From</label>
                                        <input
                                            type="date"
                                            value={formData.validFrom}
                                            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                            className="w-full px-3 py-2 border theme-border rounded-lg theme-bg-primary theme-text-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 theme-text-primary">Valid Until</label>
                                        <input
                                            type="date"
                                            value={formData.validTo}
                                            onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                                            className="w-full px-3 py-2 border theme-border rounded-lg theme-bg-primary theme-text-primary"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 theme-text-primary">Description (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Special offer for new students"
                                        className="w-full px-3 py-2 border theme-border rounded-lg theme-bg-primary theme-text-primary"
                                        maxLength={255}
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    className="w-full py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
                                >
                                    Create Coupon
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CouponManager;
