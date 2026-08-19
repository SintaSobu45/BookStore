import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ArrowLeft,
  Download,
  ImageDown,
  Loader2,
  UserCircle,
} from "lucide-react";

import { getStoryPoetryById } from "../../services/storyPoetryService";

export default function AdminStoryPoetryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= LOAD DETAILS =================

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getStoryPoetryById(id);

        setItem(data);
      } catch (error) {
        console.error("Failed to load submission details:", error);

        setError(error.message || "Failed to load submission details.");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("book-print-page");

    if (!element) {
      alert("Book print page not found.");
      return;
    }

    try {
      // Wait briefly to ensure images and fonts are fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      // A4 PDF
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;
      const pdfHeight = 297;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);

      heightLeft -= pdfHeight;

      // Additional pages if content is longer than A4
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;

        pdf.addPage();

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);

        heightLeft -= pdfHeight;
      }

      // Safe filename from contributor name
      const fileName =
        item.contributorNameMalayalam?.replace(/[\\/:*?"<>|]/g, "_").trim() ||
        "submission";

      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF.");
    }
  };

  const handleDownloadImage = async () => {
    if (!item.contributorProfileImageUrl) {
      alert("No contributor profile image available.");
      return;
    }

    try {
      const response = await fetch(item.contributorProfileImageUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch image.");
      }

      const blob = await response.blob();

      console.log("Downloaded blob:", {
        type: blob.type,
        size: blob.size,
      });

      const imageUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      // Safe filename from contributor name
      const fileName =
        item.contributorNameMalayalam?.replace(/[\\/:*?"<>|]/g, "_").trim() ||
        "contributor";

      // Detect correct image extension
      const extensionMap = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "avif",
      };

      const extension = extensionMap[blob.type] || "jpg";

      link.href = imageUrl;
      link.download = `${fileName}.${extension}`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error("Image download failed:", error);
      alert("Failed to download contributor image.");
    }
  };
  // ================= LOADING =================

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-900" />

        <span className="ml-3 text-sm text-stone-500">
          Loading submission...
        </span>
      </div>
    );
  }

  // ================= ERROR =================

  if (error || !item) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700">
          {error || "Submission not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-stone-100 min-h-screen">
      {/* =====================================================
          ADMIN CONTROLS
          THESE ARE NOT PART OF THE PRINTED BOOK PAGE
      ===================================================== */}

      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-[#1b3b2b] hover:text-emerald-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Submissions
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-2 px-4 py-2.5 border border-stone-300 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-stone-50"
          >
            <ImageDown className="h-4 w-4" />
            Download Photo
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1b3b2b] hover:bg-emerald-950 text-white rounded-xl text-sm font-bold"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* =====================================================
          BOOK PRINT PAGE
      ===================================================== */}

      <div
        id="book-print-page"
        className="
          book-page
          max-w-5xl
          mx-auto
          bg-white
          shadow-xl
          min-h-[1120px]
          px-10
          md:px-20
          pt-20
          pb-20
        "
      >
        {/* =====================================================
            AUTHOR / CONTRIBUTOR HEADER
            IMAGE LEFT + DETAILS RIGHT
        ===================================================== */}

        <div className="flex items-start gap-8 md:gap-10">
          {/* ================= PROFILE IMAGE ================= */}

          <div className="shrink-0">
            {item.contributorProfileImageUrl ? (
              <img
                src={item.contributorProfileImageUrl}
                alt={item.contributorNameMalayalam}
                className="
                  w-36
                  h-44
                  md:w-40
                  md:h-48
                  object-cover
                  rounded-[28px]
                "
              />
            ) : (
              <div
                className="
                  w-36
                  h-44
                  md:w-40
                  md:h-48
                  bg-stone-100
                  rounded-[28px]
                  flex
                  items-center
                  justify-center
                "
              >
                <UserCircle className="w-16 h-16 text-stone-300" />
              </div>
            )}
          </div>

          {/* ================= CONTRIBUTOR DETAILS ================= */}

          <div
            className="
    pt-3
    text-gray-900
    leading-relaxed
    flex-1
  "
            style={{
              fontFamily: "'Manjari', sans-serif",
            }}
          >
            {/* NAME */}

            <p className="text-lg md:text-xl font-bold">
              {item.contributorNameMalayalam || ""}
            </p>

            {/* CITY + DISTRICT */}

            {(item.contributorCityMalayalam ||
              item.contributorDistrictMalayalam) && (
              <p className="text-base md:text-lg mt-1">
                {item.contributorCityMalayalam || ""}
                {item.contributorCityMalayalam &&
                  item.contributorDistrictMalayalam &&
                  ", "}
                {item.contributorDistrictMalayalam || ""}
              </p>
            )}

            {/* EMAIL */}

            {item.contributorEmail && (
              <p
                className="text-base md:text-lg mt-1"
                style={{
                  fontFamily: "Arial, sans-serif",
                }}
              >
                mail/{item.contributorEmail}
              </p>
            )}
          </div>
        </div>

        {/* =====================================================
            LARGE TITLE
        ===================================================== */}

        <div className="mt-12 md:mt-14">
          <h1
            className="
              text-4xl
              md:text-5xl
              font-bold
              text-gray-950
              leading-tight
              tracking-tight
            "
            style={{
              fontFamily: "'Manjari', sans-serif",
            }}
          >
            {item.title}
          </h1>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div
          className="
            mt-10
            md:mt-12
            text-gray-900
          "
          style={{
            fontFamily: "'Manjari', sans-serif",
          }}
        >
          <div
            className="
              whitespace-pre-wrap
              text-[21px]
              md:text-[23px]
              leading-[2]
            "
          >
            {item.content}
          </div>
        </div>
      </div>

      {/* =====================================================
          PRINT STYLES
      ===================================================== */}

      <style>{`

        @page {
          size: A4;
          margin: 0;
        }


        @media print {

          body {
            background: white !important;
          }


          .print\\:hidden {
            display: none !important;
          }


          .book-page {
            width: 210mm !important;
            min-height: 297mm !important;
            max-width: none !important;

            margin: 0 !important;

            padding:
              20mm
              18mm
              20mm
              18mm !important;

            box-shadow: none !important;

            background: white !important;
          }

        }

      `}</style>
    </div>
  );
}
