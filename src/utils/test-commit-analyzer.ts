#!/usr/bin/env node

/**
 * Test script for the Commit Message Analyzer
 * This script demonstrates the commit message analyzer functionality
 */
import { CommitMessageAnalyzerService } from '../services/commit-message-analyzer.service';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: ts-node test-commit-analyzer.ts <repository-path> [limit]');
    console.log('Example: ts-node test-commit-analyzer.ts /path/to/repo 50');
    process.exit(1);
  }

  const repoPath = args[0];
  const limit = args[1] ? parseInt(args[1], 10) : 20;

  console.log(`\n📊 Analyzing commit messages in: ${repoPath}`);
  console.log(`Analyzing last ${limit} commits...\n`);

  try {
    const analyzer = new CommitMessageAnalyzerService(repoPath);
    const report = await analyzer.analyzeRepository(repoPath, { limit });

    console.log('='.repeat(80));
    console.log('📈 COMMIT MESSAGE QUALITY REPORT');
    console.log('='.repeat(80));
    console.log(`Total Commits: ${report.totalCommits}`);
    console.log(`Analyzed: ${report.analyzedCommits}`);
    console.log(`Overall Score: ${report.overallScore.toFixed(2)}/100`);
    console.log(`Pass Rate: ${report.passRate.toFixed(2)}%`);
    console.log();

    // Display rule violations summary
    if (report.rulesSummary.length > 0) {
      console.log('🚨 COMMON VIOLATIONS:');
      console.log('-'.repeat(80));
      report.rulesSummary.slice(0, 10).forEach((rule, index) => {
        console.log(`${index + 1}. ${rule.description}`);
        console.log(`   Rule: ${rule.rule} | Violations: ${rule.violations}`);
      });
      console.log();
    }

    // Display sample commits
    console.log('📝 SAMPLE COMMIT ANALYSIS:');
    console.log('-'.repeat(80));

    const sampleCommits = report.commits.slice(0, 5);
    sampleCommits.forEach((commit, index) => {
      const statusIcon = commit.passed ? '✅' : '❌';
      console.log(
        `\n${index + 1}. ${statusIcon} ${commit.subject.substring(0, 60)}${commit.subject.length > 60 ? '...' : ''}`
      );
      console.log(`   Hash: ${commit.hash.substring(0, 8)} | Author: ${commit.author}`);
      console.log(`   Score: ${commit.score}/100 | Issues: ${commit.issues.length}`);

      if (commit.issues.length > 0) {
        commit.issues.forEach(issue => {
          const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
          console.log(`   ${icon} ${issue.message}`);
        });
      }
    });

    console.log();
    console.log('='.repeat(80));

    // Score distribution
    const excellent = report.commits.filter(c => c.score >= 90).length;
    const good = report.commits.filter(c => c.score >= 70 && c.score < 90).length;
    const fair = report.commits.filter(c => c.score >= 50 && c.score < 70).length;
    const poor = report.commits.filter(c => c.score < 50).length;

    console.log('\n📊 SCORE DISTRIBUTION:');
    console.log('-'.repeat(80));
    console.log(
      `Excellent (90-100): ${excellent} commits (${((excellent / report.analyzedCommits) * 100).toFixed(1)}%)`
    );
    console.log(
      `Good (70-89):       ${good} commits (${((good / report.analyzedCommits) * 100).toFixed(1)}%)`
    );
    console.log(
      `Fair (50-69):       ${fair} commits (${((fair / report.analyzedCommits) * 100).toFixed(1)}%)`
    );
    console.log(
      `Poor (0-49):        ${poor} commits (${((poor / report.analyzedCommits) * 100).toFixed(1)}%)`
    );
    console.log();
  } catch (error) {
    console.error('Error analyzing repository:', error);
    process.exit(1);
  }
}

main();
