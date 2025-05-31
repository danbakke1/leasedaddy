import { env } from "node:process";

export const tunnelUrl = env.TUNNEL_DOMAIN.replace(/^https?:\/\//, "");

export const port = env.PORT || "3000";

export const langflowOptions = {
  baseUrl: env.LANGFLOW_URL,
  apiKey: env.LANGFLOW_API_KEY,
  flowId: env.LANGFLOW_FLOW_ID,
};

export const langflowStreaming = env.LANGFLOW_STREAMING === "true";
