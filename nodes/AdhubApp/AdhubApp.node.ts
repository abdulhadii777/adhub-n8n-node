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

function trimTrailingSlash(value: string): string {
	return value.replace(/\/+$/, '');
}

export class AdhubApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Adhub App',
		name: 'adhubApp',
		group: ['transform'],
		version: 1,
		description: 'Send data to an Adhub endpoint',
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
				displayName: 'Endpoint Path',
				name: 'endpointPath',
				type: 'string',
				default: '/v1/endpoint',
				placeholder: '/v1/endpoint',
				required: true,
				description: 'Path appended to Base URL',
			},
			{
				displayName: 'HTTP Method',
				name: 'httpMethod',
				type: 'options',
				default: 'POST',
				options: [
					{ name: 'GET', value: 'GET' },
					{ name: 'POST', value: 'POST' },
					{ name: 'PUT', value: 'PUT' },
					{ name: 'PATCH', value: 'PATCH' },
					{ name: 'DELETE', value: 'DELETE' },
				],
			},
			{
				displayName: 'Query Parameters (JSON)',
				name: 'queryParams',
				type: 'string',
				default: '',
				placeholder: '{"limit": 10}',
				description: 'Optional query parameters as a JSON object',
			},
			{
				displayName: 'Headers (JSON)',
				name: 'headers',
				type: 'string',
				default: '',
				placeholder: '{"X-Custom": "value"}',
				description: 'Optional headers as a JSON object',
			},
			{
				displayName: 'Send Body',
				name: 'sendBody',
				type: 'boolean',
				default: true,
				description: 'Whether to send a request body',
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
						sendBody: [true],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const endpointPath = this.getNodeParameter('endpointPath', itemIndex) as string;
			const httpMethod = this.getNodeParameter('httpMethod', itemIndex) as IHttpRequestMethods;
			const queryParamsRaw = this.getNodeParameter('queryParams', itemIndex) as string;
			const headersRaw = this.getNodeParameter('headers', itemIndex) as string;
			const sendBody = this.getNodeParameter('sendBody', itemIndex) as boolean;
			const bodyRaw = this.getNodeParameter('body', itemIndex) as string;

			const credentials = await this.getCredentials('adhubAppApi', itemIndex);
			const baseUrl = trimTrailingSlash(credentials.baseUrl as string);
			const apiKey = credentials.apiKey as string;
			const apiKeyHeader = (credentials.apiKeyHeader as string) || 'Authorization';
			const apiKeyPrefix = (credentials.apiKeyPrefix as string) || '';

	const qs = parseJson(queryParamsRaw, 'Query Parameters');
	const headers = parseJson(headersRaw, 'Headers');

			headers[apiKeyHeader] = apiKeyPrefix ? `${apiKeyPrefix} ${apiKey}` : apiKey;
			headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';

			const options: IHttpRequestOptions = {
				method: httpMethod,
				url: `${baseUrl}${endpointPath.startsWith('/') ? '' : '/'}${endpointPath}`,
				qs,
				headers,
				json: true,
			};

			if (sendBody) {
				options.body = parseJson(bodyRaw, 'Body');
			}

			const response = await this.helpers.request(options);
			returnData.push({ json: response });
		}

		return [returnData];
	}
}
