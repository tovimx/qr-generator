/**
 * Enhanced Test Reporter
 * Provides detailed test reporting and metrics collection
 */

import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult, TestError } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface TestMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  flakyTests: number;
  duration: number;
  browserBreakdown: Record<string, { passed: number; failed: number; skipped: number }>;
  slowestTests: Array<{ name: string; duration: number; browser: string }>;
  errorBreakdown: Record<string, number>;
  coverageStats?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}

interface TestSuiteMetrics {
  suite: string;
  tests: number;
  passed: number;
  failed: number;
  duration: number;
  coverage?: number;
}

export class EnhancedTestReporter implements Reporter {
  private startTime = 0;
  private metrics: TestMetrics = {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    skippedTests: 0,
    flakyTests: 0,
    duration: 0,
    browserBreakdown: {},
    slowestTests: [],
    errorBreakdown: {}
  };
  private suiteMetrics: TestSuiteMetrics[] = [];
  private config: FullConfig | undefined;

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    this.startTime = Date.now();
    console.log(`🚀 Starting E2E tests with ${config.projects.length} project(s)`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log(`📁 Output directory: ${(config as any).outputDir || 'playwright-report'}`);
    
    // Count total tests
    this.countTests(suite);
    console.log(`📊 Total tests to run: ${this.metrics.totalTests}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const projectName = test.parent.project()?.name || 'unknown';
    const suiteName = test.parent.title || 'unknown';
    
    // Initialize browser breakdown if needed
    if (!this.metrics.browserBreakdown[projectName]) {
      this.metrics.browserBreakdown[projectName] = { passed: 0, failed: 0, skipped: 0 };
    }

    // Update metrics based on test result
    switch (result.status) {
      case 'passed':
        this.metrics.passedTests++;
        this.metrics.browserBreakdown[projectName].passed++;
        break;
      case 'failed':
        this.metrics.failedTests++;
        this.metrics.browserBreakdown[projectName].failed++;
        this.processTestError(result.error, test.title);
        break;
      case 'timedOut':
        this.metrics.failedTests++;
        this.metrics.browserBreakdown[projectName].failed++;
        this.metrics.errorBreakdown['timeout'] = (this.metrics.errorBreakdown['timeout'] || 0) + 1;
        break;
      case 'skipped':
        this.metrics.skippedTests++;
        this.metrics.browserBreakdown[projectName].skipped++;
        break;
    }

    // Track flaky tests (retry > 0 but passed)
    if (result.retry > 0 && result.status === 'passed') {
      this.metrics.flakyTests++;
    }

    // Track slowest tests
    if (result.duration > 5000) { // Tests longer than 5 seconds
      this.metrics.slowestTests.push({
        name: `${suiteName} > ${test.title}`,
        duration: result.duration,
        browser: projectName
      });
    }

    // Update suite metrics
    this.updateSuiteMetrics(suiteName, result);
  }

  async onEnd(result: FullResult) {
    this.metrics.duration = Date.now() - this.startTime;
    
    // Sort slowest tests
    this.metrics.slowestTests.sort((a, b) => b.duration - a.duration);
    this.metrics.slowestTests = this.metrics.slowestTests.slice(0, 10); // Top 10

    // Generate reports
    await this.generateConsoleReport();
    await this.generateJSONReport();
    await this.generateHTMLReport();
    await this.generateMarkdownReport();
    
    // Performance analysis
    await this.analyzePerformance();
    
    // Success/failure summary
    const successRate = (this.metrics.passedTests / this.metrics.totalTests) * 100;
    console.log(`\n🎯 Overall Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate < 90) {
      console.log('⚠️  Success rate below 90% - consider investigating test stability');
    }
  }

  private countTests(suite: Suite) {
    for (const child of suite.suites) {
      this.countTests(child);
    }
    this.metrics.totalTests += suite.tests.length;
  }

  private processTestError(error: TestError | undefined, testTitle: string) {
    if (!error) return;
    
    const errorMessage = error.message || '';
    
    // Categorize common error types
    if (errorMessage.includes('Timeout')) {
      this.metrics.errorBreakdown['timeout'] = (this.metrics.errorBreakdown['timeout'] || 0) + 1;
    } else if (errorMessage.includes('locator')) {
      this.metrics.errorBreakdown['locator_not_found'] = (this.metrics.errorBreakdown['locator_not_found'] || 0) + 1;
    } else if (errorMessage.includes('expect')) {
      this.metrics.errorBreakdown['assertion_failed'] = (this.metrics.errorBreakdown['assertion_failed'] || 0) + 1;
    } else if (errorMessage.includes('Navigation')) {
      this.metrics.errorBreakdown['navigation_failed'] = (this.metrics.errorBreakdown['navigation_failed'] || 0) + 1;
    } else {
      this.metrics.errorBreakdown['other'] = (this.metrics.errorBreakdown['other'] || 0) + 1;
    }
  }

  private updateSuiteMetrics(suiteName: string, result: TestResult) {
    let suiteMetric = this.suiteMetrics.find(s => s.suite === suiteName);
    if (!suiteMetric) {
      suiteMetric = {
        suite: suiteName,
        tests: 0,
        passed: 0,
        failed: 0,
        duration: 0
      };
      this.suiteMetrics.push(suiteMetric);
    }

    suiteMetric.tests++;
    suiteMetric.duration += result.duration;
    
    if (result.status === 'passed') {
      suiteMetric.passed++;
    } else if (result.status === 'failed' || result.status === 'timedOut') {
      suiteMetric.failed++;
    }
  }

  private async generateConsoleReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 E2E TEST REPORT SUMMARY');
    console.log('='.repeat(80));
    
    console.log(`\n📊 Test Results:`);
    console.log(`   ✅ Passed: ${this.metrics.passedTests}`);
    console.log(`   ❌ Failed: ${this.metrics.failedTests}`);
    console.log(`   ⏭️  Skipped: ${this.metrics.skippedTests}`);
    console.log(`   🔄 Flaky: ${this.metrics.flakyTests}`);
    console.log(`   ⏱️  Duration: ${(this.metrics.duration / 1000).toFixed(2)}s`);

    console.log(`\n🌐 Browser Breakdown:`);
    for (const [browser, stats] of Object.entries(this.metrics.browserBreakdown)) {
      const total = stats.passed + stats.failed + stats.skipped;
      const successRate = total > 0 ? ((stats.passed / total) * 100).toFixed(1) : '0.0';
      console.log(`   ${browser}: ${stats.passed}✅ ${stats.failed}❌ ${stats.skipped}⏭️  (${successRate}%)`);
    }

    if (this.metrics.slowestTests.length > 0) {
      console.log(`\n🐌 Slowest Tests:`);
      this.metrics.slowestTests.slice(0, 5).forEach((test, i) => {
        console.log(`   ${i + 1}. ${test.name} (${(test.duration / 1000).toFixed(2)}s) [${test.browser}]`);
      });
    }

    if (Object.keys(this.metrics.errorBreakdown).length > 0) {
      console.log(`\n🔍 Error Categories:`);
      for (const [error, count] of Object.entries(this.metrics.errorBreakdown)) {
        console.log(`   ${error.replace(/_/g, ' ')}: ${count}`);
      }
    }

    console.log('\n' + '='.repeat(80));
  }

  private async generateJSONReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      config: {
        projects: this.config?.projects.map(p => p.name) || [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        timeout: (this.config as any)?.timeout || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        retries: (this.config as any)?.retries || 0
      },
      metrics: this.metrics,
      suiteMetrics: this.suiteMetrics,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        ci: !!process.env['CI']
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outputDir = (this.config as any)?.outputDir || 'test-results';
    const reportPath = path.join(outputDir, 'test-report.json');
    
    await fs.promises.mkdir(outputDir, { recursive: true });
    await fs.promises.writeFile(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log(`📄 JSON report saved: ${reportPath}`);
  }

  private async generateHTMLReport() {
    const html = this.generateHTMLContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outputDir = (this.config as any)?.outputDir || 'test-results';
    const reportPath = path.join(outputDir, 'enhanced-report.html');
    
    await fs.promises.mkdir(outputDir, { recursive: true });
    await fs.promises.writeFile(reportPath, html);
    
    console.log(`🌐 HTML report saved: ${reportPath}`);
  }

  private generateHTMLContent(): string {
    const successRate = (this.metrics.passedTests / this.metrics.totalTests) * 100;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E2E Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; }
        .metric-label { color: #666; margin-top: 5px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        .section { margin-bottom: 30px; }
        .section h2 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f8f9fa; font-weight: 600; }
        .progress-bar { width: 100%; height: 20px; background: #eee; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 E2E Test Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <div class="metric-value success">${this.metrics.passedTests}</div>
                <div class="metric-label">Passed Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value error">${this.metrics.failedTests}</div>
                <div class="metric-label">Failed Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value warning">${this.metrics.flakyTests}</div>
                <div class="metric-label">Flaky Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value info">${(this.metrics.duration / 1000).toFixed(1)}s</div>
                <div class="metric-label">Total Duration</div>
            </div>
        </div>

        <div class="section">
            <h2>Success Rate</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${successRate}%"></div>
            </div>
            <p style="text-align: center; margin-top: 10px; font-weight: bold;">
                ${successRate.toFixed(1)}% (${this.metrics.passedTests}/${this.metrics.totalTests})
            </p>
        </div>

        <div class="section">
            <h2>Browser Breakdown</h2>
            <table>
                <thead>
                    <tr><th>Browser</th><th>Passed</th><th>Failed</th><th>Skipped</th><th>Success Rate</th></tr>
                </thead>
                <tbody>
                    ${Object.entries(this.metrics.browserBreakdown).map(([browser, stats]) => {
                        const total = stats.passed + stats.failed + stats.skipped;
                        const rate = total > 0 ? ((stats.passed / total) * 100).toFixed(1) : '0.0';
                        return `
                            <tr>
                                <td>${browser}</td>
                                <td class="success">${stats.passed}</td>
                                <td class="error">${stats.failed}</td>
                                <td class="warning">${stats.skipped}</td>
                                <td>${rate}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        ${this.metrics.slowestTests.length > 0 ? `
        <div class="section">
            <h2>Slowest Tests</h2>
            <table>
                <thead>
                    <tr><th>Test</th><th>Duration</th><th>Browser</th></tr>
                </thead>
                <tbody>
                    ${this.metrics.slowestTests.slice(0, 10).map(test => `
                        <tr>
                            <td>${test.name}</td>
                            <td>${(test.duration / 1000).toFixed(2)}s</td>
                            <td>${test.browser}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}

        <div class="section">
            <h2>Test Suite Breakdown</h2>
            <table>
                <thead>
                    <tr><th>Suite</th><th>Tests</th><th>Passed</th><th>Failed</th><th>Duration</th></tr>
                </thead>
                <tbody>
                    ${this.suiteMetrics.map(suite => `
                        <tr>
                            <td>${suite.suite}</td>
                            <td>${suite.tests}</td>
                            <td class="success">${suite.passed}</td>
                            <td class="error">${suite.failed}</td>
                            <td>${(suite.duration / 1000).toFixed(2)}s</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
    `;
  }

  private async generateMarkdownReport() {
    const successRate = (this.metrics.passedTests / this.metrics.totalTests) * 100;
    
    const markdown = `# 🧪 E2E Test Report

**Generated:** ${new Date().toLocaleString()}

## 📊 Summary

| Metric | Value |
|--------|--------|
| ✅ Passed | ${this.metrics.passedTests} |
| ❌ Failed | ${this.metrics.failedTests} |
| ⏭️ Skipped | ${this.metrics.skippedTests} |
| 🔄 Flaky | ${this.metrics.flakyTests} |
| ⏱️ Duration | ${(this.metrics.duration / 1000).toFixed(2)}s |
| 🎯 Success Rate | ${successRate.toFixed(1)}% |

## 🌐 Browser Results

| Browser | Passed | Failed | Skipped | Success Rate |
|---------|--------|--------|---------|-------------|
${Object.entries(this.metrics.browserBreakdown).map(([browser, stats]) => {
  const total = stats.passed + stats.failed + stats.skipped;
  const rate = total > 0 ? ((stats.passed / total) * 100).toFixed(1) : '0.0';
  return `| ${browser} | ${stats.passed} | ${stats.failed} | ${stats.skipped} | ${rate}% |`;
}).join('\n')}

${this.metrics.slowestTests.length > 0 ? `
## 🐌 Slowest Tests

| Test | Duration | Browser |
|------|----------|---------|
${this.metrics.slowestTests.slice(0, 5).map(test => 
  `| ${test.name} | ${(test.duration / 1000).toFixed(2)}s | ${test.browser} |`
).join('\n')}
` : ''}

${Object.keys(this.metrics.errorBreakdown).length > 0 ? `
## 🔍 Error Categories

| Error Type | Count |
|------------|-------|
${Object.entries(this.metrics.errorBreakdown).map(([error, count]) => 
  `| ${error.replace(/_/g, ' ')} | ${count} |`
).join('\n')}
` : ''}

## 📋 Test Suites

| Suite | Tests | Passed | Failed | Duration |
|-------|--------|--------|--------|----------|
${this.suiteMetrics.map(suite => 
  `| ${suite.suite} | ${suite.tests} | ${suite.passed} | ${suite.failed} | ${(suite.duration / 1000).toFixed(2)}s |`
).join('\n')}

---
*Report generated by Enhanced E2E Test Reporter*
`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outputDir = (this.config as any)?.outputDir || 'test-results';
    const reportPath = path.join(outputDir, 'test-report.md');
    
    await fs.promises.mkdir(outputDir, { recursive: true });
    await fs.promises.writeFile(reportPath, markdown);
    
    console.log(`📝 Markdown report saved: ${reportPath}`);
  }

  private async analyzePerformance() {
    const avgTestDuration = this.metrics.duration / this.metrics.totalTests;
    
    console.log(`\n⚡ Performance Analysis:`);
    console.log(`   Average test duration: ${(avgTestDuration / 1000).toFixed(2)}s`);
    
    if (avgTestDuration > 10000) {
      console.log(`   ⚠️  Tests are running slower than expected (>10s average)`);
    }
    
    if (this.metrics.flakyTests > 0) {
      console.log(`   ⚠️  ${this.metrics.flakyTests} flaky tests detected - consider investigation`);
    }
    
    const timeoutErrors = this.metrics.errorBreakdown['timeout'] || 0;
    if (timeoutErrors > 0) {
      console.log(`   ⚠️  ${timeoutErrors} timeout errors - may indicate performance issues`);
    }
  }
}