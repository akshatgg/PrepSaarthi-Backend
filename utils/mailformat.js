exports.resetPasswordMessage = (user, URI) => {
  console.log(URI)
   return(
    `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto;">
    <div style="background-color: #3A5AFF; padding: 20px; border-radius: 10px; text-align: center;">
      <h2 style="color: #fff; margin: 0;">Password Reset Request</h2>
    </div>
    <div style="padding: 20px; background-color: #f9f9f9; border-radius: 0 0 10px 10px;">
      <p>Dear ${user.name},</p>
      <p style="font-size: 1.1em;">
        We received a request to reset the password for your account. Please click the link below to reset your password:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a 
          href="https://${URI}" 
          target="_blank"
          style="display: inline-block; padding: 10px 20px; font-size: 1.1em; font-weight: bold; background-color: #3A5AFF; color: #fff; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 1.1em;">
        This link is valid for the next 15 minutes. If you did not request a password reset, please disregard this email or contact our support team immediately.
      </p>
      <p>Best regards,<br><span style="color: #3A5AFF;">The PrepSaarthi Team</span></p>
    </div>
  </div>
`
   )
}
