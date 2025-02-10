const supabase = require('../config/supabase');

class AnalyticsController {
  async collectEvent(req, res) {
    try {
      const eventData = req.body;
      
      // Anonymize IP address
      const ip = req.ip.replace(/\.\d+$/, '.0');
      
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          ip_hash: crypto.createHash('sha256').update(ip).digest('hex'),
          created_at: new Date()
        }]);

      if (error) throw error;
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error collecting event:', error);
      res.status(500).json({ error: 'Failed to collect event' });
    }
  }
}

module.exports = new AnalyticsController();