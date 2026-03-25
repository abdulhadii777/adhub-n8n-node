import type { IDataObject, IHttpRequestMethods, IHttpRequestOptions } from 'n8n-workflow';

type JsonRecord = IDataObject;

const BASE_URL = 'https://adhub-main-d1fcap.laravel.cloud/api/v1';

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

function buildRequestOptions(config: {
	method: IHttpRequestMethods;
	endpoint: string;
	apiToken: string;
	qs?: JsonRecord;
	body?: JsonRecord;
}): IHttpRequestOptions {
	const headers: JsonRecord = {
		Authorization: `Bearer ${config.apiToken}`,
		'Content-Type': 'application/json',
	};

	const options: IHttpRequestOptions = {
		method: config.method,
		url: `${BASE_URL}${config.endpoint}`,
		qs: config.qs ?? {},
		headers,
		json: true,
	};

	if (config.body) {
		options.body = config.body;
	}

	return options;
}

export { BASE_URL, JsonRecord, buildRequestOptions, parseJson };
