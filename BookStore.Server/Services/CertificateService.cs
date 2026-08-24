using BookStore.Server.DTOs.Certificate;
using BookStore.Server.Models;
using BookStore.Server.Repositories;

namespace BookStore.Server.Services
{
    public class CertificateService
    {
        private readonly CertificateRepository _certificateRepository;
        private readonly StoryPoetryRepository _storyPoetryRepository;
        private readonly EmailService _emailService;

        public CertificateService(
            CertificateRepository certificateRepository,
            StoryPoetryRepository storyPoetryRepository,
            EmailService emailService)
        {
            _certificateRepository = certificateRepository;
            _storyPoetryRepository = storyPoetryRepository;
            _emailService = emailService;
        }


        // =========================================================
        // GET CANDIDATES
        // =========================================================
        //
        // Only:
        // Paid StoryPoetry
        // AND
        // No Certificate yet
        // =========================================================

        public async Task<List<CertificateCandidateResponse>>
            GetCandidatesAsync()
        {
            var submissions =
                await _storyPoetryRepository
                    .GetAllEntitiesAsync();

            var result =
                new List<CertificateCandidateResponse>();

            foreach (var submission in submissions)
            {
                if (submission.PaymentStatus != "Paid")
                {
                    continue;
                }

                var certificateExists =
                    await _certificateRepository
                        .ExistsForStoryPoetryAsync(
                            submission.StoryPoetryId);

                if (certificateExists)
                {
                    continue;
                }

                result.Add(
                    new CertificateCandidateResponse
                    {
                        StoryPoetryId =
                            submission.StoryPoetryId,

                        UserId =
                            submission.UserId,

                        Title =
                            submission.Title,

                        Type =
                            submission.Type,

                        ContributorNameMalayalam =
                            submission.ContributorNameMalayalam,

                        ContributorEmail =
                            submission.ContributorEmail,

                        CreatedDate =
                            submission.CreatedDate
                    });
            }

            return result;
        }


        // =========================================================
        // GENERATE SINGLE CERTIFICATE RECORD
        // =========================================================

        public async Task<Certificate?>
            GenerateAsync(
                int storyPoetryId)
        {
            var submission =
                await _storyPoetryRepository
                    .GetByIdAsync(
                        storyPoetryId);

            if (submission == null)
            {
                return null;
            }

            if (submission.PaymentStatus != "Paid")
            {
                throw new InvalidOperationException(
                    "Certificate is available only for paid submissions.");
            }

            var existing =
                await _certificateRepository
                    .GetByStoryPoetryIdAsync(
                        storyPoetryId);

            if (existing != null)
            {
                throw new InvalidOperationException(
                    "Certificate has already been generated for this submission.");
            }

            var certificate =
                new Certificate
                {
                    UserId =
                        submission.UserId,

                    StoryPoetryId =
                        submission.StoryPoetryId,

                    // IMPORTANT
                    // Snapshot Malayalam name
                    RecipientName =
                        submission.ContributorNameMalayalam,

                    CertificateNumber =
                        GenerateCertificateNumber(),

                    CertificateTitle =
                        "Certificate of Appreciation",

                    Description =
                        null,

                    IssuedDate =
                        DateTime.UtcNow,

                    PdfUrl =
                        null,

                    IsSent =
                        false,

                    SentDate =
                        null,

                    CreatedDate =
                        DateTime.UtcNow
                };

            return await _certificateRepository
                .AddAsync(certificate);
        }


        // =========================================================
        // BULK GENERATE
        // =========================================================
        //
        // Creates certificate records for selected IDs.
        //
        // It does NOT email.
        // It does NOT generate the visual template.
        //
        // The frontend will use the returned RecipientName
        // to render the certificate template.
        // =========================================================

        public async Task<List<CertificateSummaryResponse>>
            BulkGenerateAsync(
                List<int> storyPoetryIds)
        {
            if (storyPoetryIds == null ||
                storyPoetryIds.Count == 0)
            {
                throw new ArgumentException(
                    "At least one StoryPoetryId is required.");
            }

            var uniqueIds =
                storyPoetryIds
                    .Distinct()
                    .ToList();

            var generated =
                new List<Certificate>();

            foreach (var storyPoetryId in uniqueIds)
            {
                var submission =
                    await _storyPoetryRepository
                        .GetByIdAsync(
                            storyPoetryId);

                if (submission == null)
                {
                    continue;
                }

                if (submission.PaymentStatus != "Paid")
                {
                    continue;
                }

                var existing =
                    await _certificateRepository
                        .GetByStoryPoetryIdAsync(
                            storyPoetryId);

                if (existing != null)
                {
                    continue;
                }

                var certificate =
                    new Certificate
                    {
                        UserId =
                            submission.UserId,

                        StoryPoetryId =
                            submission.StoryPoetryId,

                        // Each person's own Malayalam name
                        RecipientName =
                            submission.ContributorNameMalayalam,

                        CertificateNumber =
                            GenerateCertificateNumber(),

                        CertificateTitle =
                            "Certificate of Appreciation",

                        Description =
                            null,

                        IssuedDate =
                            DateTime.UtcNow,

                        PdfUrl =
                            null,

                        IsSent =
                            false,

                        SentDate =
                            null,

                        CreatedDate =
                            DateTime.UtcNow
                    };

                generated.Add(certificate);
            }

            if (generated.Count > 0)
            {
                await _certificateRepository
                    .AddRangeAsync(
                        generated);
            }

            return generated
                .Select(c =>
                    new CertificateSummaryResponse
                    {
                        CertificateId =
                            c.CertificateId,

                        StoryPoetryId =
                            c.StoryPoetryId,

                        UserId =
                            c.UserId,

                        CertificateNumber =
                            c.CertificateNumber,

                        RecipientName =
                            c.RecipientName,

                        IssuedDate =
                            c.IssuedDate,

                        IsSent =
                            c.IsSent
                    })
                .ToList();
        }


        // =========================================================
        // GET GENERATED CERTIFICATE
        // =========================================================

        public async Task<CertificateSummaryResponse?>
            GetGeneratedCertificateAsync(
                int certificateId)
        {
            var certificate =
                await _certificateRepository
                    .GetByIdAsync(
                        certificateId);

            if (certificate == null)
            {
                return null;
            }

            return new CertificateSummaryResponse
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
            };
        }


        // =========================================================
        // SEND CERTIFICATE EMAIL
        // =========================================================
        //
        // The frontend sends the final PDF generated from
        // Salman's certificate template.
        //
        // Backend only:
        // 1. Gets matching certificate
        // 2. Gets matching StoryPoetry email
        // 3. Sends PDF
        // 4. Marks IsSent
        // =========================================================

        public async Task<CertificateSendResponse?>
            SendCertificateAsync(
                int certificateId,
                byte[] pdfBytes,
                string fileName)
        {
            var certificate =
                await _certificateRepository
                    .GetByIdAsync(
                        certificateId);

            if (certificate == null)
            {
                return null;
            }

            if (certificate.IsSent)
            {
                throw new InvalidOperationException(
                    "Certificate has already been sent.");
            }

            var submission =
                certificate.StoryPoetry;

            if (submission == null)
            {
                throw new InvalidOperationException(
                    "Story/Poetry submission not found.");
            }

            if (string.IsNullOrWhiteSpace(
                submission.ContributorEmail))
            {
                throw new InvalidOperationException(
                    "Contributor email is not available.");
            }

            if (pdfBytes == null ||
                pdfBytes.Length == 0)
            {
                throw new ArgumentException(
                    "Certificate PDF is required.");
            }

            var emailBody = $@"
<html>
<body style='font-family: Arial, sans-serif; color: #333;'>
    <div style='max-width: 600px; margin: auto;'>
        <h2 style='text-align: center;'>
            The Old Library
        </h2>

        <h3>
            Certificate
        </h3>

        <p>
            Dear <strong>{certificate.RecipientName}</strong>,
        </p>

        <p>
            Your certificate has been issued by The Old Library.
            Please find your certificate attached to this email.
        </p>

        <p>
            Thank you for your valuable contribution.
        </p>

        <p>
            Regards,<br/>
            <strong>The Old Library</strong>
        </p>
    </div>
</body>
</html>";

            await _emailService.SendEmailAsync(
                submission.ContributorEmail,
                "The Old Library - Certificate",
                emailBody,
                true,
                pdfBytes,
                fileName);

            certificate.IsSent = true;
            certificate.SentDate = DateTime.UtcNow;

            await _certificateRepository
                .UpdateAsync(
                    certificate);

            return new CertificateSendResponse
            {
                CertificateId =
                    certificate.CertificateId,

                IsSent =
                    certificate.IsSent,

                SentDate =
                    certificate.SentDate,

                Message =
                    "Certificate email sent successfully."
            };
        }


        // =========================================================
        // CERTIFICATE NUMBER
        // =========================================================

        private static string GenerateCertificateNumber()
        {
            var uniquePart =
                Guid.NewGuid()
                    .ToString("N")
                    .Substring(0, 8)
                    .ToUpperInvariant();

            return
                $"TOL-{DateTime.UtcNow:yyyy}-{uniquePart}";
        }
    }
}