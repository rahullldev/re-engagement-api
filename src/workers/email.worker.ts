import { Worker } from "bullmq";
import { CampaignStatus } from "@prisma/client";

import redis from "../config/redis.js";
import prisma from "../config/prisma.js";
import emailService from "../services/email.service.js";

const emailWorker = new Worker(
  "email-queue",

  async (job) => {

    const { userId, email, campaignType } = job.data;
    const now = new Date().toISOString();

    try {
      console.log(`[${now}] Sending ${campaignType} -> ${email}`);

      await emailService.sendEmail(email, campaignType);

      await prisma.emailCampaign.update({

        where: {
          userId_campaignType: {
            userId,
            campaignType
          }
        },

        data: {
          status: CampaignStatus.SENT,
          sentAt: new Date()
        }

      });
      console.log(`[${new Date().toISOString()}] Sent ${campaignType} -> ${email}`);

    } catch (error) {
      console.error("❌ Email sending failed:", error);

      await prisma.emailCampaign.update({

        where: {
          userId_campaignType: {
            userId,
            campaignType
          }
        },

        data: {
          status: CampaignStatus.FAILED,

          retryCount: {
            increment: 1
          },

          errorMessage:
            error instanceof Error
              ? error.message
              : "Unknown Error"

        }

      });

      throw error;

    }

  },

  {

    connection: redis,

    concurrency: 5

  }

);

export default emailWorker;