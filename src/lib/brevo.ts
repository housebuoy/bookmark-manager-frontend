import * as Brevo from "@getbrevo/brevo";

// Create the API instance
const apiInstance = new Brevo.TransactionalEmailsApi();

// Use the enum for the key type
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ""
);

// Email sending function
export async function sendEmail({
  to,
  templateId,
  params = {},
}: {
  to: string;
  templateId: number;
  params?: Record<string, unknown>;
}) {
  const emailData = new Brevo.SendSmtpEmail();
  emailData.to = [{ email: to }];
  emailData.templateId = templateId;
  emailData.params = params;

  // headers can be empty if you don't need custom headers
  return apiInstance.sendTransacEmail(emailData, { headers: {} });
}
