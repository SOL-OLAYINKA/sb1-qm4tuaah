import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, Activity, Bell, Plus, Volume2, Vibrate, Music2, PartyPopper as Party } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useReminders, type Reminder } from '../lib/useReminders';
import { useAudio } from '../lib/useAudio';
import { AudioButton } from '../components/AudioButton';
import { useAuth } from '../lib/AuthContext';
import { SOUND_TYPES, type SoundType } from '../lib/sounds';
import { supabase } from '../lib/supabase';

const HomePage = () => {
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [showNewReminder, setShowNewReminder] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { playSound } = useAudio();
  
  // Initialize with current time + 30 minutes
  const initialReminderTime = new Date(Date.now() + 30 * 60000);
  
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    title: '',
    time: initialReminderTime,
    icon: '⏰',
    sound: true,
    soundType: 'gentle',
    vibration: true
  });

  const { reminders, activeReminders, addReminder, removeReminder, getRemainingTime } = useReminders();

  // Check if user has logged symptoms today
  useEffect(() => {
    const checkTodayLogs = async () => {
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('symptom_logs')
        .select('id')
        .eq('user_id', user.id)
        .gte('date', today.toISOString())
        .limit(1);

      setHasLoggedToday(!!data?.length);
    };

    checkTodayLogs();
  }, [user]);

  const quickActions = [
    { 
      icon: <Activity className="w-6 h-6" />, 
      label: "Log Symptom", 
      path: "/symptoms",
      onClick: async () => {
        await playSound('gentle');
        navigate('/symptoms');
      }
    },
    { 
      icon: <BookOpen className="w-6 h-6" />, 
      label: "Watch Tip", 
      path: "/wellness",
      onClick: async () => {
        await playSound('soft');
        navigate('/wellness');
      }
    },
    { 
      icon: <Heart className="w-6 h-6" />, 
      label: "Track Cycle", 
      path: "/cycle",
      onClick: async () => {
        await playSound('chime');
        navigate('/cycle');
      }
    }
  ];

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleAddReminder = async () => {
    if (!newReminder.title || !newReminder.time) return;

    await playSound('bell');
    
    addReminder({
      id: Date.now().toString(),
      title: newReminder.title,
      time: new Date(newReminder.time),
      icon: newReminder.icon || '⏰',
      sound: newReminder.sound ?? true,
      soundType: newReminder.soundType ?? 'gentle',
      vibration: newReminder.vibration ?? true
    });
    
    setShowNewReminder(false);
    setNewReminder({
      title: '',
      time: initialReminderTime,
      icon: '⏰',
      sound: true,
      soundType: 'gentle',
      vibration: true
    });
  };

  const handleRemoveReminder = async (id: string) => {
    await playSound('alert');
    removeReminder(id);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setNewReminder(prev => ({ ...prev, time: newDate }));
    }
  };

  const handleLogToday = async (hasLogged: boolean) => {
    await playSound('gentle');
    setHasLoggedToday(hasLogged);
    
    if (hasLogged) {
      setShowCongrats(true);
      setTimeout(() => setShowCongrats(false), 5000);

      // If they've already logged, save this status
      if (user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        await supabase
          .from('symptom_logs')
          .upsert({
            user_id: user.id,
            date: today.toISOString(),
            mood: 3, // Default mood
            symptoms: [],
          });
      }
    } else {
      navigate('/symptoms');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Congratulatory Message */}
      {showCongrats && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-8 py-6 rounded-xl shadow-lg transform animate-[bounce_1s_ease-in-out] text-center">
            <Party className="w-12 h-12 text-pink-500 mx-auto mb-3 animate-[spin_2s_linear_infinite]" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Great job!</h3>
            <p className="text-gray-600">You're taking great care of yourself today! 🎉</p>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-gray-600 mt-2">How are you feeling today?</p>
      </div>

      {/* Daily Affirmation */}
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800">Daily Affirmation</h2>
        <p className="text-gray-700 mt-2 italic">
          "You are strong, capable, and in tune with your body's needs."
        </p>
      </div>

      {/* Logging Reminder */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800">Did you log today?</h2>
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => handleLogToday(true)}
            className={`flex-1 py-3 rounded-lg transition-colors ${
              hasLoggedToday
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => handleLogToday(false)}
            className={`flex-1 py-3 rounded-lg transition-colors ${
              !hasLoggedToday
                ? 'bg-pink-100 text-pink-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center justify-center text-center hover:bg-pink-50 transition-colors"
          >
            <div className="text-pink-600 mb-2">{action.icon}</div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Upcoming Reminders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Upcoming Reminders</h2>
          </div>
          <button
            onClick={async () => {
              await playSound('soft');
              setShowNewReminder(true);
            }}
            className="text-pink-600 hover:text-pink-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3">
          {reminders.map(reminder => (
            <div
              key={reminder.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                activeReminders.includes(reminder.id)
                  ? 'bg-pink-100'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{reminder.icon}</span>
                <div>
                  <p className="font-medium">{reminder.title}</p>
                  <p className="text-sm text-gray-600">
                    {getRemainingTime(reminder.time)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {reminder.sound && (
                  <AudioButton
                    soundType={reminder.soundType}
                    className="text-gray-500 hover:text-gray-700"
                  />
                )}
                {reminder.vibration && <Vibrate className="w-4 h-4 text-gray-500" />}
                <button
                  onClick={() => handleRemoveReminder(reminder.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Reminder Modal */}
      {showNewReminder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">New Reminder</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                  placeholder="Reminder title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="datetime-local"
                  value={formatDateTimeLocal(newReminder.time instanceof Date ? newReminder.time : new Date())}
                  onChange={handleTimeChange}
                  min={formatDateTimeLocal(new Date())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <input
                  type="text"
                  value={newReminder.icon}
                  onChange={(e) => setNewReminder(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                  placeholder="Enter an emoji"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Sound
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(SOUND_TYPES).map(([type]) => (
                    <button
                      key={type}
                      onClick={async () => {
                        await playSound(type as SoundType);
                        setNewReminder(prev => ({ ...prev, soundType: type as SoundType }));
                      }}
                      className={`flex items-center justify-between p-2 rounded-lg border ${
                        newReminder.soundType === type
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
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newReminder.sound}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, sound: e.target.checked }))}
                    className="rounded text-pink-600"
                  />
                  <span className="text-sm">Sound</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newReminder.vibration}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, vibration: e.target.checked }))}
                    className="rounded text-pink-600"
                  />
                  <span className="text-sm">Vibration</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={async () => {
                  await playSound('soft');
                  setShowNewReminder(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddReminder}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Add Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;