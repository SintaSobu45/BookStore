using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace BookStore.Server.Services
{
    public class PaymentReceiptService
    {
        // =========================================================
        // EVENT PAYMENT RECEIPT
        // =========================================================

        public byte[] GenerateEventPaymentReceipt(
            int registrationId,
            string customerName,
            string customerEmail,
            string eventName,
            DateTime eventDate,
            TimeSpan eventTime,
            string venue,
            int numberOfSeats,
            decimal amountPaid,
            string? paymentMethod,
            string paymentId,
            DateTime paymentDate)
        {
            QuestPDF.Settings.License =
                LicenseType.Community;

            string receiptNumber =
                $"REG-{registrationId:D6}";

            string formattedEventTime =
                DateTime.Today
                    .Add(eventTime)
                    .ToString("hh:mm tt");

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    // =================================================
                    // PAGE SETTINGS
                    // =================================================

                    page.Size(PageSizes.A4);
                    page.Margin(45);


                    // =================================================
                    // HEADER
                    // =================================================

                    page.Header()
                        .Column(column =>
                        {
                            column.Spacing(4);

                            column.Item()
                                .AlignCenter()
                                .Text("THE OLD LIBRARY")
                                .Bold()
                                .FontSize(24);

                            column.Item()
                                .AlignCenter()
                                .Text(
                                    "Event Registration & Payment Receipt")
                                .FontSize(12);

                            column.Item()
                                .PaddingTop(12)
                                .LineHorizontal(1);
                        });


                    // =================================================
                    // CONTENT
                    // =================================================

                    page.Content()
                        .PaddingTop(25)
                        .Column(column =>
                        {
                            column.Spacing(12);


                            // =========================================
                            // RECEIPT TITLE
                            // =========================================

                            column.Item()
                                .AlignCenter()
                                .Text("PAYMENT RECEIPT")
                                .Bold()
                                .FontSize(18);


                            // =========================================
                            // RECEIPT INFORMATION
                            // =========================================

                            column.Item()
                                .PaddingTop(10)
                                .Background(Colors.Grey.Lighten4)
                                .Padding(12)
                                .Column(info =>
                                {
                                    info.Spacing(6);

                                    info.Item()
                                        .Text(
                                            $"Receipt No: {receiptNumber}")
                                        .Bold();

                                    info.Item()
                                        .Text(
                                            $"Payment ID: {paymentId}");

                                    info.Item()
                                        .Text(
                                            $"Payment Date: {paymentDate:dd-MM-yyyy hh:mm tt}");

                                    info.Item()
                                        .Text(
                                            "Payment Status: PAID")
                                        .Bold();
                                });


                            // =========================================
                            // CUSTOMER DETAILS
                            // =========================================

                            column.Item()
                                .PaddingTop(10)
                                .Text("CUSTOMER DETAILS")
                                .Bold()
                                .FontSize(13);

                            column.Item()
                                .LineHorizontal(1);

                            column.Item()
                                .Text(
                                    $"Name: {customerName}");

                            column.Item()
                                .Text(
                                    $"Email: {customerEmail}");


                            // =========================================
                            // EVENT DETAILS
                            // =========================================

                            column.Item()
                                .PaddingTop(10)
                                .Text("EVENT DETAILS")
                                .Bold()
                                .FontSize(13);

                            column.Item()
                                .LineHorizontal(1);

                            column.Item()
                                .Text(
                                    $"Event Name: {eventName}");

                            column.Item()
                                .Text(
                                    $"Event Date: {eventDate:dd-MM-yyyy}");

                            column.Item()
                                .Text(
                                    $"Event Time: {formattedEventTime}");

                            column.Item()
                                .Text(
                                    $"Venue: {venue}");


                            // =========================================
                            // BOOKING DETAILS
                            // =========================================

                            column.Item()
                                .PaddingTop(10)
                                .Text("BOOKING DETAILS")
                                .Bold()
                                .FontSize(13);

                            column.Item()
                                .LineHorizontal(1);

                            column.Item()
                                .Text(
                                    $"Number of Seats: {numberOfSeats}");


                            // =========================================
                            // PAYMENT DETAILS
                            // =========================================

                            column.Item()
                                .PaddingTop(10)
                                .Text("PAYMENT DETAILS")
                                .Bold()
                                .FontSize(13);

                            column.Item()
                                .LineHorizontal(1);

                            column.Item()
                                .Text(
                                    $"Payment Method: {paymentMethod ?? "N/A"}");

                            column.Item()
                                .Text(
                                    $"Payment ID: {paymentId}");


                            // =========================================
                            // TOTAL AMOUNT
                            // =========================================

                            column.Item()
                                .PaddingTop(15)
                                .Background(Colors.Grey.Lighten4)
                                .Padding(15)
                                .Row(row =>
                                {
                                    row.RelativeItem()
                                        .Text("TOTAL AMOUNT PAID")
                                        .Bold()
                                        .FontSize(14);

                                    row.AutoItem()
                                        .Text(
                                            $"₹{amountPaid:F2}")
                                        .Bold()
                                        .FontSize(16);
                                });


                            // =========================================
                            // THANK YOU MESSAGE
                            // =========================================

                            column.Item()
                                .PaddingTop(25)
                                .AlignCenter()
                                .Text(
                                    "Thank you for registering with The Old Library.")
                                .Bold()
                                .FontSize(11);

                            column.Item()
                                .AlignCenter()
                                .Text(
                                    "We look forward to welcoming you to the event.")
                                .FontSize(10);

                            column.Item()
                                .PaddingTop(10)
                                .AlignCenter()
                                .Text(
                                    "This is a computer-generated payment receipt and does not require a signature.")
                                .FontSize(8);
                        });


                    // =================================================
                    // FOOTER
                    // =================================================

                    page.Footer()
                        .AlignCenter()
                        .Column(column =>
                        {
                            column.Item()
                                .LineHorizontal(1);

                            column.Item()
                                .PaddingTop(5)
                                .Text("The Old Library")
                                .FontSize(9);

                            column.Item()
                                .Text(
                                    "Event Registration & Payment Receipt")
                                .FontSize(8);
                        });
                });
            });

            return document.GeneratePdf();
        }


        // =========================================================
        // STORY / POETRY / SPECIAL PAYMENT RECEIPT
        // =========================================================

        public byte[] GenerateStoryPoetryPaymentReceipt(
            int storyPoetryId,
            string customerName,
            string customerEmail,
            string type,
            string title,
            string contributorNameMalayalam,
            string contributorEmail,
            string contributorPhone,
            decimal amountPaid,
            string? paymentMethod,
            string paymentId,
            DateTime paymentDate)
        {
            QuestPDF.Settings.License =
                LicenseType.Community;

            // =========================================================
            // RECEIPT NUMBER
            // =========================================================

            string receiptNumber =
                $"SP-{storyPoetryId:D6}";


            // =========================================================
            // SUBMISSION TYPE
            // =========================================================

            // Type comes directly from StoryPoetry table.
            //
            // Story
            // Poetry
            // Special
            //
            // No hardcoding is required.

            string submissionType =
                string.IsNullOrWhiteSpace(type)
                    ? "Submission"
                    : type;


            // =========================================================
            // CREATE PDF DOCUMENT
            // =========================================================

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    // =================================================
                    // PAGE SETTINGS
                    // =================================================

                    page.Size(PageSizes.A4);
                    page.Margin(45);


                    // =================================================
                    // HEADER
                    // =================================================

                    page.Header()
                        .Column(column =>
                        {
                            column.Spacing(4);

                            column.Item()
                                .AlignCenter()
                                .Text("THE OLD LIBRARY")
                                .Bold()
                                .FontSize(24);

                            column.Item()
                                .AlignCenter()
                                .Text(
                                    "Story, Poetry & Special Submission")
                                .FontSize(12);

                            column.Item()
                                .PaddingTop(12)
                                .LineHorizontal(1);
                        });


                    // =================================================
                    // CONTENT
                    // =================================================

                    page.Content()
                        .PaddingTop(25)
                        .Column(column =>
                        {
                            column.Spacing(12);


                            // =========================================
                            // RECEIPT TITLE
                            // =========================================

                            column.Item()
                                .AlignCenter()
                                .Text("PAYMENT RECEIPT")
                                .Bold()
                                .FontSize(18);


                            // =========================================
                            // RECEIPT INFORMATION
                            // =========================================

                            column.Item()
                                .PaddingTop(10)
                                .Background(Colors.Grey.Lighten4)
                                .Padding(12)
                                .Column(info =>
                                {
                                    info.Spacing(6);

                                    info.Item()
                                        .Text(
                                            $"Receipt No: {receiptNumber}")
                                        .Bold();

                                    info.Item()
                                        .Text(
                                            $"Payment ID: {paymentId}");

                                    info.Item()
                                        .Text(
                                            $"Payment Date: {paymentDate:dd-MM-yyyy hh:mm tt}");

                                    info.Item()
                                        .Text(
                                            "Payment Status: PAID")
                                        .Bold();
                                });


                            // =========================================
                            // CUSTOMER DETAILS
                            // =========================================

                            column.Item()
                                .PaddingTop(10)
                                .Text("CUSTOMER DETAILS")
                                .Bold()
                                .FontSize(13);

                            column.Item()
                                .LineHorizontal(1);

                            column.Item()
                                .Text(
                                    $"Name: {customerName}");

                            column.Item()
                                .Text(
                                    $"Email: {customerEmail}");


                            // =========================================
                            // SUBMISSION DETAILS
                            // =========================================

                            column.Item()
                                .PaddingTop(10)
                                .Text("SUBMISSION DETAILS")
                                .Bold()
                                .FontSize(13);

                            column.Item()
                                .LineHorizontal(1);

                            column.Item()
                                .Text(
                                    $"Submission Type: {submissionType}");

                            column.Item()
                                .Text(
                                    $"Title: {title}");

                            column.Item()
                                .Text(
                                    $"Submission ID: {storyPoetryId}");


                            // =========================================
                            // CONTRIBUTOR DETAILS
                            // =========================================

                            column.Item()
                                .PaddingTop(10)
                                .Text("CONTRIBUTOR DETAILS")
                                .Bold()
                                .FontSize(13);

                            column.Item()
                                .LineHorizontal(1);

                            column.Item()
                                .Text(
                                    $"Contributor Name: {contributorNameMalayalam}");

                            column.Item()
                                .Text(
                                    $"Contributor Email: {contributorEmail}");

                            column.Item()
                                .Text(
                                    $"Contributor Phone: {contributorPhone}");


                            // =========================================
                            // PAYMENT DETAILS
                            // =========================================

                            column.Item()
                                .PaddingTop(10)
                                .Text("PAYMENT DETAILS")
                                .Bold()
                                .FontSize(13);

                            column.Item()
                                .LineHorizontal(1);

                            column.Item()
                                .Text(
                                    $"Payment Method: {paymentMethod ?? "N/A"}");

                            column.Item()
                                .Text(
                                    $"Payment ID: {paymentId}");

                            column.Item()
                                .Text(
                                    $"Payment Date: {paymentDate:dd-MM-yyyy hh:mm tt}");


                            // =========================================
                            // TOTAL AMOUNT
                            // =========================================

                            column.Item()
                                .PaddingTop(15)
                                .Background(Colors.Grey.Lighten4)
                                .Padding(15)
                                .Row(row =>
                                {
                                    row.RelativeItem()
                                        .Text("TOTAL AMOUNT PAID")
                                        .Bold()
                                        .FontSize(14);

                                    row.AutoItem()
                                        .Text(
                                            $"₹{amountPaid:F2}")
                                        .Bold()
                                        .FontSize(16);
                                });


                            // =========================================
                            // CONFIRMATION MESSAGE
                            // =========================================

                            column.Item()
                                .PaddingTop(25)
                                .AlignCenter()
                                .Text(
                                    $"Thank you for your {submissionType.ToLowerInvariant()} submission.")
                                .Bold()
                                .FontSize(11);

                            column.Item()
                                .AlignCenter()
                                .Text(
                                    "Your payment has been successfully received.")
                                .FontSize(10);

                            column.Item()
                                .AlignCenter()
                                .Text(
                                    "Your submission will be processed by The Old Library.")
                                .FontSize(10);

                            column.Item()
                                .PaddingTop(10)
                                .AlignCenter()
                                .Text(
                                    "This is a computer-generated payment receipt and does not require a signature.")
                                .FontSize(8);
                        });


                    // =================================================
                    // FOOTER
                    // =================================================

                    page.Footer()
                        .AlignCenter()
                        .Column(column =>
                        {
                            column.Item()
                                .LineHorizontal(1);

                            column.Item()
                                .PaddingTop(5)
                                .Text("The Old Library")
                                .FontSize(9);

                            column.Item()
                                .Text(
                                    "Story, Poetry & Special Submission Payment Receipt")
                                .FontSize(8);
                        });
                });
            });


            // =========================================================
            // GENERATE PDF
            // =========================================================

            return document.GeneratePdf();
        }
    }
}