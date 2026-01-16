import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const CurrencySelector = ({ className = '' }) => {
  const { currency, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
    { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
    { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' }
  ];

  const currentCurrency = currencies.find(c => c.code === currency);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm theme-text-primary hover:theme-bg-secondary rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{currentCurrency?.flag}</span>
        <span>{currency}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 theme-bg-primary border theme-border rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs theme-text-muted mb-2 px-2">Select Currency</div>
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => {
                    changeCurrency(curr.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    currency === curr.code 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'theme-text-primary hover:theme-bg-secondary'
                  }`}
                >
                  <span className="text-lg">{curr.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{curr.code}</div>
                    <div className="text-xs theme-text-muted">{curr.name}</div>
                  </div>
                  {currency === curr.code && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySelector;