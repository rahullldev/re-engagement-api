import { CampaignType } from "@prisma/client";

import day2 from "./day2.template.js";
import day5 from "./day5.template.js";
import day7 from "./day7.template.js";

type EmailTemplate = {
  subject: string;
  html: string;
};

function buildTemplate(template: {
  subject: string;
  heading: string;
  body: string;
  buttonText: string;
  image: string;
}): EmailTemplate {

  return {

    subject: template.subject,

    html: `
<!DOCTYPE html>
<html>

<head>

<meta charset="UTF-8" />

<style>

body{
    margin:0;
    padding:40px;
    background:#f5f5f5;
    font-family:Arial,Helvetica,sans-serif;
}

.container{
    max-width:600px;
    margin:auto;
    background:#ffffff;
    border-radius:16px;
    overflow:hidden;
    box-shadow:0 5px 20px rgba(0,0,0,.08);
}

.hero{
    width:100%;
    display:block;
}

.content{
    padding:40px;
}

h1{
    margin-top:0;
    font-size:34px;
    color:#222;
}

p{
    font-size:16px;
    color:#555;
    line-height:1.7;
}

.button{
    display:inline-block;
    margin-top:30px;
    background:#ff4f87;
    color:#ffffff !important;
    text-decoration:none;
    padding:16px 34px;
    border-radius:10px;
    font-weight:bold;
}

.footer{
    margin-top:50px;
    padding-top:20px;
    border-top:1px solid #eee;
    font-size:13px;
    color:#999;
}

</style>

</head>

<body>

<div class="container">

<img
class="hero"
src="${template.image}"
alt="Banner"
/>

<div class="content">

<h1>${template.heading}</h1>

<p>

${template.body}

</p>

<a
class="button"
href="https://www.affiny.ai/">

${template.buttonText}

</a>

<div class="footer">

You're receiving this email because you have an account with us.

</div>

</div>

</div>

</body>

</html>
`
  };

}

export function getEmailTemplate(
  campaign: CampaignType
): EmailTemplate {

  switch (campaign) {

    case CampaignType.DAY_2:
      return buildTemplate(day2);

    case CampaignType.DAY_5:
      return buildTemplate(day5);

    case CampaignType.DAY_7:
      return buildTemplate(day7);

    default:
      throw new Error("Unknown campaign type");
  }

}