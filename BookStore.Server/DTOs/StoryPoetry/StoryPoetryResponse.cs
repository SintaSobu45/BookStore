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
        // STORY / POETRY PARTICULAR
        // =========================================================

        public int StoryPoetryParticularId { get; set; }

        // Current particular name
        public string ParticularName { get; set; } = string.Empty;

        // Historical name saved when submission was created
        public string ParticularNameSnapshot { get; set; } = string.Empty;


        // =========================================================
        // CONTRIBUTOR DETAILS
        // =========================================================

        public string ContributorNameMalayalam { get; set; } = string.Empty;

        public string ContributorAddressMalayalam { get; set; } = string.Empty;

        public string ContributorAddress { get; set; } = string.Empty;

        public string ContributorPincode { get; set; } = string.Empty;

        public string ContributorDistrictMalayalam { get; set; } = string.Empty;

        public string ContributorCityMalayalam { get; set; } = string.Empty;

        public string ContributorEmail { get; set; } = string.Empty;

        public string ContributorPhone { get; set; } = string.Empty;


        // =========================================================
        // CONTRIBUTOR PROFILE IMAGE
        // =========================================================

        public string ContributorProfileImageUrl { get; set; } = string.Empty;


        // =========================================================
        // PAYMENT / COPY INFORMATION
        // =========================================================

        public decimal BaseAmount { get; set; }

        public int ExtraCopies { get; set; }

        public decimal ExtraCopyPrice { get; set; }

        public int FreeCopies { get; set; }

        public int TotalCopies { get; set; }

        public decimal Amount { get; set; }


        // =========================================================
        // PAYMENT STATUS
        // =========================================================

        // Pending -> Payment not completed
        // Paid    -> Payment completed successfully

        public string PaymentStatus { get; set; } = "Pending";

        // Payment becomes available 4 hours after submission
        public DateTime? PaymentEnabledAt { get; set; }

        public bool PaymentNotificationSent { get; set; }

        //submission id
        public string SubmissionNumber { get; set; } = string.Empty;


        // =========================================================
        // DATES
        // =========================================================

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }
    }
}