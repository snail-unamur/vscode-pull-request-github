import React, { useMemo } from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Metric } from '../../src/improvedPullRequest/improvedPullRequestMetrics';
import { hexToRgba } from 'hex-and-rgba/esm';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  metrics: Metric[];
  isDarkTheme: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({ metrics, isDarkTheme }) => {
  const themeColor = isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDarkTheme ? '#eeeeee' : '#000000';
  const fontFamily = getComputedStyle(document.body).getPropertyValue('--vscode-font-family').trim();

  const editorColor = useMemo(() => {
    const raw = getComputedStyle(document.body).getPropertyValue('--vscode-textLink-foreground').trim();
    return raw || (isDarkTheme ? '#9cdcfe' : '#007acc');
  }, [isDarkTheme]);

  const rgbaColor = useMemo(() => hexToRgba(editorColor), [editorColor]);

  const data = useMemo(() => {
    const labels = metrics.map(m => m.name);

    let borderColor = isDarkTheme ? 'rgba(156, 220, 254, 1)' : 'rgba(0, 122, 204, 1)';
    let backgroundColor = isDarkTheme ? 'rgba(156, 220, 254, 0.3)' : 'rgba(0, 122, 204, 0.3)';

    if (rgbaColor) {
      const [r, g, b, a] = rgbaColor;
      borderColor = `rgba(${r}, ${g}, ${b}, ${a})`;
      backgroundColor = `rgba(${r}, ${g}, ${b}, ${a * 0.3})`;
    }

    const datasets = [
      {
        data: metrics.map(m => m.value),
        borderColor,
        backgroundColor,
        borderWidth: 1,
      },
    ];

    return { labels, datasets };
  }, [metrics, rgbaColor, isDarkTheme]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const name = context.label;
            const metric = metrics.find(m => m.name === name)

            let label = '';
            if (context.parsed.r !== null) {
              label += `${context.parsed.r}: ${metric?.fullName} `;
            }

            return label;
          }
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: 4,
        ticks: {
          stepSize: 1,
          display: false,
        },
        angleLines: {
          color: themeColor,
        },
        grid: {
          color: themeColor,
          circular: true,
        },
        pointLabels: {
          color: textColor,
          font: {
            family: fontFamily,
            size: 13,
          },
        },
      },
    },
  }), [themeColor, textColor]);

  return (
    <div style={{ width: '100%', height: 200 }}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default RadarChart;
