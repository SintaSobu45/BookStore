using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class PaymentNotificationBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentNotificationBackgroundService> _logger;

        public PaymentNotificationBackgroundService(
            IServiceScopeFactory serviceScopeFactory,
            IConfiguration configuration,
            ILogger<PaymentNotificationBackgroundService> logger)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _configuration = configuration;
            _logger = logger;
        }


        // =========================================================
        // BACKGROUND SERVICE
        // =========================================================

        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            _logger.LogInformation(
                "Payment notification background service started.");


            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndSendPaymentNotificationsAsync(
                        stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Error while processing payment notifications.");
                }


                // -------------------------------------------------
                // CHECK EVERY 1 MINUTE
                // -------------------------------------------------

                try
                {
                    await Task.Delay(
                        TimeSpan.FromMinutes(1),
                        stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }
            }


            _logger.LogInformation(
                "Payment notification background service stopped.");
        }


        // =========================================================
        // CHECK PAYMENT NOTIFICATIONS
        // =========================================================

        private async Task CheckAndSendPaymentNotificationsAsync(
            CancellationToken cancellationToken)
        {
            using var scope =
                _serviceScopeFactory.CreateScope();


            var storyPoetryRepository =
                scope.ServiceProvider
                    .GetRequiredService<StoryPoetryRepository>();


            var emailService =
                scope.ServiceProvider
                    .GetRequiredService<EmailService>();


            // -----------------------------------------------------
            // GET SUBMISSIONS WHERE PAYMENT IS NOW AVAILABLE
            // -----------------------------------------------------

            var submissions =
                await storyPoetryRepository
                    .GetPaymentNotificationPendingAsync();


            if (submissions.Count == 0)
            {
                return;
            }


            // -----------------------------------------------------
            // FRONTEND URL
            // -----------------------------------------------------

            var frontendBaseUrl =
                _configuration["FrontendSettings:BaseUrl"];


            if (string.IsNullOrWhiteSpace(frontendBaseUrl))
            {
                _logger.LogError(
                    "FrontendSettings:BaseUrl is not configured.");

                return;
            }


            frontendBaseUrl =
                frontendBaseUrl.TrimEnd('/');


            // =====================================================
            // PROCESS EACH SUBMISSION
            // =====================================================

            foreach (var storyPoetry in submissions)
            {
                cancellationToken.ThrowIfCancellationRequested();


                // -------------------------------------------------
                // GET USER
                // -------------------------------------------------

                var user = storyPoetry.User;


                if (user == null)
                {
                    _logger.LogWarning(
                        "User not found for StoryPoetryId {StoryPoetryId}.",
                        storyPoetry.StoryPoetryId);

                    continue;
                }


                // -------------------------------------------------
                // CHECK EMAIL
                // -------------------------------------------------

                if (string.IsNullOrWhiteSpace(user.Email))
                {
                    _logger.LogWarning(
                        "User email is empty for StoryPoetryId {StoryPoetryId}.",
                        storyPoetry.StoryPoetryId);

                    continue;
                }


                // -------------------------------------------------
                // PAYMENT PAGE URL
                // -------------------------------------------------

                var paymentPageUrl =
                    $"{frontendBaseUrl}/your/uploads";


                // =================================================
                // EMAIL BODY
                // =================================================

               
                string emailBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
</head>

<body style='margin:0; padding:0; background-color:#f4f6f5; font-family:Arial, Helvetica, sans-serif;'>

    <table width='100%' cellpadding='0' cellspacing='0' border='0'
           style='background-color:#f4f6f5; padding:30px 15px;'>
        <tr>
            <td align='center'>

                <table width='600' cellpadding='0' cellspacing='0' border='0'
                       style='max-width:600px; width:100%; background-color:#ffffff; border-radius:12px; overflow:hidden;'>

                    <!-- HEADER -->
                    <tr>
                        <td style='background-color:#1b3b2b; padding:28px 25px; text-align:center;'>

                            <h1 style='margin:0; color:#ffffff; font-size:26px;'>
                                The Old Library
                            </h1>

                            <p style='margin:8px 0 0; color:#dce8df; font-size:14px;'>
                                Story &amp; Poetry Submission
                            </p>

                        </td>
                    </tr>


                    <!-- CONTENT -->
                    <tr>
                        <td style='padding:35px 30px;'>

                            <h2 style='margin:0 0 20px; color:#1b3b2b; font-size:22px;'>
                                Payment is Now Available
                            </h2>


                            <p style='margin:0 0 16px; color:#333333; font-size:15px; line-height:1.7;'>
                                Dear <strong>{user.Name}</strong>,
                            </p>


                            <p style='margin:0 0 20px; color:#333333; font-size:15px; line-height:1.7;'>
                                Payment for your
                                <strong>{storyPoetry.Type}</strong>
                                submission is now available.
                            </p>


                            <!-- SUBMISSION DETAILS -->
                            <table width='100%' cellpadding='0' cellspacing='0' border='0'
                                   style='margin:25px 0; border:1px solid #e1e5e2; border-radius:8px;'>

                                <tr>
                                    <td colspan='2'
                                        style='padding:14px 16px; background-color:#f1f5f2; color:#1b3b2b; font-size:15px; font-weight:bold;'>
                                        Submission Details
                                    </td>
                                </tr>


                                <tr>
                                    <td style='padding:12px 16px; color:#666666; font-size:14px; width:40%;'>
                                        Submission ID
                                    </td>

                                    <td style='padding:12px 16px; color:#333333; font-size:14px; font-weight:bold;'>
                                        {storyPoetry.StoryPoetryId}
                                    </td>
                                </tr>


                                <tr>
                                    <td style='padding:12px 16px; color:#666666; font-size:14px;'>
                                        Submission Type
                                    </td>

                                    <td style='padding:12px 16px; color:#333333; font-size:14px;'>
                                        {storyPoetry.Type}
                                    </td>
                                </tr>


                                <tr>
                                    <td style='padding:12px 16px; color:#666666; font-size:14px;'>
                                        Title
                                    </td>

                                    <td style='padding:12px 16px; color:#333333; font-size:14px;'>
                                        {storyPoetry.Title}
                                    </td>
                                </tr>

                            </table>


                            <!-- PAYMENT MESSAGE -->
                            <p style='margin:0 0 20px; color:#333333; font-size:15px; line-height:1.7;'>
                                You can now complete your payment using the button below.
                            </p>


                            <!-- PAY NOW BUTTON -->
                            <table width='100%' cellpadding='0' cellspacing='0' border='0'>
                                <tr>
                                    <td align='center' style='padding:10px 0 25px 0;'>

                                        <a href='{paymentPageUrl}'
                                           style='background-color:#1b3b2b;
                                                  color:#ffffff;
                                                  padding:14px 30px;
                                                  text-decoration:none;
                                                  border-radius:8px;
                                                  display:inline-block;
                                                  font-size:15px;
                                                  font-weight:bold;'>
                                            Pay Now
                                        </a>

                                    </td>
                                </tr>
                            </table>


                            <!-- PAYMENT INFO -->
                            <table width='100%' cellpadding='0' cellspacing='0' border='0'
                                   style='background-color:#f1f5f2; border-radius:8px; margin:5px 0 20px 0;'>

                                <tr>
                                    <td style='padding:16px 18px;'>

                                        <p style='margin:0 0 8px; color:#1b3b2b; font-size:14px; font-weight:bold;'>
                                            Payment Information
                                        </p>

                                        <p style='margin:0; color:#555555; font-size:14px; line-height:1.6;'>
                                            There is no payment expiry. You can complete
                                            the payment at any time.
                                        </p>

                                    </td>
                                </tr>

                            </table>


                            <p style='margin:0 0 16px; color:#333333; font-size:15px; line-height:1.7;'>
                                Thank you for choosing
                                <strong>The Old Library</strong>.
                            </p>


                        </td>
                    </tr>


                    <!-- FOOTER -->
                    <tr>
                        <td style='background-color:#f1f3f2; padding:20px 25px; text-align:center;'>

                            <p style='margin:0 0 6px; color:#666666; font-size:13px;'>
                                Regards,
                            </p>

                            <p style='margin:0; color:#1b3b2b; font-size:14px; font-weight:bold;'>
                                The Old Library
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>";


                // =================================================
                // SEND EMAIL
                // =================================================

                try
                {
                    await emailService.SendEmailAsync(
                        user.Email,
                        "The Old Library - Payment is Now Available",
                        emailBody,
                        true);


                    // ---------------------------------------------
                    // EMAIL SENT SUCCESSFULLY
                    // ---------------------------------------------

                    storyPoetry.PaymentNotificationSent = true;


                    await storyPoetryRepository
                        .UpdateAsync(storyPoetry);


                    _logger.LogInformation(
                        "Payment available email sent successfully for StoryPoetryId {StoryPoetryId}.",
                        storyPoetry.StoryPoetryId);
                }
                catch (Exception ex)
                {
                    // ---------------------------------------------
                    // EMAIL FAILED
                    // ---------------------------------------------
                    //
                    // PaymentNotificationSent remains false.
                    //
                    // The background service will try again
                    // during the next check.
                    // ---------------------------------------------

                    _logger.LogError(
                        ex,
                        "Failed to send payment available email for StoryPoetryId {StoryPoetryId}.",
                        storyPoetry.StoryPoetryId);
                }
            }
        }
    }
}