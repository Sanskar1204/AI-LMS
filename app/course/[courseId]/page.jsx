// app/course/[courseId]/page.jsx
"use client"; // This component needs to be a Client Component to use useState/useEffect

import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios for making API calls
import { useParams, useRouter } from "next/navigation";
import CourseIntro from "./_components/CourseIntro"; // Assuming these components exist
// import StudyMatrailSection from "./_components/StudyMatrailSection"; // Assuming these components exist
import ChapterList from "./_components/ChapterList"; // Assuming these components exist
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react"; // Added Loader2 for loading state

const Course = () => {
  const { courseId } = useParams(); // Get the dynamic courseId from the URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to handle errors
  const router = useRouter();

  useEffect(() => {
    if (courseId) {
      getCourseDetails();
    }
  }, [courseId]); // Re-run effect if courseId changes

  const getCourseDetails = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      // Call the new dedicated API route for fetching single course details
      const result = await axios.get(`/api/course-details/${courseId}`);

      if (!result.data.success) {
        throw new Error(result.data.error || "Failed to fetch course details.");
      }

      setCourse(result.data.result); // Set the fetched course data
    } catch (err) {
      console.error("Error fetching course details:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to load course details."
      );
      setCourse(null); // Clear course data on error
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.push("/dashboard");
  };

  return (
    <div className="mx-10 md:mx-36 lg:px-60 mt-10">
      <Button
        variant="ghost"
        size="sm"
        onClick={goBack}
        className="flex items-center gap-1 my-3 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        <span>Back </span>
      </Button>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading course details...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      ) : course ? (
        <div>
          {/* Pass the entire course object to child components */}
          <CourseIntro course={course} />
          {/* <StudyMatrailSection courseId={courseId} course={course} /> */}
          <ChapterList course={course} />
        </div>
      ) : (
        <p className="text-red-500">Course not found or an error occurred.</p>
      )}
    </div>
  );
};

// ADD THIS LINE:
export default Course;
