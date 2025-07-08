import { PullRequestModel } from '../github/pullRequestModel';
import { ImprovedPullRequestClient } from './improvedPullRequestClient';
import {
	measurablePullRequest,
	MeasurablePullRequestType,
} from './measureablePullRequest';

export class SorteablePullRequests {
	private _sorteablePRs: MeasurablePullRequestType[] = [];
	private _improvedPRClient: ImprovedPullRequestClient;

	constructor(
		prs: PullRequestModel[],
		improvedPRClient: ImprovedPullRequestClient
	) {
		this._sorteablePRs = prs.map((pr) =>
			measurablePullRequest(pr, improvedPRClient)
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

		const prScores = await this._improvedPRClient.retrieveMultipleRiskScore(
			repoOwner,
			repoName,
			prNumbers
		);

		const scoreMap = new Map(
			prScores.map((pr) => [pr.number, pr.analysis.risk_score.score])
		);

		this._sorteablePRs.forEach((pr) => {
			const score = scoreMap.get(pr.number);
			if (score !== undefined) {
				pr.risk = score;
			}
		});
	}
}
