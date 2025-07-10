import { v4 as uuidv4 } from 'uuid';

const confusionMessages = [
  "You seem confused. Want to rewind 15 seconds?",
  "Not quite sure? Rewind 15 seconds to review?",
  "Need a quick recap? Go back 15 seconds?",
  "Looks like something was unclear. Rewind a bit?",
  "Feeling lost? Want to replay the last part?"
];

export default function handleConfusion(videoRef, setMessages, onResponse) {
  if (!videoRef?.current || !setMessages) return;

  const randomMsg =
    confusionMessages[Math.floor(Math.random() * confusionMessages.length)];

  setMessages((prev) => {
    const updatedPrev = prev.map((msg) =>
      msg.type === "prompt" && !msg.responded ? { ...msg, responded: true } : msg
    );

    // Remove any unresponded prompt messages to avoid duplication
    const filteredPrev = updatedPrev.filter((msg) => !(msg.type === "prompt" && !msg.responded));

    return [
      ...filteredPrev,
      {
        id: uuidv4(),
        type: "prompt",
        text: randomMsg,
        options: [
          { label: "Yes", value: "rewind" },
          { label: "No", value: "continue" },
        ],
        responded: false,
      },
    ];
  });

  // ✅ Ensure response handler is triggered exactly once
  if (typeof onResponse === 'function') {
    onResponse();
  }
}