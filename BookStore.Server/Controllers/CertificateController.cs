using BookStore.Server.DTOs.Certificate;
using BookStore.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;


namespace BookStore.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CertificateController : ControllerBase
    {
        private readonly CertificateService _certificateService;

        public CertificateController(
            CertificateService certificateService)
        {
            _certificateService = certificateService;
        }


        // =========================================================
        // ADMIN - GET CANDIDATES
        // =========================================================

        [HttpGet("candidates")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetCandidates()
        {
            try
            {
                var candidates =
                    await _certificateService
                        .GetCandidatesAsync();

                return Ok(new
                {
                    message =
                        "Certificate candidates retrieved successfully.",

                    data =
                        candidates
                });
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "An unexpected error occurred while retrieving certificate candidates."
                    });
            }
        }


        // =========================================================
        // ADMIN - GENERATE SINGLE CERTIFICATE
        // =========================================================

        [HttpPost("generate/{storyPoetryId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GenerateCertificate(
            int storyPoetryId)
        {
            try
            {
                var certificate =
                    await _certificateService
                        .GenerateAsync(
                            storyPoetryId);

                if (certificate == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Story/Poetry submission not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Certificate generated successfully.",

                    data =
                        new CertificateSummaryResponse
                        {
                            CertificateId =
                                certificate.CertificateId,

                            StoryPoetryId =
                                certificate.StoryPoetryId,

                            UserId =
                                certificate.UserId,

                            CertificateNumber =
                                certificate.CertificateNumber,

                            RecipientName =
                                certificate.RecipientName,

                            IssuedDate =
                                certificate.IssuedDate,

                            IsSent =
                                certificate.IsSent
                        }
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message =
                        ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "An unexpected error occurred while generating the certificate."
                    });
            }
        }


        // =========================================================
        // ADMIN - BULK GENERATE
        // =========================================================
        //
        // Admin selects multiple paid candidates.
        //
        // POST:
        // api/Certificate/bulk-generate
        //
        // Body:
        // {
        //     "storyPoetryIds": [2, 4, 7]
        // }
        // =========================================================

        [HttpPost("bulk-generate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> BulkGenerate(
            [FromBody] BulkCertificateGenerateRequest request)
        {
            try
            {
                if (request == null ||
                    request.StoryPoetryIds == null ||
                    request.StoryPoetryIds.Count == 0)
                {
                    return BadRequest(new
                    {
                        message =
                            "At least one StoryPoetryId is required."
                    });
                }

                var result =
                    await _certificateService
                        .BulkGenerateAsync(
                            request.StoryPoetryIds);

                return Ok(new
                {
                    message =
                        "Certificates generated successfully.",

                    data =
                        result
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message =
                        ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "An unexpected error occurred while generating certificates."
                    });
            }
        }


        // =========================================================
        // ADMIN - GET GENERATED CERTIFICATE
        // =========================================================
        //
        // Used after generation.
        //
        // GET:
        // api/Certificate/{certificateId}
        // =========================================================

        [HttpGet("{certificateId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetGeneratedCertificate(
            int certificateId)
        {
            try
            {
                var certificate =
                    await _certificateService
                        .GetGeneratedCertificateAsync(
                            certificateId);

                if (certificate == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Certificate not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Certificate retrieved successfully.",

                    data =
                        certificate
                });
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "An unexpected error occurred while retrieving the certificate."
                    });
            }
        }


        // =========================================================
        // ADMIN - SEND CERTIFICATE PDF
        // =========================================================
        //
        // The frontend sends the PDF generated from the fixed
        // certificate template.
        //
        // POST:
        // api/Certificate/{certificateId}/send
        //
        // Form-data:
        // certificatePdf = PDF file
        // =========================================================

        [HttpPost("{certificateId}/send")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> SendCertificate(
            int certificateId,
            IFormFile certificatePdf)
        {
            try
            {
                if (certificatePdf == null ||
                    certificatePdf.Length == 0)
                {
                    return BadRequest(new
                    {
                        message =
                            "Certificate PDF is required."
                    });
                }

                if (!string.Equals(
                    certificatePdf.ContentType,
                    "application/pdf",
                    StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(new
                    {
                        message =
                            "Only PDF files are allowed."
                    });
                }

                using var memoryStream =
                    new MemoryStream();

                await certificatePdf.CopyToAsync(
                    memoryStream);

                var pdfBytes =
                    memoryStream.ToArray();

                var result =
                    await _certificateService
                        .SendCertificateAsync(
                            certificateId,
                            pdfBytes,
                            certificatePdf.FileName);

                if (result == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Certificate not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Certificate email sent successfully.",

                    data =
                        result
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message =
                        ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message =
                        ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        message =
                            "An unexpected error occurred while sending the certificate email."
                    });
            }
        }
    }
}