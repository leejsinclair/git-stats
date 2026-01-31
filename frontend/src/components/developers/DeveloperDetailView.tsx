import type { DeveloperStats } from '../../types';
import { DeveloperHeader } from './detail/DeveloperHeader';
import { CommitSizeChart } from './detail/CommitSizeChart';
import { CommitTypeChart } from './detail/CommitTypeChart';
import { WorkingHoursChart } from './detail/WorkingHoursChart';
import { QualityMetricCard } from './detail/QualityMetricCard';
import { OverviewStatsCard } from './detail/OverviewStatsCard';
import { MessageComplianceCard } from './detail/MessageComplianceCard';
import { ActivityChartsGrid } from './detail/ActivityChartsGrid';
import { RecentCommitsTable } from './detail/RecentCommitsTable';

interface DeveloperDetailViewProps {
  developer: DeveloperStats;
  onBack: () => void;
}

/**
 * Displays comprehensive statistics and charts for a single developer.
 * 
 * @param props - Component props
 * @param props.developer - Detailed developer statistics including commits, metrics, and activity patterns
 * @param props.onBack - Callback to navigate back to the developers list
 * @returns A detailed view with charts, tables, and metrics for a developer
 */
export function DeveloperDetailView({ developer, onBack }: DeveloperDetailViewProps) {
  const { name, email, metrics, messageCompliance, activity, recentCommits, commitSizeDistribution, commitTypeDistribution, workingHoursAnalysis } = developer;

  // Prepare day of week chart data
  const dayOfWeekData = Object.entries(activity.commitsByDayOfWeek).map(([day, count]) => ({
    day: day.substring(0, 3),
    commits: count,
  }));

  // Prepare hour distribution data
  const hourData = Object.entries(activity.commitsByHour)
    .map(([hour, count]) => ({
      hour: `${hour}:00`,
      commits: count,
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  // Prepare recent activity data
  const recentActivityData = [...activity.recentActivity]
    .reverse()
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      commits: item.commits,
      added: item.linesAdded,
      removed: item.linesRemoved,
    }));

  // Prepare repository contribution data
  const repoCommits = new Map<string, number>();
  for (const commit of recentCommits) {
    repoCommits.set(commit.repo, (repoCommits.get(commit.repo) || 0) + 1);
  }
  const repoData = Array.from(repoCommits.entries())
    .map(([repo, commits]) => ({ repo, commits }))
    .sort((a, b) => b.commits - a.commits);

  return (
    <div>
      {/* Header */}
      <DeveloperHeader
        name={name}
        email={email}
        totalCommits={metrics.totalCommits}
        onBack={onBack}
      />

      {/* Code Quality Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Commit Size Distribution */}
        <CommitSizeChart distribution={commitSizeDistribution} />

        {/* Commit Type Distribution */}
        <CommitTypeChart distribution={commitTypeDistribution} />

        {/* Working Hours */}
        <WorkingHoursChart 
          analysis={workingHoursAnalysis}
          totalCommits={recentCommits.length}
        />

        {/* Documentation Ratio */}
        <QualityMetricCard
          title="Documentation Ratio"
          icon="📚"
          ratio={metrics.documentationRatio}
          thresholds={{ excellent: 15, good: 10 }}
          labels={{
            excellent: 'Excellent - Well documented',
            good: 'Good - Could improve',
            poor: 'Low - Needs more documentation',
          }}
          helpText="Includes commits with docs:, README, or documentation keywords"
        />

        {/* Test Ratio */}
        <QualityMetricCard
          title="Test Coverage Ratio"
          icon="🧪"
          ratio={metrics.testRatio}
          thresholds={{ excellent: 20, good: 10 }}
          labels={{
            excellent: 'Excellent - Strong testing culture',
            good: 'Good - Room for improvement',
            poor: 'Low - Consider adding more tests',
          }}
          helpText="Includes commits with test:, spec, or testing keywords"
        />
      </div>

      {/* Repository and Activity Stats */}
      <OverviewStatsCard
        repositoryCount={metrics.repositories.length}
        linesModified={metrics.linesModified}
        activeDays={activity.activeDays}
        averageCommitsPerDay={activity.averageCommitsPerDay}
      />

      {/* Message Compliance Section */}
      {messageCompliance && (
        <MessageComplianceCard
          passPercentage={messageCompliance.passPercentage}
          averageScore={messageCompliance.averageScore}
          validMessages={messageCompliance.validMessages}
          totalMessages={messageCompliance.totalMessages}
          commonIssues={messageCompliance.commonIssues}
        />
      )}

      {/* Activity Charts */}
      <ActivityChartsGrid
        dayOfWeekData={dayOfWeekData}
        repoData={repoData}
        hourData={hourData}
        recentActivityData={recentActivityData}
      />

      {/* Recent Commits */}
      <RecentCommitsTable commits={recentCommits} maxDisplay={20} />
    </div>
  );
}
