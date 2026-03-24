import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
	IHttpRequestMethods,
	IDataObject,
} from 'n8n-workflow';

type JsonRecord = IDataObject;

function parseJson(value: string | undefined, fieldName: string): JsonRecord {
	if (!value) return {};
	try {
		const parsed = JSON.parse(value);
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as JsonRecord;
		throw new Error(`${fieldName} must be a JSON object`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Invalid JSON in "${fieldName}": ${message}`);
	}
}

const BASE_URL = 'https://adhub-main-d1fcap.laravel.cloud/api/v1';

export class AdhubApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Adhub App',
		name: 'adhubApp',
		group: ['transform'],
		version: 1,
		description: 'Manage Adhub leads, sources, and statuses',
		defaults: {
			name: 'Adhub App',
		},
		icon: 'file:android-icon-144.png',
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'adhubAppApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{ name: 'Lead Source', value: 'leadSources' },
					{ name: 'Lead Status', value: 'leadStatuses' },
					{ name: 'Lead', value: 'leads' },
				],
				default: 'leadSources',
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['leadSources'],
					},
				},
				options: [
					{ name: 'List', value: 'listLeadSources', action: 'Lead Sources: List' },
					{ name: 'Create', value: 'createLeadSource', action: 'Lead Sources: Create' },
					{ name: 'Get', value: 'getLeadSource', action: 'Lead Sources: Get' },
					{ name: 'Update', value: 'updateLeadSource', action: 'Lead Sources: Update' },
					{ name: 'Delete', value: 'deleteLeadSource', action: 'Lead Sources: Delete' },
				],
				default: 'listLeadSources',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['leadStatuses'],
					},
				},
				options: [
					{ name: 'List', value: 'listLeadStatuses', action: 'Lead Statuses: List' },
					{ name: 'Create', value: 'createLeadStatus', action: 'Lead Statuses: Create' },
					{ name: 'Get', value: 'getLeadStatus', action: 'Lead Statuses: Get' },
					{ name: 'Update', value: 'updateLeadStatus', action: 'Lead Statuses: Update' },
					{ name: 'Delete', value: 'deleteLeadStatus', action: 'Lead Statuses: Delete' },
				],
				default: 'listLeadStatuses',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				required: true,
				displayOptions: {
					show: {
						resource: ['leads'],
					},
				},
				options: [
					{ name: 'List', value: 'listLeads', action: 'Leads: List' },
					{ name: 'Create', value: 'createLead', action: 'Leads: Create' },
					{ name: 'Get', value: 'getLead', action: 'Leads: Get' },
					{ name: 'Update', value: 'updateLead', action: 'Leads: Update' },
					{ name: 'Delete', value: 'deleteLead', action: 'Leads: Delete' },
					{ name: 'List Query Fields', value: 'listLeadQueryFields', action: 'Leads: Query Fields' },
					{ name: 'Timeline', value: 'getLeadTimeline', action: 'Leads: Timeline' },
					{ name: 'Entries', value: 'listLeadEntries', action: 'Leads: Entries' },
				],
				default: 'listLeads',
			},
			{
				displayName: 'Source ID',
				name: 'sourceId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['leadSources'],
						operation: ['getLeadSource', 'updateLeadSource', 'deleteLeadSource'],
					},
				},
				description: 'Lead source identifier',
			},
			{
				displayName: 'Status ID',
				name: 'statusId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['leadStatuses'],
						operation: ['getLeadStatus', 'updateLeadStatus', 'deleteLeadStatus'],
					},
				},
				description: 'Lead status identifier',
			},
			{
				displayName: 'Lead ID',
				name: 'leadId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: [
							'getLead',
							'updateLead',
							'deleteLead',
							'getLeadTimeline',
							'listLeadEntries',
						],
					},
				},
				description: 'Lead identifier',
			},
			{
				displayName: 'Context',
				name: 'queryContext',
				type: 'string',
				default: 'lead.list',
				required: true,
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['listLeadQueryFields'],
					},
				},
				description: 'Context key like lead.list, lead.assignment, task.list',
			},
			{
				displayName: 'Body Type',
				name: 'leadBodyType',
				type: 'options',
				options: [
					{ name: 'Form', value: 'form' },
					{ name: 'JSON', value: 'json' },
				],
				default: 'form',
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['createLead', 'updateLead'],
					},
				},
			},
			{
				displayName: 'Body (JSON)',
				name: 'body',
				type: 'string',
				default: '',
				placeholder: '{"name":"Example"}',
				description: 'Request body as a JSON object',
				displayOptions: {
					show: {
						resource: ['leadSources'],
						operation: [
							'createLeadSource',
							'updateLeadSource',
						],
					},
				},
			},
			{
				displayName: 'Body (JSON)',
				name: 'body',
				type: 'string',
				default: '',
				placeholder: '{"per_page":50,"page":1}',
				description: 'Request body as a JSON object',
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['listLeads'],
					},
				},
			},
			{
				displayName: 'Body (JSON)',
				name: 'body',
				type: 'string',
				default: '',
				placeholder: '{"first_name":"Jane"}',
				description: 'Request body as a JSON object',
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['createLead', 'updateLead'],
						leadBodyType: ['json'],
					},
				},
			},
			{
				displayName: 'Body Type',
				name: 'statusBodyType',
				type: 'options',
				options: [
					{ name: 'Form', value: 'form' },
					{ name: 'JSON', value: 'json' },
				],
				default: 'form',
				displayOptions: {
					show: {
						resource: ['leadStatuses'],
						operation: ['createLeadStatus', 'updateLeadStatus'],
					},
				},
			},
			{
				displayName: 'Body (JSON)',
				name: 'statusBody',
				type: 'string',
				default: '',
				placeholder: '{"name":"Example"}',
				description: 'Request body as a JSON object',
				displayOptions: {
					show: {
						resource: ['leadStatuses'],
						operation: ['createLeadStatus', 'updateLeadStatus'],
						statusBodyType: ['json'],
					},
				},
			},
			{
				displayName: 'First Name',
				name: 'leadFirstName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['createLead', 'updateLead'],
						leadBodyType: ['form'],
					},
				},
			},
			{
				displayName: 'Last Name',
				name: 'leadLastName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['createLead', 'updateLead'],
						leadBodyType: ['form'],
					},
				},
			},
			{
				displayName: 'Email',
				name: 'leadEmail',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['createLead', 'updateLead'],
						leadBodyType: ['form'],
					},
				},
			},
			{
				displayName: 'Mobile Number',
				name: 'leadMobileNumber',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['createLead', 'updateLead'],
						leadBodyType: ['form'],
					},
				},
			},
			{
				displayName: 'Status ID',
				name: 'leadStatusId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['createLead', 'updateLead'],
						leadBodyType: ['form'],
					},
				},
			},
			{
				displayName: 'Source ID',
				name: 'leadSourceId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['createLead', 'updateLead'],
						leadBodyType: ['form'],
					},
				},
			},
			{
				displayName: 'Include Empty Fields',
				name: 'leadIncludeEmpty',
				type: 'boolean',
				default: true,
				description: 'Send empty strings for blank fields instead of omitting them',
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['createLead', 'updateLead'],
						leadBodyType: ['form'],
					},
				},
			},
			{
				displayName: 'Additional Fields (JSON)',
				name: 'leadAdditionalFields',
				type: 'string',
				default: '',
				placeholder: '{"company":"Acme","job_title":"Owner"}',
				description: 'Optional extra fields as a JSON object',
				displayOptions: {
					show: {
						resource: ['leads'],
						operation: ['createLead', 'updateLead'],
						leadBodyType: ['form'],
					},
				},
			},
			{
				displayName: 'Name',
				name: 'statusName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['leadStatuses'],
						operation: ['createLeadStatus', 'updateLeadStatus'],
						statusBodyType: ['form'],
					},
				},
			},
			{
				displayName: 'Color',
				name: 'statusColor',
				type: 'string',
				default: '',
				placeholder: '#22c55e',
				displayOptions: {
					show: {
						resource: ['leadStatuses'],
						operation: ['createLeadStatus', 'updateLeadStatus'],
						statusBodyType: ['form'],
					},
				},
				description: 'Hex color like #22c55e',
			},
			{
				displayName: 'Is Protected',
				name: 'statusIsProtected',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['leadStatuses'],
						operation: ['createLeadStatus', 'updateLeadStatus'],
						statusBodyType: ['form'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const resource = this.getNodeParameter('resource', itemIndex) as string;
			const operation = this.getNodeParameter('operation', itemIndex) as string;
			const sourceId = this.getNodeParameter('sourceId', itemIndex, '') as string;
			const bodyRaw = this.getNodeParameter('body', itemIndex, '') as string;
			const statusId = this.getNodeParameter('statusId', itemIndex, '') as string;
			const leadId = this.getNodeParameter('leadId', itemIndex, '') as string;
			const queryContext = this.getNodeParameter('queryContext', itemIndex, '') as string;
			const statusBodyType = this.getNodeParameter('statusBodyType', itemIndex, 'form') as string;
			const statusName = this.getNodeParameter('statusName', itemIndex, '') as string;
			const statusColor = this.getNodeParameter('statusColor', itemIndex, '') as string;
			const statusIsProtected = this.getNodeParameter('statusIsProtected', itemIndex, false) as boolean;
			const statusBodyRaw = this.getNodeParameter('statusBody', itemIndex, '') as string;
			const leadBodyType = this.getNodeParameter('leadBodyType', itemIndex, 'form') as string;
			const leadFirstName = this.getNodeParameter('leadFirstName', itemIndex, '') as string;
			const leadLastName = this.getNodeParameter('leadLastName', itemIndex, '') as string;
			const leadEmail = this.getNodeParameter('leadEmail', itemIndex, '') as string;
			const leadMobileNumber = this.getNodeParameter('leadMobileNumber', itemIndex, '') as string;
			const leadStatusId = this.getNodeParameter('leadStatusId', itemIndex, '') as string;
			const leadSourceId = this.getNodeParameter('leadSourceId', itemIndex, '') as string;
			const leadIncludeEmpty = this.getNodeParameter('leadIncludeEmpty', itemIndex, false) as boolean;
			const leadAdditionalFieldsRaw = this.getNodeParameter(
				'leadAdditionalFields',
				itemIndex,
				'',
			) as string;

			const credentials = await this.getCredentials('adhubAppApi', itemIndex);
			const apiToken = credentials.apiToken as string;

			let httpMethod: IHttpRequestMethods;
			let endpointPath: string;
			let includeBody = false;
			const qs: JsonRecord = {};

			if (resource === 'leadSources') {
				switch (operation) {
					case 'listLeadSources':
						httpMethod = 'GET';
						endpointPath = '/lead-sources';
						break;
					case 'createLeadSource':
						httpMethod = 'POST';
						endpointPath = '/lead-sources';
						includeBody = true;
						break;
					case 'getLeadSource':
						httpMethod = 'GET';
						endpointPath = `/lead-sources/${sourceId}`;
						break;
					case 'updateLeadSource':
						httpMethod = 'PUT';
						endpointPath = `/lead-sources/${sourceId}`;
						includeBody = true;
						break;
					case 'deleteLeadSource':
						httpMethod = 'DELETE';
						endpointPath = `/lead-sources/${sourceId}`;
						break;
					default:
						throw new Error(`Unsupported operation for Lead Sources: ${operation}`);
				}
			} else if (resource === 'leadStatuses') {
				switch (operation) {
					case 'listLeadStatuses':
						httpMethod = 'GET';
						endpointPath = '/lead-statuses';
						break;
					case 'createLeadStatus':
						httpMethod = 'POST';
						endpointPath = '/lead-statuses';
						includeBody = true;
						break;
					case 'getLeadStatus':
						httpMethod = 'GET';
						endpointPath = `/lead-statuses/${statusId}`;
						break;
					case 'updateLeadStatus':
						httpMethod = 'PUT';
						endpointPath = `/lead-statuses/${statusId}`;
						includeBody = true;
						break;
					case 'deleteLeadStatus':
						httpMethod = 'DELETE';
						endpointPath = `/lead-statuses/${statusId}`;
						break;
					default:
						throw new Error(`Unsupported operation for Lead Statuses: ${operation}`);
				}
			} else if (resource === 'leads') {
				switch (operation) {
					case 'listLeadQueryFields':
						httpMethod = 'GET';
						endpointPath = '/query-builder/fields';
						qs.context = queryContext;
						break;
					case 'listLeads':
						httpMethod = 'POST';
						endpointPath = '/leads/list';
						includeBody = true;
						break;
					case 'createLead':
						httpMethod = 'POST';
						endpointPath = '/leads';
						includeBody = true;
						break;
					case 'getLead':
						httpMethod = 'GET';
						endpointPath = `/leads/${leadId}`;
						break;
					case 'updateLead':
						httpMethod = 'PUT';
						endpointPath = `/leads/${leadId}`;
						includeBody = true;
						break;
					case 'deleteLead':
						httpMethod = 'DELETE';
						endpointPath = `/leads/${leadId}`;
						break;
					case 'getLeadTimeline':
						httpMethod = 'GET';
						endpointPath = `/leads/${leadId}/timeline`;
						break;
					case 'listLeadEntries':
						httpMethod = 'GET';
						endpointPath = `/leads/${leadId}/entries`;
						break;
					default:
						throw new Error(`Unsupported operation for Leads: ${operation}`);
				}
			} else {
				throw new Error(`Unsupported resource: ${resource}`);
			}

			const headers: JsonRecord = {};
			headers.Authorization = `Bearer ${apiToken}`;
			headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';

			const options: IHttpRequestOptions = {
				method: httpMethod,
				url: `${BASE_URL}${endpointPath}`,
				qs,
				headers,
				json: true,
			};

			if (includeBody) {
				if (resource === 'leadStatuses' && statusBodyType === 'form') {
					const body: JsonRecord = { name: statusName };
					if (statusColor) body.color = statusColor;
					body.is_protected = statusIsProtected;
					options.body = body;
				} else if (resource === 'leadStatuses') {
					options.body = parseJson(statusBodyRaw, 'Body');
				} else if (resource === 'leads' && leadBodyType === 'form') {
					const body: JsonRecord = {};
					if (leadIncludeEmpty || leadFirstName) body.first_name = leadFirstName;
					if (leadIncludeEmpty || leadLastName) body.last_name = leadLastName;
					if (leadIncludeEmpty || leadEmail) body.email = leadEmail;
					if (leadIncludeEmpty || leadMobileNumber) body.mobile_number = leadMobileNumber;
					if (leadIncludeEmpty || leadStatusId) body.status_id = leadStatusId;
					if (leadIncludeEmpty || leadSourceId) body.source_id = leadSourceId;
					const extraFields = parseJson(leadAdditionalFieldsRaw, 'Additional Fields');
					for (const [key, value] of Object.entries(extraFields)) {
						if (body[key] === undefined) body[key] = value as IDataObject[keyof IDataObject];
					}
					options.body = body;
				} else {
					options.body = parseJson(bodyRaw, 'Body');
				}
			}

			const response = await this.helpers.request(options);
			returnData.push({ json: response });
		}

		return [returnData];
	}
}
