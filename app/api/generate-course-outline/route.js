import { GoogleGenerativeAI } from "@google/generative-ai";

// Retry configuration for a single model call
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

// Define the fallback models in order of preference.
// 'gemini-1.5-pro' is the latest powerful Pro model.
// 'gemini-1.5-flash' is a faster, more cost-effective alternative.
// 'gemini-pro' was causing a 404 and has been replaced/updated.
// Ensure this array is updated in your backend file!
// app/api/generate-course-outline/route.js
const FALLBACK_MODELS = ["gemini-1.5-flash"];

/**
 * Attempts to generate content with a given model and prompt,
 * with built-in retries for transient errors.
 * @param {import('@google/generative-ai').GenerativeModel} model The GenerativeModel instance.
 * @param {string} prompt The text prompt to send to the model.
 * @param {number} attempt The current retry attempt (internal use).
 * @returns {Promise<string>} The generated text response.
 * @throws {Error} If all retry attempts fail.
 */
async function generateWithRetry(model, prompt, attempt = 0) {
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    // Ensure the response has text content
    if (result.response && result.response.text) {
      return result.response.text();
    } else {
      // Handle cases where the response structure is unexpected
      throw new Error("Invalid response structure from generative model.");
    }
  } catch (error) {
    // Log the specific error for debugging
    console.error(`Attempt ${attempt + 1} failed:`, error.message);

    // If max retries reached, rethrow the error
    if (attempt >= MAX_RETRIES - 1) {
      throw error;
    }

    // Calculate exponential backoff delay
    const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry with the same model
    return generateWithRetry(model, prompt, attempt + 1);
  }
}

/**
 * Handles POST requests to generate a course outline using Google Generative AI.
 * It iterates through a list of fallback models until a successful response is obtained.
 * @param {Request} request The incoming Next.js request object.
 * @returns {Response} A JSON response containing the course outline or an error.
 */
export async function POST(request) {
  try {
    // 1. Verify API key
    if (!process.env.GEMINI_API_KEY) {
      console.error(
        "Server Error: Gemini API key not configured in environment variables."
      );
      return Response.json(
        {
          error: "Server configuration error: AI service not available.",
          success: false,
        },
        { status: 500 }
      );
    }

    // 2. Initialize client and parse request body
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const { courseDescription } = await request.json();

    // Input validation: Ensure courseDescription is provided
    if (!courseDescription) {
      return Response.json(
        {
          error: "Course description is required.",
          success: false,
        },
        { status: 400 }
      );
    }

    // 3. Create properly formatted prompt for JSON output
    const prompt = `Generate a comprehensive course outline based on: ${courseDescription}. 
      Respond ONLY with a valid JSON object containing:
      - "title": string (e.g., "Introduction to Web Development")
      - "difficulty": "beginner" | "intermediate" | "advanced"
      - "modules": array of objects, where each object has:
          - "name": string (e.g., "Module 1: HTML Basics")
          - "lessons": array of objects, where each object has:
              - "title": string (e.g., "Lesson 1.1: Introduction to HTML")
              - "duration": string (e.g., "30 min", "1 hour")
      - "recommendedDuration": string (overall course duration, e.g., "8 hours", "2 weeks")

      Example JSON structure:
      {
        "title": "Example Course",
        "difficulty": "beginner",
        "modules": [
          {
            "name": "Module 1",
            "lessons": [
              {"title": "Lesson 1.1", "duration": "30 min"}
            ]
          }
        ],
        "recommendedDuration": "4 hours"
      }
      `;

    // 4. Try models with fallback strategy
    let lastError = null;
    for (const modelName of FALLBACK_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 8192,
            // Ensure the model is instructed to return JSON
            responseMimeType: "application/json",
          },
        });

        console.log(`Attempting to generate content with model: ${modelName}`);
        const responseText = await generateWithRetry(model, prompt);

        // Attempt to parse the JSON response
        const jsonResponse = JSON.parse(responseText);

        // If parsing is successful, return the response
        return Response.json({ success: true, result: jsonResponse });
      } catch (error) {
        lastError = error;
        console.warn(`Failed with model ${modelName}:`, error.message);
        // If the error is a 404 (model not found), log specifically and try next model
        if (error.message.includes("404 Not Found")) {
          console.warn(
            `Model ${modelName} not found or supported. Trying next fallback model.`
          );
          continue; // Try the next model in the fallback list
        }
        // For other errors, rethrow to be caught by the outer try-catch
        throw error;
      }
    }

    // If all fallback models failed
    throw (
      lastError ||
      new Error("All configured AI models failed to generate a response.")
    );
  } catch (error) {
    console.error("Generation Error in API route:", {
      message: error.message,
      stack: error.stack,
      // Include response data if it's an Axios error from an internal call (though not expected here)
      response: error.response?.data,
      status: error.response?.status,
    });

    // Determine status code and user-friendly message
    let errorMessage =
      "Failed to generate course outline. Please try again later.";
    let statusCode = 500;

    if (error.message.includes("Gemini API key not configured")) {
      errorMessage =
        "Server configuration error: AI service not available. Please contact support.";
      statusCode = 500;
    } else if (
      error.message.includes("overloaded") ||
      error.message.includes("quota")
    ) {
      errorMessage =
        "The AI service is currently overloaded or has hit a quota limit. Please try again later.";
      statusCode = 503; // Service Unavailable
    } else if (error.message.includes("All configured AI models failed")) {
      errorMessage =
        "Could not generate content with any available AI models. Please try again.";
      statusCode = 500;
    } else if (
      error.message.includes("Invalid response structure") ||
      error.message.includes("JSON.parse")
    ) {
      errorMessage =
        "The AI generated an invalid response. Please try again or refine your description.";
      statusCode = 500;
    } else if (error.message.includes("Course description is required")) {
      errorMessage = error.message; // Use the specific message from input validation
      statusCode = 400;
    }

    return Response.json(
      {
        error: errorMessage,
        success: false,
      },
      { status: statusCode }
    );
  }
}
