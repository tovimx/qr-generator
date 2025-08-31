/**
 * Enhanced Test Reporting and Metrics Collection
 * Generates comprehensive test reports with metrics, trends, and insights
 */

import { Page } from '@playwright/test';
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface TestMetrics {
  testName: string;
  suite: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  startTime: Date;
  endTime: Date;
  browser: string;
  viewport?: { width: number; height: number };
  screenshots?: string[];
  errors?: string[];
  performance?: PerformanceMetrics;
  coverage?: CoverageMetrics;
  accessibility?: AccessibilityMetrics;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  qrGenerationTime?: number;
  memoryUsage?: any;
  networkRequests: number;
  largestContentfulPaint?: number;
  firstContentfulPaint?: number;
  cumulativeLayoutShift?: number;
}

export interface CoverageMetrics {
  linesTotal: number;
  linesCovered: number;
  functionsTotal: number;
  functionsCovered: number;
  branchesTotal: number;
  branchesCovered: number;
  statements: number;
}

export interface AccessibilityMetrics {
  violations: number;
  violationTypes: string[];
  wcagLevel: 'A' | 'AA' | 'AAA';
  score: number;
}

export interface TestSuiteResults {
  suiteName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  coverage: number;
  performanceScore: number;
  accessibilityScore: number;
  tests: TestMetrics[];
}

export interface TestReportSummary {
  timestamp: Date;
  environment: string;
  commit: string;
  branch: string;
  totalTests: number;
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  totalDuration: number;
  overallCoverage: number;
  performanceScore: number;
  accessibilityScore: number;
  suites: TestSuiteResults[];
  trends: TestTrends;
}

export interface TestTrends {
  passRate: number[];
  performanceScore: number[];
  coverageScore: number[];
  executionTime: number[];
  lastRuns: Date[];
}

/**
 * Enhanced test reporter with metrics collection and analysis
 */
export class TestReporter {
  private reportDir: string;
  private metricsFile: string;
  private trendsFile: string;
  private testMetrics: TestMetrics[] = [];

  constructor(reportDir: string = 'test-reports') {
    this.reportDir = reportDir;
    this.metricsFile = join(reportDir, 'test-metrics.json');
    this.trendsFile = join(reportDir, 'test-trends.json');
    
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }
  }

  /**
   * Start collecting metrics for a test
   */
  startTest(testName: string, suite: string, browser: string): TestMetrics {
    const metrics: TestMetrics = {
      testName,
      suite,
      status: 'passed',
      duration: 0,
      startTime: new Date(),
      endTime: new Date(),
      browser,
      screenshots: [],
      errors: [],
      performance: {
        pageLoadTime: 0,
        networkRequests: 0
      }
    };

    this.testMetrics.push(metrics);
    return metrics;
  }

  /**
   * End test and finalize metrics
   */
  endTest(metrics: TestMetrics, status: TestMetrics['status'], errors: string[] = []): void {
    metrics.endTime = new Date();
    metrics.duration = metrics.endTime.getTime() - metrics.startTime.getTime();
    metrics.status = status;
    metrics.errors = errors;
  }

  /**
   * Collect performance metrics from a page
   */
  async collectPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Would need additional measurement
        cumulativeLayoutShift: 0,  // Would need additional measurement
        memoryUsage: (performance as any).memory || null
      };
    });

    // Count network requests
    let networkRequests = 0;
    page.on('request', () => networkRequests++);
    
    return {
      ...performanceMetrics,
      networkRequests,
      qrGenerationTime: await this.measureQRGeneration(page)
    };
  }

  /**
   * Measure QR code generation performance
   */
  private async measureQRGeneration(page: Page): Promise<number | undefined> {
    try {
      const startTime = Date.now();
      await page.locator('canvas').waitFor({ state: 'visible', timeout: 5000 });
      return Date.now() - startTime;
    } catch {
      return undefined;
    }
  }

  /**
   * Collect accessibility metrics
   */
  async collectAccessibilityMetrics(page: Page): Promise<AccessibilityMetrics> {
    const violations = await page.evaluate(() => {
      // Basic accessibility checks
      const issues: string[] = [];
      
      // Check for h1 elements
      if (document.querySelectorAll('h1').length === 0) {
        issues.push('missing-h1');
      }
      
      // Check for alt text on images
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        issues.push('missing-alt-text');
      }
      
      // Check for form labels
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      const unlabeledInputs = Array.from(inputs).filter(input => {
        const labels = document.querySelectorAll(`label[for="${input.id}"]`);
        return input.id === '' || labels.length === 0;
      });
      
      if (unlabeledInputs.length > 0) {
        issues.push('missing-form-labels');
      }
      
      // Check for keyboard navigation
      const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusableElements.length === 0) {
        issues.push('no-keyboard-navigation');
      }
      
      return issues;
    });

    const score = Math.max(0, 100 - (violations.length * 25));
    
    return {
      violations: violations.length,
      violationTypes: violations,
      wcagLevel: score >= 90 ? 'AA' : score >= 70 ? 'A' : 'A',
      score
    };
  }

  /**
   * Generate comprehensive test report
   */
  generateReport(): TestReportSummary {
    const suiteGroups = this.groupTestsBySuite();
    const suites: TestSuiteResults[] = [];
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalDuration = 0;
    
    for (const [suiteName, tests] of Object.entries(suiteGroups)) {
      const passed = tests.filter(t => t.status === 'passed').length;
      const failed = tests.filter(t => t.status === 'failed').length;
      const skipped = tests.filter(t => t.status === 'skipped').length;
      const suiteDuration = tests.reduce((sum, t) => sum + t.duration, 0);
      
      const performanceScore = this.calculatePerformanceScore(tests);
      const accessibilityScore = this.calculateAccessibilityScore(tests);
      
      suites.push({
        suiteName,
        totalTests: tests.length,
        passedTests: passed,
        failedTests: failed,
        skippedTests: skipped,
        duration: suiteDuration,
        coverage: 0, // Would need actual coverage data
        performanceScore,
        accessibilityScore,
        tests
      });
      
      totalTests += tests.length;
      totalPassed += passed;
      totalFailed += failed;
      totalSkipped += skipped;
      totalDuration += suiteDuration;
    }
    
    const overallPerformanceScore = suites.length > 0 
      ? suites.reduce((sum, s) => sum + s.performanceScore, 0) / suites.length 
      : 0;
    
    const overallAccessibilityScore = suites.length > 0
      ? suites.reduce((sum, s) => sum + s.accessibilityScore, 0) / suites.length
      : 0;

    const summary: TestReportSummary = {
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'test',
      commit: process.env['GITHUB_SHA'] || 'unknown',
      branch: process.env['GITHUB_REF_NAME'] || 'unknown',
      totalTests,
      totalPassed,
      totalFailed,
      totalSkipped,
      totalDuration,
      overallCoverage: 0, // Would need actual coverage
      performanceScore: overallPerformanceScore,
      accessibilityScore: overallAccessibilityScore,
      suites,
      trends: this.calculateTrends()
    };

    this.saveReport(summary);
    this.generateHTMLReport(summary);
    this.generateMarkdownReport(summary);
    
    return summary;
  }

  /**
   * Group tests by suite name
   */
  private groupTestsBySuite(): Record<string, TestMetrics[]> {
    return this.testMetrics.reduce((groups, test) => {
      if (!groups[test.suite]) {
        groups[test.suite] = [];
      }
      groups[test.suite].push(test);
      return groups;
    }, {} as Record<string, TestMetrics[]>);
  }

  /**
   * Calculate performance score for a suite
   */
  private calculatePerformanceScore(tests: TestMetrics[]): number {
    const performanceTests = tests.filter(t => t.performance);
    if (performanceTests.length === 0) return 100;
    
    const avgPageLoadTime = performanceTests.reduce((sum, t) => sum + (t.performance?.pageLoadTime || 0), 0) / performanceTests.length;
    const avgQRGeneration = performanceTests.reduce((sum, t) => sum + (t.performance?.qrGenerationTime || 0), 0) / performanceTests.length;
    
    // Score based on performance thresholds
    let score = 100;
    if (avgPageLoadTime > 3000) score -= 20;
    if (avgPageLoadTime > 5000) score -= 20;
    if (avgQRGeneration > 2000) score -= 10;
    
    return Math.max(0, score);
  }

  /**
   * Calculate accessibility score for a suite
   */
  private calculateAccessibilityScore(tests: TestMetrics[]): number {
    const accessibilityTests = tests.filter(t => t.accessibility);
    if (accessibilityTests.length === 0) return 100;
    
    return accessibilityTests.reduce((sum, t) => sum + (t.accessibility?.score || 0), 0) / accessibilityTests.length;
  }

  /**
   * Calculate trends from historical data
   */
  private calculateTrends(): TestTrends {
    const historicalData = this.loadHistoricalData();
    
    return {
      passRate: historicalData.map(d => (d.totalPassed / d.totalTests) * 100),
      performanceScore: historicalData.map(d => d.performanceScore),
      coverageScore: historicalData.map(d => d.overallCoverage),
      executionTime: historicalData.map(d => d.totalDuration),
      lastRuns: historicalData.map(d => new Date(d.timestamp))
    };
  }

  /**
   * Load historical test data for trend analysis
   */
  private loadHistoricalData(): TestReportSummary[] {
    try {
      if (existsSync(this.trendsFile)) {
        const data = readFileSync(this.trendsFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Could not load historical data:', error);
    }
    return [];
  }

  /**
   * Save report data
   */
  private saveReport(summary: TestReportSummary): void {
    // Save current report
    writeFileSync(this.metricsFile, JSON.stringify(summary, null, 2));
    
    // Update trends data
    const historicalData = this.loadHistoricalData();
    historicalData.push(summary);
    
    // Keep only last 30 runs
    const recentData = historicalData.slice(-30);
    writeFileSync(this.trendsFile, JSON.stringify(recentData, null, 2));
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(summary: TestReportSummary): void {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Generator E2E Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
        .metric-label { color: #6b7280; margin-top: 5px; }
        .suite { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .suite-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .suite-title { font-size: 1.25em; font-weight: bold; }
        .status-passed { color: #10b981; }
        .status-failed { color: #ef4444; }
        .status-skipped { color: #f59e0b; }
        .test-list { margin-top: 15px; }
        .test-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .test-item:last-child { border-bottom: none; }
        .progress-bar { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .progress-pass { background: #10b981; }
        .progress-fail { background: #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 QR Generator E2E Test Report</h1>
            <p><strong>Generated:</strong> ${summary.timestamp.toLocaleString()}</p>
            <p><strong>Branch:</strong> ${summary.branch} | <strong>Commit:</strong> ${summary.commit.substring(0, 8)}</p>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value ${summary.totalFailed > 0 ? 'status-failed' : 'status-passed'}">${summary.totalPassed}/${summary.totalTests}</div>
                <div class="metric-label">Tests Passed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round((summary.totalPassed / summary.totalTests) * 100)}%</div>
                <div class="metric-label">Pass Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(summary.performanceScore)}</div>
                <div class="metric-label">Performance Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(summary.accessibilityScore)}</div>
                <div class="metric-label">Accessibility Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(summary.totalDuration / 1000)}s</div>
                <div class="metric-label">Total Duration</div>
            </div>
        </div>

        ${summary.suites.map(suite => `
            <div class="suite">
                <div class="suite-header">
                    <div class="suite-title">${suite.suiteName}</div>
                    <div>
                        <span class="status-passed">${suite.passedTests} passed</span>
                        ${suite.failedTests > 0 ? `<span class="status-failed">${suite.failedTests} failed</span>` : ''}
                        ${suite.skippedTests > 0 ? `<span class="status-skipped">${suite.skippedTests} skipped</span>` : ''}
                    </div>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill progress-pass" style="width: ${(suite.passedTests / suite.totalTests) * 100}%"></div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 15px;">
                    <div>
                        <strong>Performance:</strong> ${Math.round(suite.performanceScore)}/100
                    </div>
                    <div>
                        <strong>Accessibility:</strong> ${Math.round(suite.accessibilityScore)}/100
                    </div>
                    <div>
                        <strong>Duration:</strong> ${Math.round(suite.duration / 1000)}s
                    </div>
                </div>

                <div class="test-list">
                    ${suite.tests.map(test => `
                        <div class="test-item">
                            <div>
                                <span class="status-${test.status}">${test.testName}</span>
                                <small style="color: #6b7280; margin-left: 10px;">${test.browser}</small>
                            </div>
                            <div>${Math.round(test.duration)}ms</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    writeFileSync(join(this.reportDir, 'test-report.html'), html);
  }

  /**
   * Generate markdown report for GitHub
   */
  private generateMarkdownReport(summary: TestReportSummary): void {
    const passRate = Math.round((summary.totalPassed / summary.totalTests) * 100);
    const statusEmoji = summary.totalFailed === 0 ? '✅' : '❌';
    
    const markdown = `
# ${statusEmoji} QR Generator E2E Test Report

**Generated:** ${summary.timestamp.toLocaleString()}  
**Branch:** ${summary.branch} | **Commit:** ${summary.commit.substring(0, 8)}

## 📊 Test Summary

| Metric | Value |
|--------|-------|
| Tests Passed | ${summary.totalPassed}/${summary.totalTests} (${passRate}%) |
| Performance Score | ${Math.round(summary.performanceScore)}/100 |
| Accessibility Score | ${Math.round(summary.accessibilityScore)}/100 |
| Total Duration | ${Math.round(summary.totalDuration / 1000)}s |

## 📋 Test Suites

${summary.suites.map(suite => {
  const suitePassRate = Math.round((suite.passedTests / suite.totalTests) * 100);
  const suiteStatus = suite.failedTests === 0 ? '✅' : '❌';
  
  return `
### ${suiteStatus} ${suite.suiteName}

- **Tests:** ${suite.passedTests}/${suite.totalTests} (${suitePassRate}%)
- **Performance:** ${Math.round(suite.performanceScore)}/100
- **Accessibility:** ${Math.round(suite.accessibilityScore)}/100
- **Duration:** ${Math.round(suite.duration / 1000)}s

${suite.tests.filter(t => t.status === 'failed').length > 0 ? 
`**Failed Tests:**
${suite.tests.filter(t => t.status === 'failed').map(t => `- ❌ ${t.testName} (${t.browser})`).join('\n')}` : ''}
`;
}).join('')}

## 📈 Coverage Areas

- 📝 User Authentication & Authorization
- 🎨 QR Code Creation & Customization  
- 🔗 Link Management (Add, Edit, Delete)
- 📊 Analytics & Tracking
- 🌐 Multi-Domain Support
- ⚡ Performance Benchmarks
- 🛡️ Error Handling & Recovery
- 🔌 API Integration & Validation
- 📱 Responsive Design & Mobile
- 🚀 Network Failure Scenarios
- 🛡️ Security & XSS Protection
- 🎨 Visual Regression & UI Consistency

---
*Report generated by QR Generator E2E Test Suite*
`;

    writeFileSync(join(this.reportDir, 'test-report.md'), markdown.trim());
  }
}

/**
 * Global test reporter instance
 */
export const globalTestReporter = new TestReporter();

/**
 * Helper function to use in Playwright test files
 */
export function useTestReporter() {
  return globalTestReporter;
}