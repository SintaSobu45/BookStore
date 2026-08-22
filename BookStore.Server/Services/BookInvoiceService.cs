using BookStore.Server.Models.OrderModel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace BookStore.Server.Services
{
    public class BookInvoiceService
    {
        public byte[] GenerateBookInvoice(
            Order order,
            string? paymentMethod,
            string? razorpayPaymentId,
            DateTime paymentDate)
        {
            QuestPDF.Settings.License =
                LicenseType.Community;

            // =========================================================
            // INVOICE INFORMATION
            // =========================================================

            string invoiceNumber =
                $"INV-{order.OrderId:D6}";

            string orderType =
                order.UserId.HasValue
                    ? "Registered Customer"
                    : "Guest Customer";


            // =========================================================
            // DISCOUNT SUMMARY
            // =========================================================

            decimal originalTotal =
                order.OrderItems.Sum(item =>
                {
                    decimal originalPrice =
                        item.Book?.Price ?? item.UnitPrice;

                    return originalPrice * item.Quantity;
                });

            decimal totalDiscount =
                originalTotal - order.SubTotal;

            if (totalDiscount < 0)
            {
                totalDiscount = 0;
            }


            // =========================================================
            // CREATE DOCUMENT
            // =========================================================

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    // =================================================
                    // PAGE SETTINGS
                    // =================================================

                    page.Size(PageSizes.A4);

                    page.MarginHorizontal(35);

                    page.MarginTop(30);

                    page.MarginBottom(30);


                    // =================================================
                    // HEADER
                    // =================================================

                    page.Header()
                        .Column(header =>
                        {
                            header.Spacing(2);

                            header.Item()
                                .AlignCenter()
                                .Text("THE OLD LIBRARY")
                                .Bold()
                                .FontSize(21);

                            header.Item()
                                .AlignCenter()
                                .Text("BOOK ORDER INVOICE")
                                .FontSize(10);

                            header.Item()
                                .PaddingTop(6)
                                .LineHorizontal(1);
                        });


                    // =================================================
                    // CONTENT
                    // =================================================

                    page.Content()
                        .PaddingTop(12)
                        .Column(column =>
                        {
                            column.Spacing(7);


                            // =========================================
                            // INVOICE TITLE
                            // =========================================

                            column.Item()
                                .AlignCenter()
                                .Text("INVOICE")
                                .Bold()
                                .FontSize(17);


                            // =========================================
                            // INVOICE + PAYMENT INFORMATION
                            // =========================================

                            column.Item()
                                .Background(Colors.Grey.Lighten4)
                                .Padding(9)
                                .Row(row =>
                                {
                                    // ---------------------------------
                                    // LEFT
                                    // ---------------------------------

                                    row.RelativeItem()
                                        .Column(left =>
                                        {
                                            left.Spacing(3);

                                            left.Item()
                                                .Text(
                                                    $"Invoice No: {invoiceNumber}")
                                                .Bold()
                                                .FontSize(9);

                                            left.Item()
                                                .Text(
                                                    $"Order ID: {order.OrderId}")
                                                .FontSize(9);

                                            left.Item()
                                                .Text(
                                                    $"Order Type: {orderType}")
                                                .FontSize(9);
                                        });


                                    // ---------------------------------
                                    // RIGHT
                                    // ---------------------------------

                                    row.RelativeItem()
                                        .Column(right =>
                                        {
                                            right.Spacing(3);

                                            right.Item()
                                                .AlignRight()
                                                .Text(
                                                    $"Order Date: {order.OrderDate:dd-MM-yyyy}")
                                                .FontSize(9);

                                            right.Item()
                                                .AlignRight()
                                                .Text(
                                                    $"Payment Date: {paymentDate:dd-MM-yyyy}")
                                                .FontSize(9);

                                            right.Item()
                                                .AlignRight()
                                                .Text(
                                                    "Payment Status: PAID")
                                                .Bold()
                                                .FontSize(9);
                                        });
                                });


                            // =========================================
                            // CUSTOMER + SHIPPING
                            // =========================================

                            column.Item()
                                .Row(row =>
                                {
                                    // ---------------------------------
                                    // CUSTOMER
                                    // ---------------------------------

                                    row.RelativeItem()
                                        .Column(customer =>
                                        {
                                            customer.Spacing(3);

                                            customer.Item()
                                                .Text("CUSTOMER DETAILS")
                                                .Bold()
                                                .FontSize(10);

                                            customer.Item()
                                                .LineHorizontal(1);

                                            customer.Item()
                                                .Text(
                                                    $"Name: {order.CustomerName}")
                                                .FontSize(8);

                                            customer.Item()
                                                .Text(
                                                    $"Email: {order.CustomerEmail}")
                                                .FontSize(8);

                                            customer.Item()
                                                .Text(
                                                    $"Phone: {order.CustomerPhone}")
                                                .FontSize(8);
                                        });


                                    // ---------------------------------
                                    // SHIPPING
                                    // ---------------------------------

                                    row.RelativeItem()
                                        .PaddingLeft(20)
                                        .Column(shipping =>
                                        {
                                            shipping.Spacing(3);

                                            shipping.Item()
                                                .Text("SHIPPING ADDRESS")
                                                .Bold()
                                                .FontSize(10);

                                            shipping.Item()
                                                .LineHorizontal(1);

                                            shipping.Item()
                                                .Text(
                                                    $"Address: {order.ShippingAddress}")
                                                .FontSize(8);

                                            shipping.Item()
                                                .Text(
                                                    $"{order.City}, {order.State} - {order.Pincode}")
                                                .FontSize(8);
                                        });
                                });


                            // =========================================
                            // ORDER DETAILS TITLE
                            // =========================================

                            column.Item()
                                .PaddingTop(3)
                                .Text("ORDER DETAILS")
                                .Bold()
                                .FontSize(10);

                            column.Item()
                                .LineHorizontal(1);


                            // =========================================
                            // TABLE HEADER
                            // =========================================

                            column.Item()
                                .Background(Colors.Grey.Lighten4)
                                .PaddingVertical(6)
                                .PaddingHorizontal(5)
                                .Row(row =>
                                {
                                    row.ConstantItem(25)
                                        .Text("#")
                                        .Bold()
                                        .FontSize(8);

                                    row.RelativeItem(4)
                                        .Text("Book")
                                        .Bold()
                                        .FontSize(8);

                                    row.RelativeItem(1)
                                        .AlignCenter()
                                        .Text("Qty")
                                        .Bold()
                                        .FontSize(8);

                                    row.RelativeItem(2)
                                        .AlignRight()
                                        .Text("Original")
                                        .Bold()
                                        .FontSize(8);

                                    row.RelativeItem(1)
                                        .AlignRight()
                                        .Text("Disc.")
                                        .Bold()
                                        .FontSize(8);

                                    row.RelativeItem(2)
                                        .AlignRight()
                                        .Text("Price")
                                        .Bold()
                                        .FontSize(8);

                                    row.RelativeItem(2)
                                        .AlignRight()
                                        .Text("Total")
                                        .Bold()
                                        .FontSize(8);
                                });


                            // =========================================
                            // ORDER ITEMS
                            // =========================================

                            int itemNumber = 1;

                            foreach (var item in order.OrderItems)
                            {
                                string bookTitle =
                                    item.Book?.Title
                                    ?? $"Book #{item.BookId}";

                                decimal originalPrice =
                                    item.Book?.Price
                                    ?? item.UnitPrice;

                                decimal discountPercentage =
                                    item.Book?.DiscountPercentage
                                    ?? 0;

                                column.Item()
                                    .BorderBottom(1)
                                    .PaddingVertical(5)
                                    .PaddingHorizontal(5)
                                    .Row(row =>
                                    {
                                        row.ConstantItem(25)
                                            .Text(
                                                itemNumber.ToString())
                                            .FontSize(8);

                                        row.RelativeItem(4)
                                            .Text(bookTitle)
                                            .FontSize(8);

                                        row.RelativeItem(1)
                                            .AlignCenter()
                                            .Text(
                                                item.Quantity.ToString())
                                            .FontSize(8);

                                        row.RelativeItem(2)
                                            .AlignRight()
                                            .Text(
                                                $"₹{originalPrice:F2}")
                                            .FontSize(8);

                                        row.RelativeItem(1)
                                            .AlignRight()
                                            .Text(
                                                $"{discountPercentage:F0}%")
                                            .FontSize(8);

                                        row.RelativeItem(2)
                                            .AlignRight()
                                            .Text(
                                                $"₹{item.UnitPrice:F2}")
                                            .FontSize(8);

                                        row.RelativeItem(2)
                                            .AlignRight()
                                            .Text(
                                                $"₹{item.TotalPrice:F2}")
                                            .FontSize(8);
                                    });

                                itemNumber++;
                            }


                            // =========================================
                            // PAYMENT + SUMMARY
                            // =========================================

                            column.Item()
                                .PaddingTop(6)
                                .Row(row =>
                                {
                                    // ---------------------------------
                                    // PAYMENT DETAILS
                                    // ---------------------------------

                                    row.RelativeItem()
                                        .Column(payment =>
                                        {
                                            payment.Spacing(3);

                                            payment.Item()
                                                .Text("PAYMENT DETAILS")
                                                .Bold()
                                                .FontSize(10);

                                            payment.Item()
                                                .LineHorizontal(1);

                                            payment.Item()
                                                .Text(
                                                    $"Method: {paymentMethod ?? "N/A"}")
                                                .FontSize(8);

                                            payment.Item()
                                                .Text(
                                                    $"Payment ID: {razorpayPaymentId ?? "N/A"}")
                                                .FontSize(8);

                                            payment.Item()
                                                .Text(
                                                    "Status: Paid")
                                                .Bold()
                                                .FontSize(8);
                                        });


                                    // ---------------------------------
                                    // AMOUNT SUMMARY
                                    // ---------------------------------

                                    row.RelativeItem()
                                        .PaddingLeft(20)
                                        .Column(summary =>
                                        {
                                            summary.Spacing(3);

                                            summary.Item()
                                                .Row(r =>
                                                {
                                                    r.RelativeItem()
                                                        .Text("Original Total:")
                                                        .FontSize(8);

                                                    r.AutoItem()
                                                        .Text(
                                                            $"₹{originalTotal:F2}")
                                                        .FontSize(8);
                                                });

                                            summary.Item()
                                                .Row(r =>
                                                {
                                                    r.RelativeItem()
                                                        .Text("Discount:")
                                                        .FontSize(8);

                                                    r.AutoItem()
                                                        .Text(
                                                            $"-₹{totalDiscount:F2}")
                                                        .FontSize(8);
                                                });

                                            summary.Item()
                                                .Row(r =>
                                                {
                                                    r.RelativeItem()
                                                        .Text("Subtotal:")
                                                        .Bold()
                                                        .FontSize(8);

                                                    r.AutoItem()
                                                        .Text(
                                                            $"₹{order.SubTotal:F2}")
                                                        .Bold()
                                                        .FontSize(8);
                                                });

                                            summary.Item()
                                                .Row(r =>
                                                {
                                                    r.RelativeItem()
                                                        .Text("Courier Fee:")
                                                        .FontSize(8);

                                                    r.AutoItem()
                                                        .Text(
                                                            $"₹{order.CourierFee:F2}")
                                                        .FontSize(8);
                                                });

                                            summary.Item()
                                                .PaddingTop(4)
                                                .BorderTop(1)
                                                .PaddingTop(5)
                                                .Row(r =>
                                                {
                                                    r.RelativeItem()
                                                        .Text("TOTAL")
                                                        .Bold()
                                                        .FontSize(11);

                                                    r.AutoItem()
                                                        .Text(
                                                            $"₹{order.TotalAmount:F2}")
                                                        .Bold()
                                                        .FontSize(12);
                                                });
                                        });
                                });


                            // =========================================
                            // ORDER STATUS
                            // =========================================

                            column.Item()
                                .PaddingTop(5)
                                .Background(Colors.Grey.Lighten4)
                                .Padding(6)
                                .AlignCenter()
                                .Text(
                                    $"Order Status: {order.OrderStatus}")
                                .Bold()
                                .FontSize(8);


                            // =========================================
                            // THANK YOU
                            // =========================================

                            column.Item()
                                .PaddingTop(8)
                                .AlignCenter()
                                .Text(
                                    "Thank you for shopping with The Old Library.")
                                .Bold()
                                .FontSize(9);

                            column.Item()
                                .AlignCenter()
                                .Text(
                                    "Please keep this invoice for your records.")
                                .FontSize(7);


                            // =========================================
                            // COMPUTER GENERATED
                            // =========================================

                            column.Item()
                                .PaddingTop(4)
                                .AlignCenter()
                                .Text(
                                    "This is a computer-generated invoice and does not require a signature.")
                                .FontSize(6);
                        });


                    // =================================================
                    // FOOTER
                    // =================================================

                    page.Footer()
                        .AlignCenter()
                        .Column(footer =>
                        {
                            footer.Item()
                                .LineHorizontal(1);

                            footer.Item()
                                .PaddingTop(3)
                                .Text("The Old Library • Book Order Invoice")
                                .FontSize(7);

                            footer.Item()
                                .Text("Thank you for your purchase.")
                                .FontSize(6);
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