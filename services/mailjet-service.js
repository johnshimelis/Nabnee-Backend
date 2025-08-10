const mailjetConfig = require("../utils/mailjet-config");

class MailjetService {
  constructor() {
    this.mailjet = mailjetConfig();
  }

  async sendOtpEmail(email, displayName, otpCode, language = "en") {
    const isArabic = language === "ar";

    const subject = isArabic
      ? "رمز التحقق الخاص بك من نبني"
      : "Your nabnee Verification Code";

    const htmlContent = this.generateOtpEmailTemplate(
      displayName,
      otpCode,
      isArabic
    );

    try {
      const result = await this.mailjet
        .post("send", { version: "v3.1" })
        .request({
          Messages: [
            {
              From: {
                Email: process.env.MAILJET_FROM_EMAIL || "noreply@nabnee.com",
                Name: "nabnee",
              },
              To: [
                {
                  Email: email,
                  Name: displayName,
                },
              ],
              Subject: subject,
              HTMLPart: htmlContent,
              TextPart: this.generateOtpTextContent(
                displayName,
                otpCode,
                isArabic
              ),
            },
          ],
        });


      return {
        success: true,
        messageId: result.body.Messages[0].To[0].MessageID,
      };
    } catch (error) {
      console.error("Error sending OTP email:", error);
      throw new Error("Failed to send OTP email");
    }
  }

  async sendPasswordResetEmail(email, displayName, resetId, language = "en") {
    const isArabic = language === "ar";

    const subject = isArabic
      ? "إعادة تعيين كلمة المرور - نبني"
      : "Reset your nabnee password";

    const htmlContent = this.generatePasswordResetEmailTemplate(
      displayName,
      resetId,
      isArabic
    );

    try {
      const result = await this.mailjet
        .post("send", { version: "v3.1" })
        .request({
          Messages: [
            {
              From: {
                Email: process.env.MAILJET_FROM_EMAIL || "noreply@nabnee.com",
                Name: "nabnee",
              },
              To: [
                {
                  Email: email,
                  Name: displayName,
                },
              ],
              Subject: subject,
              HTMLPart: htmlContent,
              TextPart: this.generatePasswordResetTextContent(
                displayName,
                resetId,
                isArabic
              ),
            },
          ],
        });


      return {
        success: true,
        messageId: result.body.Messages[0].To[0].MessageID,
      };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  async sendBusinessClaimEmail(email, displayName, businessName, claimToken, language = "en") {
    const isArabic = language === "ar";

    const subject = isArabic
      ? `اطلب صفحة عملك على نبني - ${businessName}`
      : `Claim Your Business Page on nabnee - ${businessName}`;

    const htmlContent = this.generateBusinessClaimEmailTemplate(
      displayName,
      businessName,
      claimToken,
      isArabic
    );

    try {
      const result = await this.mailjet
        .post("send", { version: "v3.1" })
        .request({
          Messages: [
            {
              From: {
                Email: process.env.MAILJET_FROM_EMAIL || "noreply@nabnee.com",
                Name: "nabnee",
              },
              To: [
                {
                  Email: email,
                  Name: displayName,
                },
              ],
              Subject: subject,
              HTMLPart: htmlContent,
              TextPart: this.generateBusinessClaimTextContent(
                displayName,
                businessName,
                claimToken,
                isArabic
              ),
            },
          ],
        });

      return {
        success: true,
        messageId: result.body.Messages[0].To[0].MessageID,
      };
    } catch (error) {
      console.error("Error sending business claim email:", error);
      throw new Error("Failed to send business claim email");
    }
  }
  async sendNewBusinessUserEmail(email, displayName, businessName, username, password, loginUrl = "https://nabnee.com/login", language = "en") {
    const isArabic = language === "ar";

    const subject = isArabic
      ? `مرحباً بك في نبني - ${businessName}`
      : `Welcome to nabnee - ${businessName}`;

    const htmlContent = this.generateNewBusinessUserEmailTemplate(
      displayName,
      businessName,
      username,
      password,
      loginUrl,
      isArabic
    );

    try {
      const result = await this.mailjet
        .post("send", { version: "v3.1" })
        .request({
          Messages: [
            {
              From: {
                Email: process.env.MAILJET_FROM_EMAIL || "noreply@nabnee.com",
                Name: "nabnee",
              },
              To: [
                {
                  Email: email,
                  Name: displayName,
                },
              ],
              Subject: subject,
              HTMLPart: htmlContent,              TextPart: this.generateNewBusinessUserTextContent(
                displayName,
                businessName,
                email,
                password,
                loginUrl,
                isArabic
              ),
            },
          ],
        });
      return {
        success: true,
        messageId: result.body.Messages[0].To[0].MessageID,
      };
    } catch (error) {
      console.error("Error sending new business user email:", error);
      throw new Error("Failed to send new business user email");
    }
  }

  generateOtpEmailTemplate(displayName, otpCode, isArabic = false) {
    const direction = isArabic ? "rtl" : "ltr";
    const title = isArabic ? "رمز التحقق الخاص بك" : "Your Verification Code";
    const greeting = isArabic
      ? `مرحباً ${displayName}،`
      : `Hello ${displayName},`;
    const message = isArabic
      ? "شكراً لتسجيلك في نبني. للتحقق من حسابك، يرجى استخدام رمز التحقق التالي:"
      : "Thank you for registering with nabnee. To verify your account, please use the following verification code:";
    const expiry = isArabic
      ? "ستنتهي صلاحية هذا الرمز خلال 10 دقائق. إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني."
      : "This code will expire in 10 minutes. If you did not request this code, please ignore this email.";
    const regards = isArabic
      ? "مع أطيب التحيات،<br>فريق نبني"
      : "Best regards,<br>The nabnee Team";

    return `
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f6f8f1;font-family:Arial,sans-serif">
        <table width="100%" bgcolor="#f6f8f1" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <table bgcolor="#ffffff" style="width:100%;max-width:600px;margin:0 auto" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:30px;border-bottom:1px solid #f2eeed">
                    <h1 style="color:#153643;font-size:24px;margin:0 0 20px 0;font-weight:bold">${title}</h1>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:0 0 20px 0">${greeting}</p>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:0 0 30px 0">${message}</p>
                    <div style="background-color:#f7f7f7;border-radius:8px;padding:25px;text-align:center;margin:20px 0">
                      <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#153643">${otpCode}</div>
                    </div>
                    <p style="color:#153643;font-size:14px;line-height:20px;margin:20px 0 0 0">${expiry}</p>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:30px 0 0 0">${regards}</p>
                  </td>
                </tr>
          
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  generatePasswordResetEmailTemplate(displayName, resetId, isArabic = false) {
    // https://nabnee.com
    const direction = isArabic ? "rtl" : "ltr";
    const title = isArabic ? "إعادة تعيين كلمة المرور" : "Reset Your Password";
    const greeting = isArabic
      ? `مرحباً ${displayName}،`
      : `Hello ${displayName},`;
    const message = isArabic
      ? "تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في نبني. اضغط على الزر أدناه لإعادة تعيين كلمة المرور:"
      : "We received a request to reset the password for your nabnee account. Click the button below to reset your password:";
    const buttonText = isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password";
    const expiry = isArabic
      ? "ستنتهي صلاحية هذا الرابط خلال 24 ساعة. إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني."
      : "This link will expire in 24 hours. If you did not request a password reset, please ignore this email.";
    const regards = isArabic
      ? "مع أطيب التحيات،<br>فريق نبني"
      : "Best regards,<br>The nabnee Team";

    const resetUrl = `https://nabnee.com/reset-password?token=${resetId}`;

    return `
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f6f8f1;font-family:Arial,sans-serif">
        <table width="100%" bgcolor="#f6f8f1" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <table bgcolor="#ffffff" style="width:100%;max-width:600px;margin:0 auto" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:30px;border-bottom:1px solid #f2eeed">
                    <h1 style="color:#153643;font-size:24px;margin:0 0 20px 0;font-weight:bold">${title}</h1>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:0 0 20px 0">${greeting}</p>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:0 0 30px 0">${message}</p>
                    <div style="text-align:center;margin:30px 0">
                      <a href="${resetUrl}" style="background-color:#4CAF50;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:16px;font-weight:bold;display:inline-block">${buttonText}</a>
                    </div>
                    <p style="color:#153643;font-size:14px;line-height:20px;margin:20px 0 0 0">${expiry}</p>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:30px 0 0 0">${regards}</p>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#44525F" style="padding:30px;text-align:center">
                   
                    <p style="color:#ffffff;font-size:12px;margin:20px 0 0 0">© nabnee ${new Date().getFullYear()}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Generate business claim email template
   */
  generateBusinessClaimEmailTemplate(displayName, businessName, claimToken, isArabic = false) {
    const direction = isArabic ? "rtl" : "ltr";
    const title = isArabic ? "اطلب صفحة عملك" : "Claim Your Business Page";
    const greeting = isArabic
      ? `مرحباً ${displayName}،`
      : `Hello ${displayName},`;
    const message = isArabic
      ? `لقد تم إنشاء صفحة عمل لشركة "${businessName}" على منصة نبني. نعتقد أنك قد تكون مالك هذا العمل أو لديك سلطة إدارته.`
      : `A business page for "${businessName}" has been created on the nabnee platform. We believe you may be the owner of this business or have authority to manage it.`;
    const instruction = isArabic
      ? "اضغط على الزر أدناه لمطالبة صفحة عملك وإدارتها:"
      : "Click the button below to claim your business page and manage it:";
    const buttonText = isArabic ? "اطلب صفحة العمل" : "Claim Business Page";
    const expiry = isArabic
      ? "ستنتهي صلاحية هذا الرابط خلال 24 ساعة. إذا لم تطلب هذه المطالبة، يرجى تجاهل هذا البريد الإلكتروني."
      : "This link will expire in 24 hours. If you did not request this claim, please ignore this email.";
    const regards = isArabic
      ? "مع أطيب التحيات،<br>فريق نبني"
      : "Best regards,<br>The nabnee Team";

    const claimUrl = `https://nabnee.com/claim-business?token=${claimToken}`;

    return `
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f6f8f1;font-family:Arial,sans-serif">
        <table width="100%" bgcolor="#f6f8f1" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <table bgcolor="#ffffff" style="width:100%;max-width:600px;margin:0 auto" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:30px;border-bottom:1px solid #f2eeed">
                    <h1 style="color:#153643;font-size:24px;margin:0 0 20px 0;font-weight:bold">${title}</h1>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:0 0 20px 0">${greeting}</p>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:0 0 20px 0">${message}</p>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:0 0 30px 0">${instruction}</p>
                    <div style="text-align:center;margin:30px 0">
                      <a href="${claimUrl}" style="background-color:#4CAF50;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:16px;font-weight:bold;display:inline-block">${buttonText}</a>
                    </div>
                    <p style="color:#153643;font-size:14px;line-height:20px;margin:20px 0 0 0">${expiry}</p>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:30px 0 0 0">${regards}</p>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#44525F" style="padding:30px;text-align:center">
                   
                    <p style="color:#ffffff;font-size:12px;margin:20px 0 0 0">© nabnee ${new Date().getFullYear()}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  /**
   * Generate new business user email template
   */
  generateNewBusinessUserEmailTemplate(displayName, businessName, email, password, loginUrl, isArabic = false) {
    const direction = isArabic ? "rtl" : "ltr";
    const title = isArabic ? "مرحباً بك في نبني" : "Welcome to nabnee";
    const greeting = isArabic
      ? `مرحباً ${displayName}،`
      : `Hello ${displayName},`;
    const message = isArabic
      ? `لقد تم إنشاء حساب أعمال لك في نبني لشركة "${businessName}". يمكنك الآن تسجيل الدخول وإدارة صفحة عملك.`
      : `A business account has been created for you on nabnee for "${businessName}". You can now login and manage your business page.`;
    const credentialsTitle = isArabic ? "بيانات تسجيل الدخول الخاصة بك:" : "Your login credentials:";    const usernameLabel = isArabic ? "البريد الإلكتروني:" : "Email:";
    const passwordLabel = isArabic ? "كلمة المرور:" : "Password:";
    const buttonText = isArabic ? "تسجيل الدخول" : "Login";
    const instruction = isArabic
      ? "اضغط على الزر أدناه لتسجيل الدخول إلى حسابك:"
      : "Click the button below to log in to your account:";
    const securityNote = isArabic
      ? "ملاحظة أمنية: نوصي بتغيير كلمة المرور فور تسجيل الدخول للمرة الأولى."
      : "Security note: We recommend changing your password after logging in for the first time.";
    const regards = isArabic
      ? "مع أطيب التحيات،<br>فريق نبني"
      : "Best regards,<br>The nabnee Team";

    return `
      <!DOCTYPE html>
      <html dir="${direction}">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f6f8f1;font-family:Arial,sans-serif">
        <table width="100%" bgcolor="#f6f8f1" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <table bgcolor="#ffffff" style="width:100%;max-width:600px;margin:0 auto" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:30px;border-bottom:1px solid #f2eeed">
                    <h1 style="color:#153643;font-size:24px;margin:0 0 20px 0;font-weight:bold">${title}</h1>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:0 0 20px 0">${greeting}</p>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:0 0 20px 0">${message}</p>
                    <div style="background-color:#f7f7f7;border-radius:8px;padding:25px;margin:20px 0">
                      <h3 style="color:#153643;margin-top:0">${credentialsTitle}</h3>
                      <p style="margin:10px 0"><strong>${usernameLabel}</strong> ${email}</p>
                      <p style="margin:10px 0"><strong>${passwordLabel}</strong> ${password}</p>
                    </div>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:20px 0">${instruction}</p>
                    <div style="text-align:center;margin:30px 0">
                      <a href="${loginUrl}" style="background-color:#4CAF50;color:white;padding:15px 30px;text-decoration:none;border-radius:5px;font-size:16px;font-weight:bold;display:inline-block">${buttonText}</a>
                    </div>
                    <p style="color:#153643;font-size:14px;line-height:20px;margin:20px 0 0 0;font-weight:bold">${securityNote}</p>
                    <p style="color:#153643;font-size:16px;line-height:24px;margin:30px 0 0 0">${regards}</p>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#44525F" style="padding:30px;text-align:center">
                    <p style="color:#ffffff;font-size:12px;margin:20px 0 0 0">© nabnee ${new Date().getFullYear()}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }

  generateOtpTextContent(displayName, otpCode, isArabic = false) {
    if (isArabic) {
      return `مرحباً ${displayName}،\n\nشكراً لتسجيلك في نبني. رمز التحقق الخاص بك هو: ${otpCode}\n\nستنتهي صلاحية هذا الرمز خلال 10 دقائق.\n\nمع أطيب التحيات،\nفريق نبني`;
    }

    return `Hello ${displayName},\n\nThank you for registering with nabnee. Your verification code is: ${otpCode}\n\nThis code will expire in 10 minutes.\n\nBest regards,\nThe nabnee Team`;
  }

  /**
   * Generate password reset email text content (fallback)
   */
  generatePasswordResetTextContent(displayName, resetId, isArabic = false) {
    const resetUrl = `https://nabnee.com/reset-password?token=${resetId}`;

    if (isArabic) {
      return `مرحباً ${displayName}،\n\nتلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في نبني.\n\nاضغط على الرابط التالي لإعادة تعيين كلمة المرور:\n${resetUrl}\n\nستنتهي صلاحية هذا الرابط خلال 24 ساعة.\n\nمع أطيب التحيات،\nفريق نبني`;
    }

    return `Hello ${displayName},\n\nWe received a request to reset the password for your nabnee account.\n\nClick the following link to reset your password:\n${resetUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe nabnee Team`;
  }

  /**
   * Generate business claim email text content (fallback)
   */
  generateBusinessClaimTextContent(displayName, businessName, claimToken, isArabic = false) {
    const claimUrl = `https://nabnee.com/claim-business?token=${claimToken}`;

    if (isArabic) {
      return `مرحباً ${displayName}،\n\nلقد تم إنشاء صفحة عمل لشركة "${businessName}" على منصة نبني. نعتقد أنك قد تكون مالك هذا العمل أو لديك سلطة إدارته.\n\nاضغط على الرابط التالي لمطالبة صفحة عملك:\n${claimUrl}\n\nستنتهي صلاحية هذا الرابط خلال 24 ساعة.\n\nمع أطيب التحيات،\nفريق نبني`;
    }

    return `Hello ${displayName},\n\nA business page for "${businessName}" has been created on the nabnee platform. We believe you may be the owner of this business or have authority to manage it.\n\nClick the following link to claim your business page:\n${claimUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe nabnee Team`;
  }

  /**
   * Generate new business user email text content (fallback)
   */
  generateNewBusinessUserTextContent(displayName, businessName, email, password, loginUrl, isArabic = false) {
    if (isArabic) {      return `مرحباً ${displayName}،

لقد تم إنشاء حساب أعمال لك في نبني لشركة "${businessName}". يمكنك الآن تسجيل الدخول وإدارة صفحة عملك.

بيانات تسجيل الدخول الخاصة بك:
البريد الإلكتروني: ${email}
كلمة المرور: ${password}

يمكنك تسجيل الدخول من خلال الرابط التالي:
${loginUrl}

ملاحظة أمنية: نوصي بتغيير كلمة المرور فور تسجيل الدخول للمرة الأولى.

مع أطيب التحيات،
فريق نبني`;
    }    return `Hello ${displayName},

A business account has been created for you on nabnee for "${businessName}". You can now login and manage your business page.

Your login credentials:
Email: ${email}
Password: ${password}

You can log in using the following link:
${loginUrl}

Security note: We recommend changing your password after logging in for the first time.

Best regards,
The nabnee Team`;
  }
}

module.exports = new MailjetService();
