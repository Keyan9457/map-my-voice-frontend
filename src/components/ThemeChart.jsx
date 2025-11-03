import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// We must register the components we're using
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to create the gradients
function createGradient(ctx, area, color1, color2) {
  if (!area) return color1; // Fallback for initial render
  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}

// 1. Accept 'setFilters' as a prop
const ThemeChart = ({ chartData, setFilters }) => {
  
  // Show a message if there's no data
  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888' }}>
        Submit a review to see chart data
      </div>
    );
  }

  // Chart.js data object
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Good',
        data: chartData.datasets[0].data,
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          return createGradient(ctx, chartArea, '#28a745', '#74c476');
        },
        borderRadius: 8,
      },
      {
        label: 'Bad',
        data: chartData.datasets[1].data,
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          return createGradient(ctx, chartArea, '#d7301f', '#fe9929');
        },
        borderRadius: 8,
      },
    ],
  };

  // 2. Add the onClick handler to the options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // This function runs when the user clicks on the chart
    onClick: (event, elements) => {
      if (elements.length > 0) {
        // Get the index of the bar that was clicked
        const elementIndex = elements[0].index;
        // Get the label for that bar (e.g., "Healthcare")
        const theme = data.labels[elementIndex];
        // Set the filter in the main App.jsx component
        setFilters({ theme: theme });
      }
    },
    plugins: {
      legend: {
        display: false, // Hide the legend
      },
      title: {
        display: true,
        text: 'Ratings by Theme (Click to Filter)', // Update title
        color: '#e0e0e0',
        font: {
          size: 16,
        },
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#555',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#e0e0e0',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#e0e0e0',
        },
      },
    },
  };

  return <Bar options={options} data={data} />;
};

export default ThemeChart;

