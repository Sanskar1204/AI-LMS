// app/api/save-course/route.js
import { Client } from "pg"; // Import the PostgreSQL client

/**
 * Handles POST requests to save a newly generated course outline to the database.
 * This endpoint expects the full course data, including the AI-generated content.
 *
 * @param {Request} request The incoming Next.js request object.
 * @returns {Response} A JSON response indicating success or failure.
 */
export async function POST(request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    // Parse the request body to get the course data
    // This payload should come directly from the AI generation result in frontend
    const {
      courseId,
      courseDescription, // This maps to 'topic' in your DB
      difficultyLevel,
      studyType, // This maps to 'course_type' in your DB
      createdBy,
      aiGeneratedContent, // This is the full JSONB from AI, maps to 'content' in your DB
    } = await request.json();

    // Input validation
    if (
      !courseId ||
      !courseDescription ||
      !difficultyLevel ||
      !studyType ||
      !createdBy ||
      !aiGeneratedContent
    ) {
      console.error(
        "Validation Error: Missing required fields for saving course."
      );
      return Response.json(
        {
          error: "Missing required course data for saving.",
          success: false,
        },
        { status: 400 }
      );
    }

    // Convert the AI generated content object to a JSON string for JSONB column
    const contentJsonString = JSON.stringify(aiGeneratedContent);

    // SQL query to insert the new course into the 'study_materials' table
    // Ensure column names match your CREATE TABLE command exactly.
    const queryText = `
      INSERT INTO "study_materials" (
        course_id, 
        course_type, 
        topic, 
        difficulty_level, 
        created_by, 
        content
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id; -- Return the ID of the newly inserted row
    `;
    const values = [
      courseId,
      studyType, // maps to course_type
      courseDescription, // maps to topic
      difficultyLevel,
      createdBy,
      contentJsonString, // JSONB content
    ];

    const result = await client.query(queryText, values);
    const newCourseId = result.rows[0].id; // Get the ID of the inserted course

    return Response.json(
      {
        success: true,
        message: "Course saved successfully!",
        id: newCourseId,
      },
      { status: 201 }
    ); // 201 Created
  } catch (error) {
    console.error("Error saving course in /api/save-course:", {
      message: error.message,
      stack: error.stack,
    });
    return Response.json(
      {
        error: "Failed to save course. Please try again later.",
        success: false,
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.end();
    }
  }
}
