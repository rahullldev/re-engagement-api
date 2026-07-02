import { Request, Response } from "express";

import campaignService from "../services/campaign.service.js";

class CampaignController {

  async processCampaigns(
    req: Request,
    res: Response
  ) {

    try {

      await campaignService.processCampaigns();

      res.status(200).json({

        success: true,

        message:
          "Campaign processing started."

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: "Internal Server Error"

      });

    }

  }

}

export default new CampaignController();