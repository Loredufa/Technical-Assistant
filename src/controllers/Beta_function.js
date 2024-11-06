const OpenAI = require('openai');
const axios = require('axios');


const {openai_org, openai_api_key} = require('../utils/config/index')

const apiKey= openai_api_key
const organization= openai_org


//Inicia openai
const client = new OpenAI({
    apiKey: apiKey,
    organization: organization,
})

const assistant = await client.beta.assistants.create({
    model: "gpt-4o",
    instructions:
      "You are a weather bot. Use the provided functions to answer questions.",
    tools: [
      {
        type: "function",
        function: {
          name: "getCurrentTemperature",
          description: "Get the current temperature for a specific location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g., San Francisco, CA",
              },
              unit: {
                type: "string",
                enum: ["Celsius", "Fahrenheit"],
                description:
                  "The temperature unit to use. Infer this from the user's location.",
              },
            },
            required: ["location", "unit"],
          },
          strict: true,
        },
      },
      {
        type: "function",
        function: {
          name: "getRainProbability",
          description: "Get the probability of rain for a specific location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g., San Francisco, CA",
              },
            },
            required: ["location"],
          },
          strict: true,
        },
      },
    ],
  });

  const thread = await client.beta.threads.create();
  const message = client.beta.threads.messages.create(thread.id, {
    role: "user",
    content: "What's the weather in San Francisco today and the likelihood it'll rain?",
  });


  class EventHandler extends EventEmitter {
    constructor(client) {
      super();
      this.client = client;
    }
  
    async onEvent(event) {
      try {
        console.log(event);
        // Retrieve events that are denoted with 'requires_action'
        // since these will have our tool_calls
        if (event.event === "thread.run.requires_action") {
          await this.handleRequiresAction(
            event.data,
            event.data.id,
            event.data.thread_id,
          );
        }
      } catch (error) {
        console.error("Error handling event:", error);
      }
    }
  
    async handleRequiresAction(data, runId, threadId) {
      try {
        const toolOutputs =
          data.required_action.submit_tool_outputs.tool_calls.map((toolCall) => {
            if (toolCall.function.name === "getCurrentTemperature") {
              return {
                tool_call_id: toolCall.id,
                output: "57",
              };
            } else if (toolCall.function.name === "getRainProbability") {
              return {
                tool_call_id: toolCall.id,
                output: "0.06",
              };
            }
          });
        // Submit all the tool outputs at the same time
        await this.submitToolOutputs(toolOutputs, runId, threadId);
      } catch (error) {
        console.error("Error processing required action:", error);
      }
    }
  
    async submitToolOutputs(toolOutputs, runId, threadId) {
      try {
        // Use the submitToolOutputsStream helper
        const stream = this.client.beta.threads.runs.submitToolOutputsStream(
          threadId,
          runId,
          { tool_outputs: toolOutputs },
        );
        for await (const event of stream) {
          this.emit("event", event);
        }
      } catch (error) {
        console.error("Error submitting tool outputs:", error);
      }
    }
  }
  
  const eventHandler = new EventHandler(client);
  eventHandler.on("event", eventHandler.onEvent.bind(eventHandler));
  
  const stream = await client.beta.threads.runs.stream(
    threadId,
    { assistant_id: assistantId },
    eventHandler,
  );
  
  for await (const event of stream) {
    eventHandler.emit("event", event);
  }


  module.exports = {
    beta
}