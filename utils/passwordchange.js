exports.passwordchange = (user) => {
    return (
      `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto;">
      <div style="background-color: #3A5AFF; padding: 20px; border-radius: 10px; text-align: center;">
        <h2 style="color: #fff; margin: 0;">Password Successfully Changed</h2>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9; border-radius: 0 0 10px 10px;">
        <p>Dear ${user.name},</p>
        <p style="font-size: 1.1em;">
          This is to confirm that your password has been successfully changed. If you made this change, no further action is required.
        </p>
        <p style="font-size: 1.1em;">
          If you did not request this change or believe this change was made in error, please contact our support team immediately to secure your account.
        </p>
      
        <p>Best regards,<br><span style="color: #3A5AFF;">The PrepSaarthi Team</span></p>
      </div>
    </div>`
    )
}
