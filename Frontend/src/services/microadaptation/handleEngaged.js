import { v4 as uuidv4 } from 'uuid';

const engagedMessages = [
  "👏 You're doing great!",
  "🚀 Keep it up!",
  "💡 Nice focus!",
  "🔥 You're crushing it!",
  "🌟 Stay sharp!",
  "📈 You're making great progress!",
];

export default function handleEngaged(setMessages) {
  const randomMsg =
    engagedMessages[Math.floor(Math.random() * engagedMessages.length)];

  setMessages((prev) => [
    ...prev,
    {
      id: uuidv4(),
      text: randomMsg,
      type: 'positive',
      sender: 'system',
    },
  ]);
}