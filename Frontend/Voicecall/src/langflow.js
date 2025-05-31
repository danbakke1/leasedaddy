import { LangflowClient } from "@datastax/langflow-client";

import { langflowOptions } from "./config.js";

const clientOptions = {
  baseUrl: langflowOptions.baseUrl,
  apiKey: langflowOptions.apiKey,
};

const langflowClient = new LangflowClient(clientOptions);
export const flow = langflowClient.flow(langflowOptions.flowId);
