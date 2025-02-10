// client/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import VisitorChart from '../components/charts/VisitorChart';
import StatsGrid from '../components/dashboard/StatsGrid';
import TopPages from '../components/dashboard/TopPages';
import TopReferrers from '../components/dashboard/TopReferrers';

function Dashboard() {
  const [stats, setStats] = useState({
    visitors: 0,
    pageviews: 0,
    avgDuration: 0,
    bounceRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process stats
      const processedStats = processStats(data);
      setStats(processedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <StatsGrid stats={stats} />
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">Visitors</h2>
        <VisitorChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopPages />
        <TopReferrers />
      </div>
    </div>
  );
}

export default Dashboard;