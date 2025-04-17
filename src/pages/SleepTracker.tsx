import React, { useState, useEffect } from 'react';
import { Moon, Sun, Clock, Calendar, BookOpen, Bell, Volume2, Vibrate } from 'lucide-react';
import { format } from 'date-fns';
import { playNotificationSound, type SoundType } from '../lib/sounds';
import { useSleepAlerts } from '../lib/useSleepAlerts';

type SleepEntry = {
  id: string;
  date: Date;
  bedtime: string;
  wakeTime: string;
  quality: number;
  notes: string;
};

const SleepTracker = () => {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>(() => {
    const savedEntries = localStorage.getItem('sleepEntries');
    return savedEntries ? JSON.parse(savedEntries) : [];
  });
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(5);
  const [notes, setNotes] = useState('');
  const { alerts, toggleAlert, updateAlertTime, updateAlertSound } = useSleepAlerts();

  useEffect(() => {
    localStorage.setItem('sleepEntries', JSON.stringify(sleepEntries));
  }, [sleepEntries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: SleepEntry = {
      id: Date.now().toString(),
      date: new Date(),
      bedtime,
      wakeTime,
      quality,
      notes
    };
    setSleepEntries(prev => [newEntry, ...prev]);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Sleep Tracker</h1>
        <p className="text-gray-600 mt-2">Monitor your sleep patterns and quality</p>
      </div>

      {/* Sleep Alerts */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Sleep Reminders</h2>
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {alert.type === 'bedtime' ? (
                    <Moon className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className="font-medium capitalize">{alert.type} Alert</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alert.enabled}
                    onChange={() => toggleAlert(alert.id, 'enabled')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={alert.time}
                    onChange={(e) => updateAlertTime(alert.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sound</label>
                  <select
                    value={alert.soundType}
                    onChange={(e) => {
                      updateAlertSound(alert.id, e.target.value as SoundType);
                      playNotificationSound(e.target.value as SoundType);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="gentle">Gentle</option>
                    <option value="chime">Chime</option>
                    <option value="soft">Soft</option>
                    <option value="bell">Bell</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alert.sound}
                    onChange={() => toggleAlert(alert.id, 'sound')}
                    className="rounded text-pink-600"
                  />
                  <span className="text-sm flex items-center gap-1">
                    <Volume2 className="w-4 h-4" /> Sound
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={alert.vibration}
                    onChange={() => toggleAlert(alert.id, 'vibration')}
                    className="rounded text-pink-600"
                  />
                  <span className="text-sm flex items-center gap-1">
                    <Vibrate className="w-4 h-4" /> Vibration
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sleep Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Bedtime
                </div>
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Wake Time
                </div>
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Quality
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-semibold text-pink-600">{quality}/10</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Notes
              </div>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you sleep? Any dreams or disturbances?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 h-32"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Save Sleep Entry
          </button>
        </div>
      </form>

      {/* Sleep History */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Sleep History</h2>
        <div className="space-y-4">
          {sleepEntries.map(entry => (
            <div key={entry.id} className="border-b border-gray-200 pb-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">
                    {format(new Date(entry.date), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{entry.bedtime} - {entry.wakeTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-pink-500 rounded-full"
                    style={{ width: `${(entry.quality / 10) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{entry.quality}/10</span>
              </div>
              {entry.notes && (
                <p className="text-gray-600 text-sm">{entry.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sleep Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-2">Average Sleep Quality</h3>
          <p className="text-3xl font-bold text-pink-600">
            {sleepEntries.length > 0
              ? (sleepEntries.reduce((acc, entry) => acc + entry.quality, 0) / sleepEntries.length).toFixed(1)
              : 'N/A'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-2">Most Common Bedtime</h3>
          <p className="text-3xl font-bold text-pink-600">{bedtime}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-2">Average Wake Time</h3>
          <p className="text-3xl font-bold text-pink-600">{wakeTime}</p>
        </div>
      </div>
    </div>
  );
};

export default SleepTracker;