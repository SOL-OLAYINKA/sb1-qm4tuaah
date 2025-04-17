import React, { useState } from 'react';
import { BookOpen, Calendar, Heart, Save, Smile, Sun, Moon } from 'lucide-react';
import { format } from 'date-fns';

type JournalEntry = {
  id: string;
  date: Date;
  mood: number;
  gratitude: string;
  reflection: string;
  bodyFeel: string;
  tags: string[];
};

const WellnessJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Omit<JournalEntry, 'id' | 'date'>>({
    mood: 5,
    gratitude: '',
    reflection: '',
    bodyFeel: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  const prompts = [
    "What made you smile today?",
    "How did your body feel during your cycle?",
    "What self-care activity did you practice?",
    "What are you looking forward to?",
    "How did you nurture yourself today?"
  ];

  const addTag = () => {
    if (newTag.trim() && !currentEntry.tags.includes(newTag.trim())) {
      setCurrentEntry(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      ...currentEntry
    };
    setEntries(prev => [newEntry, ...prev]);
    setCurrentEntry({
      mood: 5,
      gratitude: '',
      reflection: '',
      bodyFeel: '',
      tags: []
    });
  };

  const exportToPDF = () => {
    // This would be implemented to export journal entries as PDF
    console.log('Exporting journal entries...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wellness Journal</h1>
            <p className="text-gray-600 mt-2">Document your wellness journey</p>
          </div>
          <BookOpen className="w-8 h-8 text-pink-600" />
        </div>
      </div>

      {/* New Entry */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          {/* Date */}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span>{format(new Date(), 'MMMM d, yyyy')}</span>
          </div>

          {/* Mood Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling?</label>
            <div className="flex items-center gap-4">
              <Moon className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min="1"
                max="10"
                value={currentEntry.mood}
                onChange={(e) => setCurrentEntry(prev => ({ ...prev, mood: Number(e.target.value) }))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <Sun className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-semibold text-pink-600">{currentEntry.mood}/10</span>
            </div>
          </div>

          {/* Gratitude */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you grateful for today?
            </label>
            <textarea
              value={currentEntry.gratitude}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, gratitude: e.target.value }))}
              placeholder="List three things you're thankful for..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 h-24"
            />
          </div>

          {/* Body Check */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How did your body feel today?
            </label>
            <textarea
              value={currentEntry.bodyFeel}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, bodyFeel: e.target.value }))}
              placeholder="Notice any physical sensations, energy levels, or cycle-related changes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 h-24"
            />
          </div>

          {/* Daily Reflection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Reflection
            </label>
            <div className="mb-2">
              <button
                onClick={() => setCurrentEntry(prev => ({
                  ...prev,
                  reflection: prev.reflection + (prev.reflection ? '\n\n' : '') + prompts[Math.floor(Math.random() * prompts.length)]
                }))}
                className="text-sm text-pink-600 hover:text-pink-700"
              >
                Need a prompt? Click here
              </button>
            </div>
            <textarea
              value={currentEntry.reflection}
              onChange={(e) => setCurrentEntry(prev => ({ ...prev, reflection: e.target.value }))}
              placeholder="Write about your day, feelings, or any insights..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 h-32"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {currentEntry.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-pink-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
              >
                Add
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Entry
          </button>
        </div>
      </div>

      {/* Previous Entries */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Previous Entries</h2>
          <button
            onClick={exportToPDF}
            className="text-pink-600 hover:text-pink-700 flex items-center gap-2"
          >
            Export Journal
          </button>
        </div>
        <div className="space-y-6">
          {entries.map(entry => (
            <div key={entry.id} className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{format(entry.date, 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-gray-500" />
                  <span>{entry.mood}/10</span>
                </div>
              </div>
              {entry.gratitude && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Gratitude</h3>
                  <p className="text-gray-600">{entry.gratitude}</p>
                </div>
              )}
              {entry.bodyFeel && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Body Check</h3>
                  <p className="text-gray-600">{entry.bodyFeel}</p>
                </div>
              )}
              {entry.reflection && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Reflection</h3>
                  <p className="text-gray-600">{entry.reflection}</p>
                </div>
              )}
              {entry.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {entry.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WellnessJournal;