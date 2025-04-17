import React, { useState } from 'react';
import { Baby, Heart, Moon, Sun, Battery, Droplets, Brain, Play } from 'lucide-react';

type Symptom = {
  id: string;
  name: string;
  icon: React.ReactNode;
  intensity: 'none' | 'mild' | 'moderate' | 'severe';
};

const PostpartumHub = () => {
  const [isPostpartumMode, setIsPostpartumMode] = useState(true);
  const [symptoms, setSymptoms] = useState<Symptom[]>([
    { id: 'fatigue', name: 'Fatigue', icon: <Battery className="w-5 h-5" />, intensity: 'none' },
    { id: 'bleeding', name: 'Bleeding', icon: <Droplets className="w-5 h-5" />, intensity: 'none' },
    { id: 'mood', name: 'Mood', icon: <Brain className="w-5 h-5" />, intensity: 'none' },
    { id: 'sleep', name: 'Sleep Quality', icon: <Moon className="w-5 h-5" />, intensity: 'none' }
  ]);
  const [breastfeeding, setBreastfeeding] = useState({
    lastSession: '',
    duration: 0,
    side: 'left',
    notes: ''
  });
  const [recoveryNotes, setRecoveryNotes] = useState('');

  const updateSymptomIntensity = (id: string, intensity: 'none' | 'mild' | 'moderate' | 'severe') => {
    setSymptoms(prev => prev.map(symptom =>
      symptom.id === id ? { ...symptom, intensity } : symptom
    ));
  };

  const handleSave = () => {
    console.log({
      symptoms,
      breastfeeding,
      recoveryNotes,
      date: new Date()
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Postpartum Health Hub</h1>
            <p className="text-gray-600 mt-2">Track your postpartum recovery journey</p>
          </div>
          <Baby className="w-8 h-8 text-pink-600" />
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">New Mom Mode</h2>
            <p className="text-gray-600 text-sm">Customize your experience for postpartum tracking</p>
          </div>
          <button
            onClick={() => setIsPostpartumMode(!isPostpartumMode)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
              isPostpartumMode ? 'bg-pink-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isPostpartumMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Symptom Tracking */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Daily Health Check</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {symptoms.map(symptom => (
            <div key={symptom.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                {symptom.icon}
                <span className="font-medium">{symptom.name}</span>
              </div>
              <div className="flex gap-2">
                {(['none', 'mild', 'moderate', 'severe'] as const).map(intensity => (
                  <button
                    key={intensity}
                    onClick={() => updateSymptomIntensity(symptom.id, intensity)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      symptom.intensity === intensity
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breastfeeding Tracker */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Breastfeeding Log</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Session Time</label>
              <input
                type="datetime-local"
                value={breastfeeding.lastSession}
                onChange={(e) => setBreastfeeding(prev => ({ ...prev, lastSession: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={breastfeeding.duration}
                onChange={(e) => setBreastfeeding(prev => ({ ...prev, duration: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setBreastfeeding(prev => ({ ...prev, side: 'left' }))}
              className={`flex-1 py-2 rounded-lg ${
                breastfeeding.side === 'left'
                  ? 'bg-pink-100 text-pink-700 border-pink-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              } border`}
            >
              Left Side
            </button>
            <button
              onClick={() => setBreastfeeding(prev => ({ ...prev, side: 'right' }))}
              className={`flex-1 py-2 rounded-lg ${
                breastfeeding.side === 'right'
                  ? 'bg-pink-100 text-pink-700 border-pink-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              } border`}
            >
              Right Side
            </button>
          </div>
          <textarea
            value={breastfeeding.notes}
            onChange={(e) => setBreastfeeding(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any notes about feeding..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 h-24"
          />
        </div>
      </div>

      {/* Recovery Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Recovery Notes</h2>
        <textarea
          value={recoveryNotes}
          onChange={(e) => setRecoveryNotes(e.target.value)}
          placeholder="How are you feeling today? Any concerns or improvements?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 h-32"
        />
      </div>

      {/* Resources */}
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">BeAware Postpartum Series</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <Play className="w-5 h-5 text-pink-600" />
            <div>
              <h3 className="font-medium">Recovery Exercises</h3>
              <p className="text-sm text-gray-600">Gentle movements for healing</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 flex items-center gap-3">
            <Heart className="w-5 h-5 text-pink-600" />
            <div>
              <h3 className="font-medium">Self-Care Tips</h3>
              <p className="text-sm text-gray-600">Taking care of you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors"
      >
        Save Today's Log
      </button>
    </div>
  );
};

export default PostpartumHub;