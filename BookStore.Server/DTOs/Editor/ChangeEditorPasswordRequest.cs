using System.ComponentModel.DataAnnotations;

namespace BookStore.Server.DTOs.Editor
{
    public class ChangeEditorPasswordRequest
    {
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }
}