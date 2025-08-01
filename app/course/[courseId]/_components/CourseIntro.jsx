// app/course/[courseId]/_components/CourseIntro.jsx
"use client";

import React from "react";

// A simple card component for consistent styling
const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">{children}</div>
);

/**
 * Renders the course introduction section with the title, difficulty, and duration.
 * This component receives the `course` object as a prop from the parent `page.jsx`.
 * @param {object} props The component props.
 * @param {object} props.course The course object containing title, difficulty, etc.
 */
const CourseIntro = ({ course }) => {
  // Defensive check to ensure we have course data before rendering
  if (!course) {
    return null;
  }

  return (
    <>
      {/* Course Headline and Metadata */}
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{course.title}</h1>
      <div className="flex items-center space-x-4 mb-8">
        <span className="text-sm text-gray-500">
          Difficulty:{" "}
          <span className="font-semibold capitalize">{course.difficulty}</span>
        </span>
        <span className="text-sm text-gray-500">
          Recommended Duration:{" "}
          <span className="font-semibold">{course.recommendedDuration}</span>
        </span>
      </div>

      {/* Placeholder for Course Intro section with a Progress card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          {/* The progress bar and chapter count */}
          <h2 className="text-xl font-semibold mb-2">Progress</h2>
          <p className="text-gray-500 mb-4">
            Total Chapters: {course.modules?.length || 0}
          </p>
          {/* You can implement a real progress bar here based on completed lessons */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${(course.modules?.length || 0) > 0 ? 100 : 0}%`,
              }} // Simplified for display
            ></div>
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-2">Course Intro</h2>
          {/*
            Conditional rendering: if course.introduction exists and is not empty,
            display it. Otherwise, show a fallback message.
          */}
          <p className="text-gray-500">
            {course.introduction && course.introduction.trim() !== ""
              ? course.introduction
              : "A brief introduction to the course will be generated here."}
          </p>
        </Card>
      </div>
    </>
  );
};

export default CourseIntro;
