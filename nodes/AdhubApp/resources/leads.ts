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
	const leadOwnerId = ctx.getNodeParameter('leadOwnerId', itemIndex, '') as string;
	const leadTagIdsParam = ctx.getNodeParameter('leadTagIds', itemIndex, {}) as {
		values?: Array<{ value?: string }>;
	};
	const leadCompany = ctx.getNodeParameter('leadCompany', itemIndex, '') as string;
	const leadJobTitle = ctx.getNodeParameter('leadJobTitle', itemIndex, '') as string;
	const leadServiceInterest = ctx.getNodeParameter('leadServiceInterest', itemIndex, '') as string;
	const leadMonthlyBudget = ctx.getNodeParameter('leadMonthlyBudget', itemIndex, '') as string;
	const leadTimeline = ctx.getNodeParameter('leadTimeline', itemIndex, '') as string;
	const leadInternalNotes = ctx.getNodeParameter('leadInternalNotes', itemIndex, '') as string;
	const leadUpdatedAt = ctx.getNodeParameter('leadUpdatedAt', itemIndex, '') as string;
	const leadIncludeEmpty = ctx.getNodeParameter('leadIncludeEmpty', itemIndex, true) as boolean;
	const leadAdditionalFieldsRaw = ctx.getNodeParameter('leadAdditionalFields', itemIndex, '') as string;
	const leadTimelineLimit = ctx.getNodeParameter('leadTimelineLimit', itemIndex, 0) as number;
	const leadEntriesLimit = ctx.getNodeParameter('leadEntriesLimit', itemIndex, 0) as number;
	const leadListBodyType = ctx.getNodeParameter('leadListBodyType', itemIndex, 'json') as string;
	const leadListPerPage = ctx.getNodeParameter('leadListPerPage', itemIndex, 0) as number;
	const leadListPage = ctx.getNodeParameter('leadListPage', itemIndex, 0) as number;
	const leadListSearch = ctx.getNodeParameter('leadListSearch', itemIndex, '') as string;
	const leadListFilterMode = ctx.getNodeParameter('leadListFilterMode', itemIndex, 'and') as string;
	const leadListFilterRulesParam = ctx.getNodeParameter('leadListFilterRules', itemIndex, {}) as {
		values?: Array<{ field?: string; operator?: string; value?: string }>;
	};
	const leadListSortPreset = ctx.getNodeParameter('leadListSortPreset', itemIndex, '') as string;
	const leadListSortBy = ctx.getNodeParameter('leadListSortBy', itemIndex, '') as string;
	const leadListSortDir = ctx.getNodeParameter('leadListSortDir', itemIndex, '') as string;
	const bulkCreateBodyRaw = ctx.getNodeParameter('bulkCreateBody', itemIndex, '') as string;
	const bulkDeleteBodyRaw = ctx.getNodeParameter('bulkDeleteBody', itemIndex, '') as string;
	const bulkUpdateFieldsBodyRaw = ctx.getNodeParameter('bulkUpdateFieldsBody', itemIndex, '') as string;
	const bulkSyncTagsBodyRaw = ctx.getNodeParameter('bulkSyncTagsBody', itemIndex, '') as string;
	const bulkUpdateCustomFieldsBodyRaw = ctx.getNodeParameter(
		'bulkUpdateCustomFieldsBody',
		itemIndex,
		'',
	) as string;
	const operationsUsingJsonBody = new Set([
		'listLeads',
	]);

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
		case 'bulkCreateLeads':
			method = 'POST';
			endpoint = '/leads/bulk';
			includeBody = true;
			break;
		case 'bulkDeleteLeads':
			method = 'DELETE';
			endpoint = '/leads/bulk';
			includeBody = true;
			break;
		case 'bulkUpdateLeadFields':
			method = 'POST';
			endpoint = '/leads/bulk/fields';
			includeBody = true;
			break;
		case 'bulkSyncLeadTags':
			method = 'POST';
			endpoint = '/leads/bulk/tags';
			includeBody = true;
			break;
		case 'bulkUpdateLeadCustomFields':
			method = 'POST';
			endpoint = '/leads/bulk/custom-fields';
			includeBody = true;
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
			if (leadTimelineLimit) qs.limit = leadTimelineLimit;
			break;
		case 'listLeadEntries':
			method = 'GET';
			endpoint = `/leads/${leadId}/entries`;
			if (leadEntriesLimit) qs.limit = leadEntriesLimit;
			break;
		default:
			throw new Error(`Unsupported operation for Leads ${operation}`);
	}

	let body;
	if (includeBody) {
		if (operation === 'bulkCreateLeads') {
			body = parseJson(bulkCreateBodyRaw, 'Bulk Create Body');
		} else if (operation === 'bulkDeleteLeads') {
			body = parseJson(bulkDeleteBodyRaw, 'Bulk Delete Body');
		} else if (operation === 'bulkUpdateLeadFields') {
			body = parseJson(bulkUpdateFieldsBodyRaw, 'Bulk Update Fields Body');
		} else if (operation === 'bulkSyncLeadTags') {
			body = parseJson(bulkSyncTagsBodyRaw, 'Bulk Sync Tags Body');
		} else if (operation === 'bulkUpdateLeadCustomFields') {
			body = parseJson(bulkUpdateCustomFieldsBodyRaw, 'Bulk Update Custom Fields Body');
		} else if (operationsUsingJsonBody.has(operation)) {
			body = parseJson(bodyRaw, 'Body');
		} else if (leadBodyType === 'form') {
			const formBody: JsonRecord = {};
			if (leadIncludeEmpty || leadFirstName) formBody.first_name = leadFirstName;
			if (leadIncludeEmpty || leadLastName) formBody.last_name = leadLastName;
			if (leadIncludeEmpty || leadEmail) formBody.email = leadEmail;
			if (leadIncludeEmpty || leadMobileNumber) formBody.mobile_number = leadMobileNumber;
			if (leadIncludeEmpty || leadStatusId) formBody.status_id = leadStatusId;
			if (leadIncludeEmpty || leadSourceId) formBody.source_id = leadSourceId;
			if (leadIncludeEmpty || leadOwnerId) formBody.owner_id = leadOwnerId;
			if (leadIncludeEmpty || leadCompany) formBody.company = leadCompany;
			if (leadIncludeEmpty || leadJobTitle) formBody.job_title = leadJobTitle;
			if (leadIncludeEmpty || leadServiceInterest) formBody.service_interest = leadServiceInterest;
			if (leadIncludeEmpty || leadMonthlyBudget) formBody.monthly_budget = leadMonthlyBudget;
			if (leadIncludeEmpty || leadTimeline) formBody.timeline = leadTimeline;
			if (leadIncludeEmpty || leadInternalNotes) formBody.internal_notes = leadInternalNotes;
			if (leadUpdatedAt) formBody.updated_at = leadUpdatedAt;

			if (leadTagIdsParam?.values?.length) {
				const tagIds = leadTagIdsParam.values
					.map((entry) => (entry?.value ?? '').toString().trim())
					.filter((entry) => entry.length > 0);
				if (tagIds.length) formBody.tag_ids = tagIds;
			}

			const extraFields = parseJson(leadAdditionalFieldsRaw, 'Additional Fields');
			for (const [key, value] of Object.entries(extraFields)) {
				if (formBody[key] === undefined) formBody[key] = value as IDataObject[keyof IDataObject];
			}
			body = formBody;
		} else {
			body = parseJson(bodyRaw, 'Body');
		}
	}

	if (operation === 'listLeads') {
		if (leadListBodyType === 'form') {
			const listBody: JsonRecord = {};
			if (leadListPerPage) listBody.per_page = leadListPerPage;
			if (leadListPage) listBody.page = leadListPage;
			if (leadListSearch) listBody.search = leadListSearch;
			const filterRules = (leadListFilterRulesParam?.values ?? [])
				.map((rule) => ({
					field: (rule?.field ?? '').toString().trim(),
					operator: (rule?.operator ?? '').toString().trim(),
					value: (rule?.value ?? '').toString().trim(),
				}))
				.filter((rule) => rule.field.length > 0 && rule.operator.length > 0)
				.map((rule) =>
					rule.value.length > 0
						? rule
						: { field: rule.field, operator: rule.operator },
				);
			if (filterRules.length) {
				listBody.filter = {
					mode: leadListFilterMode || 'and',
					rules: filterRules,
				};
			}
			const sortPresets: Record<string, { sort_by: string; sort_dir: string }> = {
				activity_desc: { sort_by: 'activity', sort_dir: 'desc' },
				activity_asc: { sort_by: 'activity', sort_dir: 'asc' },
				date_desc: { sort_by: 'date', sort_dir: 'desc' },
				date_asc: { sort_by: 'date', sort_dir: 'asc' },
				name_asc: { sort_by: 'name', sort_dir: 'asc' },
				name_desc: { sort_by: 'name', sort_dir: 'desc' },
			};
			if (leadListSortPreset && leadListSortPreset !== 'custom') {
				const preset = sortPresets[leadListSortPreset];
				if (preset) {
					listBody.sort_by = preset.sort_by;
					listBody.sort_dir = preset.sort_dir;
				}
			} else {
				if (leadListSortBy) listBody.sort_by = leadListSortBy;
				if (leadListSortDir) listBody.sort_dir = leadListSortDir;
			}
			body = listBody;
		} else {
			const listBody: JsonRecord = (body ?? {}) as JsonRecord;
			if (leadListPerPage) listBody.per_page = listBody.per_page ?? leadListPerPage;
			if (leadListPage) listBody.page = listBody.page ?? leadListPage;
			if (leadListSearch) listBody.search = listBody.search ?? leadListSearch;
			if (leadListSortBy) listBody.sort_by = listBody.sort_by ?? leadListSortBy;
			if (leadListSortDir) listBody.sort_dir = listBody.sort_dir ?? leadListSortDir;
			body = listBody;
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
