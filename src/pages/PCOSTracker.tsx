import React, { useState } from 'react';
import { Activity, Calendar, AlertCircle, FileText, Heart, Scale, Moon, ThermometerSun } from 'lucide-react';

type PCOSSymptom = {
  id: string;
  name: string;
  icon: React.ReactNode;
  selected: boolean;
};

const PCOSTracker = () => {
  const [hasPCOS, setHasPCOS] = useState(false);
  const [symptoms, setSymptoms] = useState<PCOSSymptom[]>([
    { id: 'irregular', name: 'Irregular Periods', icon: <Calendar className="w-5 h-5" />, selected: false },
    { id: 'acne', name: 'Acne', icon: <AlertCircle className="w-5 h-5" />, selected: false },
    { id: 'hair', name: 'Excess Hair Growth', icon: <Activity className="w-5 h-5" />, selected: false },
    { id: 'weight', name: 'Weight Changes', icon: <Scale className="w-5 h-5" />, selected: false },
    { id: 'mood', name: 'Mood Swings', icon: <Moon className="w-5 h-5" />, selected: false },
    { id: 'fatigue', name: 'Fatigue', icon: <ThermometerSun className="w-5 h-5" />, selected: false }
  ]);
  const [notes, setNotes] = useState('');
  const [lastPeriod, setLastPeriod] = useState('');

  const toggleSymptom = (id: string) => {
    setSymptoms(prev => prev.map(symptom =>
      symptom.id === id ? { ...symptom, selected: !symptom.selected } : symptom
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would save the PCOS tracking data
    console.log({
      hasPCOS,
      symptoms: symptoms.filter(s => s.selected),
      notes,
      lastPeriod
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">PCOS & Hormonal Health</h1>
        <p className="text-gray-600 mt-2">Track and manage your hormonal health journey</p>
      </div>

      {/* PCOS Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">PCOS Diagnosis</h2>
            <p className="text-gray-600 text-sm">Have you been diagnosed with PCOS?</p>
          </div>
          <button
            onClick={() => setHasPCOS(!hasPCOS)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
              hasPCOS ? 'bg-pink-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                hasPCOS ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Symptom Tracking */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Symptom Tracker</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {symptoms.map(symptom => (
            <button
              key={symptom.id}
              onClick={() => toggleSymptom(symptom.id)}
              className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                symptom.selected
                  ? 'bg-pink-50 border-pink-200 text-pink-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {symptom.icon}
              <span>{symptom.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Period Tracking */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Period Tracking</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Period Start Date
            </label>
            <input
              type="date"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Notes & Observations</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about your symptoms, medications, or general observations..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Resources */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">PCOS Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="#"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <FileText className="w-5 h-5 text-pink-600" />
            <div>
              <h3 className="font-medium">Understanding PCOS</h3>
              <p className="text-sm text-gray-600">Comprehensive guide to PCOS management</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <Heart className="w-5 h-5 text-pink-600" />
            <div>
              <h3 className="font-medium">Lifestyle Tips</h3>
              <p className="text-sm text-gray-600">Diet and exercise recommendations</p>
            </div>
          </a>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors"
      >
        Save PCOS Tracking Data
      </button>
    </div>
  );
};

export default PCOSTracker;