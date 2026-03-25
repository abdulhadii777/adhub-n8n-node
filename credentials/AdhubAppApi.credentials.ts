import type { ICredentialTestRequest, ICredentialType, Icon, INodeProperties } from 'n8n-workflow';

export class AdhubAppApi implements ICredentialType {
	name = 'adhubAppApi';
	displayName = 'Adhub App API';
	documentationUrl = 'https://docs.n8n.io/integrations/creating-nodes/';
	icon: Icon = 'file:android-icon-144.png';
	test: ICredentialTestRequest = {
		request: {
			method: 'GET',
			url: 'https://adhub-main-d1fcap.laravel.cloud/api/v1/lead-sources',
			headers: {
				Authorization: 'Bearer {{$credentials.apiToken}}',
			},
		},
	};

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
