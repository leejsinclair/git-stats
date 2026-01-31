interface QualityMetricCardProps {
  title: string;
  icon: string;
  ratio: number;
  thresholds: {
    excellent: number;
    good: number;
  };
  labels: {
    excellent: string;
    good: string;
    poor: string;
  };
  helpText: string;
}

export function QualityMetricCard({
  title,
  icon,
  ratio,
  thresholds,
  labels,
  helpText,
}: QualityMetricCardProps) {
  const getStatus = () => {
    if (ratio >= thresholds.excellent) {
      return {
        color: 'text-green-600 dark:text-green-400',
        label: labels.excellent,
      };
    }
    if (ratio >= thresholds.good) {
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        label: labels.good,
      };
    }
    return {
      color: 'text-red-600 dark:text-red-400',
      label: labels.poor,
    };
  };

  const status = getStatus();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {icon} {title}
      </h2>
      <div className="text-center mb-4">
        <div className={`text-5xl font-bold ${status.color}`}>{ratio.toFixed(1)}%</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">of total commits</div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Status</div>
        <div className={`text-sm font-medium ${status.color}`}>{status.label}</div>
      </div>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">💡 {helpText}</div>
    </div>
  );
}
