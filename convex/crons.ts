import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "Delete all files marked for deletion, every minute",
  { minutes: 1 }, // every minute
  internal.files.deleteAllFiles
);

export default crons;
