
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Edge, Node } from '@xyflow/react';
import { CustomNodeData } from "@/components/mind-map/CustomNode";

const MODEL_NAME = "gemini-1.5-flash-latest";

type MindMapFlow = {
    nodes: Node<CustomNodeData>[];
    edges: Edge[];
}

export async function generateMindMapFromText(text: string): Promise<MindMapFlow> {
    const apiKey = localStorage.getItem('googleAiApiKey');
    if (!apiKey) {
        throw new Error("Google AI API key not found. Please set it in the AI Settings.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 8192,
    };

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const prompt = `You are a mind map generation expert. Based on the following text, generate a mind map in JSON format for a react-flow diagram. The JSON should have 'nodes' and 'edges' properties.
Each node must have an 'id' (string), 'type: "custom"', 'position' ({x: number, y: number}), and 'data' object. The 'data' object must have a 'label' (string) and a 'type' (string).
The node 'type' in the 'data' object must be one of the following: 'topic', 'definition', 'explanation', 'critical-point', 'example'.
The root node should be of type 'topic' and positioned at { x: 0, y: 0 }.
Position the other nodes in a hierarchical layout around the root node, ensuring there are no overlaps.
Each edge must have an 'id' (string), 'source' (source node id as a string), and 'target' (target node id as a string).
Ensure the output is a valid JSON object and nothing else. Do not add any commentary or wrap it in markdown backticks.

Here is the text:
---
${text}
---
`;
    
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
    });

    try {
        const responseText = result.response.text();
        const cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const flow = JSON.parse(cleanedJsonString);
        if (flow && Array.isArray(flow.nodes) && Array.isArray(flow.edges)) {
            return flow;
        } else {
            throw new Error('Invalid JSON format for mind map from AI.');
        }
    } catch (e) {
        console.error("Failed to parse AI response:", e);
        console.error("Raw AI response:", result.response.text());
        throw new Error("Failed to generate mind map. The AI returned an invalid format.");
    }
}
