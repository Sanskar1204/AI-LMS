"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

const CourseCardItem = ({ course, refreshCourses }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg line-clamp-2">
          {course.courseName || "Untitled Course"}
        </h3>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 line-clamp-3">
          {course.courseDescription || "No description available"}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/courses/${course.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCardItem;
