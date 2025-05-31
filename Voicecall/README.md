# Twilio Voice and Langflow

This is an example application that lets you respond to a Twilio Voice call using [Twilio ConversationRelay](https://www.twilio.com/docs/voice/twiml/connect/conversationrelay) and [Langflow](https://www.langflow.org/).

- [Prerequisites](#prerequisites)
- [Setup](#setup)
  - [Langflow](#langflow)
    - [Prompting](#prompting)
    - [Streaming](#streaming)
  - [Tunnel](#tunnel)
  - [Twilio](#twilio)
- [Run the application](#run-the-application)

## Prerequisites

You will need:

- a Twilio account with a voice-enabled phone number
- to follow the steps to [enable ConversationRelay](https://www.twilio.com/docs/voice/twiml/connect/conversationrelay/onboarding#integrate-twilio-with-conversationrelay) in your Twilio Console
- a [Langflow installation](https://docs.langflow.org/get-started-installation)
- a way to tunnel requests to your local machine, like [ngrok](http://ngrok.com/)

## Setup

First clone this repository from GitHub:

```
git clone https://github.com/langflow-ai/langflow-twilio-voice.git
cd langflow-twilio-voice
```

Install the dependencies:

```
npm install
```

Copy the `.env.example` file to `.env`.

```
cp .env.example .env
```

We'll fill in the entries in the `.env` file as we continue.

### Langflow

You will need a Langflow flow to handle the messages from the voice call.

It will be interacting with a live voice call, so it should aim to respond quickly. It is also a live conversation, so you will want to ensure that there is built in memory.

You can try using any of the template flows in Langflow, or for a basic chat bot with memory try importing and building upon [./langflow/hackathon_bot.json](./langflow/hackathon_bot.json).

Once you have created the flow you will need to get the base URL for your Langflow flow. The default for Langflow installed by pip/uv is `http://localhost:7860` and for Langflow desktop it is `http://localhost:7868`. Enter this as the `LANGFLOW_URL` in `.env`.

You will also need the ID of your flow. You can find this in the examples under _Publish_ -> _API access_. The URL looks like `http://localhost:7860/api/v1/run/${YOUR_FLOW_ID}`. Enter this in the `.env` file as `LANGFLOW_FLOW_ID`.

If you have enabled authorization on your Langflow installation, you will need to generate an API key. You can do so in the settings. Add the API key in `.env` as `LANGFLOW_API_KEY`.

#### Prompting

Your Langflow bot will be communicating by voice over the phone, so your system prompt should encourage it to be concise and clear. Consider using something like this in the system prompt:

> This conversation is being translated to voice, so answer carefully and concisely. When you respond, please spell out all numbers, for example twenty not 20. Do not include emojis in your responses. Do not include bullet points, asterisks, or special symbols.

(Inspired by this [example repo from Twilio's Kelley Robinson](https://github.com/robinske/cr-demo/blob/main/server.js#L11))

#### Streaming

If your flow is capable of streaming responses, you can take advantage of the lower latency by setting `LANGFLOW_STREAMING="true"` in the `.env` file.

### Tunnel

To connect Twilio to your locally running application, you will need a tunnel like [ngrok](https://ngrok.com) that supports web socket connections.

This application runs on `localhost:3000` by default, or whichever `PORT` number you set in `.env`.

Set up your tunnel to point to the locally running application and enter the tunnel domain in `.env` as `TUNNEL_DOMAIN`.

### Twilio

You will need to configure your voice capable phone number to connect to the application. Under the voice configuration settings of the phone number, configure it with a webhook. When a call comes in the webhook URL should be a POST request to `https://${TUNNEL_DOMAIN}/voice`.

## Run the application

You can run the application with:

```
npm start
```

Now dial your Twilio phone number and you can chat with your Langflow flow.

You can also run:

```
npm run dev
```

This runs the application in watch mode, so it restarts if you make any changes. Be aware this may cause issues with live calls losing connection.
