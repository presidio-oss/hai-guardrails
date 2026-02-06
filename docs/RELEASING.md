# hai-guardrails Release Guide

This document provides comprehensive instructions for releasing the hai-guardrails Node.js SDK to NPM.

## Overview

The hai-guardrails project is a TypeScript library that gets published as an NPM package (`@presidio-dev/hai-guardrails`) with automated version management and changelog generation using conventional commits and release-it.

## Release Channels

The project supports two release channels:

### 1. Release Candidate (RC) Channel

- **Branch**: `rc`
- **NPM Tag**: `rc` (e.g., `@presidio-dev/hai-guardrails@1.10.1-rc.2`)
- **Purpose**: Pre-release testing and validation
- **GitHub Release**: Marked as pre-release

### 2. Production Channel

- **Branch**: `release`
- **NPM Tag**: `latest` (e.g., `@presidio-dev/hai-guardrails@1.10.0`)
- **Purpose**: Stable production releases
- **GitHub Release**: Marked as latest

## Versioning Strategy

The project follows [Semantic Versioning (SemVer)](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

**Important**: Version bumps and changelog generation are automated using `release-it` based on conventional commit messages. The system analyzes commit messages to determine the appropriate version increment.

## Conventional Commits

The project uses [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning:

- `feat:` - New features (triggers MINOR version bump)
- `fix:` - Bug fixes (triggers PATCH version bump)
- `BREAKING CHANGE:` - Breaking changes (triggers MAJOR version bump)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:` - No version bump

**Examples:**

```bash
feat: add new bias detection guard
fix: resolve memory leak in pattern matching
feat!: redesign guard API (breaking change)
```

## Release Process

### Prerequisites

Before starting a release, ensure you have:

1. **Permissions**:

   - Write access to the repository
   - NPM publish permissions for `@presidio-dev/hai-guardrails`
   - GitHub release creation permissions

2. **Environment Setup**:

   - Git configured with appropriate credentials
   - Access to both `release` and `rc` branches
   - Bun runtime installed (version specified in `.tool-versions`)

3. **Quality Assurance**:
   - All tests passing locally
   - Code review completed
   - No breaking changes without proper documentation

### Step-by-Step Release Process

#### 1. Prepare the Release

**For RC Release:**

```bash
# Switch to rc branch
git checkout rc
git pull origin rc

# Merge latest changes from main (if needed)
git merge main
```

**For Production Release:**

```bash
# Switch to release branch
git checkout release
git pull origin release

# Merge latest changes from rc or main
git merge rc  # or git merge main
```

#### 2. Push to Release Branch

The version bump and changelog generation are automated, so you only need to push your changes:

```bash
# Push to trigger automated release
git push origin rc        # For RC release
# OR
git push origin release   # For production release
```

#### 3. Automated Release Process

Once pushed to `rc` or `release` branch, GitHub Actions will automatically:

1. **Lint and Format Check**: Ensures code quality standards
2. **Build Process**:
   - Install dependencies with Bun
   - Build the TypeScript project to `dist/` directory
   - Create build artifacts with provenance attestation
3. **Release Process**:
   - Analyze conventional commits to determine version bump
   - Generate/update `CHANGELOG.md`
   - Create Git tag with version
   - Build and publish NPM package with provenance
   - Create GitHub release with assets

#### 4. Verify Release

**Check NPM Package:**

```bash
# For production release
npm view @presidio-dev/hai-guardrails@latest

# For RC release
npm view @presidio-dev/hai-guardrails@rc

# Install and test
npm install @presidio-dev/hai-guardrails@latest  # or @rc
```

**Check GitHub Release:**

1. Visit the [GitHub Releases page](https://github.com/presidio-oss/hai-guardrails/releases)
2. Verify the new release appears with correct version and changelog
3. Confirm build artifacts are attached

## Release Artifacts

### NPM Package

**Package**: `@presidio-dev/hai-guardrails`

**Tags**:

- RC: `rc` (e.g., `1.10.1-rc.2`)
- Production: `latest` (e.g., `1.10.0`)

**Package Contents**:

- `dist/` - Compiled JavaScript, TypeScript definitions, and source maps
- `README.md` - Package documentation
- `package.json` - Package metadata

**Installation**:

```bash
# Production
npm install @presidio-dev/hai-guardrails

# RC
npm install @presidio-dev/hai-guardrails@rc

# Specific version
npm install @presidio-dev/hai-guardrails@1.10.0
```

### GitHub Release

**Assets**:

- Source code (zip and tar.gz)
- Build artifacts from `dist/` directory
- Build provenance attestation

**Features**:

- Automated changelog from conventional commits
- Links to related issues and pull requests
- Build provenance for supply chain security

## Troubleshooting

### Common Issues

#### Build Failures

**Problem**: TypeScript compilation or build process fails
**Solution**:

1. Run build locally: `bun run build --production`
2. Check TypeScript errors and fix them
3. Ensure all dependencies are properly installed

#### NPM Publishing Errors

**Problem**: Package fails to publish to NPM
**Solution**:

1. Verify `NODE_AUTH_TOKEN` secret is configured in GitHub
2. Check NPM package permissions
3. Ensure package name and version are unique
4. Review NPM registry status

#### Version Conflicts

**Problem**: Version already exists or conflicts
**Solution**:

1. Check existing versions: `npm view @presidio-dev/hai-guardrails versions --json`
2. Ensure conventional commits are properly formatted
3. Manually trigger version bump if needed: `bun run release`

#### Git Issues

**Problem**: Git operations fail during release
**Solution**:

1. Ensure clean working directory
2. Check branch permissions and protection rules
3. Verify GitHub token has appropriate permissions
4. Review commit message format

### Manual Recovery

If automated release fails, you can manually publish:

**Manual NPM Publish**:

```bash
# Build the package
bun run build --production

# Login to NPM
npm login

# Publish with appropriate tag
npm publish --tag latest    # For production
npm publish --tag rc        # For RC
```

**Manual GitHub Release**:

1. Create tag manually: `git tag v1.10.1 && git push origin v1.10.1`
2. Create release through GitHub UI
3. Upload build artifacts manually

## Release Checklist

### Pre-Release

- [ ] Code formatted properly (`bun run format:check`)
- [ ] Conventional commit messages used
- [ ] Breaking changes documented (if any)
- [ ] Dependencies updated and secure

### During Release

- [ ] Correct branch selected (`rc` or `release`)
- [ ] Changes merged from appropriate source branch
- [ ] Push triggers GitHub Actions workflow
- [ ] CI/CD pipeline completes successfully

### Post-Release

- [ ] NPM package published and accessible
- [ ] GitHub release created with correct assets
- [ ] Changelog updated with new version
- [ ] Installation tested from published package
- [ ] Documentation updated (if needed)
- [ ] Team notified of release

## Monitoring and Rollback

### Monitoring

- Monitor GitHub Actions workflow status
- Check NPM package availability and download stats
- Verify package installation in downstream projects
- Review GitHub release metrics

### Rollback Strategy

If a release needs to be rolled back:

1. **NPM**: Use `npm deprecate` to mark problematic version

   ```bash
   npm deprecate @presidio-dev/hai-guardrails@1.10.1 "Critical bug - use 1.10.0 instead"
   ```

2. **GitHub**: Edit release to mark as pre-release or delete if necessary

3. **Emergency**: Publish hotfix version with patch increment
   ```bash
   # Fix the issue, then
   git commit -m "fix: critical bug in version 1.10.1"
   git push origin release  # Triggers new patch release
   ```

## Development Workflow Integration

### Feature Development

1. Create feature branch from `main`
2. Use conventional commits for all changes
3. Create PR to `main` for review
4. Merge to `main` after approval

### RC Testing

1. Merge `main` to `rc` branch
2. Push to trigger RC release
3. Test RC version in staging environments
4. Gather feedback and fix issues

### Production Release

1. Merge tested `rc` to `release` branch
2. Push to trigger production release
3. Monitor for issues and user feedback

## Support

For release-related issues:

1. Check GitHub Actions logs for detailed error messages
2. Review this documentation for troubleshooting steps
3. Check NPM registry status and permissions
4. Contact the development team via GitHub issues

## Security Considerations

- All releases include build provenance attestation
- NPM packages are published with provenance for supply chain security
- GitHub tokens and NPM tokens are stored as encrypted secrets
- Build artifacts are verified and signed

---

**Last Updated**: July 2025
**Version**: 1.0
