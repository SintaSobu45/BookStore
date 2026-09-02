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
<html>
<body style='font-family: Arial, sans-serif; color: #333;'>

    <div style='max-width: 600px; margin: auto;'>

        <h2 style='text-align: center;'>
            The Old Library
        </h2>

        <h3>
            Payment is Now Available
        </h3>

        <p>
            Dear <strong>{user.Name}</strong>,
        </p>

        <p>
            Payment for your
            <strong>{storyPoetry.Type}</strong>
            submission is now available.
        </p>

        <table style='width: 100%; border-collapse: collapse;'>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Submission ID</strong>
                </td>
                <td style='padding: 8px;'>
                    {storyPoetry.StoryPoetryId}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Submission Type</strong>
                </td>
                <td style='padding: 8px;'>
                    {storyPoetry.Type}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Title</strong>
                </td>
                <td style='padding: 8px;'>
                    {storyPoetry.Title}
                </td>
            </tr>

        </table>


        <p style='text-align: center; margin-top: 30px;'>

            <a href='{paymentPageUrl}'
               style='background-color: #1b3b2b;
                      color: white;
                      padding: 12px 24px;
                      text-decoration: none;
                      border-radius: 6px;
                      display: inline-block;'>
                Pay Now
            </a>

        </p>


        <p>
            You can complete your payment using the button above.
        </p>


        <p>
            There is no payment expiry. You can complete the
            payment at any time.
        </p>


        <p>
            Thank you for choosing The Old Library.
        </p>


        <p>
            Regards,<br/>
            <strong>The Old Library</strong>
        </p>

    </div>

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