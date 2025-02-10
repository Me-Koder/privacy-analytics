// tracking-script/src/tracker.js

class PrivacyAnalytics {
    constructor(siteId) {
      this.siteId = siteId;
      this.endpoint = 'https://api.youranalytics.com/collect';
      this.sessionId = this.generateSessionId();
    }
  
    generateSessionId() {
      return Math.random().toString(36).substring(2, 15);
    }
  
    async track(eventName, properties = {}) {
      try {
        const eventData = {
          siteId: this.siteId,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
          eventName,
          properties,
          url: window.location.href,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          // Avoid collecting personal data
          // Hash any potentially identifying information
        };
  
        await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
          keepalive: true
        });
      } catch (error) {
        console.error('Error tracking event:', error);
      }
    }
  }
  
  // Usage example
  window.PrivacyAnalytics = PrivacyAnalytics;