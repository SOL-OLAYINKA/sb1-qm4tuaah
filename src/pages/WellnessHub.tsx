import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Play, BookOpen, Volume2,
  Heart, Brain, Leaf, Moon
} from 'lucide-react';
import { useWellnessContent, type WellnessContent } from '../lib/wellnessContent';
import { LoadingSpinner } from '../components/LoadingSpinner';

type Category = {
  id: 'mental' | 'physical' | 'nutrition' | 'sleep';
  name: string;
  icon: React.ReactNode;
};

const categories: Category[] = [
  { id: 'mental', name: 'Mental Health', icon: <Brain className="w-6 h-6" /> },
  { id: 'physical', name: 'Physical Health', icon: <Heart className="w-6 h-6" /> },
  { id: 'nutrition', name: 'Nutrition', icon: <Leaf className="w-6 h-6" /> },
  { id: 'sleep', name: 'Sleep', icon: <Moon className="w-6 h-6" /> },
];

const WellnessHub = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [content, setContent] = useState<WellnessContent[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchDailyContent } = useWellnessContent();

  useEffect(() => {
    const loadContent = async () => {
      try {
        const dailyContent = await fetchDailyContent();
        setContent(dailyContent);
      } catch (error) {
        console.error('Error loading wellness content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const filteredContent = content.filter(item => 
    (selectedCategory === 'all' || item.category === selectedCategory) &&
    (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredContent = content.find(item => item.featured);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Wellness Hub</h1>
        <p className="text-gray-600 mt-2">Your daily wellness resources and tips</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Content */}
      {featuredContent && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={featuredContent.thumbnail}
              alt="Wellness Feature"
              className="w-full md:w-1/3 rounded-lg object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold mb-2">{featuredContent.title}</h2>
              <p className="text-gray-700 mb-4">{featuredContent.description}</p>
              <button className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600">
                Join Challenge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map(resource => (
          <div key={resource.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {resource.thumbnail && (
              <img
                src={resource.thumbnail}
                alt={resource.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                {resource.type === 'video' && <Play className="w-4 h-4 text-red-500" />}
                {resource.type === 'article' && <BookOpen className="w-4 h-4 text-blue-500" />}
                {resource.type === 'audio' && <Volume2 className="w-4 h-4 text-green-500" />}
                <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
                {resource.duration && (
                  <span className="text-sm text-gray-500">• {resource.duration}</span>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2">
                {resource.type === 'video' && <Play className="w-4 h-4" />}
                {resource.type === 'article' && <BookOpen className="w-4 h-4" />}
                {resource.type === 'audio' && <Play className="w-4 h-4" />}
                <span>
                  {resource.type === 'video' && 'Watch Now'}
                  {resource.type === 'article' && 'Read More'}
                  {resource.type === 'audio' && 'Listen Now'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Tips */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Daily Wellness Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map(category => (
            <div key={category.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {category.icon}
                <h3 className="font-medium">{category.name}</h3>
              </div>
              <p className="text-sm text-gray-600">
                {category.id === 'mental' && 'Practice 5 minutes of mindful breathing'}
                {category.id === 'physical' && 'Try gentle stretching exercises'}
                {category.id === 'nutrition' && 'Include more leafy greens in your meals'}
                {category.id === 'sleep' && 'Maintain a consistent sleep schedule'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WellnessHub;