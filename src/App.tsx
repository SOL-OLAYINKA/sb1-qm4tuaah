import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Calendar, ClipboardList, Sparkles, User } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/LoadingSpinner';
import { NotificationInitializer } from './components/NotificationInitializer';

// Optimized code splitting
const HomePage = React.lazy(() => import('./pages/HomePage'));
const CycleTracker = React.lazy(() => import('./pages/CycleTracker'));
const SymptomLog = React.lazy(() => import('./pages/SymptomLog'));
const WellnessHub = React.lazy(() => 
  import(/* webpackChunkName: "wellness" */ './pages/WellnessHub')
    .then(module => {
      // Preload related components
      import('./pages/SleepTracker');
      import('./pages/WellnessJournal');
      return module;
    })
);
const Profile = React.lazy(() => import('./pages/Profile'));

// Combine PCOS and Postpartum into one chunk
const HealthTracking = React.lazy(() => 
  import(/* webpackChunkName: "health-tracking" */ './pages/PCOSTracker')
    .then(module => {
      import('./pages/PostpartumHub');
      return module;
    })
);

function App() {
  return (
    <Router>
      <NotificationInitializer />
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <ErrorBoundary>
          <main className="flex-1 container mx-auto px-4 py-6 mb-16">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/cycle" element={<CycleTracker />} />
                <Route path="/symptoms" element={<SymptomLog />} />
                <Route path="/wellness/*" element={<WellnessHub />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/health/*" element={<HealthTracking />} />
              </Routes>
            </Suspense>
          </main>
        </ErrorBoundary>

        {/* Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 shadow-lg">
          <div className="flex justify-around items-center h-16">
            <Link to="/" className="flex flex-col items-center text-pink-600">
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link to="/cycle" className="flex flex-col items-center text-gray-600 hover:text-pink-600">
              <Calendar className="w-6 h-6" />
              <span className="text-xs mt-1">Cycle</span>
            </Link>
            <Link to="/symptoms" className="flex flex-col items-center text-gray-600 hover:text-pink-600">
              <ClipboardList className="w-6 h-6" />
              <span className="text-xs mt-1">Log</span>
            </Link>
            <Link to="/wellness" className="flex flex-col items-center text-gray-600 hover:text-pink-600">
              <Sparkles className="w-6 h-6" />
              <span className="text-xs mt-1">Wellness</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center text-gray-600 hover:text-pink-600">
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </nav>
      </div>
    </Router>
  );
}

export default App;