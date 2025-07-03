import { PullRequestModel } from '../github/pullRequestModel';
import { SmellScoreCalculator } from './smellScoreCalculator';

export class SorteablePullRequests {
	private _sorteablePRs : SorteablePullRequest[] = [];

	constructor(prs: PullRequestModel[]) {
		this._sorteablePRs = prs.map(pr => new SorteablePullRequest(pr));
	}

	public async getSortedPullRequests(): Promise<PullRequestModel[]> {
		await Promise.all(this._sorteablePRs.map(pr => pr.calculateSmellScore()));
		this._sorteablePRs.sort((pr1,pr2) => pr1.compareTo(pr2));
		return this._sorteablePRs.map(pr => pr.pullRequest);
	}
}

class SorteablePullRequest {
	private _pullRequest: PullRequestModel;
	private _smellScore: number;
	private _smellCalculator: SmellScoreCalculator;

	constructor (pullRequest: PullRequestModel) {
		this._pullRequest = pullRequest;
		this._smellCalculator = new SmellScoreCalculator();
	}

	public get pullRequest(): PullRequestModel {
		return this._pullRequest;
	}

	public compareTo(otherSPr: SorteablePullRequest): number {
		return this._smellScore - otherSPr._smellScore;
	}

	public async calculateSmellScore(): Promise<void> {
		await this._pullRequest.getFileChangesInfo();
		this._smellScore = this._pullRequest.totalNumberOfChanges;
		// this._smellScore = this._smellCalculator.calculate();
	}
}