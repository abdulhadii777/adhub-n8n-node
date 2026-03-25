import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { buildRequestOptions, parseJson } from '../helpers';

async function handleLeadSources(
	ctx: IExecuteFunctions,
	itemIndex: number,
	operation: string,
	apiToken: string,
): Promise<INodeExecutionData> {
	const sourceId = ctx.getNodeParameter('sourceId', itemIndex, '') as string;
	const bodyRaw = ctx.getNodeParameter('body', itemIndex, '') as string;

	let method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	let endpoint: string;
	let includeBody = false;

	switch (operation) {
		case 'listLeadSources':
			method = 'GET';
			endpoint = '/lead-sources';
			break;
		case 'createLeadSource':
			method = 'POST';
			endpoint = '/lead-sources';
			includeBody = true;
			break;
		case 'getLeadSource':
			method = 'GET';
			endpoint = `/lead-sources/${sourceId}`;
			break;
		case 'updateLeadSource':
			method = 'PUT';
			endpoint = `/lead-sources/${sourceId}`;
			includeBody = true;
			break;
		case 'deleteLeadSource':
			method = 'DELETE';
			endpoint = `/lead-sources/${sourceId}`;
			break;
		default:
			throw new Error(`Unsupported operation for Lead Sources ${operation}`);
	}

	const options = buildRequestOptions({
		method,
		endpoint,
		apiToken,
		body: includeBody ? parseJson(bodyRaw, 'Body') : undefined,
	});

	const response = await ctx.helpers.request(options);
	return { json: response };
}

export { handleLeadSources };
