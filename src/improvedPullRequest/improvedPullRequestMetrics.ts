export type ImprovedPullRequestMetrics = {
    riskCategory: string,
    riskValue: number,
    radarMetrics: Metric[],
}

export type Metric = {
    id: string
    name: string,
	radarValue: number,
}