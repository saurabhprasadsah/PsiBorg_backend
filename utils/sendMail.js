const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASS,
  },
});

async function sendConfirmationMail(to) {

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Confirmation Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #333;
      background-color: #fff;
    }

    .container {
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      padding: 0 15px;
      border-radius: 5px;
      line-height: 1.8;
    }

    .header {
      border-bottom: 1px solid #eee;
    }

    .header a {
      font-size: 1.4em;
      color: #000;
      text-decoration: none;
      font-weight: 600;
    }

    .footer {
      color: #aaa;
      font-size: 0.8em;
      line-height: 1;
      font-weight: 300;
    }

    .email-info {
      color: #666666;
      font-weight: 400;
      font-size: 13px;
      line-height: 18px;
      padding-bottom: 6px;
    }

    .email-info a {
      text-decoration: none;
      color: #00bc69;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <a>Welcome to Your Chat</a>
    </div>
    <br />
    <strong>Dear ${to},</strong>
    <p>
      Thank you for signing up with <strong>Us.</strong>. We're thrilled to have you on board!
      <br /><br />
      You can now enjoy seamless communication and explore all the features of Your Chat.
      <br /><br />
      If you have any questions, feel free to contact our support team.
    </p>
    <p style="font-size: 0.9em">
      <strong>Thank you for choosing Us.</strong>
      <br /><br />
      Best regards,
      <br />
      <strong>Backend Team</strong>
    </p>

    <hr style="border: none; border-top: 0.5px solid #131111" />
    <div class="footer">
      <p>This email can't receive replies.</p>
      <p>
        For more information about Your Chat and your account, visit our 
        <a href="https://your-chat.com">website</a>.
      </p>
    </div>
  </div>
  <div style="text-align: center">
    <div class="email-info">
      <span>
        This email was sent to
        <a href="mailto:${to}">${to}</a>
      </span>
    </div>
    <div class="email-info">
      <a href="/">Your Chat</a> | Khora Colony Ghaziabad
      | Uttar Pradesh - 201309, India
    </div>
    <div class="email-info">
      &copy; 2023 Your Chat. All rights reserved.
    </div>
  </div>
</body>
</html>`;


  await transporter.sendMail({
    from: '"Your Chat" <spareg1234@gmail.com>',
    to: `${to}`,
    subject: "Backend Team - Verification",
    text: "Hello from Backend Team, Thank you for signing up for Backend Team.",
    html: htmlContent, // html body
  });

  return true;
}

module.exports=sendConfirmationMail;