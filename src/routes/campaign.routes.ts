import { Router } from "express";

import campaignController
from "../controllers/campaign.controller.js";

const router = Router();

router.post(
  "/process",
  campaignController.processCampaigns
);

export default router;