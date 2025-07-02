/*---------------------------------------------------------------------------------------------
 *  Copyright (c) dummy copyright. All rights reserved.
 *  Licensed under dummy. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

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