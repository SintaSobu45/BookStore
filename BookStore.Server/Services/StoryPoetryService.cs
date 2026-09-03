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
            //var paymentEnabledAt =
            //    createdDate.AddHours(4);

            var paymentEnabledAt = createdDate.AddMinutes(5);


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
                                Submission Received
                            </h2>

                            <p style='margin:0 0 16px; color:#333333; font-size:15px; line-height:1.7;'>
                                Dear <strong>{user.Name}</strong>,
                            </p>

                            <p style='margin:0 0 18px; color:#333333; font-size:15px; line-height:1.7;'>
                                Thank you for submitting your
                                <strong>{storyPoetry.Type}</strong>
                                to The Old Library.
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
                                        Type
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

                                <tr>
                                    <td style='padding:12px 16px; color:#666666; font-size:14px;'>
                                        Submitted On
                                    </td>

                                    <td style='padding:12px 16px; color:#333333; font-size:14px;'>
                                        {storyPoetry.CreatedDate:dd MMM yyyy, hh:mm tt}
                                    </td>
                                </tr>

                            </table>

                            <p style='margin:0 0 16px; color:#333333; font-size:15px; line-height:1.7;'>
                                Your submission has been recorded successfully.
                            </p>

                            <p style='margin:0 0 20px; color:#333333; font-size:15px; line-height:1.7;'>
                                Your submission will be reviewed, and once the review
                                period is complete, you will receive a separate email
                                when payment becomes available.
                            </p>

                            <p style='margin:0; color:#333333; font-size:15px; line-height:1.7;'>
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

                    await _emailService.SendEmailAsync(
                        user.Email,
                        "The Old Library - Submission Received",
                        emailBody,
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
                                Editor Notification
                            </p>

                        </td>
                    </tr>

                    <!-- CONTENT -->
                    <tr>
                        <td style='padding:35px 30px;'>

                            <h2 style='margin:0 0 20px; color:#1b3b2b; font-size:22px;'>
                                New Submission Received
                            </h2>

                            <p style='margin:0 0 20px; color:#333333; font-size:15px; line-height:1.7;'>
                                A new
                                <strong>{storyPoetry.Type}</strong>
                                submission has been received and is ready for review.
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
                                        {created.StoryPoetryId}
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

                                <tr>
                                    <td style='padding:12px 16px; color:#666666; font-size:14px;'>
                                        Contributor Name
                                    </td>

                                    <td style='padding:12px 16px; color:#333333; font-size:14px;'>
                                        {storyPoetry.ContributorNameMalayalam}
                                    </td>
                                </tr>

                                <tr>
                                    <td style='padding:12px 16px; color:#666666; font-size:14px;'>
                                        Contributor Email
                                    </td>

                                    <td style='padding:12px 16px; color:#333333; font-size:14px;'>
                                        {storyPoetry.ContributorEmail}
                                    </td>
                                </tr>

                                <tr>
                                    <td style='padding:12px 16px; color:#666666; font-size:14px;'>
                                        Contributor Phone
                                    </td>

                                    <td style='padding:12px 16px; color:#333333; font-size:14px;'>
                                        {storyPoetry.ContributorPhone}
                                    </td>
                                </tr>

                                <tr>
                                    <td style='padding:12px 16px; color:#666666; font-size:14px;'>
                                        Submitted On
                                    </td>

                                    <td style='padding:12px 16px; color:#333333; font-size:14px;'>
                                        {createdDate:dd MMM yyyy, hh:mm tt}
                                    </td>
                                </tr>

                            </table>

                            <p style='margin:0 0 16px; color:#333333; font-size:15px; line-height:1.7;'>
                                Please review this submission in the
                                <strong>Editor</strong> section of The Old Library.
                            </p>

                            <p style='margin:0; color:#333333; font-size:15px; line-height:1.7;'>
                                Thank you for your contribution to
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