import * as vscode from 'vscode';
import { PR_SETTINGS_NAMESPACE, PULL_REQUEST_SIZE_A, PULL_REQUEST_SIZE_B, PULL_REQUEST_SIZE_C, PULL_REQUEST_SIZE_D } from '../common/settingKeys';
import { PullRequestModel } from '../github/pullRequestModel';
import { PullRequestSizeCategory } from './pullRequestSizeCategory';

export function isMeasurablePullRequest(obj: any): obj is MeasurablePullRequestType {
	return (
		typeof obj?.retrievePrSize === 'function' &&
		typeof obj?.prSizeCategory !== 'undefined'
	);
}

export type MeasurablePullRequestType = PullRequestModel & {
	retrievePrSize(): Promise<void>;
	compareTo(other: any): number;
	prSize: number;
	prSizeCategory: PullRequestSizeCategory;
};

export function measurablePullRequest(
	pr: PullRequestModel
): MeasurablePullRequestType {
	class SorteableImpl {
		private _prSize: number = 0;
		private _prSizeCategory: PullRequestSizeCategory;

		async retrievePrSize() {
			await pr.getFileChangesInfo();
			this._prSize = pr.totalNumberOfChanges;
			this.addSizeCategory();
		}

		private addSizeCategory() {
			// What about perf, what are the impact of retreiving the setting?
			const config = vscode.workspace.getConfiguration(PR_SETTINGS_NAMESPACE);

			const thresholdA = config.get<number>(PULL_REQUEST_SIZE_A)!;
			const thresholdB = config.get<number>(PULL_REQUEST_SIZE_B)!;
			const thresholdC = config.get<number>(PULL_REQUEST_SIZE_C)!;
			const thresholdD = config.get<number>(PULL_REQUEST_SIZE_D)!;

			const size = this._prSize;

			if (size < thresholdA) this._prSizeCategory = PullRequestSizeCategory.A;
			else if (size < thresholdB) this._prSizeCategory = PullRequestSizeCategory.B;
			else if (size < thresholdC) this._prSizeCategory = PullRequestSizeCategory.C;
			else if (size < thresholdD) this._prSizeCategory = PullRequestSizeCategory.D;
			else this._prSizeCategory = PullRequestSizeCategory.E;
		}

		compareTo(other: any): number {
			return this._prSize - other._prSize;
		}

		get prSize() {
			return this._prSize;
		}

		get prSizeCategory() {
			return this._prSizeCategory;
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
