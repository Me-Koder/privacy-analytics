// server/src/services/analyticsService.js
const { supabase } = require('../config/supabase');

class AnalyticsService {
  async aggregateMetrics(siteId, dateRange) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('site_id', siteId)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end);

      if (error) throw error;

      const metrics = {
        visitors: this.calculateUniqueVisitors(data),
        pageviews: this.calculatePageviews(data),
        avgTimeOnSite: this.calculateAvgTimeOnSite(data),
        bounceRate: this.calculateBounceRate(data),
        topPages: this.getTopPages(data),
        topReferrers: this.getTopReferrers(data)
      };

      // Calculate period-over-period changes
      const previousPeriodMetrics = await this.getPreviousPeriodMetrics(siteId, dateRange);
      metrics.changes = this.calculateMetricChanges(metrics, previousPeriodMetrics);

      return metrics;
    } catch (error) {
      console.error('Error aggregating metrics:', error);
      throw error;
    }
  }

  calculateUniqueVisitors(events) {
    return new Set(events.map(e => e.session_id)).size;
  }

  calculatePageviews(events) {
    return events.filter(e => e.event_name === 'pageview').length;
  }

  calculateAvgTimeOnSite(events) {
    const sessions = this.groupEventsBySession(events);
    let totalDuration = 0;
    let validSessions = 0;

    for (const sessionEvents of Object.values(sessions)) {
      if (sessionEvents.length < 2) continue;
      
      const sessionDuration = this.calculateSessionDuration(sessionEvents);
      if (sessionDuration > 0) {
        totalDuration += sessionDuration;
        validSessions++;
      }
    }

    return validSessions > 0 ? Math.round(totalDuration / validSessions) : 0;
  }

  calculateBounceRate(events) {
    const sessions = this.groupEventsBySession(events);
    let bouncedSessions = 0;
    const totalSessions = Object.keys(sessions).length;

    for (const sessionEvents of Object.values(sessions)) {
      if (sessionEvents.length === 1 && sessionEvents[0].event_name === 'pageview') {
        bouncedSessions++;
      }
    }

    return totalSessions > 0 ? bouncedSessions / totalSessions : 0;
  }

  getTopPages(events, limit = 10) {
    const pageviews = events.filter(e => e.event_name === 'pageview');
    const pageStats = {};

    for (const event of pageviews) {
      const path = new URL(event.properties.url).pathname;
      if (!pageStats[path]) {
        pageStats[path] = {
          pageviews: 0,
          bounces: 0,
          totalSessions: 0
        };
      }

      pageStats[path].pageviews++;
      const isBouncedSession = this.isBouncedSession(events, event.session_id);
      if (isBouncedSession) pageStats[path].bounces++;
      pageStats[path].totalSessions++;
    }

    return Object.entries(pageStats)
      .map(([path, stats]) => ({
        path,
        pageviews: stats.pageviews,
        bounceRate: stats.bounces / stats.totalSessions
      }))
      .sort((a, b) => b.pageviews - a.pageviews)
      .slice(0, limit);
  }

  getTopReferrers(events, limit = 10) {
    const referrerStats = {};

    for (const event of events) {
      if (!event.properties.referrer) continue;
      
      const referrer = event.properties.referrer;
      if (!referrerStats[referrer]) {
        referrerStats[referrer] = {
          visitors: new Set(),
          conversions: 0
        };
      }

      referrerStats[referrer].visitors.add(event.session_id);
      if (event.event_name === 'conversion') {
        referrerStats[referrer].conversions++;
      }
    }

    return Object.entries(referrerStats)
      .map(([url, stats]) => ({
        url,
        visitors: stats.visitors.size,
        conversionRate: stats.conversions / stats.visitors.size
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, limit);
  }

  // Helper methods
  groupEventsBySession(events) {
    return events.reduce((acc, event) => {
      if (!acc[event.session_id]) {
        acc[event.session_id] = [];
      }
      acc[event.session_id].push(event);
      return acc;
    }, {});
  }

  calculateSessionDuration(sessionEvents) {
    const sortedEvents = sessionEvents.sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    
    return (new Date(sortedEvents[sortedEvents.length - 1].created_at) - 
            new Date(sortedEvents[0].created_at)) / 1000;
  }

  isBouncedSession(events, sessionId) {
    return events.filter(e => e.session_id === sessionId).length === 1;
  }

  async getPreviousPeriodMetrics(siteId, dateRange) {
    const periodDuration = new Date(dateRange.end) - new Date(dateRange.start);
    const previousPeriodStart = new Date(dateRange.start - periodDuration);
    const previousPeriodEnd = new Date(dateRange.start);

    return this.aggregateMetrics(siteId, {
      start: previousPeriodStart.toISOString(),
      end: previousPeriodEnd.toISOString()
    });
  }

  calculateMetricChanges(currentMetrics, previousMetrics) {
    const calculateChange = (current, previous) => {
      if (!previous) return 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      visitors: calculateChange(currentMetrics.visitors, previousMetrics.visitors),
      pageviews: calculateChange(currentMetrics.pageviews, previousMetrics.pageviews),
      avgTimeOnSite: calculateChange(currentMetrics.avgTimeOnSite, previousMetrics.avgTimeOnSite),
      bounceRate: calculateChange(currentMetrics.bounceRate, previousMetrics.bounceRate)
    };
  }
}

module.exports = new AnalyticsService();