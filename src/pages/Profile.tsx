import React, { useState, useEffect } from 'react';
import { 
  User, Bell, Lock, Moon, Sun, 
  Calendar, Shield, LogOut, ChevronRight,
  Volume2, Vibrate, Music2, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationSettings } from '../lib/useNotificationSettings';
import { playNotificationSound, SOUND_TYPES, type SoundType } from '../lib/sounds';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

const Profile = () => {
  const { settings, updateSettings } = useNotificationSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    cycleLength: 28,
    periodLength: 5
  });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setPersonalInfo(prev => ({
          ...prev,
          name: profile?.display_name || user.email?.split('@')[0] || '',
          email: user.email || ''
        }));
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user]);

  const handleSoundPreview = async (soundType: SoundType) => {
    await playNotificationSound(soundType, settings.notificationVolume);
  };

  const validateTimeFormat = (time: string): boolean => {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePrivacySettings = () => {
    navigate('/profile/privacy');
  };

  const handleSecuritySettings = () => {
    navigate('/profile/security');
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          display_name: personalInfo.name,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-pink-600 hover:text-pink-700"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={personalInfo.name}
              onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
              disabled={!isEditing}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={personalInfo.email}
              onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
              disabled={true}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cycle Length (days)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={personalInfo.cycleLength}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, cycleLength: Number(e.target.value) }))}
                disabled={!isEditing}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Period Length (days)</label>
              <input
                type="number"
                min="1"
                max="14"
                value={personalInfo.periodLength}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, periodLength: Number(e.target.value) }))}
                disabled={!isEditing}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center mb-6">
          <Bell className="w-5 h-5 mr-2" />
          <h2 className="text-xl font-semibold">Notification Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Sound and Vibration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Sound</h3>
                  <p className="text-sm text-gray-500">Enable notification sounds</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900">Vibration</h3>
                  <p className="text-sm text-gray-500">Enable vibration for notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.vibrationEnabled}
                  onChange={() => updateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            {settings.soundEnabled && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.notificationVolume}
                    onChange={(e) => updateSettings({ notificationVolume: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>Off</span>
                    <span>Max</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Default Sound</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(SOUND_TYPES).map(([type]) => (
                      <button
                        key={type}
                        onClick={() => {
                          updateSettings({ defaultSoundType: type as SoundType });
                          handleSoundPreview(type as SoundType);
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg border ${
                          settings.defaultSoundType === type
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="capitalize">{type}</span>
                        <Music2 className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quiet Hours */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">Quiet Hours</h3>
                    <p className="text-sm text-gray-500">Disable notifications during specific hours</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.quietHoursEnabled}
                    onChange={() => updateSettings({ quietHoursEnabled: !settings.quietHoursEnabled })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>

              {settings.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) => {
                        if (validateTimeFormat(e.target.value)) {
                          updateSettings({ quietHoursStart: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) => {
                        if (validateTimeFormat(e.target.value)) {
                          updateSettings({ quietHoursEnd: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alert Types */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-gray-900">Alert Types</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Daily Reminders</h4>
                <p className="text-sm text-gray-500">Water, meditation, and symptom logging</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.remindersEnabled}
                  onChange={() => updateSettings({ remindersEnabled: !settings.remindersEnabled })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Sleep Alerts</h4>
                <p className="text-sm text-gray-500">Bedtime and wake-up reminders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sleepAlertsEnabled}
                  onChange={() => updateSettings({ sleepAlertsEnabled: !settings.sleepAlertsEnabled })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Cycle Alerts</h4>
                <p className="text-sm text-gray-500">Period and ovulation predictions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cycleAlertsEnabled}
                  onChange={() => updateSettings({ cycleAlertsEnabled: !settings.cycleAlertsEnabled })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <button 
          onClick={handlePrivacySettings}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <Lock className="w-5 h-5 text-gray-400 mr-3" />
            <span>Privacy Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button 
          onClick={handleSecuritySettings}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-gray-400 mr-3" />
            <span>Security</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl shadow-sm hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center">
            <LogOut className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-500">Log Out</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Profile;