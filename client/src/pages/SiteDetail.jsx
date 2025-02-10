// client/src/pages/SiteDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import StatsGrid from '../components/dashboard/StatsGrid';
import VisitorChart from '../components/VisitorChart';
import TopPages from '../components/dashboard/TopPages';
import TopReferrers from '../components/dashboard/TopReferrers';

function SiteDetail() {
  const { siteId } = useParams();
  const [site, setSite] = useState(null);
  const [timeframe, setTimeframe] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteDetails();
    fetchAnalytics();
  }, [siteId, timeframe]);

  const fetchSiteDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single();

      if (error) throw error;
      setSite(data);
    } catch (error) {
      console.error('Error fetching site details:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const startDate = getTimeframeStartDate(timeframe);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('site_id', siteId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const processedData = processAnalyticsData(data);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!site || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{site.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{site.domain}</p>
          </div>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="ml-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>

        {analyticsData && (
          <>
            <div className="mt-6">
              <StatsGrid stats={analyticsData.overview} />
            </div>

            <div className="mt-8">
              <VisitorChart data={analyticsData.visitorTrends} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <TopPages data={analyticsData.topPages} />
              <TopReferrers data={analyticsData.topReferrers} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const getTimeframeStartDate = (timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case '24h':
      return new Date(now - 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
  }
};

const processAnalyticsData = (events) => {
  const visitors = new Set(events.map(e => e.visitor_id)).size;
  const pageviews = events.filter(e => e.event_type === 'pageview').length;
  const sessions = new Set(events.map(e => e.session_id)).size;
  const bounceRate = calculateBounceRate(events);

  return {
    overview: {
      visitors,
      pageviews,
      sessions,
      bounceRate,
      avgTimeOnSite: calculateAverageTimeOnSite(events)
    },
    visitorTrends: generateVisitorTrends(events),
    topPages: getTopPages(events),
    topReferrers: getTopReferrers(events)
  };
};

const calculateBounceRate = (events) => {
  const sessions = {};
  events.forEach(event => {
    if (!sessions[event.session_id]) {
      sessions[event.session_id] = [];
    }
    sessions[event.session_id].push(event);
  });

  const bouncedSessions = Object.values(sessions).filter(sessionEvents => 
    sessionEvents.length === 1 && sessionEvents[0].event_type === 'pageview'
  ).length;

  return (bouncedSessions / Object.keys(sessions).length) * 100;
};

const calculateAverageTimeOnSite = (events) => {
  // Group events by session
  const sessions = {};
  events.forEach(event => {
    if (!sessions[event.session_id]) {
      sessions[event.session_id] = [];
    }
    sessions[event.session_id].push(event);
  });

  // Calculate duration for each session
  let totalDuration = 0;
  let validSessions = 0;

  Object.values(sessions).forEach(sessionEvents => {
    if (sessionEvents.length < 2) return;
    
    const sessionDuration = new Date(sessionEvents[sessionEvents.length - 1].created_at) - 
                           new Date(sessionEvents[0].created_at);
    
    if (sessionDuration > 0) {
      totalDuration += sessionDuration;
      validSessions++;
    }
  });

  return validSessions > 0 ? Math.round(totalDuration / validSessions / 1000) : 0;
};

const generateVisitorTrends = (events) => {
  const trends = new Map();
  
  events.forEach(event => {
    const date = new Date(event.created_at).toLocaleDateString();
    if (!trends.has(date)) {
      trends.set(date, new Set());
    }
    trends.get(date).add(event.visitor_id);
  });

  return Array.from(trends.entries()).map(([date, visitors]) => ({
    date,
    visitors: visitors.size
  }));
};

const getTopPages = (events) => {
  const pageviews = events.filter(e => e.event_type === 'pageview');
  const pages = {};

  pageviews.forEach(event => {
    const path = event.page_path || new URL(event.url).pathname;
    if (!pages[path]) {
      pages[path] = { views: 0, visitors: new Set() };
    }
    pages[path].views++;
    pages[path].visitors.add(event.visitor_id);
  });

  return Object.entries(pages)
    .map(([path, data]) => ({
      path,
      views: data.views,
      visitors: data.visitors.size
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
};

const getTopReferrers = (events) => {
  const referrers = {};

  events.forEach(event => {
    if (!event.referrer || event.referrer === '') return;
    
    const referrerDomain = new URL(event.referrer).hostname;
    if (!referrers[referrerDomain]) {
      referrers[referrerDomain] = { visitors: new Set(), views: 0 };
    }
    referrers[referrerDomain].visitors.add(event.visitor_id);
    referrers[referrerDomain].views++;
  });

  return Object.entries(referrers)
    .map(([domain, data]) => ({
      domain,
      visitors: data.visitors.size,
      views: data.views
    }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10);
};

export default SiteDetail;