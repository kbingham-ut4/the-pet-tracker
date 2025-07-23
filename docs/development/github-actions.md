# GitHub Actions & CI/CD

This documentation covers the automated code quality, security, and CI/CD processes implemented using GitHub Actions workflows.

## Overview

The Pet Tracker project uses GitHub Actions for continuous integration and continuous deployment (CI/CD). Our workflows ensure code quality, security, and reliable deployments through automated testing, linting, and security scanning.

## Workflows

::: tip Quick Start
All workflows are automatically triggered when you create pull requests or push to main branches. No manual setup required!
:::

### 1. Code Quality (`code-quality.yml`)

The primary workflow that ensures code quality standards across the project.

::: details Workflow Configuration
**Triggers:**

- Pull requests to `main` or `develop` branches
- Pushes to `main` or `develop` branches
- When relevant files are modified (TypeScript, JavaScript, configuration files)
  :::

**Jobs:**

#### Lint (`lint`)

- Runs ESLint with SARIF output for GitHub integration
- Uploads lint results to GitHub Security tab
- **Timeout:** 10 minutes

::: code-group

```bash [Command]
pnpm lint
```

```yaml [Workflow Step]
- name: Run ESLint
  run: |
    # Run ESLint with SARIF output for GitHub integration (if available)
    if pnpm list @microsoft/eslint-formatter-sarif &>/dev/null; then
      pnpm lint --format=@microsoft/eslint-formatter-sarif --output-file=eslint-results.sarif || true
    fi
    # Run regular ESLint check
    pnpm lint
```

:::

#### Type Check (`type-check`)

- Validates TypeScript types across the project
- Ensures type safety
- **Timeout:** 10 minutes

::: code-group

```bash [Command]
pnpm type-check
```

```yaml [Workflow Step]
- name: Check TypeScript types
  run: pnpm type-check
```

:::

#### Format Check (`format-check`)

- Verifies code formatting with Prettier
- Ensures consistent code style
- **Timeout:** 5 minutes

::: code-group

```bash [Command]
pnpm format:check
```

```yaml [Workflow Step]
- name: Check code formatting
  run: pnpm format:check
```

:::

#### Tests (`tests`)

- Runs unit tests with coverage reporting
- Uploads coverage to Codecov (if configured)
- Uploads test artifacts
- **Timeout:** 15 minutes

::: code-group

```bash [Command]
pnpm test:coverage
```

```yaml [Workflow Step]
- name: Run tests with coverage
  run: pnpm test:coverage
```

:::

#### Commit Lint (`commit-lint`)

- Validates commit message format (Conventional Commits)
- Only runs on PRs from the same repository
- **Timeout:** 5 minutes

::: warning Repository Forks
This step is skipped for external forks to prevent access to repository history.
:::

#### Dependency Audit (`dependency-audit`)

- Checks for security vulnerabilities in dependencies
- Fails on high/critical vulnerabilities
- Reports outdated dependencies
- **Timeout:** 10 minutes

::: danger Critical Vulnerabilities
The workflow will fail if critical or high-severity vulnerabilities are detected in dependencies.
:::

#### Build Check (`build-check`)

- Verifies the project can build successfully
- Caches build artifacts for performance
- **Timeout:** 15 minutes

#### Quality Gate (`quality-gate`)

- Aggregates results from all quality checks
- Provides clear pass/fail status
- **Timeout:** 5 minutes

::: info Quality Gate Logic
The quality gate requires all critical checks (lint, type-check, format-check, tests) to pass. Non-critical checks (audit, build) can fail with warnings.
:::

### 2. Security Scan (`security.yml`)

Comprehensive security scanning that runs on schedule and when dependencies change.

::: details Workflow Configuration
**Triggers:**

- Daily schedule (2 AM UTC)
- Pushes to `main` affecting dependencies
- Pull requests affecting dependencies
- Manual workflow dispatch
  :::

**Jobs:**

#### Dependency Review (`dependency-review`)

- Reviews dependency changes in PRs
- Fails on moderate+ severity vulnerabilities
- Comments summary in PR

::: tip GitHub Security Integration
This job integrates with GitHub's built-in dependency review features and security advisories.
:::

#### Security Audit (`security-audit`)

- Comprehensive npm audit
- Fails on critical vulnerabilities
- Warns on high severity vulnerabilities
- **Timeout:** 15 minutes

::: code-group

```bash [Critical Check]
pnpm audit --audit-level critical
```

```bash [High Severity Check]
pnpm audit --audit-level high
```

:::

#### CodeQL Analysis (`codeql-analysis`)

- Static code analysis for security vulnerabilities
- Uses security-extended queries
- Supports JavaScript/TypeScript
- **Timeout:** 30 minutes

::: info CodeQL
CodeQL is GitHub's semantic code analysis engine that helps find security vulnerabilities in your code.
:::

#### License Check (`license-check`)

- Validates dependency licenses
- Ensures compliance with allowed licenses
- Generates license reports
- **Timeout:** 10 minutes

::: details Allowed Licenses

- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC
- CC0-1.0
- Unlicense
  :::

#### Security Summary (`security-summary`)

- Aggregates all security check results
- Provides comprehensive security status

## Configuration

### Environment Variables

::: code-group

```yaml [Workflow Configuration]
env:
  NODE_VERSION: 24
  PNPM_VERSION: 10
```

```properties [.npmrc File]
# Node.js and pnpm version configuration
node-version=24
pnpm-version=10
```

:::

### Secrets (Optional)

| Secret          | Purpose                      | Required                          |
| --------------- | ---------------------------- | --------------------------------- |
| `CODECOV_TOKEN` | Enhanced Codecov integration | No (public repos work without it) |

::: tip Adding Secrets
Add secrets in your repository settings under **Settings > Secrets and variables > Actions**.
:::

### Permissions

Each workflow uses minimal required permissions following the principle of least privilege:

| Permission               | Purpose                  |
| ------------------------ | ------------------------ |
| `contents: read`         | Read repository contents |
| `checks: write`          | Write check results      |
| `pull-requests: write`   | Comment on PRs           |
| `security-events: write` | Upload security results  |

::: warning Security Note
Never grant more permissions than necessary. Our workflows are designed with security-first principles.
:::

## Best Practices Implemented

::: tip Why These Practices Matter
Following these practices ensures reliable, secure, and maintainable CI/CD pipelines.
:::

### 1. **Parallelization**

- Jobs run in parallel where possible ⚡
- Reduces overall workflow time
- Independent failure isolation

### 2. **Timeout Management**

- Reasonable timeouts for each job ⏱️
- Prevents hanging workflows
- Quick feedback on issues

### 3. **Artifact Management**

- Upload test results and coverage 📊
- Upload security audit results
- Configurable retention periods

### 4. **Error Handling**

- Graceful degradation with `continue-on-error` 🛡️
- Conditional steps based on file existence
- Clear error messages and status reporting

### 5. **Security**

- Minimal permissions 🔒
- Secure secret handling
- Dependency review on changes

### 6. **Performance**

- Efficient caching strategy ⚡
- Conditional job execution
- Optimized dependency installation

### 7. **Observability**

- Detailed logging and status reporting 📈
- Integration with GitHub Security tab
- Clear success/failure indicators

## Usage Guide

### For Pull Requests

::: info Automatic Workflow Execution
When you create a PR, workflows run automatically. Here's what happens:
:::

1. **Create a PR** to `main` or `develop`
2. **Code quality workflow** runs automatically
3. **Security workflow** runs if dependencies changed
4. **Review and address** any failures before merging

::: code-group

```bash [Local Pre-check]
# Run quality checks locally before pushing
pnpm quality:check
```

```bash [Fix Issues]
# Auto-fix common issues
pnpm quality:fix
```

:::

### For Scheduled Security Scans

::: warning Daily Security Monitoring
Security scans run daily at 2 AM UTC to catch new vulnerabilities.
:::

- **Runs daily** to catch new vulnerabilities
- **Review security alerts** in GitHub Security tab
- **Update dependencies** as needed

### Manual Triggers

::: tip Manual Workflow Execution
You can manually trigger workflows when needed.
:::

1. Go to **Actions** tab in your repository
2. Select the workflow you want to run
3. Click **"Run workflow"** button
4. Choose the branch and click **"Run workflow"**

Use cases:

- Testing workflow changes 🧪
- Ad-hoc security checks 🔍
- Debugging workflow issues 🐛

## Customization

### Adding New Checks

::: tip Extending Workflows
Follow these steps to add new quality or security checks.
:::

1. **Add new job** to appropriate workflow
2. **Update quality gate** dependencies
3. **Consider timeout** and permissions
4. **Test with sample PR**

::: code-group

```yaml [New Job Example]
new-check:
  name: Custom Check
  runs-on: ubuntu-latest
  timeout-minutes: 10
  permissions:
    contents: read

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js and pnpm
      uses: ./.github/actions/setup-node-pnpm

    - name: Run custom check
      run: pnpm custom:check
```

```yaml [Update Quality Gate]
quality-gate:
  needs: [lint, type-check, format-check, tests, new-check]
  # ... rest of quality gate job
```

:::

### Modifying Thresholds

::: warning Impact Assessment
Changing thresholds affects all contributors. Document changes clearly.
:::

- **Update audit levels** in security workflow
- **Adjust test coverage** requirements
- **Modify timeout values** as needed

::: code-group

```yaml [Security Thresholds]
# Change from 'high' to 'moderate' for stricter checking
pnpm audit --audit-level moderate
```

```yaml [Timeout Adjustments]
# Increase timeout for slower operations
timeout-minutes: 20 # was 15
```

:::

### Integration with External Tools

::: info Third-party Integrations
Common integrations that enhance the workflow capabilities.
:::

1. **Add API tokens** as repository secrets
2. **Update workflow permissions**
3. **Configure external service** webhooks

Popular integrations:

- **SonarCloud** for code quality
- **Snyk** for security scanning
- **Lighthouse CI** for performance
- **Cypress** for E2E testing

## Troubleshooting

::: danger Common Issues
Here are the most frequent problems and their solutions.
:::

### Workflow Failures

| Issue                    | Symptoms                 | Solution                                          |
| ------------------------ | ------------------------ | ------------------------------------------------- |
| **Build timeouts**       | Jobs exceed time limits  | Increase timeout values or optimize build process |
| **Permission errors**    | Access denied messages   | Check job permissions and repository settings     |
| **Cache issues**         | Inconsistent builds      | Clear cache or update cache keys                  |
| **Dependency conflicts** | Module resolution errors | Review lockfile and audit results                 |

### Debugging Steps

::: code-group

```bash [1. Check Workflow Logs]
# Navigate to Actions tab in GitHub
# Click on failed workflow
# Expand failed job steps
# Review error messages
```

```bash [2. Review Artifacts]
# Download uploaded artifacts
# Check test results and coverage
# Review security audit reports
```

```bash [3. Test Locally]
# Run the same commands locally
pnpm lint
pnpm type-check
pnpm test:coverage
pnpm audit
```

```bash [4. Manual Workflow Run]
# Use workflow_dispatch trigger
# Test with specific branch
# Check repository security settings
```

:::

### Performance Issues

::: tip Optimization Strategies
If workflows are running slowly, try these optimizations.
:::

- **Enable caching** for dependencies and build artifacts
- **Use matrix builds** for parallel test execution
- **Optimize Docker images** if using containers
- **Split large workflows** into smaller, focused jobs

### Security Settings

::: warning Repository Configuration
Ensure your repository is configured correctly for workflows.
:::

Check these settings in **Settings > Actions**:

- ✅ Allow GitHub Actions to run
- ✅ Allow actions and reusable workflows
- ✅ Enable artifact and log retention

### Getting Help

::: info Support Resources
When you need additional help with workflows.
:::

1. **GitHub Actions Documentation**: [docs.github.com/actions](https://docs.github.com/actions)
2. **Community Forum**: [github.community](https://github.community)
3. **Project Issues**: Create an issue in this repository
4. **Team Support**: Contact the development team

---

::: tip Next Steps

- Check out the [Testing Guide](/development/testing) for local testing strategies
- Learn about [Deployment](/deployment/) processes
- Review the [Contributing Guide](/contributing/guide) for development workflow
  :::
