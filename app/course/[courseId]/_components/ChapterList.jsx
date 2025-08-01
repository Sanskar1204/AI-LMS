// app/course/[courseId]/_components/ChapterList.jsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

const ChapterList = ({ course }) => {
  if (!course || !course.modules) {
    return null;
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-4">Chapter List</h2>
      <div className="space-y-4">
        {course.modules.map((module, moduleIndex) => (
          <Card key={moduleIndex}>
            <CardHeader>
              <CardTitle className="text-xl">{module.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {module.lessons &&
                  module.lessons.map((lesson, lessonIndex) => (
                    <li key={lessonIndex} className="flex items-center gap-2">
                      <ListChecks className="text-green-500 w-4 h-4" />
                      <span>
                        {lesson.title} - ({lesson.duration})
                      </span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChapterList;
