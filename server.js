import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json());
app.use(express.static("public"));

const ai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {
    try {
        const messages = req.body.messages || [];

        const response = await ai.responses.create({
            model: process.env.OPENAI_MODEL || "gpt-6-astra",

            instructions: `
                Your name is Ameen.
                You are an advanced personal AI assistant.
                You are intelligent, friendly and respectful.

                Help the user with questions,
                explanations, learning and daily tasks.

                Speak naturally and clearly.
                Never pretend to perform actions
                that you cannot actually perform.
            `,

            input: messages
        });

        res.json({
            reply: response.output_text
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Ameen is temporarily unavailable."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("AMEEN AI is running!");
});
