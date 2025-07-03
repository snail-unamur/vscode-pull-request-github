import { PullRequestModel } from '../github/pullRequestModel';

export class SorteablePullRequests {
	private _sorteablePRs: SorteablePullRequestType[] = [];

	constructor(prs: PullRequestModel[]) {
		this._sorteablePRs = prs.map((pr) => makeSorteablePullRequest(pr));
	}

	public async getSortedPullRequests(): Promise<PullRequestModel[]> {
		await Promise.all(
			this._sorteablePRs.map((pr) => pr.retrievePrSize())
		);
		this._sorteablePRs.sort((pr1, pr2) => pr1.compareTo(pr2));
		return this._sorteablePRs;
	}
}

enum PrSizeCategory {
	A = 'A',
	B = 'B',
	C = 'C',
	D = 'D',
	E = 'E',
}

type SorteablePullRequestType = PullRequestModel & {
	retrievePrSize(): Promise<void>;
	compareTo(other: any): number;
	prSize: number;
	prSizeCategory: PrSizeCategory;
};

export function isSorteablePR(obj: any): obj is SorteablePullRequestType {
	return (
		typeof obj?.retrievePrSize === 'function' &&
		typeof obj?.prSizeCategory !== 'undefined'
	);
}

function makeSorteablePullRequest(
	pr: PullRequestModel
): SorteablePullRequestType {
	class SorteableImpl {
		private _prSize: number = 0;
		private _prSizeCategory: PrSizeCategory;

		async retrievePrSize() {
			await pr.getFileChangesInfo();
			this._prSize = pr.totalNumberOfChanges;
			this.addSizeCategory();
		}

		private addSizeCategory() {
			const size = this._prSize;
			if (size < 10) this._prSizeCategory = PrSizeCategory.A;
			else if (size < 50) this._prSizeCategory = PrSizeCategory.B;
			else if (size < 200) this._prSizeCategory = PrSizeCategory.C;
			else if (size < 500) this._prSizeCategory = PrSizeCategory.D;
			else this._prSizeCategory = PrSizeCategory.E;
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

	return new Proxy(pr as SorteablePullRequestType, {
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
