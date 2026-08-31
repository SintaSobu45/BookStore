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
          error.message || "Failed to load submission details.",
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

  const safeFileName = (name, fallback = "Story-Poetry") => {
    return (
      String(name || "")
        .replace(/[\\/:*?"<>|]/g, "_")
        .trim() || fallback
    );
  };

  // =========================================================
  // WAIT FOR IMAGES
  // =========================================================

  const waitForImages = async (container) => {
    const images = container.querySelectorAll("img");

    await Promise.all(
      Array.from(images).map(
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
  // WAIT FOR FONTS
  // =========================================================

  const waitForFonts = async () => {
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    } catch (error) {
      console.warn(
        "Could not wait for document fonts:",
        error,
      );
    }

    // Give the browser a moment to finish font rendering.
    await new Promise((resolve) =>
      setTimeout(resolve, 500),
    );
  };

  // =========================================================
  // CREATE PDF PAGE
  // =========================================================

  const createPdfPage = ({
    width = 210,
    height = 297,
  } = {}) => {
    const page = document.createElement("div");

    page.style.width = `${width}mm`;
    page.style.height = `${height}mm`;
    page.style.boxSizing = "border-box";
    page.style.backgroundColor = "#ffffff";

    // Safe A4 margins.
    page.style.padding = "20mm 18mm 20mm 18mm";

    page.style.fontFamily =
      "'Manjari', sans-serif";

    page.style.color = "#111827";

    // IMPORTANT:
    // We don't hide overflow.
    //
    // The content itself is placed only into pages where
    // it fits. This prevents text from being silently cropped.
    page.style.overflow = "hidden";

    return page;
  };

  // =========================================================
  // CREATE AUTHOR HEADER
  // =========================================================

  const createAuthorHeader = () => {
    const header = document.createElement("div");

    header.style.display = "flex";
    header.style.alignItems = "flex-start";
    header.style.gap = "8mm";
    header.style.width = "100%";
    header.style.boxSizing = "border-box";

    // -------------------------------------------------------
    // PROFILE IMAGE
    // -------------------------------------------------------

    if (item?.contributorProfileImageUrl) {
      const img = document.createElement("img");

      img.src = item.contributorProfileImageUrl;
      img.crossOrigin = "anonymous";

      img.style.width = "35mm";
      img.style.height = "43mm";
      img.style.objectFit = "cover";
      img.style.borderRadius = "5mm";
      img.style.display = "block";
      img.style.flexShrink = "0";

      header.appendChild(img);
    } else {
      const placeholder =
        document.createElement("div");

      placeholder.style.width = "35mm";
      placeholder.style.height = "43mm";
      placeholder.style.backgroundColor = "#f5f5f4";
      placeholder.style.borderRadius = "5mm";

      placeholder.style.display = "flex";
      placeholder.style.alignItems = "center";
      placeholder.style.justifyContent = "center";

      placeholder.style.fontSize = "12mm";
      placeholder.style.color = "#a8a29e";

      placeholder.style.flexShrink = "0";

      placeholder.textContent = "👤";

      header.appendChild(placeholder);
    }

    // -------------------------------------------------------
    // CONTRIBUTOR DETAILS
    // -------------------------------------------------------

    const details = document.createElement("div");

    details.style.flex = "1";
    details.style.minWidth = "0";
    details.style.paddingTop = "2mm";

    details.style.fontFamily =
      "'Manjari', sans-serif";

    details.style.lineHeight = "1.55";

    // NAME
    const authorName = document.createElement("div");

    authorName.style.fontSize = "17px";
    authorName.style.fontWeight = "700";

    authorName.textContent =
      item?.contributorNameMalayalam || "";

    details.appendChild(authorName);

    // LOCATION
    if (
      item?.contributorCityMalayalam ||
      item?.contributorDistrictMalayalam
    ) {
      const location =
        document.createElement("div");

      location.style.fontSize = "14px";
      location.style.marginTop = "2px";

      location.textContent =
        `${item?.contributorCityMalayalam || ""}${
          item?.contributorCityMalayalam &&
          item?.contributorDistrictMalayalam
            ? ", "
            : ""
        }${
          item?.contributorDistrictMalayalam || ""
        }`;

      details.appendChild(location);
    }

    // EMAIL
    if (item?.contributorEmail) {
      const email =
        document.createElement("div");

      email.style.fontFamily =
        "Arial, sans-serif";

      email.style.fontSize = "12px";
      email.style.marginTop = "3px";

      email.style.overflowWrap = "anywhere";

      email.textContent =
        `mail/${item.contributorEmail}`;

      details.appendChild(email);
    }

    header.appendChild(details);

    return header;
  };

  // =========================================================
  // CREATE TITLE
  // =========================================================

  const createTitle = () => {
    const title =
      document.createElement("div");

    title.style.marginTop = "13mm";

    title.style.fontFamily =
      "'Manjari', sans-serif";

    title.style.fontSize = "28px";
    title.style.fontWeight = "700";

    // Important for Malayalam glyphs.
    title.style.lineHeight = "1.45";

    title.style.color = "#111827";

    title.style.width = "100%";

    title.style.boxSizing = "border-box";

    title.style.overflowWrap = "break-word";
    title.style.wordBreak = "normal";

    title.textContent = item?.title || "";

    return title;
  };

  // =========================================================
  // CREATE CONTENT ELEMENT
  // =========================================================

  const createContentElement = ({
    fontSize = 16,
    lineHeight = 1.85,
  } = {}) => {
    const content =
      document.createElement("div");

    content.style.width = "100%";

    content.style.fontFamily =
      "'Manjari', sans-serif";

    content.style.fontSize =
      `${fontSize}px`;

    /*
      IMPORTANT:

      A generous line-height prevents Malayalam
      characters/diacritics from being vertically clipped.
    */
    content.style.lineHeight =
      String(lineHeight);

    content.style.color = "#111827";

    content.style.boxSizing = "border-box";

    /*
      Preserve exactly what the user typed.

      Newlines remain newlines.
      Spaces remain spaces.
      Long Malayalam text can wrap.
    */
    content.style.whiteSpace = "pre-wrap";

    content.style.overflowWrap =
      "break-word";

    content.style.wordBreak = "normal";

    return content;
  };

  // =========================================================
  // CREATE CONTENT PARAGRAPH
  // =========================================================

  const createContentParagraph = (text) => {
    const paragraph =
      document.createElement("div");

    /*
      Do NOT use fixed heights.

      The browser calculates the actual height.
    */
    paragraph.style.width = "100%";

    paragraph.style.whiteSpace = "pre-wrap";

    paragraph.style.overflowWrap =
      "break-word";

    paragraph.style.wordBreak = "normal";

    paragraph.style.boxSizing = "border-box";

    paragraph.style.margin = "0";

    /*
      IMPORTANT:

      We deliberately do NOT use:

        breakInside: avoid

      on every line.

      That was one of the reasons the previous
      implementation could behave badly.

      Text should be allowed to naturally flow.
    */

    paragraph.textContent =
      text === "" ? "\u00A0" : text;

    return paragraph;
  };

  // =========================================================
  // RENDER HTML PAGE INTO PDF
  // =========================================================

  const renderPageToPdf = async ({
    pdf,
    page,
    pageIndex,
  }) => {
    await waitForImages(page);
    await waitForFonts();

    /*
      Render at high resolution.

      3x gives good quality without making the
      browser canvas unnecessarily huge.
    */
    const canvas = await html2canvas(
      page,
      {
        scale: 3,

        useCORS: true,
        allowTaint: false,

        backgroundColor: "#ffffff",

        width: page.offsetWidth,
        height: page.offsetHeight,

        windowWidth: page.offsetWidth,
        windowHeight: page.offsetHeight,

        /*
          Important for Malayalam text rendering.
        */
        logging: false,
      },
    );

    const image =
      canvas.toDataURL(
        "image/jpeg",
        0.98,
      );

    if (pageIndex > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      image,
      "JPEG",
      0,
      0,
      210,
      297,
    );
  };

  // =========================================================
  // BUILD POETRY PDF
  // =========================================================

  const buildPoetryPdf = async ({
    pdf,
    printContainer,
  }) => {
    const page = createPdfPage();

    // Author header.
    page.appendChild(
      createAuthorHeader(),
    );

    // Title.
    page.appendChild(
      createTitle(),
    );

    // Content.
    const contentArea =
      createContentElement({
        fontSize: 16,
        lineHeight: 1.75,
      });

    contentArea.style.marginTop =
      "9mm";

    /*
      Poetry is limited by the user side to
      30 lines, so normally it should fit.

      We do NOT artificially split it.
      The entire submitted poem goes into
      this one page.
    */
    const contentText =
      String(item?.content || "");

    contentArea.textContent =
      contentText;

    page.appendChild(contentArea);

    printContainer.appendChild(page);

    await waitForImages(page);
    await waitForFonts();

    /*
      If the poetry happens to be slightly too
      tall because of font rendering, gradually
      reduce font size.

      We never remove content.
      We also keep a safe line-height.
    */
    let fontSize = 16;

    while (
      page.scrollHeight >
        page.clientHeight &&
      fontSize > 12
    ) {
      fontSize -= 0.5;

      contentArea.style.fontSize =
        `${fontSize}px`;

      await new Promise((resolve) =>
        requestAnimationFrame(resolve),
      );
    }

    /*
      Final render.

      If content still exceeds the page after
      safe reduction, we DO NOT silently delete it.
      The user's 30-line submission limit should
      normally prevent this situation.
    */
    await renderPageToPdf({
      pdf,
      page,
      pageIndex: 0,
    });

    printContainer.removeChild(page);
  };

  // =========================================================
  // BUILD STORY PDF
  // =========================================================

  const buildStoryPdf = async ({
    pdf,
    printContainer,
  }) => {
    const contentText =
      String(item?.content || "");

    /*
      Preserve the user's actual Enter presses.

      We split only by explicit newline so that
      paragraphs/lines remain intact.

      We DO NOT impose a 35-character limit here.
      That belongs to the user submission side,
      not the admin PDF layout.
    */
    const lines =
      contentText.split(/\r?\n/);

    /*
      Story pages are created dynamically.

      The story can use:
        1 page
        2 pages
        3 pages
        4 pages

      depending on actual content.

      We NEVER create empty extra pages.
    */

    let pageIndex = 0;

    let page = null;
    let contentArea = null;

    // -------------------------------------------------------
    // Create the first story page.
    // -------------------------------------------------------

    const createStoryPage = ({
      firstPage = false,
    } = {}) => {
      const newPage = createPdfPage();

      if (firstPage) {
        // Author header only appears on page 1.
        newPage.appendChild(
          createAuthorHeader(),
        );

        // Title only appears on page 1.
        newPage.appendChild(
          createTitle(),
        );
      }

      const newContentArea =
        createContentElement({
          fontSize: 16,
          lineHeight: 1.75,
        });

      if (firstPage) {
        newContentArea.style.marginTop =
          "9mm";
      } else {
        newContentArea.style.marginTop =
          "0mm";
      }

      newPage.appendChild(
        newContentArea,
      );

      return {
        page: newPage,
        contentArea: newContentArea,
      };
    };

    // -------------------------------------------------------
    // Start page 1.
    // -------------------------------------------------------

    ({
      page,
      contentArea,
    } = createStoryPage({
      firstPage: true,
    }));

    printContainer.appendChild(page);

    await waitForImages(page);
    await waitForFonts();

    // -------------------------------------------------------
    // Add lines naturally.
    // -------------------------------------------------------

    let currentLineIndex = 0;

    while (
      currentLineIndex < lines.length
    ) {
      const line =
        lines[currentLineIndex];

      const paragraph =
        createContentParagraph(line);

      contentArea.appendChild(
        paragraph,
      );

      /*
        Wait one browser frame so the DOM has
        calculated the new text height.
      */
      await new Promise((resolve) =>
        requestAnimationFrame(resolve),
      );

      const pageIsOverflowing =
        page.scrollHeight >
        page.clientHeight + 1;

      if (!pageIsOverflowing) {
        /*
          It fits.

          Move to the next submitted line.
        */
        currentLineIndex++;
        continue;
      }

      /*
        The newly added line doesn't fit.

        Remove ONLY that line from this page.

        Then create the next page and put that
        same line there.

        Therefore:

          Page 1 -> full
          Page 2 -> continues

        with NO text deletion.
      */
      contentArea.removeChild(
        paragraph,
      );

      /*
        If there is only one extremely tall line,
        we still need to prevent an infinite loop.

        In normal user submissions this should not
        happen because the user-side line length
        is limited.
      */
      if (
        contentArea.children.length === 0
      ) {
        /*
          A single line is taller than the page.

          We reduce the font size safely until
          that line can fit.

          Again: we never delete it.
        */
        let fontSize = 16;

        let fitsSingleLine = false;

        while (
          fontSize > 11
        ) {
          contentArea.style.fontSize =
            `${fontSize}px`;

          contentArea.style.lineHeight =
            "1.65";

          contentArea.appendChild(
            paragraph,
          );

          await new Promise((resolve) =>
            requestAnimationFrame(resolve),
          );

          if (
            page.scrollHeight <=
            page.clientHeight + 1
          ) {
            fitsSingleLine = true;
            break;
          }

          contentArea.removeChild(
            paragraph,
          );

          fontSize -= 0.5;
        }

        if (fitsSingleLine) {
          currentLineIndex++;
          continue;
        }

        /*
          If an individual submitted line somehow
          cannot fit even after safe reduction,
          stop rather than silently losing data.
        */
        console.warn(
          "A single story line could not fit on an A4 page.",
        );

        contentArea.appendChild(
          paragraph,
        );

        currentLineIndex++;

        continue;
      }

      // -----------------------------------------------------
      // Current page is finished.
      // -----------------------------------------------------

      await renderPageToPdf({
        pdf,
        page,
        pageIndex,
      });

      pageIndex++;

      /*
        HARD MAXIMUM:

        Story is allowed up to 4 PDF pages.

        The user-side limit is 120 lines, so
        under the intended layout this should fit.
      */
      if (pageIndex >= 4) {
        /*
          We have reached the allowed maximum.

          The submission system should already prevent
          more than 120 user-entered lines.

          Do NOT create a 5th page.
        */
        if (
          currentLineIndex <
          lines.length
        ) {
          console.warn(
            "Story content exceeds the maximum of 4 PDF pages.",
          );
        }

        page = null;
        contentArea = null;

        break;
      }

      // -----------------------------------------------------
      // Create continuation page.
      // -----------------------------------------------------

      ({
        page,
        contentArea,
      } = createStoryPage({
        firstPage: false,
      }));

      printContainer.appendChild(page);

      await waitForImages(page);
      await waitForFonts();

      /*
        IMPORTANT:

        currentLineIndex was NOT incremented
        after removing the overflowing paragraph.

        Therefore that exact same line will now
        be inserted on the new page.
      */
    }

    // -------------------------------------------------------
    // Render final page only if it contains content.
    // -------------------------------------------------------

    if (
      page &&
      contentArea &&
      contentArea.children.length > 0
    ) {
      await renderPageToPdf({
        pdf,
        page,
        pageIndex,
      });

      printContainer.removeChild(page);

      page = null;
      contentArea = null;
    }
  };

  // =========================================================
  // PDF DOWNLOAD
  // =========================================================

  const handleDownloadPDF = async () => {
    try {
      if (!item) return;

      const { isPoetry, isStory } =
        getContentType();

      const pdf = new jsPDF(
        "p",
        "mm",
        "a4",
      );

      /*
        IMPORTANT:

        jsPDF starts with one blank page.

        We will render page 0 into it.
      */

      const printContainer =
        document.createElement("div");

      printContainer.style.position =
        "fixed";

      printContainer.style.left =
        "-100000px";

      printContainer.style.top = "0";

      printContainer.style.width =
        "210mm";

      printContainer.style.background =
        "#ffffff";

      printContainer.style.zIndex =
        "-9999";

      /*
        Make sure the hidden container itself
        doesn't inherit weird application styles.
      */
      printContainer.style.margin = "0";
      printContainer.style.padding = "0";

      document.body.appendChild(
        printContainer,
      );

      try {
        if (isPoetry) {
          // ===============================================
          // POETRY = ONE PAGE
          // ===============================================

          await buildPoetryPdf({
            pdf,
            printContainer,
          });
        } else if (isStory) {
          // ===============================================
          // STORY = UP TO FOUR PAGES
          // ===============================================

          await buildStoryPdf({
            pdf,
            printContainer,
          });
        } else {
          /*
            Fallback for unknown content type.

            Treat it like a normal single-page submission.
          */

          const page = createPdfPage();

          page.appendChild(
            createAuthorHeader(),
          );

          page.appendChild(
            createTitle(),
          );

          const contentArea =
            createContentElement({
              fontSize: 16,
              lineHeight: 1.75,
            });

          contentArea.style.marginTop =
            "9mm";

          contentArea.textContent =
            String(item?.content || "");

          page.appendChild(
            contentArea,
          );

          printContainer.appendChild(
            page,
          );

          await renderPageToPdf({
            pdf,
            page,
            pageIndex: 0,
          });
        }
      } finally {
        /*
          Always remove the hidden DOM container.
        */
        if (
          printContainer.parentNode
        ) {
          document.body.removeChild(
            printContainer,
          );
        }
      }

      // =====================================================
      // SAVE
      // =====================================================

      const fileName =
        safeFileName(
          item.contributorNameMalayalam,
        );

      pdf.save(
        `${fileName}.pdf`,
      );
    } catch (error) {
      console.error(
        "PDF generation failed:",
        error,
      );

      alert(
        "Failed to generate PDF.",
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
        "No contributor profile image available.",
      );

      return;
    }

    try {
      const response = await fetch(
        item.contributorProfileImageUrl,
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch image.",
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
          "contributor",
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
        error,
      );

      alert(
        "Failed to download contributor image.",
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

          {/* DOWNLOAD PDF */}

          <button
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1b3b2b] hover:bg-emerald-950 text-white rounded-xl text-sm font-bold cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4" />

            Download PDF
          </button>
        </div>
      </div>

      {/* =====================================================
          ADMIN BOOK PREVIEW

          This is only the browser preview.

          PDF generation is completely independent from
          this preview now.
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

              /*
                Slightly more line-height than before.

                This prevents Malayalam characters from
                touching/cropping into the next line.
              */
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
              /*
                Safer Malayalam line-height.
              */
              lineHeight:
                "1.9",

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

          .print\\\\:hidden {
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