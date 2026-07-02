import prisma from "../config/prisma.js";
import { emailQueue } from "../queue/email.queue.js";
import { CampaignType } from "@prisma/client";

class CampaignService {

    async processCampaigns() {

        // const users = await prisma.user.findMany();
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const users = await prisma.user.findMany({
            where: {
                lastActivity: {
                    lte: twoDaysAgo
                }
            }
        });

        const now = new Date();

        for (const user of users) {

            const diffDays = Math.floor(
                (now.getTime() - user.lastActivity.getTime())
                / (1000 * 60 * 60 * 24)
            );

            // const campaigns: CampaignType[] = [];

            // if (diffDays >= 2) campaigns.push(CampaignType.DAY_2);
            // if (diffDays >= 5) campaigns.push(CampaignType.DAY_5);
            // if (diffDays >= 7) campaigns.push(CampaignType.DAY_7);
            let campaign: CampaignType | null = null;
            if (diffDays >= 7)
                campaign = CampaignType.DAY_7;
            else if (diffDays >= 5)
                campaign = CampaignType.DAY_5;
            else if (diffDays >= 2)
                campaign = CampaignType.DAY_2;
            if (!campaign) {
                    continue;
                }

            // for (const campaign of campaigns) {

            const alreadySent =
                await prisma.emailCampaign.findUnique({

                    where: {

                        userId_campaignType: {

                            userId: user.id,

                            campaignType: campaign

                        }

                    }

                });

            if (alreadySent) continue;

            await prisma.emailCampaign.create({

                data: {

                    userId: user.id,

                    campaignType: campaign,

                    status: "PENDING"

                }

            });

            await emailQueue.add(
                "send-email",
                {
                    userId: user.id,
                    email: user.email,
                    campaignType: campaign
                },
                {
                    attempts: 3,

                    backoff: {
                    type: "exponential",
                    delay: 5000
                    },

                    removeOnComplete: 100,

                    removeOnFail: 100
                }
                );

        }

    }

}



export default new CampaignService();