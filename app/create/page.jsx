"use client";

import React, { useState, useEffect } from "react";
import SelectOptions from "./_components/SelectOptions";
import { Button } from "@/components/ui/button";
import TopicInputs from "./_components/TopicInputs";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

const Create = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  // Log formData changes (for debugging)
  useEffect(() => {
    console.log("Updated FormData:", formData);
  }, [formData]);

  const handleUserInput = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  const GenerateCourseOutline = async () => {
    try {
      // Basic validation before sending to API
      if (!formData.courseDescription) {
        console.error(
          "Error: Course description is required before generating."
        );
        alert("Please provide a course description before generating."); // User-friendly alert
        return;
      }

      const courseId = uuidv4(); // Generate UUID for the course
      setLoading(true);

      // Payload for AI course outline generation
      const generatePayload = {
        courseId, // Pass courseId to AI generation if needed for internal tracking
        courseDescription: formData.courseDescription,
        difficultyLevel: formData.difficultyLevel,
        studyType: formData.studyType,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      };

      console.log("Payload being sent to AI generation API:", generatePayload);

      // 1. Call the AI generation API
      const generateResult = await axios.post(
        "/api/generate-course-outline",
        generatePayload
      );

      console.log("AI Generation API Response:", generateResult.data);

      if (!generateResult.data.success || !generateResult.data.result) {
        throw new Error(
          generateResult.data.error ||
            "AI generation failed with no specific error."
        );
      }

      const aiGeneratedContent = generateResult.data.result; // The full JSON outline from AI

      // 2. Prepare payload for saving the course to your database
      const savePayload = {
        courseId: generatePayload.courseId, // Use the same courseId
        courseDescription: generatePayload.courseDescription,
        difficultyLevel: generatePayload.difficultyLevel,
        studyType: generatePayload.studyType,
        createdBy: generatePayload.createdBy,
        aiGeneratedContent: aiGeneratedContent, // Pass the entire AI-generated content
      };

      console.log("Payload being sent to save course API:", savePayload);

      // 3. Call the API to save the course to the database
      const saveResult = await axios.post("/api/save-course", savePayload);

      console.log("Save Course API Response:", saveResult.data);

      if (!saveResult.data.success) {
        throw new Error(
          saveResult.data.error || "Failed to save course to database."
        );
      }

      setLoading(false);
      // Redirect to the dashboard after successful generation AND saving
      router.replace("/dashboard");
    } catch (error) {
      console.error("Error in course generation or saving process:", error);
      setLoading(false);
      // Display a more user-friendly error message
      alert(
        error.response?.data?.error ||
          error.message ||
          "An unexpected error occurred. Please try again."
      );
    }
  };

  return (
    <div className="flex flex-col items-center p-5 md:px-24 lg:px-36 mt-10">
      <h2 className="font-bold text-3xl text-primary text-center">
        Start Building Your Personal Study Material
      </h2>
      <p className="text-gray-600 text-center">
        Fill in all details to generate study material for your next project.
      </p>

      <div className="mt-10 w-full">
        {step === 0 ? (
          <SelectOptions
            selectedStudyType={(value) => handleUserInput("studyType", value)}
          />
        ) : (
          <TopicInputs
            setTopic={(value) => handleUserInput("courseDescription", value)}
            setDifficultyLevel={(value) =>
              handleUserInput("difficultyLevel", value)
            }
          />
        )}
      </div>

      {/* Buttons Section */}
      <div className="flex items-center justify-between w-full mt-10">
        {step > 0 ? (
          <Button onClick={() => setStep(step - 1)} variant="outline">
            Previous
          </Button>
        ) : (
          <div className="w-[80px]"></div>
        )}

        {step === 0 ? (
          <Button onClick={() => setStep(1)}>Next</Button>
        ) : (
          <Button onClick={GenerateCourseOutline} disabled={loading}>
            {loading ? <Loader className="animate-spin mr-2" /> : "Generate"}{" "}
            {loading ? "Generating..." : ""}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Create;
