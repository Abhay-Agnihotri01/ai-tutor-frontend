import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Settings as SettingsIcon, Save, Globe,
  Mail, Shield, DollarSign, Bell, Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import { toast } from 'react-hot-toast';
import { Skeleton } from '../../components/common/Skeleton';
import { API_URL } from '../../config/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'LearnHub',
      siteDescription: 'A modern learning management system',
      contactEmail: 'admin@learnhub.com',
      supportEmail: 'support@learnhub.com'
    },
    platform: {
      allowRegistration: true,
      requireEmailVerification: true,
      defaultUserRole: 'student',
      maxFileUploadSize: 10
    },
    payment: {
      currency: 'USD',
      commissionRate: 10,
      minimumPayout: 50,
      paymentMethods: ['stripe', 'paypal']
    },
    notifications: {
      emailNotifications: true,
      courseApprovalNotifications: true,
      newUserNotifications: true,
      systemMaintenanceNotifications: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchSettings();
    }
  }, [isAuthenticated, user?.role]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-lg theme-card" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold theme-text-primary mb-2">
              Platform Settings
            </h1>
            <p className="theme-text-secondary">
              Configure your platform settings and preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="space-y-8">
          {/* General Settings */}
          <div className="theme-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              General Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Site Description
                </label>
                <textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
                />
              </div>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="theme-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Platform Settings
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium theme-text-primary">Allow User Registration</h3>
                  <p className="text-sm theme-text-secondary">Allow new users to register on the platform</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.platform.allowRegistration}
                    onChange={(e) => updateSetting('platform', 'allowRegistration', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium theme-text-primary">Email Verification Required</h3>
                  <p className="text-sm theme-text-secondary">Require email verification for new accounts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.platform.requireEmailVerification}
                    onChange={(e) => updateSetting('platform', 'requireEmailVerification', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Default User Role
                  </label>
                  <select
                    value={settings.platform.defaultUserRole}
                    onChange={(e) => updateSetting('platform', 'defaultUserRole', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium theme-text-primary mb-2">
                    Max File Upload Size (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.platform.maxFileUploadSize}
                    onChange={(e) => updateSetting('platform', 'maxFileUploadSize', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="theme-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Currency
                </label>
                <select
                  value={settings.payment.currency}
                  onChange={(e) => updateSetting('payment', 'currency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.payment.commissionRate}
                  onChange={(e) => updateSetting('payment', 'commissionRate', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium theme-text-primary mb-2">
                  Minimum Payout ($)
                </label>
                <input
                  type="number"
                  value={settings.payment.minimumPayout}
                  onChange={(e) => updateSetting('payment', 'minimumPayout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent theme-bg theme-text"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="theme-card p-6 rounded-lg">
            <h2 className="text-xl font-semibold theme-text-primary mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notification Settings
            </h2>
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium theme-text-primary capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;