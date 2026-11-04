const chat = document.querySelector("#chat");
const input = document.querySelector("#message");
const sendButton = document.querySelector("#send");
const history = [];

function addBubble(role, text) {
  const article = document.createElement("article");
  article.className = `bubble ${role}`;

  const label = document.createElement("b");
  label.textContent = role === "user" ? "You" : "Ameen";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  article.append(label, paragraph);
  chat.append(article);
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  addBubble("user", text);
  history.push({ role: "user", content: text });

  sendButton.disabled = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error);

    history.push({ role: "assistant", content: data.reply });
    addBubble("assistant", data.reply);

    if ("speechSynthesis" in window) {
      speechSynthesis.speak(
        new SpeechSynthesisUtterance(data.reply)
      );
    }
  } catch (error) {
    addBubble("assistant", "Connection error. Please try again.");
    history.pop();
  }

  sendButton.disabled = false;
}

sendButton.addEventListener("click", sendMessage);

input.addEventListener("keydown", event => {
  if (event.key === "Enter") sendMessage();
});
