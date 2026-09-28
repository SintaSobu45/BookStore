using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class SPCourierEmailService
    {
        private readonly SPCourierEmailRepository _repository;
        private readonly EmailService _emailService;

        public SPCourierEmailService(
            SPCourierEmailRepository repository,
            EmailService emailService)
        {
            _repository = repository;
            _emailService = emailService;
        }

        public async Task<bool> SendCourierEmailAsync(int userId, int eventId)
        {
            // 1. Check whether the user attended the selected event
            var hasAttended = await _repository.HasAttendedEventAsync(
                userId,
                eventId);

            // 2. Attended users should NOT receive courier email
            if (hasAttended)
            {
                return false;
            }

            // 3. Get user's StoryPoetry submissions
            var submissions = await _repository.GetUserSubmissionsAsync(userId);

            if (submissions == null || submissions.Count == 0)
            {
                throw new InvalidOperationException(
                    "No StoryPoetry submissions found for this user.");
            }

            // 4. Get email from the submission snapshot
            var email = submissions
                .Select(s => s.ContributorEmail)
                .FirstOrDefault(e => !string.IsNullOrWhiteSpace(e));

            if (string.IsNullOrWhiteSpace(email))
            {
                throw new InvalidOperationException(
                    "Contributor email is not available.");
            }

            // 5. Get contributor name
            var contributorName = submissions
                .Select(s => s.ContributorNameMalayalam)
                .FirstOrDefault(n => !string.IsNullOrWhiteSpace(n))
                ?? "Contributor";

            // 6. Create email
            var subject = "The Old Library - Your Story/Poetry Submission Dispatched";

            var body = $@"
                <h2>Submission Dispatched</h2>

                <p>Dear {contributorName},</p>

                <p>
                    Your Story/Poetry submission has been successfully
                    dispatched.
                </p>

                <p>
                    Thank you for being a part of The Old Library.
                </p>

                <p>
                    We hope you receive your submission safely.
                </p>

                <p>
                    Thank you,<br/>
                    The Old Library
                </p>
            ";

            // 7. Send email using existing EmailService
            await _emailService.SendEmailAsync(
                email,
                subject,
                body,
                true);

            return true;
        }
    }
}