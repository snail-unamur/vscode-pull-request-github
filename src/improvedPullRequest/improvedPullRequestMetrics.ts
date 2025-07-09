export type ImprovedPullRequestMetrics = {
    riskValue: number,
    riskCategory: string,
    metrics: Metric[],
}

export type Metric = {
    name: string,
	value: number,
	coefficient: number,
}