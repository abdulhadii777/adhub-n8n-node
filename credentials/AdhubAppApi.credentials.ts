import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class AdhubAppApi implements ICredentialType {
	name = 'adhubAppApi';
	displayName = 'Adhub App API';
	documentationUrl = 'https://docs.n8n.io/integrations/creating-nodes/';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Bearer token for the Adhub API',
		},
	];
}
