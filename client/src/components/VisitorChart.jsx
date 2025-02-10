// client/src/components/VisitorChart.jsx
import { Line } from 'react-chartjs-2';

function VisitorChart({ data }) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Visitors',
        data: data.map(d => d.visitors),
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Visitors</h3>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}