import type { IExecuteFunctions, INodeExecutionData, IDataObject } from 'n8n-workflow';

import { buildRequestOptions, parseJson, JsonRecord } from '../helpers';

async function handleLeads(
	ctx: IExecuteFunctions,
	itemIndex: number,
	operation: string,
	apiToken: string,
): Promise<INodeExecutionData> {
	const leadId = ctx.getNodeParameter('leadId', itemIndex, '') as string;
	const queryContext = ctx.getNodeParameter('queryContext', itemIndex, '') as string;
	const bodyRaw = ctx.getNodeParameter('body', itemIndex, '') as string;
	const leadBodyType = ctx.getNodeParameter('leadBodyType', itemIndex, 'form') as string;
	const leadFirstName = ctx.getNodeParameter('leadFirstName', itemIndex, '') as string;
	const leadLastName = ctx.getNodeParameter('leadLastName', itemIndex, '') as string;
	const leadEmail = ctx.getNodeParameter('leadEmail', itemIndex, '') as string;
	const leadMobileNumber = ctx.getNodeParameter('leadMobileNumber', itemIndex, '') as string;
	const leadStatusId = ctx.getNodeParameter('leadStatusId', itemIndex, '') as string;
	const leadSourceId = ctx.getNodeParameter('leadSourceId', itemIndex, '') as string;
	const leadIncludeEmpty = ctx.getNodeParameter('leadIncludeEmpty', itemIndex, false) as boolean;
	const leadAdditionalFieldsRaw = ctx.getNodeParameter('leadAdditionalFields', itemIndex, '') as string;

	let method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	let endpoint: string;
	let includeBody = false;
	const qs: JsonRecord = {};

	switch (operation) {
		case 'listLeadQueryFields':
			method = 'GET';
			endpoint = '/query-builder/fields';
			qs.context = queryContext;
			break;
		case 'listLeads':
			method = 'POST';
			endpoint = '/leads/list';
			includeBody = true;
			break;
		case 'createLead':
			method = 'POST';
			endpoint = '/leads';
			includeBody = true;
			break;
		case 'getLead':
			method = 'GET';
			endpoint = `/leads/${leadId}`;
			break;
		case 'updateLead':
			method = 'PUT';
			endpoint = `/leads/${leadId}`;
			includeBody = true;
			break;
		case 'deleteLead':
			method = 'DELETE';
			endpoint = `/leads/${leadId}`;
			break;
		case 'getLeadTimeline':
			method = 'GET';
			endpoint = `/leads/${leadId}/timeline`;
			break;
		case 'listLeadEntries':
			method = 'GET';
			endpoint = `/leads/${leadId}/entries`;
			break;
		default:
			throw new Error(`Unsupported operation for Leads ${operation}`);
	}

	let body;
	if (includeBody) {
		if (leadBodyType === 'form') {
			const formBody: JsonRecord = {};
			if (leadIncludeEmpty || leadFirstName) formBody.first_name = leadFirstName;
			if (leadIncludeEmpty || leadLastName) formBody.last_name = leadLastName;
			if (leadIncludeEmpty || leadEmail) formBody.email = leadEmail;
			if (leadIncludeEmpty || leadMobileNumber) formBody.mobile_number = leadMobileNumber;
			if (leadIncludeEmpty || leadStatusId) formBody.status_id = leadStatusId;
			if (leadIncludeEmpty || leadSourceId) formBody.source_id = leadSourceId;

			const extraFields = parseJson(leadAdditionalFieldsRaw, 'Additional Fields');
			for (const [key, value] of Object.entries(extraFields)) {
				if (formBody[key] === undefined) formBody[key] = value as IDataObject[keyof IDataObject];
			}
			body = formBody;
		} else {
			body = parseJson(bodyRaw, 'Body');
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

export { handleLeads };
