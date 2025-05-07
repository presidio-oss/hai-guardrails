import type { Guard, GuardOptions } from '../types/types'
import { makeGuard } from './make'

type SecretPattern = {
	id: string
	name: string
	description: string
	pattern: RegExp
	minEntropy?: number
	replacement: string
}

// Default secret patterns (can be extended through options)
const DEFAULT_SECRET_PATTERNS: SecretPattern[] = [
	{
		id: '1password-service-account-token',
		name: '1Password Service Account Token',
		description:
			'Uncovered a possible 1Password service account token, potentially compromising access to secrets in vaults.',
		pattern: /ops_eyJ[a-zA-Z0-9+/]{250,}={0,3}/,
		minEntropy: 4,
		replacement: '[REDACTED-1PASSWORD-TOKEN]',
	},
	{
		id: '1password-secret-key',
		name: '1Password secret key',
		description:
			'Uncovered a possible 1Password secret key, potentially compromising access to secrets in vaults.',
		pattern:
			/\bA3-[A-Z0-9]{6}-(?:[A-Z0-9]{11}|[A-Z0-9]{6}-[A-Z0-9]{5})-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}\b/,
		minEntropy: 3.8,
		replacement: '[REDACTED-1PASSWORD-KEY]',
	},
	{
		id: 'aws-access-token',
		name: 'AWS Access Token',
		description:
			'Identified a pattern that may indicate AWS credentials, risking unauthorized cloud resource access and data breaches on AWS platforms.',
		pattern: /\b((?:A3T[A-Z0-9]|AKIA|ASIA|ABIA|ACCA)[A-Z0-9]{16})\b/,
		minEntropy: 3,
		replacement: '[REDACTED-AWS-TOKEN]',
	},
	{
		id: 'aws-secret-key',
		name: 'AWS Secret Key',
		description:
			'Identified a pattern that may indicate AWS credentials, risking unauthorized cloud resource access and data breaches on AWS platforms.',
		pattern: /\b((?:A3T[A-Z0-9]|AKIA|ASIA|ABIA|ACCA)[A-Z0-9]{16})\b/,
		minEntropy: 3,
		replacement: '[REDACTED-AWS-SECRET-KEY]',
	},
	{
		id: 'azure-ad-client-secret',
		name: 'Azure AD Client Secret',
		description:
			'Identified a pattern that may indicate Azure AD client secrets, risking unauthorized access to Azure resources and data breaches on Azure platforms.',
		pattern:
			/(?:^|[\\'"\x60\s>=:(,)])([a-zA-Z0-9_~.]{3}\dQ~[a-zA-Z0-9_~.-]{31,34})(?:$|[\\'"\x60\s<),])/,
		minEntropy: 3,
		replacement: '[REDACTED-AZURE-CLIENT-SECRET]',
	},
	{
		id: 'github-pat',
		name: 'GitHub Personal Access Token',
		description:
			'Uncovered a GitHub Personal Access Token, potentially leading to unauthorized repository access and sensitive content exposure.',
		pattern: /ghp_[0-9a-zA-Z]{36}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITHUB-PAT]',
	},
	{
		id: 'github-fine-grained-pat',
		name: 'GitHub Fine-Grained Personal Access Token',
		description:
			'Found a GitHub Fine-Grained Personal Access Token, risking unauthorized repository access and code manipulation.',
		pattern: /github_pat_\w{82}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITHUB-FINE-GRAINED-PAT]',
	},
	{
		id: 'github-oauth',
		name: 'GitHub OAuth Access Token',
		description:
			'Discovered a GitHub OAuth Access Token, posing a risk of compromised GitHub account integrations and data leaks.',
		pattern: /gho_[0-9a-zA-Z]{36}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITHUB-OAUTH]',
	},
	{
		id: 'github-app-token',
		name: 'GitHub App Token',
		description:
			'Identified a GitHub App Token, which may compromise GitHub application integrations and source code security.',
		pattern: /(?:ghu|ghs)_[0-9a-zA-Z]{36}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITHUB-APP-TOKEN]',
	},
	{
		id: 'github-refresh-token',
		name: 'GitHub Refresh Token',
		description:
			'Detected a GitHub Refresh Token, which could allow prolonged unauthorized access to GitHub services.',
		pattern: /ghr_[0-9a-zA-Z]{36}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITHUB-REFRESH-TOKEN]',
	},
	{
		id: 'gitlab-cicd-job-token',
		name: 'GitLab CI/CD Job Token',
		description:
			'Identified a GitLab CI/CD Job Token, potential access to projects and some APIs on behalf of a user while the CI job is running.',
		pattern: /glcbt-[0-9a-zA-Z]{1,5}_[0-9a-zA-Z_-]{20}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-CICD-JOB-TOKEN]',
	},
	{
		id: 'gitlab-deploy-token',
		name: 'GitLab Deploy Token',
		description:
			'Identified a GitLab Deploy Token, risking access to repositories, packages and containers with write access.',
		pattern: /gldt-[0-9a-zA-Z_\-]{20}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-DEPLOY-TOKEN]',
	},
	{
		id: 'gitlab-feature-flag-client-token',
		name: 'GitLab Feature Flag Client Token',
		description:
			'Identified a GitLab feature flag client token, risks exposing user lists and features flags used by an application.',
		pattern: /glffct-[0-9a-zA-Z_\-]{20}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-FEATURE-FLAG-CLIENT-TOKEN]',
	},
	{
		id: 'gitlab-feed-token',
		name: 'GitLab Feed Token',
		description: 'Identified a GitLab feed token, risking exposure of user data.',
		pattern: /glft-[0-9a-zA-Z_\-]{20}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-FEED-TOKEN]',
	},
	{
		id: 'gitlab-incoming-mail-token',
		name: 'GitLab Incoming Mail Token',
		description:
			'Identified a GitLab incoming mail token, risking manipulation of data sent by mail.',
		pattern: /glimt-[0-9a-zA-Z_\-]{25}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-INCOMING-MAIL-TOKEN]',
	},
	{
		id: 'gitlab-kubernetes-agent-token',
		name: 'GitLab Kubernetes Agent Token',
		description:
			'Identified a GitLab Kubernetes Agent token, risking access to repos and registry of projects connected via agent.',
		pattern: /glagent-[0-9a-zA-Z_\-]{50}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-KUBERNETES-AGENT-TOKEN]',
	},
	{
		id: 'gitlab-oauth-app-secret',
		name: 'GitLab OIDC Application Secret',
		description:
			'Identified a GitLab OIDC Application Secret, risking access to apps using GitLab as authentication provider.',
		pattern: /gloas-[0-9a-zA-Z_\-]{64}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-OAUTH-APP-SECRET]',
	},
	{
		id: 'gitlab-pat',
		name: 'GitLab Personal Access Token',
		description:
			'Identified a GitLab Personal Access Token, risking unauthorized access to GitLab repositories and codebase exposure.',
		pattern: /glpat-[\w-]{20}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-PAT]',
	},
	{
		id: 'gitlab-pat-routable',
		name: 'GitLab Personal Access Token (routable)',
		description:
			'Identified a GitLab Personal Access Token (routable), risking unauthorized access to GitLab repositories and codebase exposure.',
		pattern: /\bglpat-[0-9a-zA-Z_-]{27,300}\.[0-9a-z]{2}[0-9a-z]{7}\b/,
		minEntropy: 4,
		replacement: '[REDACTED-GITLAB-PAT-ROUTABLE]',
	},
	{
		id: 'gitlab-ptt',
		name: 'GitLab Pipeline Trigger Token',
		description:
			'Found a GitLab Pipeline Trigger Token, potentially compromising continuous integration workflows and project security.',
		pattern: /glptt-[0-9a-f]{40}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-PTT]',
	},
	{
		id: 'gitlab-rrt',
		name: 'GitLab Runner Registration Token',
		description:
			'Discovered a GitLab Runner Registration Token, posing a risk to CI/CD pipeline integrity and unauthorized access.',
		pattern: /GR1348941[\w-]{20}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-RRT]',
	},
	{
		id: 'gitlab-runner-authentication-token',
		name: 'GitLab Runner Authentication Token',
		description:
			'Discovered a GitLab Runner Authentication Token, posing a risk to CI/CD pipeline integrity and unauthorized access.',
		pattern: /glrt-[0-9a-zA-Z_\-]{20}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-RUNNER-AUTHENTICATION-TOKEN]',
	},
	{
		id: 'gitlab-runner-authentication-token-routable',
		name: 'GitLab Runner Authentication Token (Routable)',
		description:
			'Discovered a GitLab Runner Authentication Token (Routable), posing a risk to CI/CD pipeline integrity and unauthorized access.',
		pattern: /\bglrt-t\d_[0-9a-zA-Z_\-]{27,300}\.[0-9a-z]{2}[0-9a-z]{7}\b/,
		minEntropy: 4,
		replacement: '[REDACTED-GITLAB-RUNNER-AUTHENTICATION-TOKEN-ROUTABLE]',
	},
	{
		id: 'gitlab-scim-token',
		name: 'GitLab SCIM Token',
		description:
			'Discovered a GitLab SCIM Token, posing a risk to unauthorized access for a organization or instance.',
		pattern: /glsoat-[0-9a-zA-Z_\-]{20}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-SCIM-TOKEN]',
	},
	{
		id: 'gitlab-session-cookie',
		name: 'GitLab Session Cookie',
		description:
			'Discovered a GitLab Session Cookie, posing a risk to unauthorized access to a user account.',
		pattern: /_gitlab_session=[0-9a-z]{32}/,
		minEntropy: 3,
		replacement: '[REDACTED-GITLAB-SESSION-COOKIE]',
	},
]

function calculateEntropy(str: string): number {
	if (str.length === 0) return 0

	const charCount = new Map<string, number>()

	// Count occurrences of each character
	for (const char of str) {
		charCount.set(char, (charCount.get(char) || 0) + 1)
	}

	let entropy = 0
	const length = str.length

	// Calculate entropy using Shannon's formula
	for (const count of charCount.values()) {
		const probability = count / length
		entropy -= probability * Math.log2(probability)
	}

	return entropy
}

function redactSecrets(
	input: string,
	patterns: SecretPattern[]
): { redacted: string; found: boolean } {
	let redacted = input
	let found = false

	for (const { pattern, minEntropy, replacement } of patterns) {
		const globalPattern = new RegExp(
			pattern,
			pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
		)
		const matches = input.matchAll(globalPattern)

		for (const match of matches) {
			const matchText = match[0]

			// Skip if entropy check is required and not met
			if (minEntropy !== undefined) {
				const entropy = calculateEntropy(matchText)
				if (entropy < minEntropy) {
					continue
				}
			}

			redacted = redacted.replace(matchText, replacement)
			found = true
		}
	}

	return { redacted, found }
}

type SecretGuardOptions = GuardOptions & {
	patterns?: SecretPattern[]
}
export function makeSecretGuard(opts: SecretGuardOptions = {}): Guard {
	const patterns = [...DEFAULT_SECRET_PATTERNS, ...(opts.patterns || [])]
	return makeGuard({
		...opts,
		id: 'secret',
		name: 'Secret Guard',
		implementation: (input, msg, config, idx) => {
			const common = {
				guardId: config.id,
				guardName: config.name,
				message: msg,
				index: idx,
				passed: true,
				reason: 'No secrets detected',
			}

			if (!msg.inScope) {
				return {
					...common,
					passed: true,
					reason: 'Message is not in scope',
				}
			}

			const { redacted, found } = redactSecrets(input, patterns)

			if (found) {
				return {
					...common,
					passed: true,
					reason: 'Input contains potential secrets',
					modifiedMessage: {
						...msg,
						content: redacted,
					},
				}
			}

			return common
		},
	})
}
