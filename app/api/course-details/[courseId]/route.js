// app/api/course-details/[courseId]/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// This is a placeholder for your database client import.
// You would replace this with your actual Neon/PostgreSQL client.
// For example:
// import { sql } from '@vercel/postgres'; // Assuming Vercel's Neon integration

// Retry configuration and fallback models
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;
const FALLBACK_MODELS = ["gemini-1.5-flash"];

// --- New function to fetch YouTube video URL ---
/**
 * Searches YouTube for a video and returns the URL of the first result.
 * @param {string} query The search query (e.g., the lesson title).
 * @returns {Promise<string|null>} The YouTube video URL or null if not found.
 */
async function fetchYoutubeVideo(query) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    // This is the most likely cause of the issue
    console.error(
      "YouTube API key is not configured. Please add YOUTUBE_API_KEY to your .env.local file."
    );
    return null;
  }

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    query
  )}&key=${apiKey}&type=video&maxResults=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API returned status: ${response.status}`);
    }
    const data = await response.json();

    // Check if a video was found
    if (data.items && data.items.length > 0) {
      const videoId = data.items[0].id.videoId;
      console.log(
        `YouTube video found for query "${query}": https://www.youtube.com/watch?v=${videoId}`
      );
      return `https://www.youtube.com/watch?v=${videoId}`;
    } else {
      console.log(`No YouTube video found for query: "${query}"`);
    }
  } catch (error) {
    console.error("Error fetching YouTube video:", error);
  }

  return null; // Return null on error or no results
}

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
    if (result.response && result.response.text) {
      return result.response.text();
    } else {
      throw new Error("Invalid response structure from generative model.");
    }
  } catch (error) {
    console.error(
      `Attempt ${attempt + 1} failed with model ${model.model}:`,
      error.message
    );
    if (attempt >= MAX_RETRIES - 1) {
      throw error;
    }
    const delay = INITIAL_DELAY_MS * Math.pow(2, attempt);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return generateWithRetry(model, prompt, attempt + 1);
  }
}

/**
 * Handles the GET request for fetching a single course by its ID.
 * This function first checks the database and, if the course is not found,
 * generates it with the AI and saves it to the database for future requests.
 * @param {Request} request The incoming Next.js request object.
 * @param {object} context The context object containing dynamic route parameters.
 * @returns {NextResponse} A JSON response with the course data or an error.
 */
export async function GET(request, { params }) {
  try {
    const courseId = params.courseId;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required.", success: false },
        { status: 400 }
      );
    }

    //
    // START: YOUR NEON DATABASE LOGIC GOES HERE
    //
    const courseFromDb = null;

    if (courseFromDb) {
      console.log(
        `Course ${courseId} found in database. Returning stored data.`
      );
      return NextResponse.json({ success: true, result: courseFromDb });
    }

    //
    // END: YOUR NEON DATABASE LOGIC GOES HERE
    //

    console.log(`Course ${courseId} not found. Generating with AI...`);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    let courseTitle;
    if (courseId === "1") {
      courseTitle = "Introduction to C++ Programming";
    } else if (courseId === "2") {
      courseTitle = "AI Fundamentals and Machine Learning";
    } else {
      courseTitle = `Course with ID: ${courseId}`;
    }

    // The prompt no longer requests a youtubeUrl from the AI
    const prompt = `Generate a comprehensive course outline for: ${courseTitle}.
      Respond ONLY with a valid JSON object containing:
      - "title": string (e.g., "Introduction to Web Development")
      - "introduction": string (A brief, one-paragraph summary of the course content)
      - "difficulty": "beginner" | "intermediate" | "advanced"
      - "modules": array of objects, where each object has:
          - "name": string (e.g., "Module 1: HTML Basics")
          - "lessons": array of objects, where each object has:
              - "title": string (e.g., "Lesson 1.1: Introduction to HTML")
              - "duration": string (e.g., "30 min", "1 hour")
      - "recommendedDuration": string (overall course duration, e.g., "8 hours", "2 weeks")
    `;

    let courseData = null;
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
            responseMimeType: "application/json",
          },
        });
        const responseText = await generateWithRetry(model, prompt);
        courseData = JSON.parse(responseText);
        break;
      } catch (error) {
        lastError = error;
        console.warn(`Failed with model ${modelName}:`, error.message);
      }
    }

    if (!courseData) {
      throw (
        lastError ||
        new Error("All configured AI models failed to generate a response.")
      );
    }

    // --- New logic to fetch YouTube videos for each lesson ---
    for (const module of courseData.modules) {
      for (const lesson of module.lessons) {
        // Use the lesson title as the search query
        const youtubeUrl = await fetchYoutubeVideo(lesson.title + " course");
        // Add the found URL to the lesson object
        lesson.youtubeUrl = youtubeUrl;
      }
    }

    //
    // START: YOUR NEON DATABASE LOGIC GOES HERE AGAIN
    //

    console.log(
      `Successfully generated and stored course ${courseId} in the database.`
    );
    //
    // END: YOUR NEON DATABASE LOGIC GOES HERE AGAIN
    //

    return NextResponse.json({ success: true, result: courseData });
  } catch (error) {
    console.error("Error fetching course details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch course details. Please try again later.",
        success: false,
      },
      { status: 500 }
    );
  }
}
