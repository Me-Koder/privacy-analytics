// server/src/controllers/siteController.js
const { supabase } = require('../config/supabase');

class SiteController {
  async createSite(req, res) {
    try {
      const { name, domain } = req.body;
      const userId = req.user.id;

      const { data, error } = await supabase
        .from('sites')
        .insert([
          { name, domain, user_id: userId }
        ])
        .select('*')
        .single();

      if (error) throw error;

      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSites(req, res) {
    try {
      const userId = req.user.id;

      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getSiteStats(req, res) {
    try {
      const { siteId } = req.params;
      const { timeframe = '7d' } = req.query;

      const startDate = getStartDate(timeframe);

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('site_id', siteId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const stats = calculateStats(data);
      res.json(stats);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

function getStartDate(timeframe) {
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
}

function calculateStats(events) {
  // Calculate various metrics
  const pageviews = events.filter(e => e.event_name === 'pageview').length;
  const uniqueVisitors = new Set(events.map(e => e.session_id)).size;
  const topPages = getTopPages(events);
  const topReferrers = getTopReferrers(events);

  return {
    pageviews,
    uniqueVisitors,
    topPages,
    topReferrers
  };
}

module.exports = new SiteController();