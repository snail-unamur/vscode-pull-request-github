import { PullRequestModel } from '../github/pullRequestModel';
import { SmellScoreCalculator } from './smellScoreCalculator';

export class SorteablePullRequest {
	private _pullRequest: PullRequestModel;
	private _smellScore: number;
	private _smellCalculator: SmellScoreCalculator;

	constructor (pullRequest: PullRequestModel) {
		this._pullRequest = pullRequest;
		this._smellCalculator = new SmellScoreCalculator();
		this.calculateSmellScore();
	}

	public get pullRequest(): PullRequestModel {
		return this._pullRequest;
	}

	public compareTo(otherSPr: SorteablePullRequest) : number {
		return this._smellScore - otherSPr._smellScore;
	}

	private calculateSmellScore() {
		this._smellScore = this._smellCalculator.calculate();
	}
}