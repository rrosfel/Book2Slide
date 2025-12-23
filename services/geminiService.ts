import { GoogleGenAI } from "@google/genai";
import { BookInfographicData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBookInfographic = async (title: string, author: string): Promise<BookInfographicData> => {
  const modelId = "gemini-3-pro-preview";

  const prompt = `
  Act as a world-class literary critic and expert analyst. I need a deep, high-level analysis of the book "${title}" by "${author}", suitable for a professional lecture or slide deck.
  
  OBJECTIVE:
  Do NOT provide a generic, surface-level summary. Your output must match the depth of a university-level study guide. 
  You must identify the author's specific coined terms, their central philosophical or narrative thesis, and the structural evolution of their argument.

  TOOLS:
  Use Google Search to find high-quality critiques, academic analyses, and the specific vocabulary used by the author.

  JSON STRUCTURE & CONTENT REQUIREMENTS:
  1. "summary" (THE CENTRAL THESIS):
     - For Non-Fiction: What is the core paradigm shift or theory proposed? (e.g., "From discipline to flexibility," "The end of history").
     - For Fiction: What is the central thematic conflict or philosophical question?
     - Length: A substantial, analytical paragraph (approx 130-160 words).
  
  2. "keyConcepts" (DISTINCTIVE TERMINOLOGY):
     - Identify 4 specific concepts, archetypes, or terms COINED or heavily used by the author (e.g., "The Third Woman," "Antifragility," "Doublethink," "Liquid Modernity").
     - Avoid generic words like "Love" or "War" unless defined in a unique way.
     - Definition: Explain the specific nuance of the term in the context of the book.

  3. "plotArc" (STRUCTURAL EVOLUTION):
     - For Non-Fiction: Track the logical progression of the argument (Premise -> Evidence -> Counter-point -> Conclusion).
     - For Fiction: Track the narrative arc.
  
  4. "takeaways" (CRITICAL CONCLUSION):
     - What is the final diagnosis? Is it optimistic, pessimistic, or neutral?
     - What is the "Call to Action" or the "Map" the author provides?

  OUTPUT FORMAT:
  Return ONLY a valid JSON object with this exact structure:
  {
    "title": "Exact Book Title",
    "author": "Author Name",
    "publicationYear": "YYYY",
    "genre": "Specific Genre (e.g., 'Sociological Essay', 'Dystopian Fiction')",
    "tagline": "A sophisticated, intellectual hook (5-10 words)",
    "summary": "The deep analysis/central thesis paragraph.",
    "targetAudience": "Specific psychographic (e.g. 'Post-structuralists', 'Entrepreneurs', 'Historians')",
    "characters": [
      { "name": "Name/Archetype", "role": "Role", "description": "Analysis of their function", "icon": "👤" }
    ],
    "keyConcepts": [
      { "term": "Specific Term 1", "definition": "Deep definition...", "icon": "💡" },
      { "term": "Specific Term 2", "definition": "Deep definition...", "icon": "⚡" },
      { "term": "Specific Term 3", "definition": "Deep definition...", "icon": "🧠" },
      { "term": "Specific Term 4", "definition": "Deep definition...", "icon": "👁️" }
    ],
    "plotArc": [
      { "stage": "Foundation/Beginning", "description": "The starting premise or situation." },
      { "stage": "Development/Inciting", "description": "The complication or expansion of the argument." },
      { "stage": "Climax/Crux", "description": "The peak of the argument or conflict." },
      { "stage": "Resolution/Synthesis", "description": "The final synthesis or conclusion." }
    ],
    "themes": [
      { "name": "Theme Name", "description": "Explanation", "color": "#FF5733" }
    ],
    "keyQuote": "The most famous or representative quote from the text.",
    "takeaways": [
      "Critical Insight 1",
      "Critical Insight 2",
      "Critical Insight 3"
    ]
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        generationConfig: {
            temperature: 0.3, // Lower temperature for more analytical/factual output
        }
      },
    });

    const text = response.text || "{}";
    const groundings = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract sources if available
    const sources = groundings
      .map(chunk => chunk.web?.uri)
      .filter((uri): uri is string => !!uri);

    // Robust JSON Extraction
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    let cleanJson = "{}";

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
       cleanJson = text.substring(firstBrace, lastBrace + 1);
    } else {
       // Fallback cleanup if braces aren't clear
       cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const data: BookInfographicData = JSON.parse(cleanJson);
    
    // Attach sources to the data object
    data.sources = sources;

    return data;
  } catch (error) {
    console.error("Error generating book infographic:", error);
    throw new Error("Failed to generate deep analysis. Please check the title/author and try again.");
  }
};
