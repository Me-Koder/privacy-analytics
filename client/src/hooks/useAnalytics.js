// client/src/hooks/useAnalytics.js
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export function useAnalytics(siteId, timeframe = '7d') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [siteId, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('site_id', siteId)
        .gte('created_at', getStartDate(timeframe))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setData(processAnalyticsData(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchAnalytics };
}

const getStartDate = (timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case '24h':
      return new Date(now - 24 * 60 * 60 * 1000).toISOString();
    case '7d':
      return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  }
};

const processAnalyticsData = (events) => {
  return {
    visitors: new Set(events.map(e => e.visitor_id)).size,
    pageviews: events.filter(e => e.event_type === 'pageview').length,
    avgDuration: calculateAverageDuration(events),
    bounceRate: calculateBounceRate(events),
    topPages: getTopPages(events),
    topReferrers: getTopReferrers(events)
  };
};