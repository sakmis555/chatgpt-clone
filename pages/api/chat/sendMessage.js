import { OpenAIEdgeStream } from "openai-edge-stream";

// edge function
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    console.log("random text before handler func");
    const { message } = await req.json();
    console.log(message);
    const initialChatMessage = {
      role: "system",
      content:
        "Your name is TalkGPT. An incredibly intelligent and quick thinking AI, that always replies with an enthusiastic and positive energy. You were created by Saksham Mishra. Your response must be formatted as markdown.",
    };
    const response = await fetch(
      `${req.headers.get("origin")}/api/chat/createNewChat`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: req.headers.get("cookie"),
        },
        body: JSON.stringify({
          message,
        }),
      }
    );
    const json = await response.json();
    const chatId = json._id;
    // console.log("NEW CHAT", json);

    const stream = await OpenAIEdgeStream(
      "https://api.openai.com/v1/chat/completions",
      {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [initialChatMessage, { content: message, role: "user" }],
          stream: true,
        }),
      },
      {
        onBeforeStream: ({ emit }) => {
          emit(chatId, "newChatId");
        },
        onAfterStream: async ({ fullContent }) => {
          await fetch(
            `${req.headers.get("origin")}/api/chat/addMessageToChat`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                cookie: req.headers.get("cookie"),
              },
              body: JSON.stringify({
                chatId,
                role: "assistant",
                content: fullContent,
              }),
            }
          );
        },
      }
    );
    return new Response(stream);
  } catch (error) {
    console.log("An error occurred in send message:", error);
  }
}
