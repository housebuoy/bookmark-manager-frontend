import * as SibApiV3Sdk from "sib-api-v3-typescript";

// Create an instance of the transactional email API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Set your API key
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

// Define the email sending function
interface SendEmailOptions {
  to: string;
  templateId: number;
  params: Record<string, unknown>;
}

export async function sendEmail({ to, templateId, params }: SendEmailOptions) {
  const sendSmtpEmail: SibApiV3Sdk.SendSmtpEmail = {
    to: [{ email: to }],
    templateId,
    params,
  };

  return apiInstance.sendTransacEmail(sendSmtpEmail);
}
