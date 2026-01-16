import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR');
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(false);

  // Detect user's currency based on location
  useEffect(() => {
    detectUserCurrency();
    fetchExchangeRates();
  }, []);

  const detectUserCurrency = async () => {
    try {
      // Try to get user's location and currency
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      const currencyMap = {
        'US': 'USD',
        'GB': 'GBP', 
        'CA': 'CAD',
        'AU': 'AUD',
        'IN': 'INR',
        'DE': 'EUR',
        'FR': 'EUR',
        'IT': 'EUR',
        'ES': 'EUR',
        'JP': 'JPY',
        'CN': 'CNY',
        'BR': 'BRL',
        'MX': 'MXN',
        'SG': 'SGD',
        'AE': 'AED'
      };
      
      const detectedCurrency = currencyMap[data.country_code] || 'USD';
      setCurrency(detectedCurrency);
      localStorage.setItem('preferredCurrency', detectedCurrency);
    } catch (error) {
      // Fallback to saved preference or USD
      const saved = localStorage.getItem('preferredCurrency');
      setCurrency(saved || 'USD');
    }
  };

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      // Using a free exchange rate API
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/INR');
      const data = await response.json();
      setExchangeRates(data.rates);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Fallback rates (approximate)
      setExchangeRates({
        USD: 0.012,
        EUR: 0.011,
        GBP: 0.0095,
        CAD: 0.016,
        AUD: 0.018,
        JPY: 1.8,
        CNY: 0.086,
        SGD: 0.016,
        AED: 0.044,
        INR: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const convertPrice = (priceInINR, targetCurrency = currency) => {
    if (!priceInINR || !exchangeRates[targetCurrency]) return priceInINR;
    return Math.round(priceInINR * exchangeRates[targetCurrency] * 100) / 100;
  };

  const formatPrice = (priceInINR, targetCurrency = currency) => {
    const convertedPrice = convertPrice(priceInINR, targetCurrency);
    
    const formatters = {
      USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
      EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
      GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
      CAD: new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }),
      AUD: new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }),
      JPY: new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }),
      CNY: new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }),
      SGD: new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }),
      AED: new Intl.NumberFormat('ar-AE', { style: 'currency', currency: 'AED' }),
      INR: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })
    };

    return formatters[targetCurrency]?.format(convertedPrice) || `${convertedPrice} ${targetCurrency}`;
  };

  const value = {
    currency,
    exchangeRates,
    loading,
    convertPrice,
    formatPrice,
    refreshRates: fetchExchangeRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};