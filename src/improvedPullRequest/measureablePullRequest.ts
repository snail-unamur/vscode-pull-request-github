import * as vscode from 'vscode';
import Logger from '../common/logger';
import { PR_SETTINGS_NAMESPACE, PULL_REQUEST_RISK_A, PULL_REQUEST_RISK_B, PULL_REQUEST_RISK_C, PULL_REQUEST_RISK_D } from '../common/settingKeys';
import { formatError } from '../common/utils';
import { PullRequestModel } from '../github/pullRequestModel';
import { PullRequestRiskCategory } from './pullRequestRiskCategory';

export function isMeasurablePullRequest(obj: any): obj is MeasurablePullRequestType {
	return (
		typeof obj?.retrieveRiskScore === 'function' &&
		typeof obj?.riskCategory !== 'undefined'
	);
}

export type MeasurablePullRequestType = PullRequestModel & {
	retrieveRiskScore(): Promise<void>;
	compareTo(other: any): number;
	risk: number;
	riskCategory: PullRequestRiskCategory;
};

export function measurablePullRequest(
	pr: PullRequestModel
): MeasurablePullRequestType {
	class SorteableImpl {
		private _riskScore: number;
		private _riskCategory: PullRequestRiskCategory;

		get risk() {
			return this._riskScore;
		}

		get riskCategory() {
			return this._riskCategory;
		}

		compareTo(other: any): number {
			return this._riskScore - other._riskScore;
		}

		async retrieveRiskScore() {
			const repoId = pr.id;
			const prNumber = pr.number;

			const apiUrl = `http://localhost:6002/api/repositories/${repoId}/pullRequests/${prNumber}`;

			try {
				const result = await (await fetch(apiUrl)).json();

				Logger.debug('Pull Request risk information retrieved.', repoId.toString());

				this._riskScore = result.analysis.risk_score.score;
				this.addSizeCategory();
			} catch (error) {
				vscode.window.showErrorMessage(vscode.l10n.t('Failed to retreive risk informations: {0}', formatError(error)));
			}
		}

		private addSizeCategory() {
			// What about perf, what are the impact of retreiving the setting?
			const config = vscode.workspace.getConfiguration(PR_SETTINGS_NAMESPACE);

			const thresholdA = config.get<number>(PULL_REQUEST_RISK_A)!;
			const thresholdB = config.get<number>(PULL_REQUEST_RISK_B)!;
			const thresholdC = config.get<number>(PULL_REQUEST_RISK_C)!;
			const thresholdD = config.get<number>(PULL_REQUEST_RISK_D)!;

			const size = this._riskScore;

			if (size < thresholdA) this._riskCategory = PullRequestRiskCategory.A;
			else if (size < thresholdB) this._riskCategory = PullRequestRiskCategory.B;
			else if (size < thresholdC) this._riskCategory = PullRequestRiskCategory.C;
			else if (size < thresholdD) this._riskCategory = PullRequestRiskCategory.D;
			else this._riskCategory = PullRequestRiskCategory.E;
		}
	}

	const decorator = new SorteableImpl();

	return new Proxy(pr as MeasurablePullRequestType, {
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
