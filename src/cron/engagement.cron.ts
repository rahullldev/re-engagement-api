import cron from "node-cron";
import campaignService from "../services/campaign.service.js";
console.log("✅ engagement.cron.ts loaded");

cron.schedule("*/4 * * * *", async () => {
  console.log("Running daily engagement campaign...");

  try {
    const start = Date.now();
    await campaignService.processCampaigns();
    console.log(`Cron finished in ${Date.now() - start} ms`);
  } catch (err) {
    console.error("Cron Job Failed:", err);
  }
});