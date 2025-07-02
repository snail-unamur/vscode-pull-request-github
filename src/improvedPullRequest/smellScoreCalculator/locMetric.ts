/*---------------------------------------------------------------------------------------------
 *  Copyright (c) dummy copyright. All rights reserved.
 *  Licensed under dummy. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { SmellScoreMetric } from './smellScoreMetric';

export class LocMetric implements SmellScoreMetric {
	calculate(): number {
		return 1;
	}
}