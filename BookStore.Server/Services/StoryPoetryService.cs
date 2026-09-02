using BookStore.Server.DTOs.StoryPoetry;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class StoryPoetryService
    {
        private readonly StoryPoetryRepository _storyPoetryRepository;
        private readonly ProfileRepository _profileRepository;
        private readonly FtpImageService _ftpImageService;
        private readonly EmailService _emailService;
        private readonly AccountRepository _accountRepository;

        public StoryPoetryService(
            StoryPoetryRepository storyPoetryRepository,
            ProfileRepository profileRepository,
            FtpImageService ftpImageService,
            EmailService emailService,
            AccountRepository accountRepository)
        {
            _storyPoetryRepository = storyPoetryRepository;
            _profileRepository = profileRepository;
            _ftpImageService = ftpImageService;
            _emailService = emailService;
            _accountRepository = accountRepository;
        }


        // =========================================================
        // ADD STORY / POETRY / SPECIAL
        // =========================================================

        public async Task<StoryPoetryResponse> AddAsync(
            AddStoryPoetryRequest request,
            int userId)
        {
            // -----------------------------------------------------
            // GET LOGGED-IN USER PROFILE
            // -----------------------------------------------------

            var user = await _profileRepository
                .GetUserByIdAsync(userId);

            if (user == null)
            {
                throw new UnauthorizedAccessException(
                    "User profile not found.");
            }


            // -----------------------------------------------------
            // IMAGE IS REQUIRED
            // -----------------------------------------------------

            if (request.ContributorProfileImage == null ||
                request.ContributorProfileImage.Length == 0)
            {
                throw new ArgumentException(
                    "Contributor profile image is required.");
            }


            // =====================================================
            // CONTRIBUTOR DETAILS
            // =====================================================

            var contributorNameMalayalam =
                request.ContributorNameMalayalam;

            var contributorAddressMalayalam =
                request.ContributorAddressMalayalam;

            var contributorDistrictMalayalam =
                request.ContributorDistrictMalayalam;

            var contributorCityMalayalam =
                request.ContributorCityMalayalam;

            var contributorEmail =
                request.ContributorEmail;

            var contributorPhone =
                request.ContributorPhone;


            // =====================================================
            // VALIDATE CONTRIBUTOR DETAILS
            // =====================================================

            if (string.IsNullOrWhiteSpace(
                contributorNameMalayalam))
            {
                throw new ArgumentException(
                    "Contributor Malayalam name is required.");
            }

            if (string.IsNullOrWhiteSpace(
                contributorDistrictMalayalam))
            {
                throw new ArgumentException(
                    "Contributor Malayalam district is required.");
            }

            if (string.IsNullOrWhiteSpace(
                contributorCityMalayalam))
            {
                throw new ArgumentException(
                    "Contributor Malayalam city is required.");
            }

            if (string.IsNullOrWhiteSpace(
                contributorEmail))
            {
                throw new ArgumentException(
                    "Contributor email is required.");
            }

            if (string.IsNullOrWhiteSpace(
                contributorPhone))
            {
                throw new ArgumentException(
                    "Contributor phone number is required.");
            }


            // =====================================================
            // UPLOAD PROFILE IMAGE TO FTP
            // =====================================================

            var imageUrl =
                await _ftpImageService.UploadImageAsync(
                    request.ContributorProfileImage);

            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                throw new Exception(
                    "Contributor profile image upload failed.");
            }


            // =====================================================
            // CREATE DATES
            // =====================================================

            // One timestamp is used for both CreatedDate
            // and PaymentEnabledAt calculation.
            var createdDate = DateTime.UtcNow;

            // Payment becomes available exactly 4 hours
            // after the submission is created.
            var paymentEnabledAt =
                createdDate.AddHours(4);


            // =====================================================
            // CREATE STORY / POETRY
            // =====================================================

            var storyPoetry = new StoryPoetry
            {
                // -------------------------------------------------
                // LOGGED-IN USER
                // -------------------------------------------------

                UserId = userId,


                // -------------------------------------------------
                // STORY / POETRY DETAILS
                // -------------------------------------------------

                Title = request.Title,

                Type = request.Type,

                Content = request.Content,


                // -------------------------------------------------
                // CONTRIBUTOR SNAPSHOT
                // -------------------------------------------------

                ContributorNameMalayalam =
                    contributorNameMalayalam,

                ContributorAddressMalayalam =
                    contributorAddressMalayalam,

                ContributorDistrictMalayalam =
                    contributorDistrictMalayalam,

                ContributorCityMalayalam =
                    contributorCityMalayalam,

                ContributorEmail =
                    contributorEmail,

                ContributorPhone =
                    contributorPhone,


                // -------------------------------------------------
                // FTP IMAGE URL
                // -------------------------------------------------

                ContributorProfileImageUrl =
                    imageUrl,


                // =================================================
                // PAYMENT
                // =================================================

                // Submission is created first.
                // Payment is not immediately available.
                PaymentStatus = "Pending",

                // Payment becomes available after 4 hours.
                PaymentEnabledAt = paymentEnabledAt,


                // -------------------------------------------------
                // DATES
                // -------------------------------------------------

                CreatedDate = createdDate
            };


            // =====================================================
            // SAVE STORY / POETRY
            // =====================================================

            var created =
                await _storyPoetryRepository
                    .AddAsync(storyPoetry);


            // =====================================================
            // SEND SUBMISSION RECEIVED EMAILS
            // =====================================================

            // IMPORTANT:
            // These emails are sent only after the database save
            // succeeds.
            //
            // Email failure must NOT make the submission fail.


            // =====================================================
            // 1. EMAIL USER
            // =====================================================

            if (!string.IsNullOrWhiteSpace(user.Email))
            {
                try
                {
                    string userEmailBody = $@"
<html>
<body style='font-family: Arial, sans-serif; color: #333;'>

    <div style='max-width: 600px; margin: auto;'>

        <h2 style='text-align: center;'>
            The Old Library
        </h2>

        <h3>
            Submission Received
        </h3>

        <p>
            Dear <strong>{user.Name}</strong>,
        </p>

        <p>
            Thank you for submitting your
            <strong>{storyPoetry.Type}</strong>
            to The Old Library.
        </p>

        <p>
            Your submission has been successfully received.
        </p>

        <table style='width: 100%; border-collapse: collapse;'>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Submission ID</strong>
                </td>
                <td style='padding: 8px;'>
                    {created.StoryPoetryId}
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

            <tr>
                <td style='padding: 8px;'>
                    <strong>Submitted On</strong>
                </td>
                <td style='padding: 8px;'>
                    {createdDate:dd-MM-yyyy HH:mm}
                </td>
            </tr>

        </table>

        <p>
            Your submission has been recorded successfully.
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

                    await _emailService.SendEmailAsync(
                        user.Email,
                        "The Old Library - Submission Received",
                        userEmailBody,
                        true);
                }
                catch (Exception ex)
                {
                    // Email failure must not affect submission.
                    Console.WriteLine(
                        $"Story/Poetry submission email failed: {ex.Message}");
                }
            }


            // =====================================================
            // 2. EMAIL ALL EDITORS
            // =====================================================

            try
            {
                var editors =
                    await _accountRepository
                        .GetAllEditorsAsync();

                foreach (var editor in editors)
                {
                    if (string.IsNullOrWhiteSpace(editor.Email))
                    {
                        continue;
                    }

                    try
                    {
                        string editorEmailBody = $@"
<html>
<body style='font-family: Arial, sans-serif; color: #333;'>

    <div style='max-width: 600px; margin: auto;'>

        <h2 style='text-align: center;'>
            The Old Library
        </h2>

        <h3>
            New Story/Poetry Submission Received
        </h3>

        <p>
            A new
            <strong>{storyPoetry.Type}</strong>
            submission has been received.
        </p>

        <table style='width: 100%; border-collapse: collapse;'>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Submission ID</strong>
                </td>
                <td style='padding: 8px;'>
                    {created.StoryPoetryId}
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

            <tr>
                <td style='padding: 8px;'>
                    <strong>Contributor Name</strong>
                </td>
                <td style='padding: 8px;'>
                    {storyPoetry.ContributorNameMalayalam}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Contributor Email</strong>
                </td>
                <td style='padding: 8px;'>
                    {storyPoetry.ContributorEmail}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Contributor Phone</strong>
                </td>
                <td style='padding: 8px;'>
                    {storyPoetry.ContributorPhone}
                </td>
            </tr>

            <tr>
                <td style='padding: 8px;'>
                    <strong>Submitted On</strong>
                </td>
                <td style='padding: 8px;'>
                    {createdDate:dd-MM-yyyy HH:mm}
                </td>
            </tr>

        </table>

        <p>
            Please review the submission in the
            Editor section of The Old Library.
        </p>

        <p>
            Regards,<br/>
            <strong>The Old Library</strong>
        </p>

    </div>

</body>
</html>";

                        await _emailService.SendEmailAsync(
                            editor.Email,
                            "The Old Library - New Story/Poetry Submission Received",
                            editorEmailBody,
                            true);
                    }
                    catch (Exception ex)
                    {
                        // One editor's email failure must not prevent
                        // other editors from receiving the notification.
                        Console.WriteLine(
                            $"Editor submission email failed for {editor.Email}: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                // Failure to retrieve editors must not affect
                // the already-saved submission.
                Console.WriteLine(
                    $"Could not retrieve editors for submission email: {ex.Message}");
            }


            // =====================================================
            // GET SAVED RECORD
            // =====================================================

            var result =
                await _storyPoetryRepository
                    .GetByIdAsync(
                        created.StoryPoetryId);

            if (result == null)
            {
                throw new Exception(
                    "Story/Poetry submission could not be retrieved after saving.");
            }


            return MapToResponse(result);
        }


        // =========================================================
        // GET BY ID
        // =========================================================

        public async Task<StoryPoetryResponse?> GetByIdAsync(
            int id)
        {
            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(id);

            if (storyPoetry == null)
            {
                return null;
            }

            return MapToResponse(storyPoetry);
        }


        // =========================================================
        // GET ALL SUBMISSIONS
        // =========================================================

        public async Task<List<StoryPoetryResponse>> GetAllAsync()
        {
            return await _storyPoetryRepository
                .GetAllAsync();
        }


        // =========================================================
        // GET MY SUBMISSIONS
        // =========================================================

        public async Task<List<StoryPoetryResponse>> GetMyAsync(
            int userId)
        {
            return await _storyPoetryRepository
                .GetByUserIdAsync(userId);
        }


        // =========================================================
        // UPDATE
        // =========================================================

        public async Task<StoryPoetryResponse?> UpdateAsync(
            int id,
            UpdateStoryPoetryRequest request,
            int userId)
        {
            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(id);

            if (storyPoetry == null)
            {
                return null;
            }


            // -----------------------------------------------------
            // ONLY OWNER CAN UPDATE
            // -----------------------------------------------------

            if (storyPoetry.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only update your own submission.");
            }


            // -----------------------------------------------------
            // UPDATE STORY DETAILS
            // -----------------------------------------------------

            storyPoetry.Title =
                request.Title;

            storyPoetry.Type =
                request.Type;

            storyPoetry.Content =
                request.Content;

            storyPoetry.UpdatedDate =
                DateTime.UtcNow;


            // -----------------------------------------------------
            // CONTRIBUTOR DETAILS AND IMAGE
            // ARE NOT UPDATED
            // -----------------------------------------------------

            await _storyPoetryRepository
                .UpdateAsync(storyPoetry);


            return await GetByIdAsync(id);
        }


        // =========================================================
        // DELETE
        // =========================================================

        public async Task<bool> DeleteAsync(
            int id,
            int userId)
        {
            var storyPoetry =
                await _storyPoetryRepository
                    .GetByIdAsync(id);

            if (storyPoetry == null)
            {
                return false;
            }


            // -----------------------------------------------------
            // ONLY OWNER CAN DELETE
            // -----------------------------------------------------

            if (storyPoetry.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only delete your own submission.");
            }


            await _storyPoetryRepository
                .DeleteAsync(storyPoetry);


            return true;
        }


        // =========================================================
        // MAP ENTITY TO RESPONSE DTO
        // =========================================================

        private static StoryPoetryResponse MapToResponse(
            StoryPoetry storyPoetry)
        {
            return new StoryPoetryResponse
            {
                // -------------------------------------------------
                // SUBMISSION
                // -------------------------------------------------

                StoryPoetryId =
                    storyPoetry.StoryPoetryId,

                UserId =
                    storyPoetry.UserId,


                // -------------------------------------------------
                // STORY / POETRY DETAILS
                // -------------------------------------------------

                Title =
                    storyPoetry.Title,

                Type =
                    storyPoetry.Type,

                Content =
                    storyPoetry.Content,


                // -------------------------------------------------
                // PAYMENT STATUS
                // -------------------------------------------------

                PaymentStatus =
                    storyPoetry.PaymentStatus,

                PaymentEnabledAt =
                    storyPoetry.PaymentEnabledAt,


                // -------------------------------------------------
                // CONTRIBUTOR DETAILS
                // -------------------------------------------------

                ContributorNameMalayalam =
                    storyPoetry.ContributorNameMalayalam,

                ContributorAddressMalayalam =
                    storyPoetry.ContributorAddressMalayalam,

                ContributorDistrictMalayalam =
                    storyPoetry.ContributorDistrictMalayalam,

                ContributorCityMalayalam =
                    storyPoetry.ContributorCityMalayalam,

                ContributorEmail =
                    storyPoetry.ContributorEmail,

                ContributorPhone =
                    storyPoetry.ContributorPhone,


                // -------------------------------------------------
                // PROFILE IMAGE
                // -------------------------------------------------

                ContributorProfileImageUrl =
                    storyPoetry.ContributorProfileImageUrl,


                // -------------------------------------------------
                // DATES
                // -------------------------------------------------

                CreatedDate =
                    storyPoetry.CreatedDate,

                UpdatedDate =
                    storyPoetry.UpdatedDate
            };
        }
    }
}