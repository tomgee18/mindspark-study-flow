import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Edge, Node } from '@xyflow/react';
import { CustomNodeData } from "@/features/mind-map/components/CustomNode";
import { sanitizeText, decryptApiKey, checkRateLimit } from "@/lib/utils";

const MODEL_NAME = "gemini-1.5-flash-latest";
const MAX_TEXT_LENGTH = 500000; // Increased from 100k to 500k characters

type MindMapFlow = {
    nodes: Node<CustomNodeData>[];
    edges: Edge[];
}

export async function generateMindMapFromText(text: string): Promise<MindMapFlow> {
    // TODO: Implement chunking or streaming for large text inputs
    // TODO: Implement chunking or streaming for large text inputs
    const rateLimitResult = checkRateLimit('ai_generate');
    if (!rateLimitResult.allowed) {

        throw new Error(`You are making too many requests. Please try again in ${rateLimitResult.retryAfter} seconds.`);

    }

    if (text.length > MAX_TEXT_LENGTH) {
        throw new Error(`Input text is too long. Please provide text with less than ${MAX_TEXT_LENGTH.toLocaleString()} characters.`);
    }

    // Optimize text by removing excessive whitespace and redundant content
    const optimizedText = text
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n{3,}/g, '\n\n') // Reduce excessive line breaks
        .trim();

    const sanitizedText = sanitizeText(optimizedText);
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
        temperature: 0.8, // Reduced from 1.0 for more focused responses
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

    const prompt = `You are a mind map generation expert. Based on the following text, generate a comprehensive mind map in JSON format for a react-flow diagram. The JSON should have 'nodes' and 'edges' properties.

IMPORTANT: Each node must contain CONCISE, CLEAR content that conveys the main point effectively. Use 1-2 focused sentences that capture the essential information without being verbose.

Each node must have an 'id' (string), 'type: "custom"', 'position' ({x: number, y: number}), and 'data' object. The 'data' object must have:
- 'label' (string): A clear, concise explanation (1-2 sentences maximum), NOT just a heading
- 'type' (string): One of 'topic', 'definition', 'explanation', 'critical-point', 'example'

Guidelines for node content:
- 'topic' nodes: Provide a brief overview with key context in 1-2 sentences
- 'definition' nodes: Include clear definitions with essential context in 1-2 sentences
- 'explanation' nodes: Offer focused explanations of key concepts in 1-2 sentences
- 'critical-point' nodes: Highlight important insights or facts in 1-2 sentences
- 'example' nodes: Provide specific, relevant examples in 1-2 sentences

The root node should be of type 'topic' and positioned at { x: 0, y: 0 }.
Position other nodes in a hierarchical layout around the root node with adequate spacing (200-300 pixels between nodes).
Each edge must have an 'id' (string), 'source' (source node id as a string), and 'target' (target node id as a string).

Ensure the output is a valid JSON object and nothing else. Do not add any commentary or wrap it in markdown backticks.

Here is the text to analyze:
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
        console.error("Google AI API error (generateMindMapFromText):", apiError);
        throw new Error(`AI service temporarily unavailable. Please try again in a few moments.`);
    }

    try {
        const responseText = result.response.text();
        console.log("Raw AI response:", responseText); // Debug logging
        
        let cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '');
        const jsonStartIndex = cleanedJsonString.indexOf('{');
        const jsonEndIndex = cleanedJsonString.lastIndexOf('}');
        
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            cleanedJsonString = cleanedJsonString.substring(jsonStartIndex, jsonEndIndex + 1);
        } else {
            console.error("Could not extract JSON from AI response:", responseText);
            throw new Error("AI response format error. Please try again with different input.");
        }

        const flow = JSON.parse(cleanedJsonString);
        
        if (flow && Array.isArray(flow.nodes) && Array.isArray(flow.edges) && flow.nodes.length > 0) {
            // Validate node structure
            const validatedNodes = flow.nodes.map((node: any, index: number) => ({
                ...node,
                id: node.id || `node-${index}`,
                type: 'custom',
                position: node.position || { x: index * 200, y: index * 100 },
                data: {
                    label: node.data?.label || 'Untitled Node',
                    type: node.data?.type || 'explanation',
                }
            }));
            
            
            return { nodes: validatedNodes, edges: flow.edges };
        } else {
            console.error("Invalid mind map structure:", flow);
            throw new Error("Generated mind map structure is incomplete or invalid. Please check the AI response format.");
        }
    } catch (e: any) {
        console.error("Failed to parse AI response:", e.message);
        if (e instanceof SyntaxError) {
            throw new Error("AI response contains invalid JSON. Please try again.");
        } else if (e.message.includes("AI response format") || e.message.includes("Generated mind map")) {
            throw new Error("Invalid JSON format in AI response. Please try again.");
        } else if (e.message.includes("AI response format") || e.message.includes("Generated mind map")) {

        } else {
            throw new Error("Unable to process AI response. Please try again with clearer input text.");
        }
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
    if (mindMapPromptData.length > MAX_TEXT_LENGTH / 2) { // Reserve half for other parts of prompt
         throw new Error("Mind map data is too large to generate a quiz. Please simplify the mind map.");
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
            // Sanitize the responseText before logging
            const sanitizedResponse = responseText.replace(/[\r\n]+/g, ' ').trim();
            console.error("Raw AI response for quiz:", sanitizedResponse);
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
            // Sanitize the responseText before logging
            const sanitizedResponse = responseText.replace(/[\r\n]+/g, ' ').trim();
            console.error("Raw AI response for quiz (expected array):", sanitizedResponse);
            throw new Error('Invalid JSON structure for quiz from AI (expected an array).');
        }
    } catch (e: any) {
        console.error("Failed to parse AI quiz response:", e.message);
        // Sanitize the responseText before logging
        const sanitizedResponse = result.response.text().replace(/[\r\n]+/g, ' ').trim();
        console.error("Raw AI response text for quiz:", sanitizedResponse);
        throw new Error(`Failed to parse quiz from AI response: ${e.message}`);
    }
}


export async function generateSummaryFromNodes(
    nodes: Node<CustomNodeData>[],
    title: string
): Promise<string> {
    const rateLimitResult = checkRateLimit('ai_summary');
    if (!rateLimitResult.allowed) {
        throw new Error(`Rate limit exceeded for summary generation. Please try again in ${rateLimitResult.retryAfter} seconds.`);
    }

    const apiKey = await decryptApiKey();
    if (!apiKey) {
        throw new Error("Google AI API key not found. Please set it in the AI Settings.");
    }

    // Prepare node data for the prompt
    let nodeContent = "";
    nodes.forEach(node => {
        nodeContent += `- ${node.data.type.toUpperCase()}: ${node.data.label}\n`;
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.4,
        topK: 1,
        topP: 1,
        maxOutputTokens: 4096,
    };

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const summaryPrompt = `You are an expert at summarizing and synthesizing information. Based on the following mind map nodes, create a comprehensive summary that explains the topic and connects the key concepts.

Mind Map Title: ${title}

Mind Map Nodes:
${nodeContent}

Please provide a well-structured summary that:
1. Introduces the main topic
2. Explains key concepts and their relationships
3. Synthesizes the information into a coherent narrative
4. Concludes with the most important takeaways

Format the summary with appropriate paragraphs and structure. The summary should be informative and educational.`;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: summaryPrompt }] }],
            generationConfig,
            safetySettings,
        });

        return result.response.text();
    } catch (error: any) {
        console.error("Error generating summary:", error);
        if (error.response) {
            console.error("API response:", error.response);

        }
        if (error instanceof TypeError) {
            throw new Error(`Failed to generate summary: Network error or invalid API response`);
        } else if (error.code === 'ECONNREFUSED') {
            throw new Error(`Failed to generate summary: Unable to connect to the AI service`);
        } else {
            throw new Error(`Failed to generate summary: ${error.message}`);
        }
    }
}

export async function generateExpansionForNode(
    parentNode: Node<CustomNodeData>,
): Promise<{ newNodes: Node<CustomNodeData>[], newEdges: Edge[] }> {
    // ... (previous code remains unchanged)

    try {
        const responseText = result.response.text();
        // Robust cleaning of JSON
        let cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '');
        const jsonStartIndex = cleanedJsonString.indexOf('{');
        const jsonEndIndex = cleanedJsonString.lastIndexOf('}');
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            cleanedJsonString = cleanedJsonString.substring(jsonStartIndex, jsonEndIndex + 1);
        } else {
            // Use a sanitized version of the response text
            console.error("Raw AI response for expansion:", JSON.stringify(responseText)); // import JSON
            throw new Error("Could not find valid JSON in AI expansion response.");
        }

        // ... (rest of the code remains unchanged)
    } catch (e: any) {
        console.error("Failed to parse AI expansion response:", e.message);
        console.error("Raw AI response text for expansion:", JSON.stringify(result.response.text())); // import JSON
        throw new Error(`Failed to parse node expansion from AI response: ${e.message}`);
    }
}

