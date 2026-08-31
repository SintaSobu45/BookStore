import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Leaf,
  Eye,
  Loader2,
  X,
  Download,
  ImageDown,
  FileDown,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { getAllStoryPoetry } from "../../services/storyPoetryService";
import { useNavigate } from "react-router-dom";

export default function AdminStoryPoetry() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // =========================================================
  // PDF / DATE FILTERS
  // =========================================================

  const [selectedMonth, setSelectedMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingSinglePdf, setGeneratingSinglePdf] = useState(null);

  // =========================================================
  // LOAD ALL SUBMISSIONS
  // =========================================================

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllStoryPoetry();

      console.log("story response:", data);

      setSubmissions(data);
    } catch (error) {
      console.error("Failed to load submissions:", error);

      setError(error.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // =========================================================
  // GET DATE ONLY
  // =========================================================
  // Converts:
  // 2026-08-20T10:30:00
  // into:
  // 2026-08-20
  //
  // This avoids timezone problems when filtering dates.
  // =========================================================

  const getDateOnly = (date) => {
    if (!date) return "";

    return String(date).slice(0, 10);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // TYPE ICON
  // =========================================================

  const renderTypeIcon = (type) => {
    if (type === "Poetry") {
      return <Leaf className="h-4 w-4 text-emerald-800" />;
    }

    return <BookOpen className="h-4 w-4 text-emerald-800" />;
  };

  // =========================================================
  // TYPE COLOR
  // =========================================================

  const getTypeStyle = (type) => {
    if (type === "Poetry") {
      return "bg-emerald-100 text-emerald-800";
    }

    if (type === "Special") {
      return "bg-purple-100 text-purple-800";
    }

    return "bg-blue-100 text-blue-800";
  };

  // =========================================================
  // PAYMENT STATUS COLOR
  // =========================================================

  const getPaymentStyle = (status) => {
    if (status === "Paid") {
      return "bg-emerald-100 text-emerald-800";
    }

    return "bg-amber-100 text-amber-800";
  };

  // =========================================================
  // DATE FILTER LOGIC
  // =========================================================

  const matchesDateFilter = (item) => {
    const itemDate = getDateOnly(item.createdDate);

    if (!itemDate) {
      return false;
    }

    // ---------------------------------------------------------
    // MONTH FILTER
    // ---------------------------------------------------------

    const matchesMonth =
      !selectedMonth || itemDate.startsWith(selectedMonth);

    // ---------------------------------------------------------
    // FROM DATE
    // ---------------------------------------------------------

    const matchesFromDate =
      !fromDate || itemDate >= fromDate;

    // ---------------------------------------------------------
    // TO DATE
    // ---------------------------------------------------------

    const matchesToDate =
      !toDate || itemDate <= toDate;

    return matchesMonth && matchesFromDate && matchesToDate;
  };

  // =========================================================
  // FILTER SUBMISSIONS
  // =========================================================

  const filteredSubmissions = submissions.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    // Only show PAID submissions
    const isPaid = item.paymentStatus === "Paid";

    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------

    const matchesSearch =
      !search ||
      item.title?.toLowerCase().includes(search) ||
      item.contributorNameMalayalam?.toLowerCase().includes(search);

    // ---------------------------------------------------------
    // DATE FILTER
    // ---------------------------------------------------------

    const matchesDate = matchesDateFilter(item);

    return isPaid && matchesSearch && matchesDate;
  });

  // =========================================================
  // DOWNLOAD PROFILE PICTURE
  // =========================================================

  const handleDownloadProfilePicture = async (item) => {
    if (!item.contributorProfileImageUrl) {
      alert("Profile picture is not available.");
      return;
    }

    try {
      const response = await fetch(item.contributorProfileImageUrl, {
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error("Failed to download profile picture.");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;

      const safeName =
        item.contributorNameMalayalam
          ?.replace(/[^\w\u0D00-\u0D7F-]+/g, "_")
          .replace(/^_+|_+$/g, "") || "contributor";

      link.download = `${safeName}-profile-picture`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Profile picture download failed:", error);

      // Fallback
      try {
        const link = document.createElement("a");

        link.href = item.contributorProfileImageUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error(
          "Profile picture fallback failed:",
          fallbackError,
        );

        alert(
          "Unable to download the profile picture. Please check the image URL/CORS settings.",
        );
      }
    }
  };

  // =========================================================
  // GENERATE PDF
  // =========================================================

  const generatePDF = async (items, fileName) => {
    if (!items || items.length === 0) {
      alert("No submissions found.");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");

    const PAGE_WIDTH = 210;
    const PAGE_HEIGHT = 297;

    const MARGIN_TOP = 20;
    const MARGIN_BOTTOM = 20;
    const MARGIN_LEFT = 18;
    const MARGIN_RIGHT = 18;

    // =========================================================
    // TEMPORARY CONTAINER
    // =========================================================

    const printContainer = document.createElement("div");

    printContainer.style.position = "absolute";
    printContainer.style.left = "-10000px";
    printContainer.style.top = "0";
    printContainer.style.width = "210mm";
    printContainer.style.background = "#ffffff";
    printContainer.style.zIndex = "-9999";

    document.body.appendChild(printContainer);

    // =========================================================
    // WAIT FOR IMAGES
    // =========================================================

    const waitForImages = async (container) => {
      const images = [...container.querySelectorAll("img")];

      await Promise.all(
        images.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve();
                return;
              }

              img.onload = resolve;
              img.onerror = resolve;
            }),
        ),
      );
    };

    // =========================================================
    // CREATE STORY DOCUMENT
    // =========================================================

    const createStoryDocument = () => {
      const page = document.createElement("div");

      page.style.width = "210mm";
      page.style.boxSizing = "border-box";
      page.style.background = "#ffffff";

      page.style.padding = `
        ${MARGIN_TOP}mm
        ${MARGIN_RIGHT}mm
        ${MARGIN_BOTTOM}mm
        ${MARGIN_LEFT}mm
      `;

      page.style.fontFamily = "'Manjari', sans-serif";
      page.style.color = "#111827";

      page.style.height = "auto";
      page.style.minHeight = "0";
      page.style.overflow = "visible";

      return page;
    };

    // =========================================================
    // CONTRIBUTOR HEADER
    // =========================================================

    const createContributorHeader = (item) => {
      const wrapper = document.createElement("div");

      wrapper.style.display = "flex";
      wrapper.style.alignItems = "flex-start";
      wrapper.style.gap = "10mm";
      wrapper.style.width = "100%";

      // -------------------------------------------------------
      // PROFILE IMAGE
      // -------------------------------------------------------

      if (item.contributorProfileImageUrl) {
        const img = document.createElement("img");

        img.src = item.contributorProfileImageUrl;
        img.crossOrigin = "anonymous";

        img.style.width = "40mm";
        img.style.height = "48mm";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8mm";
        img.style.display = "block";
        img.style.flexShrink = "0";

        wrapper.appendChild(img);
      } else {
        const placeholder = document.createElement("div");

        placeholder.style.width = "40mm";
        placeholder.style.height = "48mm";
        placeholder.style.background = "#f5f5f4";
        placeholder.style.borderRadius = "8mm";
        placeholder.style.display = "flex";
        placeholder.style.alignItems = "center";
        placeholder.style.justifyContent = "center";
        placeholder.style.fontSize = "14mm";
        placeholder.style.color = "#a8a29e";
        placeholder.style.flexShrink = "0";

        placeholder.textContent = "👤";

        wrapper.appendChild(placeholder);
      }

      // -------------------------------------------------------
      // DETAILS
      // -------------------------------------------------------

      const details = document.createElement("div");

      details.style.flex = "1";
      details.style.paddingTop = "3mm";
      details.style.lineHeight = "1.6";
      details.style.fontFamily = "'Manjari', sans-serif";

      // NAME

      const name = document.createElement("div");

      name.style.fontSize = "18px";
      name.style.fontWeight = "700";

      name.textContent = item.contributorNameMalayalam || "";

      details.appendChild(name);

      // LOCATION

      const location = document.createElement("div");

      location.style.fontSize = "15px";
      location.style.marginTop = "3px";

      location.textContent = `${item.contributorCityMalayalam || ""}${
        item.contributorCityMalayalam &&
        item.contributorDistrictMalayalam
          ? ", "
          : ""
      }${item.contributorDistrictMalayalam || ""}`;

      details.appendChild(location);

      // EMAIL

      if (item.contributorEmail) {
        const email = document.createElement("div");

        email.style.fontFamily = "Arial, sans-serif";
        email.style.fontSize = "14px";
        email.style.marginTop = "4px";

        email.textContent = `mail/${item.contributorEmail}`;

        details.appendChild(email);
      }

      wrapper.appendChild(details);

      return wrapper;
    };

    // =========================================================
    // TITLE
    // =========================================================

    const createTitle = (item) => {
      const container = document.createElement("div");

      container.style.marginTop = "18mm";
      container.style.width = "100%";

      const title = document.createElement("h1");

      title.style.margin = "0";
      title.style.fontFamily = "'Manjari', sans-serif";
      title.style.fontSize = "32px";
      title.style.lineHeight = "1.3";
      title.style.fontWeight = "700";
      title.style.color = "#111827";

      title.textContent = item.title || "";

      container.appendChild(title);

      return container;
    };

    // =========================================================
    // CONTENT
    // =========================================================

    const createContent = (item) => {
      const content = document.createElement("div");

      content.style.marginTop = "14mm";
      content.style.width = "100%";

      content.style.fontFamily = "'Manjari', sans-serif";
      content.style.fontSize = "17px";
      content.style.lineHeight = "2";
      content.style.color = "#111827";

      const lines = (item.content || "").split(/\r?\n/);

      lines.forEach((line) => {
        const element = document.createElement("div");

        element.style.whiteSpace = "pre-wrap";

        if (line === "") {
          element.style.height = "34px";
        } else {
          element.style.minHeight = "34px";
        }

        element.textContent = line || "\u00A0";

        content.appendChild(element);
      });

      return content;
    };

    // =========================================================
    // CAPTURE ONE COMPLETE STORY
    // =========================================================

    const captureStory = async (item) => {
      printContainer.innerHTML = "";

      const storyDocument = createStoryDocument();

      storyDocument.appendChild(createContributorHeader(item));

      storyDocument.appendChild(createTitle(item));

      storyDocument.appendChild(createContent(item));

      printContainer.appendChild(storyDocument);

      // -------------------------------------------------------
      // WAIT FOR IMAGES
      // -------------------------------------------------------

      await waitForImages(storyDocument);

      // -------------------------------------------------------
      // WAIT FOR FONTS
      // -------------------------------------------------------

      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // -------------------------------------------------------
      // GIVE BROWSER TIME TO PAINT MALAYALAM FONT
      // -------------------------------------------------------

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      // -------------------------------------------------------
      // CAPTURE COMPLETE STORY
      // -------------------------------------------------------

      const canvas = await html2canvas(storyDocument, {
        scale: 1.5,

        useCORS: true,
        allowTaint: false,

        backgroundColor: "#ffffff",

        logging: false,
      });

      return canvas;
    };

    // =========================================================
    // ADD CANVAS TO PDF IN A4 SLICES
    // =========================================================

    const addCanvasToPDF = (canvas, isFirstPDFPage) => {
      // Keep a small safety margin so Malayalam glyphs are
      // never cut exactly at the page boundary.
      const SAFETY_MARGIN_MM = 5;

      const sliceHeight = Math.round(
        canvas.width *
          ((PAGE_HEIGHT - SAFETY_MARGIN_MM) / PAGE_WIDTH),
      );

      let sourceY = 0;
      let firstSlice = true;

      while (sourceY < canvas.height) {
        const remainingHeight = canvas.height - sourceY;

        const currentSliceHeight = Math.min(
          sliceHeight,
          remainingHeight,
        );

        const sliceCanvas = document.createElement("canvas");

        sliceCanvas.width = canvas.width;
        sliceCanvas.height = currentSliceHeight;

        const ctx = sliceCanvas.getContext("2d");

        ctx.drawImage(
          canvas,

          // SOURCE
          0,
          sourceY,
          canvas.width,
          currentSliceHeight,

          // DESTINATION
          0,
          0,
          canvas.width,
          currentSliceHeight,
        );

        const imgData = sliceCanvas.toDataURL(
          "image/jpeg",
          0.95,
        );

        if (!isFirstPDFPage || !firstSlice) {
          pdf.addPage();
        }

        const imageHeight =
          (currentSliceHeight / canvas.width) * PAGE_WIDTH;

        pdf.addImage(
          imgData,
          "JPEG",
          0,
          0,
          PAGE_WIDTH,
          imageHeight,
        );

        sourceY += currentSliceHeight;

        firstSlice = false;

        // Free memory
        sliceCanvas.width = 1;
        sliceCanvas.height = 1;
      }
    };

    // =========================================================
    // PROCESS ALL SUBMISSIONS
    // =========================================================

    let isFirstPDFPage = true;

    try {
      for (
        let submissionIndex = 0;
        submissionIndex < items.length;
        submissionIndex++
      ) {
        const item = items[submissionIndex];

        console.log(
          `Generating PDF: ${submissionIndex + 1}/${items.length}`,
          item.title,
        );

        // -----------------------------------------------------
        // CAPTURE COMPLETE STORY
        // -----------------------------------------------------

        const canvas = await captureStory(item);

        // -----------------------------------------------------
        // SLICE COMPLETE STORY INTO A4 PAGES
        // -----------------------------------------------------

        addCanvasToPDF(canvas, isFirstPDFPage);

        isFirstPDFPage = false;

        // -----------------------------------------------------
        // FREE LARGE CANVAS
        // -----------------------------------------------------

        canvas.width = 1;
        canvas.height = 1;

        printContainer.innerHTML = "";

        await new Promise((resolve) =>
          setTimeout(resolve, 20),
        );
      }

      // =======================================================
      // SAVE PDF
      // =======================================================

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation failed:", error);

      throw error;
    } finally {
      // =======================================================
      // CLEANUP
      // =======================================================

      if (document.body.contains(printContainer)) {
        document.body.removeChild(printContainer);
      }
    }
  };

  // =========================================================
  // GET PDF FILTERED SUBMISSIONS
  // =========================================================

  const getPDFSubmissions = () => {
    return submissions.filter((item) => {
      if (item.paymentStatus !== "Paid") {
        return false;
      }

      return matchesDateFilter(item);
    });
  };

  // =========================================================
  // GET PDF FILE NAME
  // =========================================================

  const getPDFFilename = () => {
    // ---------------------------------------------------------
    // MONTH
    // ---------------------------------------------------------

    if (selectedMonth && !fromDate && !toDate) {
      const [year, month] = selectedMonth.split("-");

      const monthName = new Date(
        Number(year),
        Number(month) - 1,
      ).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });

      return `Story-Poetry-${monthName.replace(" ", "-")}.pdf`;
    }

    // ---------------------------------------------------------
    // FROM + TO
    // ---------------------------------------------------------

    if (fromDate && toDate) {
      return `Story-Poetry-${fromDate}-to-${toDate}.pdf`;
    }

    // ---------------------------------------------------------
    // ONLY FROM
    // ---------------------------------------------------------

    if (fromDate) {
      return `Story-Poetry-from-${fromDate}.pdf`;
    }

    // ---------------------------------------------------------
    // ONLY TO
    // ---------------------------------------------------------

    if (toDate) {
      return `Story-Poetry-until-${toDate}.pdf`;
    }

    // ---------------------------------------------------------
    // FALLBACK
    // ---------------------------------------------------------

    return "Story-Poetry-Submissions.pdf";
  };

  // =========================================================
  // MONTHLY / DATE RANGE PDF
  // =========================================================

  const handleDownloadMonthlyPDF = async () => {
    // ---------------------------------------------------------
    // VALIDATE DATE RANGE
    // ---------------------------------------------------------

    if (fromDate && toDate && fromDate > toDate) {
      alert("From date cannot be after To date.");
      return;
    }

    // ---------------------------------------------------------
    // CHECK WHETHER ANY FILTER IS SELECTED
    // ---------------------------------------------------------

    if (!selectedMonth && !fromDate && !toDate) {
      alert(
        "Please select a month or choose a From / To date range.",
      );

      return;
    }

    // ---------------------------------------------------------
    // GET FILTERED SUBMISSIONS
    // ---------------------------------------------------------

    const pdfSubmissions = getPDFSubmissions();

    if (pdfSubmissions.length === 0) {
      alert("No paid submissions found for the selected period.");
      return;
    }

    try {
      setGeneratingPdf(true);

      const fileName = getPDFFilename();

      await generatePDF(pdfSubmissions, fileName);
    } catch (error) {
      console.error(
        "Monthly/date range PDF generation failed:",
        error,
      );

      alert(
        "Failed to generate PDF. Please try again.",
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  // =========================================================
  // SINGLE USER PDF
  // =========================================================

  const handleDownloadSinglePDF = async (item) => {
    if (!item) return;

    try {
      setGeneratingSinglePdf(item.storyPoetryId);

      const safeTitle =
        item.title
          ?.replace(/[^\w\u0D00-\u0D7F-]+/g, "_")
          .replace(/^_+|_+$/g, "") || "story";

      const safeName =
        item.contributorNameMalayalam
          ?.replace(/[^\w\u0D00-\u0D7F-]+/g, "_")
          .replace(/^_+|_+$/g, "") || "contributor";

      const fileName = `${safeName}-${safeTitle}.pdf`;

      await generatePDF([item], fileName);
    } catch (error) {
      console.error("Single PDF generation failed:", error);

      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingSinglePdf(null);
    }
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMonth("");
    setFromDate("");
    setToDate("");
  };

  // =========================================================
  // OPEN STORY
  // =========================================================

  const handleOpenStory = (item) => {
    navigate(`/admin/story/${item.storyPoetryId}`);
  };

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="p-6 mt-5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Story, Poetry & Special Submissions
        </h1>

        <p className="text-sm text-stone-500 mt-1">
          View all Story, Poetry and Special submissions from
          contributors.
        </p>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (
        <div className="bg-white border border-stone-200 rounded-2xl py-20 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-900" />

          <span className="ml-2 text-sm text-stone-500">
            Loading submissions...
          </span>
        </div>
      ) : submissions.length === 0 ? (
        /* =====================================================
           EMPTY
        ===================================================== */

        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-stone-300 mb-3" />

          <h3 className="font-bold text-gray-900">
            No submissions found
          </h3>

          <p className="text-sm text-stone-500 mt-1">
            There are currently no Story, Poetry or Special
            submissions.
          </p>
        </div>
      ) : (
        /* =====================================================
           TABLE
        ===================================================== */

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          {/* =================================================
              SEARCH & FILTER HEADER
          ================================================= */}

          <div className="px-5 py-4 border-b border-stone-200">
            <div className="flex flex-col gap-4">
              {/* =================================================
                  TOP ROW
              ================================================= */}

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* LEFT SIDE */}

                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    All Submissions
                  </h2>

                  <p className="text-xs text-stone-500 mt-0.5">
                    {filteredSubmissions.length} submission
                    {filteredSubmissions.length !== 1
                      ? "s"
                      : ""}{" "}
                    found
                  </p>
                </div>

                {/* SEARCH */}

                <div className="relative w-full lg:w-80">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(e.target.value)
                    }
                    placeholder="Search title or contributor..."
                    className="
                      w-full
                      pl-4
                      pr-10
                      py-2.5
                      rounded-xl
                      border
                      border-stone-200
                      bg-stone-50
                      text-sm
                      text-gray-900
                      placeholder:text-stone-400
                      outline-none
                      transition
                      focus:bg-white
                      focus:border-emerald-900
                      focus:ring-2
                      focus:ring-emerald-900/10
                    "
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-stone-400
                        hover:text-stone-700
                        cursor-pointer
                      "
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* =================================================
                  DATE FILTERS
              ================================================= */}

              <div className="flex flex-col xl:flex-row gap-3">
                {/* =================================================
                    MONTH
                ================================================= */}

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                    Month
                  </label>

                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) =>
                      setSelectedMonth(e.target.value)
                    }
                    className="
                      w-full
                      xl:w-44
                      px-4
                      py-2.5
                      rounded-xl
                      border
                      border-stone-200
                      bg-stone-50
                      text-sm
                      text-gray-700
                      outline-none
                      focus:bg-white
                      focus:border-emerald-900
                      focus:ring-2
                      focus:ring-emerald-900/10
                    "
                  />
                </div>

                {/* =================================================
                    FROM DATE
                ================================================= */}

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) =>
                      setFromDate(e.target.value)
                    }
                    className="
                      w-full
                      xl:w-44
                      px-4
                      py-2.5
                      rounded-xl
                      border
                      border-stone-200
                      bg-stone-50
                      text-sm
                      text-gray-700
                      outline-none
                      focus:bg-white
                      focus:border-emerald-900
                      focus:ring-2
                      focus:ring-emerald-900/10
                    "
                  />
                </div>

                {/* =================================================
                    TO DATE
                ================================================= */}

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(e) =>
                      setToDate(e.target.value)
                    }
                    className="
                      w-full
                      xl:w-44
                      px-4
                      py-2.5
                      rounded-xl
                      border
                      border-stone-200
                      bg-stone-50
                      text-sm
                      text-gray-700
                      outline-none
                      focus:bg-white
                      focus:border-emerald-900
                      focus:ring-2
                      focus:ring-emerald-900/10
                    "
                  />
                </div>

                {/* =================================================
                    CLEAR FILTERS
                ================================================= */}

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      w-full
                      xl:w-auto
                      px-4
                      py-2.5
                      rounded-xl
                      border
                      border-stone-200
                      bg-white
                      hover:bg-stone-100
                      text-stone-700
                      text-sm
                      font-bold
                      cursor-pointer
                      transition-colors
                    "
                  >
                    Clear
                  </button>
                </div>

                {/* =================================================
                    PDF BUTTON
                ================================================= */}

                <div className="flex items-end xl:ml-auto">
                  <button
                    type="button"
                    disabled={
                      (!selectedMonth &&
                        !fromDate &&
                        !toDate) ||
                      generatingPdf
                    }
                    onClick={handleDownloadMonthlyPDF}
                    className="
                      w-full
                      xl:w-auto
                      flex
                      items-center
                      justify-center
                      gap-2
                      px-5
                      py-2.5
                      rounded-xl
                      bg-[#1b3b2b]
                      hover:bg-emerald-950
                      disabled:bg-stone-300
                      disabled:cursor-not-allowed
                      text-white
                      text-sm
                      font-bold
                      whitespace-nowrap
                      cursor-pointer
                      transition-colors
                    "
                  >
                    {generatingPdf ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />

                        Download PDF
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* =================================================
                  FILTER INFO
              ================================================= */}

              {(selectedMonth || fromDate || toDate) && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-stone-500">
                    Active filter:
                  </span>

                  {selectedMonth && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Month: {selectedMonth}
                    </span>
                  )}

                  {fromDate && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold">
                      From: {formatDate(fromDate)}
                    </span>
                  )}

                  {toDate && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold">
                      To: {formatDate(toDate)}
                    </span>
                  )}

                  <span className="text-stone-400">
                    Only paid submissions are included in PDF.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              NO SEARCH RESULTS
          ================================================= */}

          {filteredSubmissions.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-stone-300 mb-3" />

              <h3 className="font-bold text-gray-900">
                No submissions found
              </h3>

              <p className="text-sm text-stone-500 mt-1">
                No submissions match the selected filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="
                  mt-4
                  px-4
                  py-2
                  rounded-lg
                  bg-[#1b3b2b]
                  hover:bg-emerald-950
                  text-white
                  text-xs
                  font-bold
                  cursor-pointer
                  transition-colors
                "
              >
                Clear Filters
              </button>
            </div>
          ) : (
            /* =================================================
               TABLE
            ================================================= */

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {/* =================================================
                    TABLE HEADER
                ================================================= */}

                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-5 py-4 font-bold text-gray-700">
                      Submission
                    </th>

                    <th className="text-left px-5 py-4 font-bold text-gray-700">
                      Contributor
                    </th>

                    <th className="text-left px-5 py-4 font-bold text-gray-700">
                      Type
                    </th>

                    <th className="text-left px-5 py-4 font-bold text-gray-700">
                      Payment
                    </th>

                    <th className="text-left px-5 py-4 font-bold text-gray-700">
                      Submitted
                    </th>

                    <th className="text-right px-5 py-4 font-bold text-gray-700">
                      Downloads
                    </th>
                  </tr>
                </thead>

                {/* =================================================
                    TABLE BODY
                ================================================= */}

                <tbody className="divide-y divide-stone-100">
                  {filteredSubmissions.map((item) => (
                    <tr
                      key={item.storyPoetryId}
                      onClick={() =>
                        handleOpenStory(item)
                      }
                      className="
                        group
                        hover:bg-emerald-50/60
                        transition-colors
                        cursor-pointer
                      "
                    >
                      {/* =================================================
                          SUBMISSION
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                            {renderTypeIcon(item.type)}
                          </div>

                          <div>
                            <p className="font-bold text-gray-900">
                              {item.title}
                            </p>

                            <p className="text-[11px] text-stone-500 mt-0.5">
                              ID #{item.storyPoetryId}
                            </p>

                            <p className="text-[10px] text-emerald-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Click row to open
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* =================================================
                          CONTRIBUTOR
                      ================================================= */}

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {item.contributorNameMalayalam || "-"}
                        </p>
                      </td>

                      {/* =================================================
                          TYPE
                      ================================================= */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${getTypeStyle(
                            item.type,
                          )}`}
                        >
                          {item.type || "-"}
                        </span>
                      </td>

                      {/* =================================================
                          PAYMENT
                      ================================================= */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${getPaymentStyle(
                            item.paymentStatus,
                          )}`}
                        >
                          {item.paymentStatus || "Pending"}
                        </span>
                      </td>

                      {/* =================================================
                          DATE
                      ================================================= */}

                      <td className="px-5 py-4 text-stone-600 text-xs font-medium">
                        {formatDate(item.createdDate)}
                      </td>

                      {/* =================================================
                          DOWNLOAD ACTIONS
                      ================================================= */}

                      <td className="px-5 py-4">
                        <div
                          className="flex justify-end items-center gap-2"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          {/* =================================================
                              PROFILE PICTURE DOWNLOAD
                          ================================================= */}

                          <button
                            type="button"
                            disabled={
                              !item.contributorProfileImageUrl
                            }
                            onClick={(e) => {
                              e.stopPropagation();

                              handleDownloadProfilePicture(
                                item,
                              );
                            }}
                            title={
                              item.contributorProfileImageUrl
                                ? "Download profile picture"
                                : "No profile picture"
                            }
                            className="
                              flex
                              items-center
                              justify-center
                              gap-2
                              px-3
                              py-2
                              rounded-lg
                              border
                              border-stone-200
                              bg-white
                              hover:bg-stone-100
                              disabled:bg-stone-100
                              disabled:text-stone-300
                              disabled:cursor-not-allowed
                              text-stone-700
                              text-xs
                              font-bold
                              cursor-pointer
                              transition-colors
                            "
                          >
                            <ImageDown className="h-4 w-4" />

                            <span className="hidden xl:inline">
                              Photo
                            </span>
                          </button>

                          {/* =================================================
                              SINGLE PDF DOWNLOAD
                          ================================================= */}

                          <button
                            type="button"
                            disabled={
                              generatingSinglePdf ===
                              item.storyPoetryId
                            }
                            onClick={(e) => {
                              e.stopPropagation();

                              handleDownloadSinglePDF(
                                item,
                              );
                            }}
                            title="Download this submission as PDF"
                            className="
                              flex
                              items-center
                              justify-center
                              gap-2
                              px-3
                              py-2
                              rounded-lg
                              bg-[#1b3b2b]
                              hover:bg-emerald-950
                              disabled:bg-stone-300
                              disabled:cursor-not-allowed
                              text-white
                              text-xs
                              font-bold
                              cursor-pointer
                              transition-colors
                            "
                          >
                            {generatingSinglePdf ===
                            item.storyPoetryId ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />

                                <span className="hidden xl:inline">
                                  Generating
                                </span>
                              </>
                            ) : (
                              <>
                                <FileDown className="h-4 w-4" />

                                <span className="hidden xl:inline">
                                  PDF
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}