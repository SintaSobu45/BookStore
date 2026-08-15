namespace BookStore.Server.DTOs.Profile
{
    public class GetProfileResponse
    {
        public int UserId { get; set; }


        // =========================================================
        // BASIC DETAILS
        // =========================================================

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;


        // =========================================================
        // PROFILE DETAILS
        // =========================================================

        public string? ProfileImageUrl { get; set; }

        public string? Address { get; set; }

        public string? City { get; set; }

        public string? District { get; set; }

        public string? State { get; set; }

        public string? Pincode { get; set; }


        // =========================================================
        // MALAYALAM DETAILS
        // These are optional.
        // =========================================================

        public string? NameMalayalam { get; set; }

        public string? AddressMalayalam { get; set; }

        public string? CityMalayalam { get; set; }

        public string? DistrictMalayalam { get; set; }

        public string? StateMalayalam { get; set; }
    }
}