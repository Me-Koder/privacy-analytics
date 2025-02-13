// client/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import VisitorChart from '../components/VisitorChart';
import StatsGrid from '../components/dashboard/StatsGrid';
import TopPages from '../components/dashboard/TopPages';
import TopReferrers from '../components/dashboard/TopReferrers';

function Dashboard() {
  const { isDemoMode } = useAuth();
  const [stats, setStats] = useState({
    visitors: 0,
    pageviews: 0,
    avgDuration: 0,
    bounceRate: 0,
    visitorChange: 0,
    pageviewChange: 0,
    durationChange: 0,
    bounceRateChange: 0
  });
  const [visitorData, setVisitorData] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDemoMode) {
      try {
        setDemoData();
      } catch (err) {
        console.error('Error setting demo data:', err);
        setError('Failed to load demo data');
        setLoading(false);
      }
    } else {
      fetchData();
    }
  }, [isDemoMode]);

  const setDemoData = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Set demo stats
      setStats({
        visitors: 1247,
        pageviews: 3829,
        avgDuration: 185,
        bounceRate: 0.32,
        visitorChange: 15.8,
        pageviewChange: 23.4,
        durationChange: 8.2,
        bounceRateChange: -5.1
      });

      // Generate last 7 days of visitor data
      const today = new Date();
      const demoVisitorData = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        visitors: Math.floor(150 + Math.random() * 100)
      }));
      setVisitorData(demoVisitorData);

      // Set demo top pages
      setTopPages([
        { path: '/products', pageviews: 1245 },
        { path: '/about', pageviews: 856 },
        { path: '/pricing', pageviews: 721 },
        { path: '/blog/top-10-features', pageviews: 543 },
        { path: '/contact', pageviews: 432 }
      ]);

      // Set demo referrers
      setTopReferrers([
        { domain: 'google.com', visitors: 456 },
        { domain: 'twitter.com', visitors: 312 },
        { domain: 'linkedin.com', visitors: 234 },
        { domain: 'facebook.com', visitors: 187 },
        { domain: 'github.com', visitors: 143 }
      ]);
    } catch (err) {
      console.error('Error in setDemoData:', err);
      setError('Failed to set demo data');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: events, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const processedStats = processStats(events);
      const processedVisitorData = processVisitorData(events);
      const processedTopPages = processTopPages(events);
      const processedTopReferrers = processTopReferrers(events);

      setStats(processedStats);
      setVisitorData(processedVisitorData);
      setTopPages(processedTopPages);
      setTopReferrers(processedTopReferrers);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isDemoMode && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You are viewing demo data. This is a simulation of how your analytics dashboard would look with real data.
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="grid gap-6">
        <StatsGrid stats={stats} />
        <VisitorChart data={visitorData} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopPages data={topPages} />
          <TopReferrers data={topReferrers} />
        </div>
      </div>
    </div>
  );
}

// Helper functions
function processStats(events) {
  // Implement your stats processing logic here
  return {
    visitors: 100,
    pageviews: 500,
    avgDuration: 120,
    bounceRate: 0.25,
    visitorChange: 10,
    pageviewChange: 15,
    durationChange: 5,
    bounceRateChange: -2
  };
}

function processVisitorData(events) {
  // Implement your visitor data processing logic here
  return Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
    visitors: Math.floor(Math.random() * 100)
  }));
}

function processTopPages(events) {
  // Implement your top pages processing logic here
  return Array.from({ length: 5 }, (_, i) => ({
    path: `/page-${i + 1}`,
    pageviews: Math.floor(Math.random() * 1000)
  }));
}

function processTopReferrers(events) {
  // Implement your top referrers processing logic here
  return Array.from({ length: 5 }, (_, i) => ({
    domain: `referrer-${i + 1}.com`,
    visitors: Math.floor(Math.random() * 500)
  }));
}

export default Dashboard;