// app/dashboard/_components/CourseList.jsx
"use client";

import { useUser } from "@clerk/nextjs";
import axios from "axios";
import React, { useContext, useEffect, useState, useCallback } from "react";
import CourseCardItem from "./CourseCardItem";
import { Loader2 } from "lucide-react";
import { CourseCountContext } from "@/app/_Context/CourseCountContext";

const POLLING_INTERVAL = 10000; // 10 seconds

const CourseList = () => {
  const { user } = useUser();
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setTotalCourse } = useContext(CourseCountContext);

  // Memoized fetch function to prevent unnecessary recreations
  const fetchCourses = useCallback(async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    try {
      setError(null);
      // IMPORTANT: This component currently sends 'createdBy' to '/api/courses'.
      // The 400 Bad Request error you saw was from '/api/generate-course-outline'
      // expecting 'courseDescription'.
      //
      // Please verify:
      // 1. Is '/api/courses' the correct endpoint for listing courses?
      // 2. Does your backend endpoint at '/api/courses' (or whichever endpoint is being hit)
      //    expect the 'createdBy' field, and is it designed to return a list of courses,
      //    NOT to generate a new course outline?
      //
      // If '/api/courses' is indeed your course generation endpoint,
      // you need to provide a 'courseDescription' in the payload here.
      // Otherwise, you need a separate backend endpoint for listing courses.
      const { data } = await axios.post("/api/courses", {
        createdBy: user.primaryEmailAddress.emailAddress,
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch courses");
      }

      setCoursesList(data.result || []);
      setTotalCourse(data.result?.length || 0);
    } catch (error) {
      console.error("Fetch error caught:", error);
      setError(
        // This will display the error message from the backend if available,
        // otherwise a generic fallback.
        error.response?.data?.error || // Assuming 'error' field for error messages
          error.response?.data?.message || // Or 'message' field
          "Failed to load courses. Please try again later."
      );
      setCoursesList([]);
      setTotalCourse(0);
    }
  }, [user, setTotalCourse]);

  // Initial fetch on mount and when user changes
  useEffect(() => {
    const getCourseList = async () => {
      setLoading(true);
      await fetchCourses();
      setLoading(false);
    };

    getCourseList();
  }, [fetchCourses]);

  // Polling effect
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(fetchCourses, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [user, fetchCourses]);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center p-10 text-center border rounded-lg border-gray-300 bg-gray-50 min-h-[200px]">
      <div className="mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-700">No courses yet</h3>
      <p className="mt-1 text-sm text-gray-500">
        Create your first course to get started with our AI-powered learning
        materials.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="font-bold text-2xl my-3">Your Study Material</h2>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-600">Loading your courses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10">
        <h2 className="font-bold text-2xl my-3">Your Study Material</h2>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="font-bold text-2xl my-3">Your Study Material</h2>

      {coursesList.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-2 gap-5">
          {coursesList.map((course) => (
            <CourseCardItem
              course={course}
              key={course.id}
              refreshCourses={fetchCourses}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
