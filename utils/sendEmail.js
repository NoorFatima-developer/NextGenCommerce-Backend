import { Resend } from "resend";
import jwt from "jsonwebtoken";

export const sendEmail = async (email) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  // 1: Create api endpoint e.g /verify-email
  // 2: User will request by clicking on the button or link given in the email to this endpoint
  // 3: Then, we will verify that user

  const token = jwt.sign({ email }, process.env.JWT_EMAIL_SECRET, {
    expiresIn: process.env.JWT_EMAIL_SECRET_EXPIRY_TIME,
  }); 

  console.log(token);
  

  const verifyLink = `http://localhost:6000/api/v1/user/verify-email?token=${encodeURIComponent(token)}`;

  const { data, error } = await resend.emails.send({
    from: "Noor Fatima <onboarding@resend.dev>",
    to: "nf982873@gmail.com",
    subject: "Verification Email",
    html: `<strong>
    Thanks for signing in with us please click on the link below to verify
    </ br>
    ${verifyLink}
    </strong>`,
  });

  return { data, error };
};


