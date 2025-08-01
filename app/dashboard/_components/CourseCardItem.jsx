// app/dashboard/_components/CourseCardItem.jsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CourseCardItem = ({ course }) => {
  if (!course) {
    return null; // Don't render if course data is missing
  }

  // Get the unique ID for the course
  const courseId = course.id;
  // Prefer the courseName, but fall back to the courseDescription if needed.
  // Display a clear message if both are missing.
  const courseName =
    course.courseName || course.courseDescription || "Course title unavailable";
  // The courseDescription is still needed for the card's body text
  const courseDescription =
    course.courseDescription || "No description available.";

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{courseName}</h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {courseDescription}
      </p>

      {/* Use Link component for navigation */}
      {courseId ? (
        <Link href={`/course/${courseId}`} passHref>
          <Button className="w-full">View Details</Button>
        </Link>
      ) : (
        // Disable the button if the course ID is missing
        <Button className="w-full" disabled>
          View Details (ID Missing)
        </Button>
      )}
    </div>
  );
};

export default CourseCardItem;
