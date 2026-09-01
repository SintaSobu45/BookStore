import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  PageBreak,
} from "docx";

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

  // =========================================================
  // LOAD DETAILS
  // =========================================================

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getStoryPoetryById(id);

        setItem(data);
      } catch (error) {
        console.error("Failed to load submission details:", error);

        setError(
          error.message || "Failed to load submission details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getContentType = () => {
    const category =
      item?.type ||
      item?.category ||
      item?.contentType ||
      item?.storyPoetryType ||
      "";

    const normalized = String(category)
      .trim()
      .toLowerCase();

    return {
      isPoetry:
        normalized === "poetry" ||
        normalized === "poem",

      isStory:
        normalized === "story",
    };
  };

  const safeFileName = (
    name,
    fallback = "Story-Poetry"
  ) => {
    return (
      String(name || "")
        .replace(/[\\/:*?"<>|]/g, "_")
        .trim() || fallback
    );
  };

  // =========================================================
  // DOWNLOAD IMAGE HELPER
  // =========================================================

  const fetchImageAsArrayBuffer = async (url) => {
    if (!url) {
      return null;
    }

    try {
      const response = await fetch(url, {
        mode: "cors",
      });

      if (!response.ok) {
        throw new Error(
          `Image request failed with status ${response.status}`
        );
      }

      const blob = await response.blob();

      return await blob.arrayBuffer();
    } catch (error) {
      console.warn(
        "Could not load contributor image for DOCX:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // DETECT IMAGE TYPE
  // =========================================================

  const getImageType = (url = "") => {
    const normalized = url.toLowerCase();

    if (
      normalized.includes(".png") ||
      normalized.includes("image/png")
    ) {
      return "png";
    }

    if (
      normalized.includes(".jpg") ||
      normalized.includes(".jpeg") ||
      normalized.includes("image/jpeg")
    ) {
      return "jpg";
    }

    return "jpg";
  };

  // =========================================================
  // CREATE AUTHOR IMAGE
  // =========================================================

  const createAuthorImage = async () => {
    if (!item?.contributorProfileImageUrl) {
      return null;
    }

    const imageData = await fetchImageAsArrayBuffer(
      item.contributorProfileImageUrl
    );

    if (!imageData) {
      return null;
    }

    const imageType = getImageType(
      item.contributorProfileImageUrl
    );

    return new ImageRun({
      data: imageData,
      transformation: {
        width: 132,
        height: 162,
      },
      type: imageType,
    });
  };

  // =========================================================
  // CREATE AUTHOR SECTION
  // =========================================================

  const createAuthorSection = async () => {
    const children = [];

    const authorImage = await createAuthorImage();

    // -------------------------------------------------------
    // AUTHOR IMAGE
    // -------------------------------------------------------

    if (authorImage) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: {
            after: 120,
          },
          children: [authorImage],
        })
      );
    }

    // -------------------------------------------------------
    // AUTHOR NAME
    // -------------------------------------------------------

    if (item?.contributorNameMalayalam) {
      children.push(
        new Paragraph({
          spacing: {
            before: 80,
            after: 40,
          },

          children: [
            new TextRun({
              text: String(
                item.contributorNameMalayalam
              ),
              font: {
                name: "Manjari",
                eastAsia: "Manjari",
              },
              size: 34,
              bold: true,
            }),
          ],
        })
      );
    }

    // -------------------------------------------------------
    // LOCATION
    // -------------------------------------------------------

    const city =
      item?.contributorCityMalayalam || "";

    const district =
      item?.contributorDistrictMalayalam || "";

    if (city || district) {
      const location = `${city}${
        city && district ? ", " : ""
      }${district}`;

      children.push(
        new Paragraph({
          spacing: {
            after: 40,
          },

          children: [
            new TextRun({
              text: location,
              font: {
                name: "Manjari",
                eastAsia: "Manjari",
              },
              size: 28,
            }),
          ],
        })
      );
    }

    // -------------------------------------------------------
    // EMAIL
    // -------------------------------------------------------

    if (item?.contributorEmail) {
      children.push(
        new Paragraph({
          spacing: {
            after: 0,
          },

          children: [
            new TextRun({
              text: `mail/${item.contributorEmail}`,
              font: {
                name: "Arial",
                eastAsia: "Arial",
              },
              size: 22,
            }),
          ],
        })
      );
    }

    return children;
  };

  // =========================================================
  // CREATE TITLE
  // =========================================================

  const createTitleParagraph = () => {
    return new Paragraph({
      spacing: {
        before: 600,
        after: 400,
        line: 360,
      },

      keepNext: true,

      children: [
        new TextRun({
          text: String(item?.title || ""),
          font: {
            name: "Manjari",
            eastAsia: "Manjari",
          },
          size: 48,
          bold: true,
        }),
      ],
    });
  };

  // =========================================================
  // CREATE CONTENT PARAGRAPHS
  // =========================================================

  const createContentParagraphs = () => {
    const content = String(item?.content || "");

    /*
      IMPORTANT:

      We split ONLY by actual Enter/newline characters.

      Word will automatically wrap long lines.

      We do NOT split based on character count.

      Therefore the user's original content is preserved.
    */

    const lines = content.split(/\r?\n/);

    return lines.map((line) => {
      return new Paragraph({
        spacing: {
          before: 0,
          after: 180,
          line: 420,
        },

        alignment: AlignmentType.LEFT,

        children: [
          new TextRun({
            text: line || " ",
            font: {
              name: "Manjari",
              eastAsia: "Manjari",
            },
            size: 32,
          }),
        ],
      });
    });
  };

  // =========================================================
  // BUILD DOCX
  // =========================================================

  const buildDocx = async () => {
    const { isPoetry, isStory } =
      getContentType();

    console.log(
      "Building DOCX:",
      isPoetry ? "Poetry" : isStory ? "Story" : "Unknown"
    );

    // -------------------------------------------------------
    // AUTHOR
    // -------------------------------------------------------

    const authorSection =
      await createAuthorSection();

    // -------------------------------------------------------
    // TITLE
    // -------------------------------------------------------

    const titleParagraph =
      createTitleParagraph();

    // -------------------------------------------------------
    // CONTENT
    // -------------------------------------------------------

    const contentParagraphs =
      createContentParagraphs();

    // -------------------------------------------------------
    // DOCUMENT
    // -------------------------------------------------------

    const documentChildren = [
      ...authorSection,
      titleParagraph,
      ...contentParagraphs,
    ];

    const doc = new Document({
      creator: "BookStore",
      title: String(item?.title || "Story-Poetry"),
      subject: isPoetry
        ? "Poetry Submission"
        : isStory
        ? "Story Submission"
        : "Story-Poetry Submission",

      description:
        "Generated from BookStore contributor submission.",

      styles: {
        default: {
          document: {
            run: {
              font: "Manjari",
              size: 32,
            },

            paragraph: {
              spacing: {
                line: 420,
              },
            },
          },
        },
      },

      sections: [
        {
          properties: {
            page: {
              width: 11906,
              height: 16838,

              margin: {
                top: 1134,
                right: 1020,
                bottom: 1134,
                left: 1020,
              },
            },
          },

          children: documentChildren,
        },
      ],
    });

    return doc;
  };

  // =========================================================
  // DOWNLOAD DOCX
  // =========================================================

  const handleDownloadDOCX = async () => {
    try {
      if (!item) {
        return;
      }

      setError("");

      console.log(
        "Starting DOCX generation..."
      );

      const doc = await buildDocx();

      console.log(
        "DOCX document created."
      );

      const blob =
        await Packer.toBlob(doc);

      console.log(
        "DOCX blob generated."
      );

      const fileName = safeFileName(
        item.contributorNameMalayalam,
        "Story-Poetry"
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${fileName}.docx`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log(
        "DOCX downloaded successfully."
      );
    } catch (error) {
      console.error(
        "DOCX generation failed:",
        error
      );

      alert(
        "Failed to generate DOCX. Please try again."
      );
    }
  };

  // =========================================================
  // DOWNLOAD CONTRIBUTOR IMAGE
  // =========================================================

  const handleDownloadImage = async () => {
    if (
      !item?.contributorProfileImageUrl
    ) {
      alert(
        "No contributor profile image available."
      );

      return;
    }

    try {
      const response = await fetch(
        item.contributorProfileImageUrl
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch image."
        );
      }

      const blob =
        await response.blob();

      const imageUrl =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      const fileName =
        safeFileName(
          item.contributorNameMalayalam,
          "contributor"
        );

      const extensionMap = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/avif": "avif",
      };

      const extension =
        extensionMap[blob.type] ||
        "jpg";

      link.href = imageUrl;

      link.download =
        `${fileName}.${extension}`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error(
        "Image download failed:",
        error
      );

      alert(
        "Failed to download contributor image."
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

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

  // =========================================================
  // ERROR
  // =========================================================

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
          {error ||
            "Submission not found."}
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="p-4 md:p-8 bg-stone-100 min-h-screen">
      {/* =====================================================
          ADMIN CONTROLS
      ===================================================== */}

      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
        {/* BACK */}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-[#1b3b2b] hover:text-emerald-950"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Submissions
        </button>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          {/* DOWNLOAD PHOTO */}

          <button
            onClick={handleDownloadImage}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-stone-300 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-stone-50 cursor-pointer shadow-sm"
          >
            <ImageDown className="h-4 w-4" />

            Download Photo
          </button>

          {/* DOWNLOAD DOCX */}

          <button
            onClick={handleDownloadDOCX}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1b3b2b] hover:bg-emerald-950 text-white rounded-xl text-sm font-bold cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4" />

            Download DOCX
          </button>
        </div>
      </div>

      {/* =====================================================
          ADMIN BOOK PREVIEW
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
          px-6
          sm:px-10
          md:px-20
          pt-12
          md:pt-20
          pb-16
          md:pb-20
        "
      >
        {/* ===================================================
            AUTHOR / CONTRIBUTOR HEADER
        =================================================== */}

        <div className="flex items-start gap-5 sm:gap-8 md:gap-10">
          {/* PROFILE IMAGE */}

          <div className="shrink-0">
            {item.contributorProfileImageUrl ? (
              <img
                src={
                  item.contributorProfileImageUrl
                }
                alt={
                  item.contributorNameMalayalam ||
                  "Contributor"
                }
                className="
                  w-28
                  h-36
                  sm:w-36
                  sm:h-44
                  md:w-40
                  md:h-48
                  object-cover
                  rounded-[20px]
                  md:rounded-[28px]
                "
              />
            ) : (
              <div
                className="
                  w-28
                  h-36
                  sm:w-36
                  sm:h-44
                  md:w-40
                  md:h-48
                  bg-stone-100
                  rounded-[20px]
                  md:rounded-[28px]
                  flex
                  items-center
                  justify-center
                "
              >
                <UserCircle className="w-12 h-12 md:w-16 md:h-16 text-stone-300" />
              </div>
            )}
          </div>

          {/* CONTRIBUTOR DETAILS */}

          <div
            className="
              pt-1
              md:pt-3
              text-gray-900
              leading-relaxed
              flex-1
              min-w-0
              text-left
            "
            style={{
              fontFamily:
                "'Manjari', sans-serif",
            }}
          >
            {/* NAME */}

            <p className="text-lg md:text-xl font-bold">
              {item.contributorNameMalayalam ||
                ""}
            </p>

            {/* CITY + DISTRICT */}

            {(item.contributorCityMalayalam ||
              item.contributorDistrictMalayalam) && (
              <p className="text-base md:text-lg mt-1">
                {item.contributorCityMalayalam ||
                  ""}

                {item.contributorCityMalayalam &&
                  item.contributorDistrictMalayalam &&
                  ", "}

                {item.contributorDistrictMalayalam ||
                  ""}
              </p>
            )}

            {/* EMAIL */}

            {item.contributorEmail && (
              <p
                className="text-sm md:text-lg mt-1 break-all"
                style={{
                  fontFamily:
                    "Arial, sans-serif",
                }}
              >
                mail/
                {item.contributorEmail}
              </p>
            )}
          </div>
        </div>

        {/* ===================================================
            TITLE
        =================================================== */}

        <div className="mt-10 md:mt-14 text-left">
          <h1
            className="
              text-3xl
              sm:text-4xl
              md:text-5xl
              font-bold
              text-gray-950
              tracking-tight
            "
            style={{
              fontFamily:
                "'Manjari', sans-serif",

              lineHeight: "1.45",

              overflowWrap:
                "break-word",

              wordBreak:
                "normal",
            }}
          >
            {item.title}
          </h1>
        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div
          className="
            mt-8
            md:mt-12
            text-gray-900
            text-left
          "
          style={{
            fontFamily:
              "'Manjari', sans-serif",
          }}
        >
          <div
            className="
              whitespace-pre-wrap
              text-[19px]
              md:text-[23px]
            "
            style={{
              lineHeight: "1.9",

              overflowWrap:
                "break-word",

              wordBreak:
                "normal",
            }}
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
            padding: 20mm 18mm 20mm 18mm !important;
            box-shadow: none !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}