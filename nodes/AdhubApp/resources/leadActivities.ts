import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { buildRequestOptions, parseJson, JsonRecord } from '../helpers';

async function handleLeadActivities(
	ctx: IExecuteFunctions,
	itemIndex: number,
	operation: string,
	apiToken: string,
): Promise<INodeExecutionData> {
	const leadId = ctx.getNodeParameter('leadId', itemIndex, '') as string;
	const activityId = ctx.getNodeParameter('activityId', itemIndex, '') as string;
	const activityBodyRaw = ctx.getNodeParameter('activityBody', itemIndex, '') as string;
	const activityLimit = ctx.getNodeParameter('activityLimit', itemIndex, 0) as number;
	const activityBodyType = ctx.getNodeParameter('activityBodyType', itemIndex, 'form') as string;
	const activityType = ctx.getNodeParameter('activityType', itemIndex, '') as string;
	const activityBodyText = ctx.getNodeParameter('activityBodyText', itemIndex, '') as string;
	const activityOccurredAt = ctx.getNodeParameter('activityOccurredAt', itemIndex, '') as string;

	let method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	let endpoint: string;
	let includeBody = false;
	const qs: JsonRecord = {};

	switch (operation) {
		case 'listLeadActivityTypes':
			method = 'GET';
			endpoint = '/leads/activity-types';
			break;
		case 'listLeadActivities':
			method = 'GET';
			endpoint = `/leads/${leadId}/activities`;
			if (activityLimit) qs.limit = activityLimit;
			break;
		case 'createLeadActivity':
			method = 'POST';
			endpoint = `/leads/${leadId}/activities`;
			includeBody = true;
			break;
		case 'getLeadActivity':
			method = 'GET';
			endpoint = `/leads/${leadId}/activities/${activityId}`;
			break;
		case 'updateLeadActivity':
			method = 'PUT';
			endpoint = `/leads/${leadId}/activities/${activityId}`;
			includeBody = true;
			break;
		case 'deleteLeadActivity':
			method = 'DELETE';
			endpoint = `/leads/${leadId}/activities/${activityId}`;
			break;
		default:
			throw new Error(`Unsupported operation for Lead Activities ${operation}`);
	}

	let body;
	if (includeBody) {
		if (activityBodyType === 'form') {
			const formBody: JsonRecord = {};
			if (activityType) formBody.type = activityType;
			if (activityBodyText) formBody.body = activityBodyText;
			if (activityOccurredAt) formBody.occurred_at = activityOccurredAt;
			body = formBody;
		} else {
			body = parseJson(activityBodyRaw, 'Body');
		}
	}

	const options = buildRequestOptions({
		method,
		endpoint,
		apiToken,
		qs,
		body,
	});

	const response = await ctx.helpers.request(options);
	return { json: response };
}

export { handleLeadActivities };
