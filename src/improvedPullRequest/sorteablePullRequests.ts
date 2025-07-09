import { PullRequestModel } from '../github/pullRequestModel';
import { ImprovedPullRequestClient } from './improvedPullRequestClient';
import {
	improvedPullRequest,
	ImprovedPullRequestType,
} from './improvedPullRequest';

export class SorteablePullRequests {
	private _sorteablePRs: ImprovedPullRequestType[] = [];
	private _improvedPRClient: ImprovedPullRequestClient;

	constructor(
		prs: PullRequestModel[],
		improvedPRClient: ImprovedPullRequestClient
	) {
		this._sorteablePRs = prs.map((pr) =>
			improvedPullRequest(pr, improvedPRClient)
		);
		this._improvedPRClient = improvedPRClient;
	}

	public async getSortedPullRequests(): Promise<PullRequestModel[]> {
		if (this._sorteablePRs.length === 0) {
			return [];
		}

		await this.associateRiskScore();

		this._sorteablePRs.sort((a, b) => a.compareTo(b));

		return this._sorteablePRs;
	}

	private async associateRiskScore() {
		const [firstPR] = this._sorteablePRs;
		const prNumbers = this._sorteablePRs.map((pr) => pr.number);
		const { owner: repoOwner, repositoryName: repoName } = firstPR.remote;

		const metricsPrMap =
			await this._improvedPRClient.retrieveMultipleMetrics(
				repoOwner,
				repoName,
				prNumbers
			);

		this._sorteablePRs.forEach((pr) => {
			const metrics = metricsPrMap.get(pr.number);

			if (metrics) {
				pr.metrics = metrics;
			}
		});
	}
}
