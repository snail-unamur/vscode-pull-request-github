import * as vscode from 'vscode';
import Logger from '../common/logger';
import { formatError } from '../common/utils';
import { ImprovedPullRequestMetrics } from './improvedPullRequestMetrics';

export class ImprovedPullRequestClient {
	private _token: string;
	private _baseUrl: string;

	constructor(token: string, baseUrl: string) {
		this._token = token;
		this._baseUrl = baseUrl;
	}

	async retrieveMetrics(
		repoOwner: string,
		repoName: string,
		prNumber: number
	): Promise<ImprovedPullRequestMetrics | undefined> {
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

			return result.analysis;
		} catch (error) {
			vscode.window.showErrorMessage(
				vscode.l10n.t(
					'Failed to retreive risk informations: {0}',
					formatError(error)
				)
			);
		}

		return undefined;
	}

	async retrieveMultipleMetrics(
		repoOwner: string,
		repoName: string,
		prNumbers: number[]
	): Promise<Map<number, ImprovedPullRequestMetrics>> {
		const prNumberQuery = prNumbers.join(',');
		const apiUrl = `${this._baseUrl}/${repoOwner}/${repoName}/pullRequest?prNumbers=${prNumberQuery}`;
		const result = new Map();

		try {
			const data = await (
				await fetch(apiUrl, {
					headers: {
						Authorization: `Bearer ${this._token}`,
					},
				})
			).json();

			Logger.debug(
				'Pull Requests risk informations retrieved.',
				`${repoOwner}/${repoName}`
			);

			data.forEach((m) => {
				result.set(m.prNumber, m.analysis);
			});

			return result;
		} catch (error) {
			vscode.window.showErrorMessage(
				vscode.l10n.t(
					'Failed to retreive risk informations: {0}',
					formatError(error)
				)
			);
		}
		return result;
	}
}
