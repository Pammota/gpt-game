"use client";
import React, { useEffect, useState } from "react";

const firstPrompt = `You act like a JSON API for a game. The games rules are as follows: 
- The player is a Romanian man living in the communist era
- The goal of the game is to survive 30 questions without any of the stats reaching 0
-  The questions should be about the current decisions the man has to make
- The stat changes are between -5 and +5, and any integer value in between
- You prompt questions in the following format:
 {
  "question": "A question",
  "ifYes": [1,2,3,4], // stats changes if answer to question is yes
  "ifNo": [1,2,3,4] // stats changes if answer to question is no
}
- I give you yes/no answers, you only give me JSON type answers, as above. 
- The stat changes are the increase/decrease amounts.
- You start with the questions. My only responses are yes/no.
- DO NOT write any other text other than the JSON. It will break the API. Not even a confirmation. NO OTHER TEXT OTHER THAN THE JSON RESPONSE.
- ONLY one JSON response at a time.`;

const endWinPrompt = "Write a 100 word summary of the story. The man has won. With the answers above taken into consideration.";
const endLosePrompt = "Write a 100 word summary of the story. The man has lost. With the answers above taken into consideration.";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type RequestAPI = {
  messages: Message[];
  prompt?: string;
};

type Choice = {
  index: number;
  message: Message;
  finish_reason: string;
};

type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

type Billing = {
  input: string;
  output: string;
  total: string;
};

type Response = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: Usage;
  billing: Billing;
};

type GPTAnswer = {
  question: "A question";
  ifYes: [1, 2, 3, 4]; // stats changes if answer to question is yes
  ifNo: [1, 2, 3, 4]; // stats changes if answer to question is no
};

type firstGPTAnswer = {
  question: "A question";
  ifYes: [1, 2, 3, 4]; // stats changes if answer to question is yes
  ifNo: [1, 2, 3, 4]; // stats changes if answer to question is no
  statNames: ["stat1", "stat2", "stat3", "stat4"]; // names of the 4 stats
};

const Page = () => {
  const pastConvo: Message[] = [
    {
      role: "user",
      content: firstPrompt,
    },
  ];
  const request: RequestAPI = {
    messages: pastConvo,
  };

  const [convoArr, setConvoArr] = useState<Message[]>(pastConvo);
  const [inputVal, setInputVal] = useState("");

  const [responseGPT, setResponseGPT] = useState<Response | null>(null);
  const [newQuestion, setNewQuestion] = useState<GPTAnswer | null>();

  const getNewMessage = (newRequest: RequestAPI) => {
    fetch("http://localhost:3000/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRequest),
    })
      .then((response) => response.json())
      .then((data: Response) => {
        if (data) {
          console.log("DATA IN NewMessage:", data);
          setResponseGPT(data);
          if (data.choices && newRequest.prompt) {
            console.log([
              ...convoArr,
              { role: "user", content: newRequest.prompt },
              data.choices[0].message,
            ]);
            const userMessage: Message = {
              role: "user",
              content: newRequest.prompt,
            };
            setConvoArr((oldArr) => [
              ...oldArr,
              userMessage,
              data.choices[0].message,
            ]);
          }
        }
      });
  };

  useEffect(() => {
    const getResponse = () => {
      fetch("http://localhost:3000/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })
        .then((response) => response.json())
        .then((data: Response) => {
          if (data) {
            console.log(data);
            setResponseGPT(data);
          }
        });
    };
    getResponse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (responseGPT?.choices) {
      const questionObject: GPTAnswer | null =
        responseGPT?.choices[0].message.content &&
        JSON.parse(responseGPT?.choices[0].message.content);
      setNewQuestion(questionObject);
    }
  }, [responseGPT]);

  return (
    <div className="w-screen h-screen text-white flex flex-col justify-center items-center">
      <div className="flex flex-col gap-2 text-center p-10">
        <span className="font-medium">{newQuestion?.question}</span>
        <span className="text-green-500">{newQuestion?.ifYes}</span>
        <span className="text-red-500">{newQuestion?.ifNo}</span>
      </div>
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          console.log("On Submit: ", {
            messages: convoArr,
            prompt: inputVal,
          });
          getNewMessage({
            messages: convoArr,
            prompt: inputVal,
          });
        }}
      >
        <input
          placeholder="Answer"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="p-4 bg-slate-600 rounded-lg text-white"
        />
        <button className="p-2 bg-sky-600 rounded-full" type="submit">
          Send
        </button>
      </form>
    </div>
  );
};

export default Page;
