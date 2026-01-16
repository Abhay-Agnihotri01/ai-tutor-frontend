import { useCurrency } from '../../context/CurrencyContext';

const Price = ({ 
  amount, 
  className = '', 
  showOriginal = false,
  size = 'base'
}) => {
  const { formatPrice, currency } = useCurrency();

  if (!amount || amount === 0) {
    return <span className={className}>Free</span>;
  }

  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  return (
    <div className={`${className} ${sizeClasses[size]}`}>
      <span className="font-semibold">
        {formatPrice(amount)}
      </span>
      {showOriginal && currency !== 'INR' && (
        <span className="text-xs theme-text-muted ml-2">
          (₹{amount})
        </span>
      )}
    </div>
  );
};

export default Price;