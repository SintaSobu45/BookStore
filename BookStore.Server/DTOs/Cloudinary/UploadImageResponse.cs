namespace BookStore.Server.DTOs.Cloudinary
{
    public class UploadImageResponse
    {
        public string ImageUrl { get; set; } = string.Empty;

        public string PublicId { get; set; } = string.Empty;
    }
}