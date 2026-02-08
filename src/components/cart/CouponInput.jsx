import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { Tag, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CouponInput = ({ courseId, originalPrice, onApply, onRemove }) => {
    const { token } = useAuth();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [error, setError] = useState('');

    const handleApply = async () => {
        if (!code.trim()) {
            setError('Please enter a coupon code');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await axios.post(
                `${API_URL}/coupons/validate`,
                { code: code.trim(), courseId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const couponData = response.data.data;
                setAppliedCoupon(couponData);
                onApply(couponData);
                toast.success(`Coupon applied! You save ₹${couponData.discountAmount.toFixed(2)}`);
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Invalid coupon code';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        setAppliedCoupon(null);
        setCode('');
        setError('');
        onRemove();
    };

    if (appliedCoupon) {
        return (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="font-semibold text-green-700 dark:text-green-300">
                            {appliedCoupon.code}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                            {appliedCoupon.type === 'percentage'
                                ? `${appliedCoupon.value}% off`
                                : appliedCoupon.type === 'free'
                                    ? 'Free course!'
                                    : `₹${appliedCoupon.value} off`
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-green-600 dark:text-green-400">
                        -₹{appliedCoupon.discountAmount.toFixed(2)}
                    </span>
                    <button
                        onClick={handleRemove}
                        className="p-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-green-700 dark:text-green-300" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase());
                            setError('');
                        }}
                        placeholder="Enter coupon code"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg theme-bg-primary theme-text-primary 
              focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors
              ${error ? 'border-red-500' : 'theme-border'}`}
                        disabled={loading}
                    />
                </div>
                <button
                    onClick={handleApply}
                    disabled={loading || !code.trim()}
                    className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        'Apply'
                    )}
                </button>
            </div>
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}
        </div>
    );
};

export default CouponInput;
