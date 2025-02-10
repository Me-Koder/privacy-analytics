// client/src/components/dashboard/TopReferrers.jsx
import { useState } from 'react';

function TopReferrers() {
  const [timeframe, setTimeframe] = useState('7d');

  const formatDomain = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Top Referrers</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border-gray-300 rounded-md text-sm"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
      <div className="px-4 py-3 sm:px-6">
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {topReferrers.map((referrer, index) => (
              <li key={referrer.url} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 text-gray-500">
                    {index + 1}.
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {formatDomain(referrer.url)}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {referrer.visitors.toLocaleString()} visitors
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {(referrer.conversionRate * 100).toFixed(1)}% conversion
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TopReferrers;