export type ImprovedPullRequestMetrics = {
    riskValue: number,
    radarMetrics: Metric[],
    defaultMetrics: Metric[],
}

export type Metric = {
    id: string
    name: string,
    fullName: string,
    description: string,
    radarValue: number,
	value: number,
}