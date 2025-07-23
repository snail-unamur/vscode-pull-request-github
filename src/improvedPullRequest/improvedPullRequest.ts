import { PullRequestModel } from '../github/pullRequestModel';
import { ImprovedPullRequestClient } from './improvedPullRequestClient';
import { ImprovedPullRequestMetrics } from './improvedPullRequestMetrics';

export function isImprovedPullRequest(obj: any): obj is ImprovedPullRequestType {
	return (
		typeof obj?.retrieveMetrics === 'function'
	);
}

export function hasMetrics(pr: ImprovedPullRequestType): boolean {
	return pr.metrics != undefined;
}

export type ImprovedPullRequestType = PullRequestModel & {
	retrieveMetrics(): Promise<void>;
	compareTo(other: any): number;
	metrics: ImprovedPullRequestMetrics;
	riskCategory: string;
	risk: number;
};

export function improvedPullRequest(
	pr: PullRequestModel,
	improvedPRClient: ImprovedPullRequestClient
): ImprovedPullRequestType {
	class SorteableImpl {
		private _metrics: ImprovedPullRequestMetrics;

		get metrics() {
			return this._metrics;
		}

		get risk() {
			return this._metrics?.riskValue;
		}

		set metrics(metrics: ImprovedPullRequestMetrics) {
			this._metrics = metrics;
		}

		get riskCategory() {
			return this._metrics?.riskCategory;
		}

		compareTo(other: any): number {
			return this.risk - other.risk;
		}

		async retrieveMetrics() {
			const repoOwner = pr.remote.owner;
			const repoName = pr.remote.repositoryName;
			const prNumber = pr.number;

			const result = await improvedPRClient.retrieveMetrics(repoOwner, repoName, prNumber);
			if (result) {
				this._metrics = result;
			}
		}
	}

	const decorator = new SorteableImpl();

	return new Proxy(pr as ImprovedPullRequestType, {
		get(target, prop, receiver) {
			if (prop in decorator) return (decorator as any)[prop];
			return Reflect.get(target, prop, receiver);
		},
		set(target, prop, value, receiver) {
			if (prop in decorator) {
				(decorator as any)[prop] = value;
				return true;
			}
			return Reflect.set(target, prop, value, receiver);
		},
		has(target, prop) {
			return prop in decorator || prop in target;
		},
	});
}
