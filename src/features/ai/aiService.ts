
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Edge, Node } from '@xyflow/react';
import { CustomNodeData } from "@/features/mind-map/components/CustomNode"; // Updated path
import { sanitizeText, decryptApiKey, checkRateLimit } from "@/lib/utils";

const MODEL_NAME = "gemini-1.5-flash-latest";
const MAX_TEXT_LENGTH = 1000000; // Changed to 1 million characters

type MindMapFlow = {
    nodes: Node<CustomNodeData>[];
    edges: Edge[];
}

export async function generateMindMapFromText(text: string): Promise<MindMapFlow> {
    const rateLimitResult = checkRateLimit('ai_generate');
    if (!rateLimitResult.allowed) {
        throw new Error(`You are making too many requests. Please try again in ${rateLimitResult.retryAfter} seconds.`);
    }

    if (text.length > MAX_TEXT_LENGTH) {
        throw new Error(`Input text is too long (${text.length} characters). Please provide text with less than ${MAX_TEXT_LENGTH} characters (current limit: ${MAX_TEXT_LENGTH}).`);
    }

    const sanitizedText = sanitizeText(text);
    if (!sanitizedText.trim()) {
        throw new Error("Input text is empty after sanitization.");
    }

    const apiKey = await decryptApiKey();
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
Each node must have an 'id' (string), 'type': "custom", 'position' ({x: number, y: number}), and 'data' object.

The main subject of the text should be designated as the single root node. This root node must:
1.  Have the type 'topic'.
2.  Be positioned exactly at { "x": 0, "y": 0 }.
3.  Have its 'label' clearly represent the main subject.

All other generated nodes must be descendants of this root node, forming a clear hierarchical tree structure.
-   Position immediate children of the root node directly below it (e.g., y-coordinate significantly greater than 0, like 100 or 150) and spread them out horizontally to avoid overlap.
-   Subsequent levels of nodes should also be positioned hierarchically below their parent nodes.
-   Critically ensure there are no disconnected nodes or nodes floating randomly. Every node (except the root) must have a parent and be part of the hierarchy stemming from the root.
-   Maintain reasonable spacing between nodes to prevent visual clutter and ensure no overlaps.

For the 'data' object of each node (including the root):
-   'label': A concise string label for the concept.
-   'type': One of 'topic' (only for the root node), 'definition', 'explanation', 'critical-point', 'example'.
-   'details': An optional string. If provided, this should be a very brief, 1-2 sentence summary or a few key bullet points providing essential context for the node's label. Focus on core information only.

Each edge must have an 'id' (string), 'source' (source node id as a string), and 'target' (target node id as a string).
Ensure the output is a valid JSON object and nothing else. Do not add any commentary or wrap it in markdown backticks.

Here is the text:
---
${sanitizedText}
---
`;
    let result;
    try {
        result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
        });
    } catch (apiError: any) {
        console.error("Google AI API error (generateMindMapFromText):", apiError.message);
        // Consider more specific error messages based on apiError.status or type if available
        throw new Error(`AI service request failed. Please try again later.`);
    }

    try {
        const responseText = result.response.text();
        let cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '');
        const jsonStartIndex = cleanedJsonString.indexOf('{');
        const jsonEndIndex = cleanedJsonString.lastIndexOf('}');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            cleanedJsonString = cleanedJsonString.substring(jsonStartIndex, jsonEndIndex + 1);
        } else {
            console.error("Raw AI response (generateMindMapFromText):", responseText);
            throw new Error("The AI returned an unreadable mind map format. Please try again.");
        }

        const flow = JSON.parse(cleanedJsonString);
        if (flow && Array.isArray(flow.nodes) && Array.isArray(flow.edges)) {
            return flow;
        } else {
            console.error("Invalid JSON structure from AI (generateMindMapFromText):", cleanedJsonString);
            throw new Error("The AI's mind map data is incomplete. Please try again.");
        }
    } catch (e: any) {
        // This catch block now primarily handles errors from JSON.parse or our direct throws.
        console.error("Failed to parse AI response (generateMindMapFromText):", e.message);
        // If it's one of our new Errors, rethrow it. Otherwise, wrap it.
        if (e.message.startsWith("The AI returned") || e.message.startsWith("The AI's mind map data")) {
            throw e;
        }
        throw new Error("The AI returned an unreadable mind map format. Please try again.");
    }
}


export async function generateSummaryFromNodes(
    nodesToSummarize: Node<CustomNodeData>[],
    title?: string
): Promise<string> {
    if (!nodesToSummarize || nodesToSummarize.length === 0) {
        // For a user-facing message, this might be better handled in the UI
        // or thrown as a more specific error type if the caller needs to distinguish.
        // For now, a simple error is fine as it will be caught by UI and shown in toast.
        throw new Error("No content available to summarize.");
    }

    const rateLimitResult = checkRateLimit('ai_summarize');
    if (!rateLimitResult.allowed) {
        throw new Error(`Rate limit exceeded for summarization. Please try again in ${rateLimitResult.retryAfter} seconds.`);
    }

    const apiKey = await decryptApiKey();
    if (!apiKey) {
        throw new Error("Google AI API key not found. Please set it in the AI Settings.");
    }

    let contentToSummarize = "";
    nodesToSummarize.forEach(node => {
        contentToSummarize += `Node: "${node.data.label}" (Type: ${node.data.type})\n`;
        if (node.data.details && node.data.details.trim() !== "") {
            // Simple sanitization for details to avoid breaking the prompt structure badly
            // Replace multiple newlines with single, remove overly complex markdown if it was an issue
            const cleanDetails = node.data.details.replace(/\n\s*\n/g, '\n').trim();
            contentToSummarize += `Details: ${cleanDetails}\n\n`;
        } else {
            contentToSummarize += "\n"; // Ensure spacing even if no details
        }
    });

    if (contentToSummarize.length > MAX_TEXT_LENGTH) {
        throw new Error(`Content is too long to summarize (${contentToSummarize.length} characters). Limit is ${MAX_TEXT_LENGTH} characters (current limit: ${MAX_TEXT_LENGTH}). Please select fewer nodes or a smaller branch.`);
    }
    if (!contentToSummarize.trim()) {
         throw new Error("Selected nodes have no content to summarize.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.5, // Lower temperature for more factual and concise summaries
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const prompt = `You are an expert at summarizing information. Based on the following content from a mind map${title ? ` (related to "${title}")` : ''}, please provide a concise summary (e.g., 1-3 paragraphs). Focus on the key concepts and their relationships as presented.

Content:
---
${contentToSummarize}
---
Summary:`;

    let result;
    try {
        result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
        });
    } catch (apiError: any) {
        console.error("Google AI API error (generateSummaryFromNodes):", apiError.message);
        throw new Error(`AI service request failed for summary. Please try again later.`);
    }

    try {
        const summaryText = result.response.text();
        if (!summaryText || summaryText.trim() === "") {
            console.warn("AI returned an empty summary (generateSummaryFromNodes). Prompt:", prompt);
            throw new Error("The AI did not return a summary. Please try again.");
        }
        // Basic cleaning for text response, though usually not as critical as JSON
        return summaryText.trim();
    } catch (e: any) {
         // This primarily catches the "AI did not return a summary" error
        console.error("Failed to get summary from AI response (generateSummaryFromNodes):", e.message);
        if (e.message.startsWith("The AI did not return")) {
            throw e;
        }
        // For other unexpected errors during text() or trim()
        throw new Error("Failed to process the AI's summary response.");
    }
}

export interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'true-false';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export async function generateQuizFromMindMap(
    nodes: Node<CustomNodeData>[],
    edges: Edge[]
): Promise<QuizQuestion[]> {
    const rateLimitResult = checkRateLimit('ai_quiz');
    if (!rateLimitResult.allowed) {
        throw new Error(`Rate limit exceeded for quiz generation. Please try again in ${rateLimitResult.retryAfter} seconds.`);
    }

    const apiKey = await decryptApiKey();
    if (!apiKey) {
        throw new Error("Google AI API key not found. Please set it in the AI Settings.");
    }

    // Simplify mind map data for the prompt
    let mindMapPromptData = "Nodes:\n";
    const nodeMap = new Map<string, Node<CustomNodeData>>();
    nodes.forEach(node => {
        nodeMap.set(node.id, node);
        mindMapPromptData += `- ${node.id}: "${node.data.label}" (type: ${node.data.type})\n`;
    });

    mindMapPromptData += "\nConnections:\n";
    edges.forEach(edge => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (sourceNode && targetNode) {
            mindMapPromptData += `- "${sourceNode.data.label}" -> "${targetNode.data.label}"\n`;
        }
    });

    if (nodes.length === 0) {
        throw new Error("Cannot generate quiz from an empty mind map.");
    }
    // Basic check for prompt length, this is a rough estimate
    if (mindMapPromptData.length > MAX_TEXT_LENGTH / 2) {
         throw new Error(`Mind map data is too large for quiz generation (${mindMapPromptData.length} characters). Approximate limit for content is ${Math.floor(MAX_TEXT_LENGTH / 2)} characters (current limit: ${Math.floor(MAX_TEXT_LENGTH / 2)}). Please simplify the mind map.`);
    }


    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.6, // Slightly lower temperature for more factual quiz questions
        topK: 1,
        topP: 1,
        maxOutputTokens: 4096,
    };

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        // Add other safety settings as needed
    ];

    const prompt = `You are an AI expert at creating educational quizzes. Based on the provided mind map structure and content, generate a quiz with 3-5 questions.

Mind Map Data:
---
${mindMapPromptData}
---

For each question, provide the following information in JSON format:
- "question": The text of the question (string).
- "type": Either "multiple-choice" or "true-false" (string).
- "options": An array of strings (e.g., ["Answer A", "Answer B", "Answer C", "Answer D"]) if type is "multiple-choice". Provide 3-4 options. Omit or leave empty if "true-false".
- "correctAnswer": The correct answer (string). For multiple-choice, this should be one of the strings from the "options" array. For true-false, it should be "True" or "False".
- "explanation": (Optional) A brief explanation for the answer (string).

Return the response as a valid JSON array of these question objects.
Ensure the output is a valid JSON array and nothing else. Do not add any commentary or wrap it in markdown backticks.
Example of expected JSON output format:
[
  {
    "question": "What is the primary site of photosynthesis in a plant cell?",
    "type": "multiple-choice",
    "options": ["Mitochondria", "Nucleus", "Chloroplasts", "Ribosomes"],
    "correctAnswer": "Chloroplasts",
    "explanation": "Chloroplasts contain chlorophyll and are where photosynthesis takes place."
  },
  {
    "question": "Photosynthesis converts light energy into mechanical energy.",
    "type": "true-false",
    "correctAnswer": "False",
    "explanation": "Photosynthesis converts light energy into chemical energy (glucose)."
  }
]
`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
    });

    try {
        const responseText = result.response.text();
        let cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '');
        // Expecting an array, so look for [ and ]
        const jsonStartIndex = cleanedJsonString.indexOf('[');
        const jsonEndIndex = cleanedJsonString.lastIndexOf(']');

        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            cleanedJsonString = cleanedJsonString.substring(jsonStartIndex, jsonEndIndex + 1);
        } else {
            console.error("Raw AI response for quiz:", responseText);
            throw new Error("Could not find valid JSON array in AI quiz response.");
        }

        const quiz = JSON.parse(cleanedJsonString) as QuizQuestion[];

        if (Array.isArray(quiz)) {
            // Basic validation of question structure
            quiz.forEach(q => {
                if (!q.question || !q.type || !q.correctAnswer) {
                    throw new Error("Invalid question structure in AI response. Missing required fields.");
                }
                if (q.type === 'multiple-choice' && (!Array.isArray(q.options) || q.options.length < 2)) {
                    throw new Error("Invalid multiple-choice question: options array is missing or has too few items.");
                }
            });
            return quiz;
        } else {
            console.error("Raw AI response for quiz (expected array):", responseText);
            throw new Error('Invalid JSON structure for quiz from AI (expected an array).');
        }
    } catch (e: any) {
        console.error("Failed to parse AI quiz response:", e.message);
        console.error("Raw AI response text for quiz:", result.response.text());
        throw new Error(`Failed to parse quiz from AI response: ${e.message}`);
    }
}


export async function generateExpansionForNode(
    parentNode: Node<CustomNodeData>,
    // allNodes: Node<CustomNodeData>[], // For future context if needed
    // allEdges: Edge[]                  // For future context if needed
): Promise<{ newNodes: Node<CustomNodeData>[], newEdges: Edge[] }> {
    const rateLimitResult = checkRateLimit('ai_expand');
    if (!rateLimitResult.allowed) {
        throw new Error(`Rate limit exceeded for node expansion. Please try again in ${rateLimitResult.retryAfter} seconds.`);
    }

    const apiKey = await decryptApiKey();
    if (!apiKey) {
        throw new Error("Google AI API key not found. Please set it in the AI Settings.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.7, // Slightly lower temperature for more focused expansion
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048, // Smaller output for just a few nodes
    };

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    // Ensure parentNode.position is defined, default if not (though it should always be)
    const parentPosition = parentNode.position || { x: 0, y: 0 };

    const prompt = `You are a mind map generation expert. A user wants to expand a node in their existing mind map.
The parent node is:
Label: "${parentNode.data.label}"
Type: "${parentNode.data.type}"
ID: "${parentNode.id}"
Position: { "x": ${parentPosition.x}, "y": ${parentPosition.y} }

Based on this parent node, generate 2-3 new child nodes that elaborate on or break down the parent node's concept.
For each new child node, provide:
- 'id': A unique string ID (e.g., "${parentNode.id}-child1", "${parentNode.id}-child2"). Ensure this ID is different from any existing node IDs in a typical mind map.
- 'type': "custom" (string)
- 'position': An {x: number, y: number} object. Position these new nodes hierarchically below or around the parent node (whose position is {x: ${parentPosition.x}, y: ${parentPosition.y}}). For example, if parent is at (0,0), children could be at (0,100), (150,100), (-150,100). Adjust spacing based on typical node sizes (around 250x100 pixels).
- 'data': An object with:
    - 'label': A concise string label for the new concept.
    - 'type': One of 'definition', 'explanation', 'critical-point', 'example'. Do not use 'topic' for these child nodes.
    - 'details': An optional string. If provided, this should be a very concise 1-sentence explanation or a key aspect of the label. Max 1-2 short sentences. Often, no details are needed if the label is self-explanatory.

Also, generate new edges to connect the parent node to these new child nodes. Each edge should have:
- 'id': A unique string ID (e.g., "e-${parentNode.id}-child1").
- 'source': "${parentNode.id}" (the ID of the parent node, as a string).
- 'target': The ID of the new child node (as a string).

Return the response as a valid JSON object with 'nodes' (an array of the new child nodes) and 'edges' (an array of the new edges connecting parent to children).
Do not include the parent node in the 'nodes' array of your response.
Ensure the output is a valid JSON object and nothing else. Do not add any commentary or wrap it in markdown backticks.
Example of expected JSON output format:
{
  "nodes": [
    { "id": "${parentNode.id}-child1", "type": "custom", "position": {"x": ${parentPosition.x}, "y": ${parentPosition.y + 100}}, "data": { "label": "New Concept 1", "type": "explanation" } },
    { "id": "${parentNode.id}-child2", "type": "custom", "position": {"x": ${parentPosition.x + 150}, "y": ${parentPosition.y + 100}}, "data": { "label": "New Concept 2", "type": "definition" } }
  ],
  "edges": [
    { "id": "e-${parentNode.id}-child1", "source": "${parentNode.id}", "target": "${parentNode.id}-child1" },
    { "id": "e-${parentNode.id}-child2", "source": "${parentNode.id}", "target": "${parentNode.id}-child2" }
  ]
}
`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig,
        safetySettings,
    });

    try {
        const responseText = result.response.text();
        // Robust cleaning of JSON
        let cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '');
        const jsonStartIndex = cleanedJsonString.indexOf('{');
        const jsonEndIndex = cleanedJsonString.lastIndexOf('}');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            cleanedJsonString = cleanedJsonString.substring(jsonStartIndex, jsonEndIndex + 1);
        } else {
            console.error("Raw AI response for expansion:", responseText);
            throw new Error("Could not find valid JSON in AI expansion response.");
        }

        const flow = JSON.parse(cleanedJsonString);

        if (flow && Array.isArray(flow.nodes) && Array.isArray(flow.edges)) {
            // Ensure nodes have CustomNodeData structure in their data field
            const validatedNodes = flow.nodes.map((node: any) => ({
                ...node,
                type: 'custom', // Enforce custom type
                data: {
                    label: node.data?.label || 'Untitled',
                    type: node.data?.type || 'explanation',
                    details: node.data?.details || undefined, // Add this line
                    isCollapsed: false,
                } as CustomNodeData,
                position: node.position || { x: parentPosition.x, y: parentPosition.y + 100 + (Math.random() * 50) }, // Fallback positioning
            }));
            return { newNodes: validatedNodes, newEdges: flow.edges };
        } else {
            console.error("Invalid JSON structure for expansion (generateExpansionForNode):", cleanedJsonString);
            throw new Error("The AI's expansion data is incomplete. Please try again.");
        }
    } catch (e: any) {
        console.error("Failed to parse AI expansion response (generateExpansionForNode):", e.message);
        if (e.message.startsWith("The AI returned") || e.message.startsWith("The AI's expansion data")) {
            throw e;
        }
        throw new Error("The AI returned an unreadable expansion format. Please try again.");
    }
}
