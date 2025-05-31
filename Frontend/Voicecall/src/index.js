import Fastify from "fastify";
import fastifyWs from "@fastify/websocket";
import fastifyFormbody from "@fastify/formbody";
import twilio from "twilio";

import { flow } from "./langflow.js";
import { tunnelUrl, port, langflowStreaming } from "./config.js";
import { sendResponse, sendErrorAndEnd } from "./relay_responses.js";

const {
  twiml: { VoiceResponse },
} = twilio;

const fastify = Fastify({
  logger: true,
});
fastify.register(fastifyWs);
fastify.register(fastifyFormbody);

fastify.post("/voice", (_request, reply) => {
  const twiml = new VoiceResponse();
  const connect = twiml.connect();
  connect.conversationRelay({
    url: `wss://${tunnelUrl}/ws`,
    welcomeGreeting: "I am Busy , Why are u calling me?",
  });
  reply.type("text/xml").send(twiml.toString());
});

fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (socket, request) => {
    socket.on("message", async (data) => {
      const message = JSON.parse(data);

      switch (message.type) {
        case "setup":
          fastify.log.info(`Conversation started: ${message.callSid}`);
          socket.callSid = message.callSid;
          break;
        case "prompt": {
          fastify.log.info(`Processing prompt: ${message.voicePrompt}`);
          if (!langflowStreaming) {
            try {
              const response = await flow.run(message.voicePrompt, {
                session_id: socket.callSid,
              });
              sendResponse(socket, response.chatOutputText());
              fastify.log.info(`Response: ${response.chatOutputText()}`);
            } catch (error) {
              fastify.log.error(`Error processing prompt: ${error.message}`);
              sendErrorAndEnd(
                socket,
                "I'm sorry, an application error has occurred."
              );
            }
          } else {
            try {
              const response = await flow.stream(message.voicePrompt, {
                session_id: socket.callSid,
              });
              let responseText = "";
              for await (const chunk of response) {
                if (chunk.event === "token") {
                  sendResponse(socket, chunk.data.chunk, false);

                  responseText += chunk.data.chunk;
                } else if (chunk.event === "end") {
                  fastify.log.info(`Response: ${responseText}`);
                  sendResponse(socket, "", true);
                }
              }
            } catch (error) {
              fastify.log.error(`Error processing prompt: ${error.message}`);
              sendErrorAndEnd(
                socket,
                "I'm sorry, an application error has occurred."
              );
            }
          }
          break;
        }
        case "error":
          fastify.log.error(`ConversationRelay error: ${message.description}`);
          break;
        default:
          fastify.log.error("Unknown message type:", message);
      }
    });

    socket.on("close", async () => {
      fastify.log.info(`WebSocket connection closed: ${socket.callSid}`);
    });
  });
});

try {
  await fastify.listen({ port });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
