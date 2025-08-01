// app/api/courses/route.js
import { Client } from "pg"; // Import the PostgreSQL client

/**
 * Handles POST requests to retrieve a list of courses created by a specific user.
 * This endpoint expects a 'createdBy' field in the request body.
 * It queries the database and returns the courses.
 *
 * @param {Request} request The incoming Next.js request object.
 * @returns {Response} A JSON response containing the list of courses or an error.
 */
export async function POST(request) {
  // Create a new PostgreSQL client instance
  // The DATABASE_URL environment variable will be used for connection
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      // Required for Neon DB to connect securely.
      // In production, consider a more robust SSL configuration if available.
      rejectUnauthorized: false,
    },
  });

  try {
    // Connect to the database
    await client.connect();

    const { createdBy } = await request.json();

    // Input validation: Ensure createdBy is provided
    if (!createdBy) {
      console.error(
        "Error: 'createdBy' field is missing in the request body for /api/courses."
      );
      return Response.json(
        {
          error: "User identifier ('createdBy') is required to fetch courses.",
          success: false,
        },
        { status: 400 }
      );
    }

    // Execute SQL query to fetch courses from the 'study_materials' table.
    // 'content' column and its derived fields are excluded.
    // Added LIMIT 10 for testing to see if the number of rows is causing the 'aborted' error.
    const queryText = `
      SELECT 
        id, 
        course_id AS "courseId", 
        course_type AS "courseType",
        topic AS "courseDescription", 
        difficulty_level AS "difficultyLevel",
        created_by AS "createdBy",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM "study_materials"
      WHERE created_by = $1
      ORDER BY "createdAt" DESC
      LIMIT 10; -- TEMPORARY: Added LIMIT for testing the 'aborted' error
    `;
    const values = [createdBy];

    const result = await client.query(queryText, values);
    const courses = result.rows; // The fetched rows are in result.rows

    // Return the fetched courses
    return Response.json({ success: true, result: courses });
  } catch (error) {
    console.error("Error fetching courses in /api/courses:", {
      message: error.message,
      stack: error.stack,
    });

    // Return a generic 500 error for unexpected issues
    return Response.json(
      {
        error: "Failed to retrieve courses. Please try again later.",
        success: false,
      },
      { status: 500 }
    );
  } finally {
    // Ensure the client is disconnected even if an error occurs
    if (client) {
      await client.end();
    }
  }
}
