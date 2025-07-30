import { serve } from "inngest/next";
import { inngest } from "../../inngest/client";
import {
  GenerateNotes,
  GenerateStudyTypeContent,
} from "@/app/inngest/functions"; // Removed helloWorld import

// Serve only the functions that actually exist
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [GenerateNotes, GenerateStudyTypeContent], // Removed helloWorld
});
