import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AdhubAppApi implements ICredentialType {
	name = 'adhubAppApi';
	displayName = 'Adhub App API';
	documentationUrl = 'https://docs.n8n.io/integrations/creating-nodes/';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://api.adhubapp.com',
			required: true,
			description: 'Base URL for the Adhub API (no trailing slash)',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Adhub API key',
		},
		{
			displayName: 'API Key Header',
			name: 'apiKeyHeader',
			type: 'string',
			default: 'Authorization',
			description: 'Header name used to send the API key',
		},
		{
			displayName: 'API Key Prefix',
			name: 'apiKeyPrefix',
			type: 'string',
			default: 'Bearer',
			description: 'Optional prefix before the API key (for example: Bearer)',
		},
	];
}
