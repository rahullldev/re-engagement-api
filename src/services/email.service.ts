import { CampaignType } from "@prisma/client";

import transporter from "../config/mail.js";
import { getEmailTemplate } from "../templates/index.js";

class EmailService {

    async sendEmail(
        email: string,
        campaignType: CampaignType
    ) {

        const template = getEmailTemplate(campaignType);

        await transporter.sendMail({

            from: process.env.SMTP_USER,

            to: email,

            subject: template.subject,

            html: template.html

        });

    }

}

export default new EmailService();