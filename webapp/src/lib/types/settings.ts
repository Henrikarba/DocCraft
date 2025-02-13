export type AIProvider = {
	name: string;
	apiEndpoint: string;
	headers: Record<string, string>;
	body: {
		temperature?: number;
		max_tokens?: number;
		[key: string]: any;
	};
};

export type Settings = {
	aiProviders: AIProvider[];
	selectedProvider: string;
};
