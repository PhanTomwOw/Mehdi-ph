
import { GoogleGenAI, Type } from "@google/genai";
import type { SportComplex, Review, User, AISuggestion } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sportsComplexSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER, description: "Unique identifier for the complex" },
      name: { type: Type.STRING, description: "Name of the sports complex" },
      address: { type: Type.STRING, description: "Full address of the complex in Tabriz" },
      sports: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of available sports like Futsal, Volleyball, etc.",
      },
      description: { type: Type.STRING, description: "A brief, appealing description of the facility" },
      imageUrl: { type: Type.STRING, description: "A placeholder image URL from https://picsum.photos" },
      rating: { type: Type.NUMBER, description: "A rating from 4.0 to 5.0" },
      availableTimeSlots: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            time: { type: Type.STRING, description: "Time slot, e.g., '14:00 - 15:00'" },
            isBooked: { type: Type.BOOLEAN, description: "Whether the slot is already booked" },
          },
        },
        description: "List of available time slots for a given day"
      },
    },
  },
};

export const fetchSportsComplexes = async (): Promise<SportComplex[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a list of 8 fictional but realistic-sounding sports complexes in Tabriz, Iran. For each complex, provide a unique ID, name, address, a list of 3-4 sports offered, a short description, a random image URL from picsum.photos with size 600x400, a rating between 4.2 and 4.9, and 8 available time slots for today, with about 3 of them marked as booked.",
      config: {
        responseMimeType: "application/json",
        responseSchema: sportsComplexSchema,
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data as SportComplex[];

  } catch (error) {
    console.error("Error fetching sports complexes:", error);
    // In case of an error, return an empty array or handle it as needed.
    return [];
  }
};


export const generateTeamBuildingPost = async (sport: string, time: string, message: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a friendly and enthusiastic sports community manager. A user wants to find teammates for an activity in Tabriz. Create an engaging and inviting announcement post for them.
            
            Here are the details:
            - Sport: ${sport}
            - Time: ${time}
            - User's message: "${message}"

            The post should be friendly, clear, and encourage people to join. Write it in a way that can be easily copied and shared on social media. Start with a catchy headline.`,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating team building post:", error);
        return "Sorry, we couldn't generate a post right now. Please try again later.";
    }
};

export const summarizeReviews = async (reviews: Review[]): Promise<string> => {
    try {
        if (reviews.length === 0) {
            return "No reviews to summarize.";
        }

        const reviewContent = reviews.map(r => `- Rating: ${r.rating}/5\n- Comment: "${r.comment}"`).join('\n\n');

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `As a helpful assistant, analyze the following user reviews for a sports complex. Provide a balanced, brief summary highlighting the main positive points (pros) and negative points (cons). Do not invent information. Base your summary solely on the provided reviews.

            Here are the reviews:
            ${reviewContent}
            
            Please structure your output with a "Pros:" section and a "Cons:" section. If there are no clear cons or pros, state that.`,
        });

        return response.text;
    } catch (error) {
        console.error("Error summarizing reviews:", error);
        throw new Error("Failed to generate review summary.");
    }
};

const suggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The name of the suggested complex." },
            reason: { type: Type.STRING, description: "A short, personalized reason for the suggestion." }
        },
    }
};


export const getAIComplexSuggestions = async (user: User, complexes: SportComplex[]): Promise<AISuggestion[]> => {
    try {
        if (!complexes || complexes.length === 0) return [];
        
        const complexNames = complexes.map(c => c.name).join(', ');
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are a sports complex recommendation assistant for Tabriz SportZone.
            A user with the identifier "${user.emailOrPhone}" wants personalized suggestions.
            Based on their profile (you can infer preferences), suggest the top 3 complexes for them from the following list.
            Provide a short, friendly, and personalized reason for each suggestion.

            Available complexes: ${complexNames}

            Return the response as a JSON array of objects, where each object has a 'name' and a 'reason' key.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestionSchema,
            },
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as AISuggestion[];

    } catch (error) {
        console.error("Error getting AI suggestions:", error);
        throw new Error("Failed to generate AI suggestions.");
    }
};
