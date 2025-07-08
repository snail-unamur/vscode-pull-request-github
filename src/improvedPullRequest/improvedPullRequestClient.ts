import * as vscode from 'vscode';
import Logger from '../common/logger';
import { formatError } from '../common/utils';

export class ImprovedPullRequestClient {
	private _token: string;
	private _baseUrl: string;

	constructor(token: string, baseUrl: string) {
		this._token = token;
		this._baseUrl = baseUrl;
	}

	async retrieveRiskScore(
		repoOwner: string,
		repoName: string,
		prNumber: number
	) {
		const apiUrl = `${this._baseUrl}/${repoOwner}/${repoName}/pullRequest/${prNumber}`;

		try {
			const result = await (
				await fetch(apiUrl, {
					headers: {
						Authorization: `Bearer ${this._token}`,
					},
				})
			).json();

			Logger.debug(
				'Pull Request risk information retrieved.',
				prNumber.toString()
			);

			return result.analysis.risk_score.score;
		} catch (error) {
			vscode.window.showErrorMessage(
				vscode.l10n.t(
					'Failed to retreive risk informations: {0}',
					formatError(error)
				)
			);
		}
	}
}
