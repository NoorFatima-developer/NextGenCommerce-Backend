import { Resend } from "resend";

export const sendEmail = async (token, email, type) => {
  const resend = new Resend(process.env.RESEND_API_KEY);
    // 1: Create api endpoint e.g /verify-email
    // 2: User will request by clicking on the button or link given in the email to this endpoint
    // 3: Then, we will verify that user

  // Set link based on email type:

  let link;
  let subject;
  let message;  

  if (type === "verify") {
    link = `http://localhost:5000/api/v1/user/verify-email?token=${encodeURIComponent(token)}`;
    subject = "Verify Your Email";
    message = "Click the link below to verify your email:";
  }
  else if (type === "reset") {
    link = `http://localhost:5000/api/v1/user/resetpassword/${encodeURIComponent(token)}`;
    subject = "Reset Your Password";
    message = "Click the link below to reset your password:";
  } else {
    return { data: null, error: "Invalid email type" };
  }

  const { data, error } = await resend.emails.send({
    from: "Noor Fatima <onboarding@resend.dev>",
    to: "nf982873@gmail.com",
    subject: subject,
    html: `<strong>${message}</strong><br/>
    <a href="${link}">${link}</a>`,
  });

  return { data, error };
};


