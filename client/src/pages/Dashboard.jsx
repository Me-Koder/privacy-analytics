// client/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import VisitorChart from '../components/VisitorChart';
import StatsGrid from '../components/dashboard/StatsGrid';
import TopPages from '../components/dashboard/TopPages';
import TopReferrers from '../components/dashboard/TopReferrers';

function Dashboard() {
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data for different components
      const processedStats = processStats(events);
      const processedVisitorData = processVisitorData(events);
      const processedTopPages = processTopPages(events);
      const processedTopReferrers = processTopReferrers(events);

      setStats(processedStats);
      setVisitorData(processedVisitorData);
      setTopPages(processedTopPages);
      setTopReferrers(processedTopReferrers);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />
      <VisitorChart data={visitorData} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopPages data={topPages} />
        <TopReferrers data={topReferrers} />
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