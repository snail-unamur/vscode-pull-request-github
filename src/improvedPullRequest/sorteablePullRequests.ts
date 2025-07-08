import { PullRequestModel } from '../github/pullRequestModel';
import { ImprovedPullRequestClient } from './improvedPullRequestClient';
import { measurablePullRequest, MeasurablePullRequestType } from './measureablePullRequest';

export class SorteablePullRequests {
	private _sorteablePRs: MeasurablePullRequestType[] = [];

	constructor(prs: PullRequestModel[], improvedPRClient: ImprovedPullRequestClient) {
		this._sorteablePRs = prs.map((pr) => measurablePullRequest(pr, improvedPRClient));
	}

	public async getSortedPullRequests(): Promise<PullRequestModel[]> {
		await Promise.all(
			this._sorteablePRs.map((pr) => pr.retrieveRiskScore())
		);
		this._sorteablePRs.sort((pr1, pr2) => pr1.compareTo(pr2));
		return this._sorteablePRs;
	}
}