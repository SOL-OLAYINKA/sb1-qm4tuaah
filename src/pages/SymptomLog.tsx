import React, { useState } from 'react';
import { 
  Activity, ThermometerSun, Moon, Sun, Droplets, 
  Frown, Smile, Plus, Save
} from 'lucide-react';

type Symptom = {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'physical' | 'emotional' | 'custom';
};

type Intensity = 'none' | 'mild' | 'moderate' | 'severe';

const symptoms: Symptom[] = [
  { id: 'cramps', name: 'Cramps', icon: <Activity className="w-5 h-5" />, category: 'physical' },
  { id: 'headache', name: 'Headache', icon: <ThermometerSun className="w-5 h-5" />, category: 'physical' },
  { id: 'mood', name: 'Mood Changes', icon: <Moon className="w-5 h-5" />, category: 'emotional' },
  { id: 'energy', name: 'Low Energy', icon: <Sun className="w-5 h-5" />, category: 'physical' },
  { id: 'flow', name: 'Flow', icon: <Droplets className="w-5 h-5" />, category: 'physical' },
  { id: 'anxiety', name: 'Anxiety', icon: <Frown className="w-5 h-5" />, category: 'emotional' },
  { id: 'happiness', name: 'Happy', icon: <Smile className="w-5 h-5" />, category: 'emotional' },
];

const SymptomLog = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, Intensity>>({});
  const [notes, setNotes] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');
  const [mood, setMood] = useState<number>(3);

  const handleSymptomIntensity = (symptomId: string, intensity: Intensity) => {
    setSelectedSymptoms(prev => ({
      ...prev,
      [symptomId]: intensity
    }));
  };

  const handleAddCustomSymptom = () => {
    if (customSymptom.trim()) {
      symptoms.push({
        id: customSymptom.toLowerCase().replace(/\s+/g, '-'),
        name: customSymptom,
        icon: <Plus className="w-5 h-5" />,
        category: 'custom'
      });
      setCustomSymptom('');
    }
  };

  const handleSave = () => {
    // Here we would save the symptom log
    console.log({
      symptoms: selectedSymptoms,
      mood,
      notes,
      date: new Date()
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Symptom Log</h1>
        <p className="text-gray-600 mt-2">Track your daily symptoms and mood</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">How are you feeling today?</h2>
        
        <div className="mb-8">
          <p className="text-gray-700 mb-4">Mood Scale</p>
          <div className="flex justify-between items-center">
            <input
              type="range"
              min="1"
              max="5"
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex justify-between mt-2">
            <Frown className="w-6 h-6 text-gray-400" />
            <Smile className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        <div className="space-y-6">
          {['physical', 'emotional', 'custom'].map(category => (
            <div key={category} className="space-y-4">
              <h3 className="text-lg font-medium capitalize">{category} Symptoms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {symptoms
                  .filter(symptom => symptom.category === category)
                  .map(symptom => (
                    <div key={symptom.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        {symptom.icon}
                        <span className="font-medium">{symptom.name}</span>
                      </div>
                      <div className="flex space-x-2">
                        {(['none', 'mild', 'moderate', 'severe'] as Intensity[]).map(intensity => (
                          <button
                            key={intensity}
                            onClick={() => handleSymptomIntensity(symptom.id, intensity)}
                            className={`px-3 py-1 rounded-full text-sm ${
                              selectedSymptoms[symptom.id] === intensity
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
          ))}
        </div>

        <div className="mt-6">
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              placeholder="Add custom symptom"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={handleAddCustomSymptom}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Add
            </button>
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about how you're feeling today..."
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full flex items-center justify-center space-x-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600"
        >
          <Save className="w-5 h-5" />
          <span>Save Symptom Log</span>
        </button>
      </div>
    </div>
  );
};

export default SymptomLog;