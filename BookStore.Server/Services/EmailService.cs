using System.Net;
using System.Net.Mail;

namespace BookStore.Server.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(
            string toEmail,
            string subject,
            string body,
            bool isHtml = true,
            byte[]? attachmentBytes = null,
            string? attachmentFileName = null)
        {
            var email =
                _configuration["EmailSettings:Email"];

            var appPassword =
                _configuration["EmailSettings:AppPassword"];

            var smtpHost =
                _configuration["EmailSettings:SmtpHost"];

            var smtpPort =
                _configuration.GetValue<int>(
                    "EmailSettings:SmtpPort");

            // =====================================================
            // VALIDATE EMAIL SETTINGS
            // =====================================================

            if (string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(appPassword))
            {
                throw new InvalidOperationException(
                    "Email settings are not configured.");
            }

            if (string.IsNullOrWhiteSpace(smtpHost))
            {
                throw new InvalidOperationException(
                    "SMTP host is not configured.");
            }

            // =====================================================
            // CREATE EMAIL
            // =====================================================

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(email),
                Subject = subject,
                Body = body,
                IsBodyHtml = isHtml
            };

            mailMessage.To.Add(toEmail);

            // =====================================================
            // PDF ATTACHMENT - OPTIONAL
            // =====================================================

            if (attachmentBytes != null &&
                attachmentBytes.Length > 0)
            {
                using var attachmentStream =
                    new MemoryStream(attachmentBytes);

                using var attachment =
                    new Attachment(
                        attachmentStream,
                        attachmentFileName ??
                            "Payment-Receipt.pdf",
                        "application/pdf");

                mailMessage.Attachments.Add(attachment);

                // Send while attachment is still alive
                await SendEmailInternalAsync(
                    mailMessage,
                    email,
                    appPassword,
                    smtpHost,
                    smtpPort);

                return;
            }

            // =====================================================
            // SEND EMAIL WITHOUT ATTACHMENT
            // =====================================================

            await SendEmailInternalAsync(
                mailMessage,
                email,
                appPassword,
                smtpHost,
                smtpPort);
        }


        // =========================================================
        // SMTP SEND
        // =========================================================

        private static async Task SendEmailInternalAsync(
            MailMessage mailMessage,
            string email,
            string appPassword,
            string smtpHost,
            int smtpPort)
        {
            using var smtpClient =
                new SmtpClient(
                    smtpHost,
                    smtpPort)
                {
                    EnableSsl = true,
                    Credentials =
                        new NetworkCredential(
                            email,
                            appPassword)
                };

            await smtpClient.SendMailAsync(
                mailMessage);
        }
    }
}