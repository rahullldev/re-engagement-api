import { Queue } from "bullmq";
import redis from "../config/redis.js";

export interface EmailJobData {
  userId: string;
  email: string;
  campaignType: "DAY_2" | "DAY_5" | "DAY_7";
}

export const emailQueue = new Queue<EmailJobData>("email-queue", {
  connection: redis,
});