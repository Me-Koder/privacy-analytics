import { useState } from 'react';

function TopPages({ data = [] }) {
  const [timeframe, setTimeframe] = useState('7d');

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Top Pages</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border-gray-300 rounded-md text-sm p-2"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
      <div className="px-4 py-3 sm:px-6">
        <div className="flow-root">
          <ul className="-my-5 divide-y divide-gray-200">
            {data.map((page, index) => (
              <li key={page.path || index} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 text-gray-500">
                    {index + 1}.
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {page.path}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {page.pageviews?.toLocaleString() || 0} views
                    </p>
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

export default TopPages;