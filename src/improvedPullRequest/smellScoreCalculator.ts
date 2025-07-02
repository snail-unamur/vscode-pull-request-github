import { LocMetric } from './smellScoreCalculator/locMetric';
import { SmellScoreMetric } from './smellScoreCalculator/smellScoreMetric';

export class SmellScoreCalculator {
	private _smellMetrics: SmellScoreMetric[] = [];

	constructor() {
		this._smellMetrics.push(new LocMetric());
	}

	calculate(): number {
		return this._smellMetrics.reduce((acc, sm) => acc + sm.calculate(), 0);
	}
}