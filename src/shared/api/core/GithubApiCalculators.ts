import type {
  PullRequest,
  Issue,
  Contributor,
  Review,
  BusFactor,
  HealthMetric,
  HealthAlert,
} from './types';

export class GithubApiCalculators {
  /**
   * Calculate the average time to merge pull requests
   */
  static calculatePRMergeTime(mergedPRs: PullRequest[]): number {
    if (mergedPRs.length === 0) {
      return 0;
    }

    let totalHours = 0;
    let validPRs = 0;

    for (const pr of mergedPRs) {
      if (pr.created_at && pr.merged_at) {
        const created = new Date(pr.created_at);
        const merged = new Date(pr.merged_at);
        const diffHours =
          (merged.getTime() - created.getTime()) / (1000 * 60 * 60);
        totalHours += diffHours;
        validPRs++;
      }
    }

    return validPRs > 0 ? totalHours / validPRs : 0;
  }

  /**
   * Calculate the issue resolution rate as percentage
   */
  static calculateIssueResolutionRate(
    closedIssues: Issue[],
    openIssues: Issue[],
  ): number {
    const totalIssues = closedIssues.length + openIssues.length;
    return totalIssues > 0
      ? Math.round((closedIssues.length / totalIssues) * 100)
      : 0;
  }

  /**
   * Calculate time to first response (currently returns a mock value)
   * This would need actual issue comment data to implement properly
   */
  static calculateTimeToFirstResponse(
    _owner: string,
    _repo: string,
    _issues: Issue[],
  ): number {
    // TODO: Implement actual calculation based on issue comments
    // For now, return a mock value
    return 4.2;
  }

  /**
   * Calculate bus factor - how many contributors are critical
   */
  static calculateBusFactor(contributors: Contributor[]): BusFactor {
    const totalContributions = contributors.reduce(
      (sum, contributor) => sum + (contributor.contributions || 0),
      0,
    );
    const threshold = totalContributions * 0.8;
    let criticalContributors = 0;
    let runningTotal = 0;

    for (const contributor of contributors) {
      runningTotal += contributor.contributions || 0;
      criticalContributors++;
      if (runningTotal >= threshold) break;
    }

    let riskLevel: 'low' | 'medium' | 'high' = 'high';
    if (criticalContributors >= 5) riskLevel = 'low';
    else if (criticalContributors >= 3) riskLevel = 'medium';

    return {
      score: criticalContributors,
      criticalContributors,
      riskLevel,
    };
  }

  /**
   * Calculate overall health score based on metrics
   */
  static calculateOverallHealthScore(metrics: HealthMetric[]): number {
    const weights = {
      'Time to First Response': 0.25,
      'PR Merge Time': 0.25,
      'Issue Resolution Rate': 0.25,
      'Bus Factor': 0.25,
    };

    let score = 0;
    for (const metric of metrics) {
      const weight = weights[metric.name as keyof typeof weights] || 0;
      let metricScore = 0;

      switch (metric.name) {
        case 'Time to First Response':
          metricScore = Math.max(
            0,
            100 - (metric.value / metric.threshold) * 100,
          );
          break;
        case 'PR Merge Time':
          metricScore = Math.max(
            0,
            100 - (metric.value / metric.threshold) * 100,
          );
          break;
        case 'Issue Resolution Rate':
          metricScore = metric.value;
          break;
        case 'Bus Factor':
          metricScore = Math.min(100, (metric.value / metric.threshold) * 100);
          break;
      }

      score += metricScore * weight;
    }

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Generate health alerts based on metrics and bus factor
   */
  static generateHealthAlerts(
    metrics: HealthMetric[],
    busFactor: BusFactor,
  ): HealthAlert[] {
    const alerts: HealthAlert[] = [];

    for (const metric of metrics) {
      if (metric.status === 'warning') {
        alerts.push({
          id: `alert-${metric.name.replace(/\s+/g, '-').toLowerCase()}`,
          type: 'warning',
          message: `${metric.name} is ${metric.value > metric.threshold ? 'above' : 'below'} recommended threshold (${metric.value} vs ${metric.threshold})`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      } else if (metric.status === 'critical') {
        alerts.push({
          id: `alert-${metric.name.replace(/\s+/g, '-').toLowerCase()}`,
          type: 'critical',
          message: `${metric.name} requires immediate attention`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }
    }

    if (busFactor.riskLevel === 'high') {
      alerts.push({
        id: 'alert-bus-factor-critical',
        type: 'critical',
        message: `Bus factor is critically low (${busFactor.score}). Project sustainability is at risk.`,
        timestamp: new Date().toISOString(),
        resolved: false,
      });
    }

    return alerts;
  }

  /**
   * Calculate average response time for pull requests
   */
  static calculateAverageResponseTime(pullRequests: PullRequest[]): number {
    if (pullRequests.length === 0) return 0;

    let totalHours = 0;
    let validPRs = 0;

    for (const pr of pullRequests.slice(0, 50)) {
      // Note: first_response would need to be fetched from PR comments/events
      // This is a simplified implementation
      if (pr.created_at) {
        // Mock calculation - in real implementation, we'd need PR comments data
        const created = new Date(pr.created_at);
        const estimatedResponse = new Date(created.getTime() + 4 * 60 * 60 * 1000); // 4 hours later
        const diffHours = (estimatedResponse.getTime() - created.getTime()) / (1000 * 60 * 60);
        totalHours += diffHours;
        validPRs++;
      }
    }

    return validPRs > 0 ? totalHours / validPRs : 0;
  }

  /**
   * Calculate code review coverage percentage
   */
  static async calculateReviewCoverage(
    getPullRequestReviews: (owner: string, repo: string, pullNumber: number) => Promise<Review[]>,
    owner: string,
    repo: string,
    mergedPRs: PullRequest[],
  ): Promise<number> {
    if (mergedPRs.length === 0) return 0;

    let reviewedPRs = 0;

    for (const pr of mergedPRs.slice(0, 20)) {
      try {
        const reviews = await getPullRequestReviews(owner, repo, pr.number);
        if (reviews.length > 0) {
          reviewedPRs++;
        }
      } catch {
        console.warn(`Failed to get reviews for PR ${pr.number}`);
      }
    }

    return Math.round((reviewedPRs / mergedPRs.length) * 100);
  }
}
