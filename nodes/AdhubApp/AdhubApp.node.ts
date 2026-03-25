import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { handleLeadSources } from './resources/leadSources';
import { handleLeadStatuses } from './resources/leadStatuses';
import { handleLeads } from './resources/leads';

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
		icon: 'file:android-icon-144.svg',
		inputs: ['main'],
		outputs: ['main'],
		usableAsTool: true,
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
				noDataExpression: true,
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
					{ name: 'Create', value: 'createLeadSource', action: 'Lead sources create' },
					{ name: 'Delete', value: 'deleteLeadSource', action: 'Lead sources delete' },
					{ name: 'Get', value: 'getLeadSource', action: 'Lead sources get' },
					{ name: 'List', value: 'listLeadSources', action: 'Lead sources list' },
					{ name: 'Update', value: 'updateLeadSource', action: 'Lead sources update' },
				],
				default: 'listLeadSources',
				noDataExpression: true,
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
					{ name: 'Create', value: 'createLeadStatus', action: 'Lead statuses create' },
					{ name: 'Delete', value: 'deleteLeadStatus', action: 'Lead statuses delete' },
					{ name: 'Get', value: 'getLeadStatus', action: 'Lead statuses get' },
					{ name: 'List', value: 'listLeadStatuses', action: 'Lead statuses list' },
					{ name: 'Update', value: 'updateLeadStatus', action: 'Lead statuses update' },
				],
				default: 'listLeadStatuses',
				noDataExpression: true,
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
					{ name: 'Create', value: 'createLead', action: 'Leads create' },
					{ name: 'Delete', value: 'deleteLead', action: 'Leads delete' },
					{ name: 'Entries', value: 'listLeadEntries', action: 'Leads entries' },
					{ name: 'Get', value: 'getLead', action: 'Leads get' },
					{ name: 'List', value: 'listLeads', action: 'Leads list' },
					{ name: 'List Query Fields', value: 'listLeadQueryFields', action: 'Leads list query fields' },
					{ name: 'Timeline', value: 'getLeadTimeline', action: 'Leads timeline' },
					{ name: 'Update', value: 'updateLead', action: 'Leads update' },
				],
				default: 'listLeads',
				noDataExpression: true,
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
						operation: ['createLeadSource', 'updateLeadSource'],
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
				description: 'Whether to send empty strings for blank fields instead of omitting them',
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
				type: 'color',
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

			const credentials = await this.getCredentials('adhubAppApi', itemIndex);
			const apiToken = credentials.apiToken as string;

			switch (resource) {
				case 'leadSources':
					returnData.push(await handleLeadSources(this, itemIndex, operation, apiToken));
					break;
				case 'leadStatuses':
					returnData.push(await handleLeadStatuses(this, itemIndex, operation, apiToken));
					break;
				case 'leads':
					returnData.push(await handleLeads(this, itemIndex, operation, apiToken));
					break;
				default:
					throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`);
			}
		}

		return [returnData];
	}
}
