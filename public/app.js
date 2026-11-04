const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const voiceBtn = document.getElementById("voice");
const speakCheckbox = document.getElementById("speak");
const clearBtn = document.getElementById("clear");
const hint = document.getElementById("hint");

let messages = [];
let recognition = null;

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

function speakReply(text) {
    if (!speakCheckbox.checked) return;

    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    speech.rate = 1;

    window.speechSynthesis.speak(speech);
}

async function sendMessage() {
    const text = input.value.trim();

    if (!text || sendBtn.disabled) return;

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

        speakReply(data.reply);

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

// Send button
sendBtn.addEventListener("click", sendMessage);

// Enter key
input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Clear conversation
clearBtn.addEventListener("click", () => {
    messages = [];

    window.speechSynthesis?.cancel();

    chat.innerHTML = "";

    addMessage(
        "Hello! I'm Ameen. How can I help you today?",
        "assistant"
    );
});

// Voice input
const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
        voiceBtn.textContent = "🔴";
        hint.textContent = "Listening... Speak now.";
    };

    recognition.onresult = (event) => {
        input.value = event.results[0][0].transcript;
        sendMessage();
    };

    recognition.onerror = () => {
        hint.textContent = "Voice input failed. Please try again.";
    };

    recognition.onend = () => {
        voiceBtn.textContent = "🎙";
    };

    voiceBtn.addEventListener("click", () => {
        try {
            recognition.start();
        } catch (error) {
            hint.textContent = "Voice recognition is already running.";
        }
    });

} else {
    voiceBtn.disabled = true;
    hint.textContent = "Voice input is not supported by this browser.";
        }
