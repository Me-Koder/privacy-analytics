// tracking-script/src/script.js
const ANALYTICS_URL = 'YOUR_API_URL'; // Replace with your actual API URL

function initializeAnalytics(siteId) {
  // Create visitor ID if not exists
  let visitorId = localStorage.getItem('pa_visitor_id');
  if (!visitorId) {
    visitorId = generateId();
    localStorage.setItem('pa_visitor_id', visitorId);
  }

  // Create session ID
  const sessionId = generateId();

  // Track pageview
  trackEvent('pageview', {
    url: window.location.href,
    referrer: document.referrer,
    title: document.title
  });

  // Listen for history changes
  window.addEventListener('popstate', handleHistoryChange);
  
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    handleHistoryChange();
  };

  function handleHistoryChange() {
    trackEvent('pageview', {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title
    });
  }

  function trackEvent(eventType, properties = {}) {
    const event = {
      site_id: siteId,
      event_type: eventType,
      visitor_id: visitorId,
      session_id: sessionId,
      url: window.location.href,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      properties
    };

    // Send event to your analytics API
    fetch(`${ANALYTICS_URL}/api/collect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
      keepalive: true
    }).catch(console.error);
  }

  // Return public API
  return {
    trackEvent
  };
}

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Export to window object
window.PrivacyAnalytics = {
  init: initializeAnalytics
};