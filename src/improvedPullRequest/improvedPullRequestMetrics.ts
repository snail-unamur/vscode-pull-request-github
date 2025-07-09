export type ImprovedPullRequestMetrics = {
    riskValue: number,
    riskCategory: number,
    metrics: Metric[],
}

type Metric = {
	value: number,
	coefficient: number,
}