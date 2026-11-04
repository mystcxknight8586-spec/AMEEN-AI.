const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");

let messages = [];

function addMessage(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${sender}`;

    const name = document.createElement("b");
    name.textContent = sender === "user" ? "You" : "Ameen";

    const content = document.createElement("p");
    content.textContent = text;

    bubble.appendChild(name);
    bubble.appendChild(content);

    chat.appendChild(bubble);
    chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
    const text = input.value.trim();

    if (!text) return;

    input.value = "";
    addMessage(text, "user");

    messages.push({
        role: "user",
        content: text
    });

    sendBtn.disabled = true;
    sendBtn.textContent = "Thinking...";

    try {
        const response = await fetch("/api/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                messages: messages
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "AI connection failed");
        }

        addMessage(data.reply, "assistant");

        messages.push({
            role: "assistant",
            content: data.reply
        });

    } catch (error) {
        addMessage(
            "Sorry! I cannot connect right now. Please try again.",
            "assistant"
        );

        console.error(error);

    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = "Send";
        input.focus();
    }
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
