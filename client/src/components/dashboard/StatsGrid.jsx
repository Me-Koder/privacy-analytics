// client/src/components/dashboard/StatsGrid.jsx
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

function StatsCard({ title, value, change, changeType }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
        {change && (
          <div className={`mt-2 flex items-center text-sm ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            <span className="font-medium">{change}%</span>
            <span className="ml-2">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatsGrid({ stats }) {
  const {
    visitors,
    pageviews,
    avgDuration,
    bounceRate,
    visitorChange,
    pageviewChange,
    durationChange,
    bounceRateChange
  } = stats;

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatBounceRate = (rate) => {
    return `${(rate * 100).toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Visitors"
        value={visitors.toLocaleString()}
        change={visitorChange}
        changeType={visitorChange >= 0 ? 'increase' : 'decrease'}
      />
      <StatsCard
        title="Page Views"
        value={pageviews.toLocaleString()}
        change={pageviewChange}
        changeType={pageviewChange >= 0 ? 'increase' : 'decrease'}
      />
      <StatsCard
        title="Avg. Session Duration"
        value={formatDuration(avgDuration)}
        change={durationChange}
        changeType={durationChange >= 0 ? 'increase' : 'decrease'}
      />
      <StatsCard
        title="Bounce Rate"
        value={formatBounceRate(bounceRate)}
        change={bounceRateChange}
        changeType={bounceRateChange <= 0 ? 'increase' : 'decrease'}
      />
    </div>
  );
}

export default StatsGrid;