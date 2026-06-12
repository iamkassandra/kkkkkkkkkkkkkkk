import { GoogleGenAI, Type } from "@google/genai";

// Lazy-loaded AI client to safely manage initialization & missing keys
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in the Secrets panel in AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

/**
 * Generates sub-concepts for mind mapping
 */
export async function handleGenerateConcept(topic: string) {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Analyze the topic "${topic}". Generate a brief 1-2 sentence overview and exactly 4 core sub-concepts that branch off from this topic to form a educational teaching mind-map. Output must be structured strictly in JSON matching the schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: { type: Type.STRING },
          concepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["id", "title", "description"]
            }
          }
        },
        required: ["overview", "concepts"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini.");
  }
  return JSON.parse(text);
}

/**
 * Generates an elegant Markdown explanation for a concept
 */
export async function handleGenerateExplanation(conceptTitle: string, parentTopic?: string) {
  const ai = getAIClient();
  const context = parentTopic ? `under the broader subject of "${parentTopic}"` : "";
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Assemble a beautifully formatted markdown lesson for the concept "${conceptTitle}" ${context}. 
    Use clean headings, bullet points, and blocks. The output must contain:
    - **Visual Analogy**: A beautifully descriptive, memorable real-world analogy to make it easy to understand.
    - **Key Axioms**: 3 concise bullet points outlining the core foundational rules or mechanisms.
    - **Practical Application**: A modern, real-world scenario or industry application where this is used.
    - **Intriguing Trivia**: A single bold callout or 'Did you know?' historical/scientific fun fact.

    Keep the tone academic, accessible, highly articulate, and concise (about 300 words). Do not include excessive metadata or markdown wrapper tags.`,
  });

  return { content: response.text || "" };
}

/**
 * Generates a deck of concise study flashcards from concepts
 */
export async function handleGenerateFlashcards(concepts: Array<{ title: string, description: string }>) {
  const ai = getAIClient();
  const listText = concepts.map(c => `- ${c.title}: ${c.description}`).join("\n");
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Generate a deck of exactly 4 concise study flashcards based on the following list of active mind-map concepts:\n\n${listText}\n\nEach card must challenge high-yield understanding. Output must be structured strictly in JSON matching the schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            category: { type: Type.STRING }
          },
          required: ["question", "answer", "category"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini.");
  }
  return JSON.parse(text);
}
