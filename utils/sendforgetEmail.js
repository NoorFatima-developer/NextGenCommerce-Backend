import { Resend } from "resend";

export const sendforgetEmail = async (token) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

 // Password reset link with token
 const resetLink = `http://localhost:6000/api/v1/user/resetpassword/${encodeURIComponent(token)}`;

  const { data, error } = await resend.emails.send({
    from: "Noor Fatima <onboarding@resend.dev>",
    to: "nf982873@gmail.com",
    subject: "Verification Email",
    html: `<strong>
    Thanks for signing in with us please click on the link below to verify
    </ br>
    ${resetLink}
    </strong>`,
  });

  return { data, error };
};


