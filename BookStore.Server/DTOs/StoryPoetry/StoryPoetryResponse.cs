namespace BookStore.Server.DTOs.StoryPoetry
{
    public class StoryPoetryResponse
    {
        // =========================================================
        // SUBMISSION
        // =========================================================

        public int StoryPoetryId { get; set; }

        // Logged-in user ID from JWT
        public int UserId { get; set; }


        // =========================================================
        // STORY / POETRY DETAILS
        // =========================================================

        public string Title { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public string Content { get; set; } = string.Empty;


        // =========================================================
        // CONTRIBUTOR DETAILS
        // =========================================================

        public string ContributorNameMalayalam { get; set; } = string.Empty;

        public string ContributorAddressMalayalam { get; set; } = string.Empty;

        public string ContributorDistrictMalayalam { get; set; } = string.Empty;

        public string ContributorCityMalayalam { get; set; } = string.Empty;

        public string ContributorEmail { get; set; } = string.Empty;

        public string ContributorPhone { get; set; } = string.Empty;


        // =========================================================
        // CONTRIBUTOR PROFILE IMAGE
        // =========================================================

        public string ContributorProfileImageUrl { get; set; } = string.Empty;


        // =========================================================
        // PAYMENT STATUS
        // =========================================================

        // Pending -> Payment not completed
        // Paid    -> Payment completed successfully

        public string PaymentStatus { get; set; } = "Pending";


        // =========================================================
        // DATES
        // =========================================================

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}