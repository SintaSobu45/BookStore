import React, { useEffect, useMemo, useState } from "react";

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

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  PageBreak,
  AlignmentType,
} from "docx";

import { getAllStoryPoetry } from "../../services/storyPoetryService";
import { useNavigate } from "react-router-dom";

export default function AdminStoryPoetry() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Type filter
  const [selectedType, setSelectedType] = useState("All");

  // Date filters
  const [selectedMonth, setSelectedMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // DOCX states
  const [generatingDocx, setGeneratingDocx] = useState(false);
  const [generatingSingleDocx, setGeneratingSingleDocx] =
    useState(null);

  // =========================================================
  // LOAD SUBMISSIONS
  // =========================================================

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllStoryPoetry();

      console.log("story response:", data);

      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load submissions:", err);

      setError(
        err?.message ||
          "Failed to load Story, Poetry and Special submissions.",
      );
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

  const getDateOnly = (date) => {
    if (!date) return "";

    return String(date).slice(0, 10);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const dateOnly = getDateOnly(date);

    if (!dateOnly) return "-";

    const [year, month, day] = dateOnly.split("-");

    const parsedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    );

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
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
      return (
        <Leaf className="h-4 w-4 text-emerald-800" />
      );
    }

    return (
      <BookOpen className="h-4 w-4 text-emerald-800" />
    );
  };

  // =========================================================
  // TYPE STYLE
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
  // PAYMENT STYLE
  // =========================================================

  const getPaymentStyle = (status) => {
    if (status === "Paid") {
      return "bg-emerald-100 text-emerald-800";
    }

    return "bg-amber-100 text-amber-800";
  };

  // =========================================================
  // DATE FILTER
  // =========================================================

  const matchesDateFilter = (item) => {
    const itemDate = getDateOnly(item?.createdDate);

    if (!itemDate) {
      return false;
    }

    // Month
    const matchesMonth =
      !selectedMonth ||
      itemDate.startsWith(selectedMonth);

    // From
    const matchesFromDate =
      !fromDate ||
      itemDate >= fromDate;

    // To
    const matchesToDate =
      !toDate ||
      itemDate <= toDate;

    return (
      matchesMonth &&
      matchesFromDate &&
      matchesToDate
    );
  };

  // =========================================================
  // TYPE FILTER
  // =========================================================

  const matchesTypeFilter = (item) => {
    if (selectedType === "All") {
      return true;
    }

    return item?.type === selectedType;
  };

  // =========================================================
  // FILTERED SUBMISSIONS
  // =========================================================

  const filteredSubmissions = useMemo(() => {
    const search = searchTerm
      .toLowerCase()
      .trim();

    return submissions.filter((item) => {
      // Only paid submissions
      const isPaid =
        item?.paymentStatus === "Paid";

      if (!isPaid) {
        return false;
      }

      // Search
      const matchesSearch =
        !search ||
        item?.title
          ?.toLowerCase()
          .includes(search) ||
        item?.contributorNameMalayalam
          ?.toLowerCase()
          .includes(search);

      // Type
      const matchesType =
        matchesTypeFilter(item);

      // Date
      const matchesDate =
        matchesDateFilter(item);

      return (
        matchesSearch &&
        matchesType &&
        matchesDate
      );
    });
  }, [
    submissions,
    searchTerm,
    selectedType,
    selectedMonth,
    fromDate,
    toDate,
  ]);

  // =========================================================
  // PDF/DOCX SUBMISSIONS
  // =========================================================

  const getDOCXSubmissions = () => {
    return submissions.filter((item) => {
      // Only paid
      if (item?.paymentStatus !== "Paid") {
        return false;
      }

      // Type
      if (!matchesTypeFilter(item)) {
        return false;
      }

      // Date
      if (!matchesDateFilter(item)) {
        return false;
      }

      return true;
    });
  };

  // =========================================================
  // SAFE FILE NAME
  // =========================================================

  const makeSafeFileName = (value, fallback) => {
    const safe =
      String(value || "")
        .replace(/[^\w\u0D00-\u0D7F-]+/g, "_")
        .replace(/^_+|_+$/g, "");

    return safe || fallback;
  };

  // =========================================================
  // GET DOCX FILENAME
  // =========================================================

  const getDOCXFilename = () => {
    // -------------------------------------------------------
    // TYPE PREFIX
    // -------------------------------------------------------

    let typePrefix = "Story-Poetry";

    if (selectedType !== "All") {
      typePrefix = selectedType;
    }

    // -------------------------------------------------------
    // MONTH
    // -------------------------------------------------------

    if (
      selectedMonth &&
      !fromDate &&
      !toDate
    ) {
      const [year, month] =
        selectedMonth.split("-");

      const monthName = new Date(
        Number(year),
        Number(month) - 1,
      ).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });

      return `${typePrefix}-${monthName.replace(
        " ",
        "-",
      )}.docx`;
    }

    // -------------------------------------------------------
    // FROM + TO
    // -------------------------------------------------------

    if (fromDate && toDate) {
      return `${typePrefix}-${fromDate}-to-${toDate}.docx`;
    }

    // -------------------------------------------------------
    // FROM
    // -------------------------------------------------------

    if (fromDate) {
      return `${typePrefix}-from-${fromDate}.docx`;
    }

    // -------------------------------------------------------
    // TO
    // -------------------------------------------------------

    if (toDate) {
      return `${typePrefix}-until-${toDate}.docx`;
    }

    // -------------------------------------------------------
    // TYPE ONLY
    // -------------------------------------------------------

    if (selectedType !== "All") {
      return `${selectedType}-Submissions.docx`;
    }

    // -------------------------------------------------------
    // FALLBACK
    // -------------------------------------------------------

    return "Story-Poetry-Submissions.docx";
  };

  // =========================================================
  // FETCH IMAGE AS ARRAY BUFFER
  // =========================================================

  const fetchImageAsArrayBuffer = async (url) => {
    if (!url) {
      return null;
    }

    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error(
          `Image request failed: ${response.status}`,
        );
      }

      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error(
          "Image response is empty.",
        );
      }

      const arrayBuffer =
        await blob.arrayBuffer();

      return {
        data: arrayBuffer,
        type: blob.type,
      };
    } catch (err) {
      console.warn(
        "Profile image could not be added to DOCX:",
        err,
      );

      return null;
    }
  };

  // =========================================================
  // DETERMINE IMAGE TYPE
  // =========================================================

  const getDocxImageType = (mimeType, url) => {
    const type =
      String(mimeType || "").toLowerCase();

    if (type.includes("png")) {
      return "png";
    }

    if (type.includes("gif")) {
      return "gif";
    }

    if (
      type.includes("jpg") ||
      type.includes("jpeg")
    ) {
      return "jpg";
    }

    const lowerUrl =
      String(url || "").toLowerCase();

    if (lowerUrl.includes(".png")) {
      return "png";
    }

    if (lowerUrl.includes(".gif")) {
      return "gif";
    }

    return "jpg";
  };

  // =========================================================
  // CREATE CONTRIBUTOR LOCATION
  // =========================================================

  const getContributorLocation = (item) => {
    const city =
      item?.contributorCityMalayalam || "";

    const district =
      item?.contributorDistrictMalayalam ||
      "";

    if (city && district) {
      return `${city}, ${district}`;
    }

    return city || district;
  };

  // =========================================================
  // CREATE DOCX
  // =========================================================

  const generateDOCX = async (
    items,
    fileName,
  ) => {
    if (!items || items.length === 0) {
      alert("No submissions found.");
      return;
    }

    console.log(
      `Starting DOCX generation for ${items.length} submissions...`,
    );

    try {
      const children = [];

      // =====================================================
      // LOOP SUBMISSIONS
      // =====================================================

      for (
        let index = 0;
        index < items.length;
        index++
      ) {
        const item = items[index];

        console.log(
          `Preparing ${index + 1}/${items.length}:`,
          item?.title,
        );

        // ===================================================
        // PROFILE IMAGE
        // ===================================================

        let profileImage = null;

        if (
          item?.contributorProfileImageUrl
        ) {
          profileImage =
            await fetchImageAsArrayBuffer(
              item.contributorProfileImageUrl,
            );
        }

        // ===================================================
        // PROFILE IMAGE
        // ===================================================

        if (profileImage) {
          const imageType =
            getDocxImageType(
              profileImage.type,
              item.contributorProfileImageUrl,
            );

          children.push(
            new Paragraph({
              alignment:
                AlignmentType.LEFT,
              spacing: {
                after: 150,
              },
              children: [
                new ImageRun({
                  data: profileImage.data,

                  transformation: {
                    width: 150,
                    height: 180,
                  },

                  type: imageType,
                }),
              ],
            }),
          );
        }

        // ===================================================
        // CONTRIBUTOR NAME
        // ===================================================

        children.push(
          new Paragraph({
            spacing: {
              before: 100,
              after: 100,
            },

            children: [
              new TextRun({
                text:
                  item?.contributorNameMalayalam ||
                  "-",

                bold: true,

                size: 34,

                font: {
                  name: "Manjari",
                  eastAsia: "Manjari",
                  complexScript: "Manjari",
                },
              }),
            ],
          }),
        );

        // ===================================================
        // LOCATION
        // ===================================================

        const location =
          getContributorLocation(item);

        if (location) {
          children.push(
            new Paragraph({
              spacing: {
                after: 80,
              },

              children: [
                new TextRun({
                  text: location,

                  size: 26,

                  font: {
                    name: "Manjari",
                    eastAsia: "Manjari",
                    complexScript: "Manjari",
                  },
                }),
              ],
            }),
          );
        }

        // ===================================================
        // EMAIL
        // ===================================================

        if (item?.contributorEmail) {
          children.push(
            new Paragraph({
              spacing: {
                after: 100,
              },

              children: [
                new TextRun({
                  text: `mail/${item.contributorEmail}`,

                  size: 22,

                  font: {
                    name: "Arial",
                    eastAsia: "Arial",
                  },
                }),
              ],
            }),
          );
        }

        // ===================================================
        // TYPE
        // ===================================================

        if (item?.type) {
          children.push(
            new Paragraph({
              spacing: {
                before: 100,
                after: 100,
              },

              children: [
                new TextRun({
                  text: item.type,

                  bold: true,

                  size: 22,

                  font: {
                    name: "Arial",
                    eastAsia: "Arial",
                  },
                }),
              ],
            }),
          );
        }

        // ===================================================
        // TITLE
        // ===================================================

        children.push(
          new Paragraph({
            alignment:
              AlignmentType.LEFT,

            spacing: {
              before: 500,
              after: 300,
            },

            children: [
              new TextRun({
                text:
                  item?.title || "-",

                bold: true,

                size: 42,

                font: {
                  name: "Manjari",
                  eastAsia: "Manjari",
                  complexScript: "Manjari",
                },
              }),
            ],
          }),
        );

        // ===================================================
        // CONTENT
        // ===================================================

        const content = String(
          item?.content || "",
        );

        const lines =
          content.split(/\r?\n/);

        if (lines.length === 0) {
          lines.push("");
        }

        lines.forEach((line) => {
          children.push(
            new Paragraph({
              spacing: {
                after: 120,
                line: 360,
              },

              children: [
                new TextRun({
                  text:
                    line === ""
                      ? " "
                      : line,

                  size: 28,

                  font: {
                    name: "Manjari",
                    eastAsia: "Manjari",
                    complexScript: "Manjari",
                  },
                }),
              ],
            }),
          );
        });

        // ===================================================
        // PAGE BREAK
        // ===================================================

        if (index < items.length - 1) {
          children.push(
            new Paragraph({
              children: [
                new PageBreak(),
              ],
            }),
          );
        }
      }

      // =====================================================
      // DOCUMENT
      // =====================================================

      const doc = new Document({
        creator: "Story Poetry Admin",

        title:
          "Story, Poetry & Special Submissions",

        description:
          "Story, Poetry and Special submissions",

        styles: {
          default: {
            document: {
              run: {
                font: "Manjari",
                size: 28,
              },

              paragraph: {
                spacing: {
                  line: 360,
                },
              },
            },
          },
        },

        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 720,
                  bottom: 720,
                  left: 900,
                  right: 900,
                },
              },
            },

            children,
          },
        ],
      });

      // =====================================================
      // CREATE BLOB
      // =====================================================

      console.log(
        "Converting document to Blob...",
      );

      const blob =
        await Packer.toBlob(doc);

      if (!blob || blob.size === 0) {
        throw new Error(
          "DOCX blob is empty.",
        );
      }

      console.log(
        "DOCX blob created:",
        blob.size,
        "bytes",
      );

      // =====================================================
      // DOWNLOAD
      // =====================================================

      const blobUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = blobUrl;

      link.download =
        fileName.endsWith(".docx")
          ? fileName
          : `${fileName}.docx`;

      link.style.display = "none";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      // =====================================================
      // CLEANUP
      // =====================================================

      setTimeout(() => {
        window.URL.revokeObjectURL(
          blobUrl,
        );
      }, 1500);

      console.log(
        "DOCX downloaded successfully:",
        fileName,
      );
    } catch (err) {
      console.error(
        "DOCX generation failed:",
        err,
      );

      throw err;
    }
  };

  // =========================================================
  // DOWNLOAD MONTHLY / FILTERED DOCX
  // =========================================================

  const handleDownloadMonthlyDOCX =
    async () => {
      // -----------------------------------------------------
      // DATE VALIDATION
      // -----------------------------------------------------

      if (
        fromDate &&
        toDate &&
        fromDate > toDate
      ) {
        alert(
          "From date cannot be after To date.",
        );

        return;
      }

      // -----------------------------------------------------
      // FILTER VALIDATION
      // -----------------------------------------------------

      if (
        !selectedMonth &&
        !fromDate &&
        !toDate &&
        selectedType === "All"
      ) {
        alert(
          "Please select a type, month, or choose a From / To date range.",
        );

        return;
      }

      // -----------------------------------------------------
      // GET SUBMISSIONS
      // -----------------------------------------------------

      const docxSubmissions =
        getDOCXSubmissions();

      if (docxSubmissions.length === 0) {
        alert(
          "No paid submissions found for the selected filters.",
        );

        return;
      }

      try {
        setGeneratingDocx(true);

        const fileName =
          getDOCXFilename();

        await generateDOCX(
          docxSubmissions,
          fileName,
        );
      } catch (err) {
        console.error(
          "Filtered DOCX generation failed:",
          err,
        );

        alert(
          `Failed to generate DOCX.\n\n${
            err?.message ||
            "Unknown error"
          }`,
        );
      } finally {
        setGeneratingDocx(false);
      }
    };

  // =========================================================
  // DOWNLOAD SINGLE DOCX
  // =========================================================

  const handleDownloadSingleDOCX =
    async (item) => {
      if (!item) return;

      try {
        setGeneratingSingleDocx(
          item.storyPoetryId,
        );

        const safeTitle =
          makeSafeFileName(
            item.title,
            "story",
          );

        const safeName =
          makeSafeFileName(
            item.contributorNameMalayalam,
            "contributor",
          );

        const fileName =
          `${safeName}-${safeTitle}.docx`;

        await generateDOCX(
          [item],
          fileName,
        );
      } catch (err) {
        console.error(
          "Single DOCX generation failed:",
          err,
        );

        alert(
          `Failed to generate DOCX.\n\n${
            err?.message ||
            "Unknown error"
          }`,
        );
      } finally {
        setGeneratingSingleDocx(null);
      }
    };

  // =========================================================
  // DOWNLOAD PROFILE PHOTO
  // =========================================================

  const handleDownloadProfilePicture =
    async (item) => {
      if (
        !item?.contributorProfileImageUrl
      ) {
        alert(
          "Profile picture is not available.",
        );

        return;
      }

      try {
        const response =
          await fetch(
            item.contributorProfileImageUrl,
            {
              mode: "cors",
              credentials: "omit",
            },
          );

        if (!response.ok) {
          throw new Error(
            "Failed to download profile picture.",
          );
        }

        const blob =
          await response.blob();

        if (!blob || blob.size === 0) {
          throw new Error(
            "Downloaded image is empty.",
          );
        }

        const blobUrl =
          window.URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        link.href = blobUrl;

        const safeName =
          makeSafeFileName(
            item.contributorNameMalayalam,
            "contributor",
          );

        const extension =
          blob.type.includes("png")
            ? "png"
            : "jpg";

        link.download =
          `${safeName}-profile-picture.${extension}`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        setTimeout(() => {
          window.URL.revokeObjectURL(
            blobUrl,
          );
        }, 1000);
      } catch (err) {
        console.error(
          "Profile picture download failed:",
          err,
        );

        // ---------------------------------------------------
        // FALLBACK
        // ---------------------------------------------------

        try {
          const link =
            document.createElement("a");

          link.href =
            item.contributorProfileImageUrl;

          link.target = "_blank";

          link.rel =
            "noopener noreferrer";

          document.body.appendChild(link);

          link.click();

          document.body.removeChild(link);
        } catch (fallbackError) {
          console.error(
            "Profile picture fallback failed:",
            fallbackError,
          );

          alert(
            "Unable to download the profile picture.",
          );
        }
      }
    };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("All");
    setSelectedMonth("");
    setFromDate("");
    setToDate("");
  };

  // =========================================================
  // OPEN STORY
  // =========================================================

  const handleOpenStory = (item) => {
    navigate(
      `/admin/story/${item.storyPoetryId}`,
    );
  };

  // =========================================================
  // FILTER SUMMARY
  // =========================================================

  const hasFilters =
    searchTerm ||
    selectedType !== "All" ||
    selectedMonth ||
    fromDate ||
    toDate;

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
          View all Story, Poetry and Special
          submissions from contributors.
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
        /* ===================================================
           EMPTY
        =================================================== */

        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-stone-300 mb-3" />

          <h3 className="font-bold text-gray-900">
            No submissions found
          </h3>

          <p className="text-sm text-stone-500 mt-1">
            There are currently no Story,
            Poetry or Special submissions.
          </p>
        </div>
      ) : (
        /* ===================================================
           MAIN
        =================================================== */

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          {/* =================================================
              FILTER HEADER
          ================================================= */}

          <div className="px-5 py-4 border-b border-stone-200">
            <div className="flex flex-col gap-4">
              {/* =============================================
                  TOP ROW
              ============================================= */}

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* LEFT */}

                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    All Submissions
                  </h2>

                  <p className="text-xs text-stone-500 mt-0.5">
                    {
                      filteredSubmissions.length
                    }{" "}
                    submission
                    {filteredSubmissions.length !==
                    1
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
                      setSearchTerm(
                        e.target.value,
                      )
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
                      onClick={() =>
                        setSearchTerm("")
                      }
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
                  TYPE FILTER
              ================================================= */}

              <div>
                <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block mb-2">
                  Submission Type
                </label>

                <div className="flex flex-wrap gap-2">
                  {[
                    "All",
                    "Story",
                    "Poetry",
                    "Special",
                  ].map((type) => {
                    const active =
                      selectedType === type;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setSelectedType(type)
                        }
                        className={`
                          px-4
                          py-2
                          rounded-xl
                          text-sm
                          font-bold
                          border
                          cursor-pointer
                          transition-colors
                          ${
                            active
                              ? "bg-[#1b3b2b] text-white border-[#1b3b2b]"
                              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                          }
                        `}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =================================================
                  DATE FILTERS
              ================================================= */}

              <div className="flex flex-col xl:flex-row gap-3">
                {/* MONTH */}

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                    Month
                  </label>

                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) =>
                      setSelectedMonth(
                        e.target.value,
                      )
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

                {/* FROM */}

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) =>
                      setFromDate(
                        e.target.value,
                      )
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

                {/* TO */}

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    min={
                      fromDate || undefined
                    }
                    onChange={(e) =>
                      setToDate(
                        e.target.value,
                      )
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

                {/* CLEAR */}

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

                {/* DOCX */}

                <div className="flex items-end xl:ml-auto">
                  <button
                    type="button"
                    disabled={
                      (!selectedType ||
                        selectedType ===
                          "All") &&
                      !selectedMonth &&
                      !fromDate &&
                      !toDate
                        ? true
                        : generatingDocx
                    }
                    onClick={
                      handleDownloadMonthlyDOCX
                    }
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
                    {generatingDocx ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />

                        Download DOCX
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* =================================================
                  ACTIVE FILTERS
              ================================================= */}

              {hasFilters && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-stone-500">
                    Active filters:
                  </span>

                  {selectedType !==
                    "All" && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold">
                      Type:{" "}
                      {selectedType}
                    </span>
                  )}

                  {selectedMonth && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Month:{" "}
                      {selectedMonth}
                    </span>
                  )}

                  {fromDate && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold">
                      From:{" "}
                      {formatDate(
                        fromDate,
                      )}
                    </span>
                  )}

                  {toDate && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold">
                      To:{" "}
                      {formatDate(toDate)}
                    </span>
                  )}

                  <span className="text-stone-400">
                    Only paid submissions are
                    included.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* =================================================
              NO RESULTS
          ================================================= */}

          {filteredSubmissions.length ===
          0 ? (
            <div className="py-16 px-6 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-stone-300 mb-3" />

              <h3 className="font-bold text-gray-900">
                No submissions found
              </h3>

              <p className="text-sm text-stone-500 mt-1">
                No paid submissions match
                the selected filters.
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
                {/* =============================================
                    HEADER
                ============================================= */}

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

                {/* =============================================
                    BODY
                ============================================= */}

                <tbody className="divide-y divide-stone-100">
                  {filteredSubmissions.map(
                    (item) => (
                      <tr
                        key={
                          item.storyPoetryId
                        }
                        onClick={() =>
                          handleOpenStory(
                            item,
                          )
                        }
                        className="
                          group
                          hover:bg-emerald-50/60
                          transition-colors
                          cursor-pointer
                        "
                      >
                        {/* ===================================
                            SUBMISSION
                        =================================== */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                              {renderTypeIcon(
                                item.type,
                              )}
                            </div>

                            <div>
                              <p className="font-bold text-gray-900">
                                {item.title ||
                                  "-"}
                              </p>

                              <p className="text-[11px] text-stone-500 mt-0.5">
                                ID #
                                {
                                  item.storyPoetryId
                                }
                              </p>

                              <p className="text-[10px] text-emerald-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                Click row to
                                open
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ===================================
                            CONTRIBUTOR
                        =================================== */}

                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800">
                            {item.contributorNameMalayalam ||
                              "-"}
                          </p>
                        </td>

                        {/* ===================================
                            TYPE
                        =================================== */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${getTypeStyle(
                              item.type,
                            )}`}
                          >
                            {item.type ||
                              "-"}
                          </span>
                        </td>

                        {/* ===================================
                            PAYMENT
                        =================================== */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${getPaymentStyle(
                              item.paymentStatus,
                            )}`}
                          >
                            {item.paymentStatus ||
                              "Pending"}
                          </span>
                        </td>

                        {/* ===================================
                            DATE
                        =================================== */}

                        <td className="px-5 py-4 text-stone-600 text-xs font-medium">
                          {formatDate(
                            item.createdDate,
                          )}
                        </td>

                        {/* ===================================
                            DOWNLOADS
                        =================================== */}

                        <td className="px-5 py-4">
                          <div
                            className="flex justify-end items-center gap-2"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            {/* PROFILE PHOTO */}

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

                            {/* DOCX */}

                            <button
                              type="button"
                              disabled={
                                generatingSingleDocx ===
                                item.storyPoetryId
                              }
                              onClick={(e) => {
                                e.stopPropagation();

                                handleDownloadSingleDOCX(
                                  item,
                                );
                              }}
                              title="Download this submission as DOCX"
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
                              {generatingSingleDocx ===
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
                                    DOCX
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}