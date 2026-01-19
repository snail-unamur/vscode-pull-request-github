import { PullRequestMetrics } from './pullRequestMetrics';
import { PullRequestMetricsClient } from './PullRequestMetricsClient';
import { PullRequestModel } from '../github/pullRequestModel';

export function hasMetrics(obj: any): obj is PullRequestWithMetrics {
	return (
		typeof obj?.retrieveMetrics === 'function' &&
		obj?.metrics != undefined
	);
}

export type PullRequestWithMetrics = PullRequestModel & {
	retrieveMetrics(): Promise<void>;
	compareTo(other: any): number;
	metrics: PullRequestMetrics;
	difficultyScore: number;
};

export function pullRequestWithMetrics(
	pr: PullRequestModel,
	precogClient: PullRequestMetricsClient
): PullRequestWithMetrics {
	class SortablePullRequest {
		private _metrics: PullRequestMetrics;

		get metrics() {
			return this._metrics;
		}

		get difficultyScore() {
			return this._metrics?.difficultyScore;
		}

		set metrics(metrics: PullRequestMetrics) {
			this._metrics = metrics;
		}

		compareTo(other: PullRequestWithMetrics): number {
			return this.difficultyScore - other.difficultyScore;
		}

		async retrieveMetrics() {
			const repoOwner = pr.remote.owner;
			const repoName = pr.remote.repositoryName;
			const prNumber = pr.number;

			const result = await precogClient.retrieveMetrics(repoOwner, repoName, prNumber);
			if (result) {
				this._metrics = result;
			}
		}
	}

	const decorator = new SortablePullRequest();

	return new Proxy(pr as PullRequestWithMetrics, {
		get(target, prop, receiver) {
			if (Reflect.has(decorator, prop)) return (decorator as SortablePullRequest)[prop];
			return Reflect.get(target, prop, receiver);
		},
		set(target, prop, value, receiver) {
			if (Reflect.has(decorator, prop)) {
				(decorator as SortablePullRequest)[prop] = value;
				return true;
			}
			return Reflect.set(target, prop, value, receiver);
		},
		has(target, prop) {
			return Reflect.has(decorator, prop) || Reflect.has(target, prop);
		},
	});
}
