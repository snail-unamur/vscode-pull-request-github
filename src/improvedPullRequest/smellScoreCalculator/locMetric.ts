import { SmellScoreMetric } from './smellScoreMetric';

export class LocMetric implements SmellScoreMetric {
	calculate(): number {
		return 1;
	}
}