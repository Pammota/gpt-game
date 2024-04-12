import { NextResponse } from "next/server";
import OpenAI from "openai";
import axios from "axios";

const apiKey = process.env.OPENAI_API_KEY;
const apiUrl = "https://api.openai.com/v1/chat/completions";

const openai = new OpenAI({
  apiKey: apiKey,
  // defaults to process.env["OPENAI_API_KEY"]
});

type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

const priceCalculator = (usage: Usage) => {
  // $0.0015 / 1K tokens	$0.002 / 1K tokens
  const priceInput = (usage?.completion_tokens * 0.0015) / 1000;
  const priceOutput = (usage?.prompt_tokens * 0.002) / 1000;
  const billing = {
    input: `${priceInput} $`,
    output: `${priceOutput} $`,
    total: `${priceInput + priceOutput} $`,
  };

  return billing;
};

const getGPTResponse = async (firstMessage: Message) => {
  const completion = await openai.chat.completions.create({
    messages: [firstMessage],
    model: "gpt-3.5-turbo",
  });

  if (completion.usage && completion.choices) {
    const billing = priceCalculator(completion.usage);
    return {
      ...completion,
      billing: billing,
    };
  }
  return {};
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

type RequestAPI = {
  messages: Message[];
  prompt: string;
};

const getGPTResponseWithMemory = async (
  prompt: string,
  pastMessages: Message[]
) => {
  const completion = await openai.chat.completions.create({
    messages: [...pastMessages, { role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  if (completion.usage && completion.choices) {
    const billing = priceCalculator(completion.usage);
    return {
      ...completion,
      billing: billing,
    };
  }
  return {};
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const content = searchParams.get("content");
  const role = searchParams.get("role") as "user" | "assistant" | null;
  let response;
  if (content !== null && role !== null)
    response = await getGPTResponse({ role, content });
  else response = { response: "No prompt provided." };

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const res: RequestAPI = await request.json();
  const messages = res.messages;
  const prompt = res.prompt;
  console.log("messages: ", messages);
  console.log("prompt: ", prompt);
  let response;
  if (prompt !== undefined && messages.length > 0)
    response = await getGPTResponseWithMemory(prompt, messages);
  else if (prompt === undefined && messages.length === 1)
    response = await getGPTResponse(messages[0]);
  else response = { response: "No prompt and/or messages provided." };

  return NextResponse.json(response);
}
