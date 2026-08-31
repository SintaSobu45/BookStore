import React, { useEffect, useState, useRef } from "react";
import {
  BookOpen,
  Leaf,
  Eye,
  Loader2,
  X,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  FileText,
  CreditCard,
  Download,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { useNavigate } from "react-router-dom";
import certificateBg from "../../assets/certificate.jpg";
import {
  getCertificateCandidates,
  bulkGenerateCertificates,
  sendCertificatePdf,
} from "../../services/certificateService";

export default function AdminCertificate() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Certificate Management States
  const [selectedCertificateUsers, setSelectedCertificateUsers] = useState([]);
  const [certificateSearch, setCertificateSearch] = useState("");
  const [certificateGenerating, setCertificateGenerating] = useState(false);
  const [certificateTemplate, setCertificateTemplate] = useState(
    "default-certificate",
  );

  // 1 / N Preview Modal States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const certRef = useRef(null);

  // =========================================================
  // LOAD CANDIDATES FROM REAL BACKEND
  // =========================================================
  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCertificateCandidates();
      // console.log(`certificate response`,data);
      setSubmissions(data || []);
    } catch (err) {
      console.error("Failed to load candidates:", err);
      setError(err.message || "Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderTypeIcon = (type) => {
    if (type === "Poetry") {
      return <Leaf className="h-4 w-4 text-emerald-800" />;
    }
    return <BookOpen className="h-4 w-4 text-emerald-800" />;
  };

  const getTypeStyle = (type) => {
    if (type === "Poetry") return "bg-emerald-100 text-emerald-800";
    if (type === "Special") return "bg-purple-100 text-purple-800";
    return "bg-blue-100 text-blue-800";
  };

  const filteredSubmissions = submissions.filter((item) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !search ||
      item.title?.toLowerCase().includes(search) ||
      item.contributorNameMalayalam?.toLowerCase().includes(search);
    const matchesMonth =
      !selectedMonth || item.createdDate?.startsWith(selectedMonth);

    return matchesSearch && matchesMonth;
  });

  const filteredCertificateUsers = submissions.filter((item) => {
    const search = certificateSearch.toLowerCase().trim();
    if (!search) return true;
    return (
      item.contributorNameMalayalam?.toLowerCase().includes(search) ||
      item.title?.toLowerCase().includes(search) ||
      item.contributorEmail?.toLowerCase().includes(search)
    );
  });

  const isCertificateUserSelected = (id) => {
    return selectedCertificateUsers.includes(id);
  };

  const toggleCertificateUser = (id) => {
    setSelectedCertificateUsers((prev) => {
      if (prev.includes(id)) {
        return prev.filter((userId) => userId !== id);
      }
      return [...prev, id];
    });
  };

  const handleSelectAllCertificates = () => {
    const filteredIds = filteredCertificateUsers.map(
      (item) => item.storyPoetryId,
    );
    const allSelected = filteredIds.every((id) =>
      selectedCertificateUsers.includes(id),
    );

    if (allSelected) {
      setSelectedCertificateUsers((prev) =>
        prev.filter((id) => !filteredIds.includes(id)),
      );
    } else {
      setSelectedCertificateUsers((prev) => [
        ...new Set([...prev, ...filteredIds]),
      ]);
    }
  };

  const clearCertificateSelection = () => {
    setSelectedCertificateUsers([]);
  };

  const selectedUsersData = submissions.filter((item) =>
    selectedCertificateUsers.includes(item.storyPoetryId),
  );

  const currentPreviewUser = selectedUsersData[previewIndex] || {};

  const handleOpenPreview = () => {
    if (selectedCertificateUsers.length === 0) {
      alert("Please select at least one contributor.");
      return;
    }
    setPreviewIndex(0);
    setIsPreviewOpen(true);
  };

  // =========================================================
  // CONFIRM, GENERATE DB RECORDS & SEND REAL EMAILS
  // =========================================================
  const handleConfirmAndSend = async () => {
  if (selectedCertificateUsers.length === 0) return;

  try {
    setCertificateGenerating(true);

    // ---------------------------------------------------------
    // 1. Generate certificate database records
    // ---------------------------------------------------------
    const generatedRecords = await bulkGenerateCertificates(
      selectedCertificateUsers,
    );

    console.log(
      "Generated certificate records:",
      generatedRecords,
    );

    // ---------------------------------------------------------
    // 2. Create a fixed-size A4 LANDSCAPE render container
    // ---------------------------------------------------------
    const renderContainer = document.createElement("div");

    renderContainer.style.position = "fixed";
    renderContainer.style.left = "-100000px";
    renderContainer.style.top = "0";

    // 297mm × 210mm = A4 landscape
    renderContainer.style.width = "297mm";
    renderContainer.style.height = "210mm";

    renderContainer.style.background = "#ffffff";
    renderContainer.style.overflow = "hidden";
    renderContainer.style.margin = "0";
    renderContainer.style.padding = "0";
    renderContainer.style.boxSizing = "border-box";

    document.body.appendChild(renderContainer);

    // ---------------------------------------------------------
    // 3. Wait until fonts are ready
    // ---------------------------------------------------------
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    // ---------------------------------------------------------
    // 4. Generate each certificate
    // ---------------------------------------------------------
    for (let i = 0; i < selectedUsersData.length; i++) {
      const user = selectedUsersData[i];

      const certRecord = Array.isArray(generatedRecords)
        ? generatedRecords.find(
            (c) => c.storyPoetryId === user.storyPoetryId,
          )
        : generatedRecords;

      if (!certRecord || !certRecord.certificateId) {
        console.warn(
          `No certificate record found for storyPoetryId ${user.storyPoetryId}`,
        );
        continue;
      }

      // -------------------------------------------------------
      // Update preview so the admin can still see progress
      // -------------------------------------------------------
      setPreviewIndex(i);

      await new Promise((resolve) => setTimeout(resolve, 100));

      // -------------------------------------------------------
      // Clear previous render
      // -------------------------------------------------------
      renderContainer.innerHTML = "";

      // -------------------------------------------------------
      // Fixed A4 certificate
      //
      // We use 1122 × 793 CSS pixels.
      //
      // 1122 / 793 ≈ 1.415
      //
      // A4 landscape:
      // 297 / 210 ≈ 1.414
      // -------------------------------------------------------
      const certificate = document.createElement("div");

      certificate.style.position = "relative";
      certificate.style.width = "1122px";
      certificate.style.height = "793px";
      certificate.style.background = "#ffffff";
      certificate.style.overflow = "hidden";
      certificate.style.boxSizing = "border-box";
      certificate.style.flexShrink = "0";

      // -------------------------------------------------------
      // Background certificate
      // -------------------------------------------------------
      const background = document.createElement("img");

      background.src = certificateBg;
      background.alt = "Certificate";

      background.style.position = "absolute";
      background.style.left = "0";
      background.style.top = "0";
      background.style.width = "1122px";
      background.style.height = "793px";

      background.style.display = "block";
      background.style.objectFit = "fill";
      background.style.margin = "0";
      background.style.padding = "0";

      certificate.appendChild(background);

      // -------------------------------------------------------
      // Malayalam contributor name
      //
      // IMPORTANT:
      // These are fixed coordinates for the PDF.
      // They do NOT depend on viewport width.
      // -------------------------------------------------------
      const nameWrapper = document.createElement("div");

      nameWrapper.style.position = "absolute";
      nameWrapper.style.left = "0";
      nameWrapper.style.top = "260px"; // ≈ 35%
      nameWrapper.style.width = "1122px";
      nameWrapper.style.height = "80px";

      nameWrapper.style.display = "flex";
      nameWrapper.style.alignItems = "center";
      nameWrapper.style.justifyContent = "center";

      nameWrapper.style.pointerEvents = "none";
      nameWrapper.style.boxSizing = "border-box";

      const name = document.createElement("span");

      name.textContent =
        user.contributorNameMalayalam || "Contributor Name";

      name.style.fontFamily =
        "'Manjari', 'Gayathri', sans-serif";

      name.style.fontSize = "20px";
      name.style.lineHeight = "1.2";
      name.style.fontWeight = "700";

      name.style.color = "#1b3b2b";
      name.style.textAlign = "center";

      name.style.whiteSpace = "nowrap";
      name.style.display = "inline-block";

      nameWrapper.appendChild(name);
      certificate.appendChild(nameWrapper);

      renderContainer.appendChild(certificate);

      // -------------------------------------------------------
      // Wait for background image
      // -------------------------------------------------------
      await new Promise((resolve) => {
        if (background.complete) {
          resolve();
        } else {
          background.onload = resolve;
          background.onerror = resolve;
        }
      });

      // -------------------------------------------------------
      // Make absolutely sure fonts are loaded
      // -------------------------------------------------------
      if (document.fonts?.load) {
        try {
          await document.fonts.load(
            "700 20px Manjari",
          );
        } catch (fontError) {
          console.warn(
            "Manjari font could not be explicitly loaded:",
            fontError,
          );
        }
      }

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // Give browser one paint cycle
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve()),
      );

      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve()),
      );

      // -------------------------------------------------------
      // 5. Capture fixed certificate
      // -------------------------------------------------------
      const canvas = await html2canvas(certificate, {
        scale: 2,

        useCORS: true,
        allowTaint: false,

        backgroundColor: "#ffffff",

        logging: false,

        width: 1122,
        height: 793,

        windowWidth: 1122,
        windowHeight: 793,

        scrollX: 0,
        scrollY: 0,

        imageTimeout: 15000,

        onclone: async (clonedDocument) => {
          if (clonedDocument.fonts?.ready) {
            await clonedDocument.fonts.ready;
          }
        },
      });

      // -------------------------------------------------------
      // 6. Create PDF explicitly as A4 LANDSCAPE
      //
      // Use "l" rather than relying on the object syntax.
      // This avoids orientation issues with different jsPDF versions.
      // -------------------------------------------------------
      const pdf = new jsPDF(
        "l",
        "mm",
        "a4",
      );

      // Get the ACTUAL page dimensions
      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      console.log(
        "PDF page size:",
        pageWidth,
        "x",
        pageHeight,
      );

      // Expected:
      // 297 × 210
      // -------------------------------------------------------

      const imgData = canvas.toDataURL(
        "image/jpeg",
        0.98,
      );

      // -------------------------------------------------------
      // 7. Put certificate EXACTLY over the entire A4 page
      // -------------------------------------------------------
      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST",
      );

      // -------------------------------------------------------
      // 8. Convert PDF to Blob
      // -------------------------------------------------------
      const pdfBlob = pdf.output("blob");

      console.log(
        `Generated certificate PDF for ${user.contributorNameMalayalam}`,
        {
          width: pageWidth,
          height: pageHeight,
          blobSize: pdfBlob.size,
        },
      );

      // -------------------------------------------------------
      // 9. Send PDF to backend
      // -------------------------------------------------------
      await sendCertificatePdf(
        certRecord.certificateId,
        pdfBlob,
        `Certificate-${
          user.contributorNameMalayalam ||
          user.storyPoetryId
        }.pdf`,
      );
    }

    // ---------------------------------------------------------
    // 10. Cleanup
    // ---------------------------------------------------------
    document.body.removeChild(renderContainer);

    alert(
      `Success! Real certificates have been sent to ${selectedUsersData.length} contributor(s).`,
    );

    setIsPreviewOpen(false);
    setSelectedCertificateUsers([]);

    await loadCandidates();
  } catch (err) {
    console.error(
      "Certificate workflow failed:",
      err,
    );

    alert(
      err.message ||
        "Failed to generate and send certificates.",
    );
  } finally {
    setCertificateGenerating(false);
  }
};
  // =========================================================
  // MONTHLY PDF
  // =========================================================
  const handleDownloadMonthlyPDF = async () => {
    if (!selectedMonth) {
      alert("Please select a month.");
      return;
    }

    const monthlySubmissions = submissions.filter((item) =>
      item.createdDate?.startsWith(selectedMonth),
    );

    if (monthlySubmissions.length === 0) {
      alert("No submissions found for the selected month.");
      return;
    }

    try {
      setGeneratingPdf(true);

      const pdf = new jsPDF("p", "mm", "a4");
      const PAGE_WIDTH = 210;
      const PAGE_HEIGHT = 297;
      const MARGIN_TOP = 20;
      const MARGIN_BOTTOM = 20;
      const MARGIN_LEFT = 18;
      const MARGIN_RIGHT = 18;

      const printContainer = document.createElement("div");
      printContainer.style.position = "fixed";
      printContainer.style.left = "-100000px";
      printContainer.style.top = "0";
      printContainer.style.width = "210mm";
      printContainer.style.background = "#ffffff";
      printContainer.style.zIndex = "-9999";
      document.body.appendChild(printContainer);

      const createPage = () => {
        const page = document.createElement("div");
        page.style.width = "210mm";
        page.style.height = "297mm";
        page.style.background = "#ffffff";
        page.style.boxSizing = "border-box";
        page.style.padding = `${MARGIN_TOP}mm ${MARGIN_RIGHT}mm ${MARGIN_BOTTOM}mm ${MARGIN_LEFT}mm`;
        page.style.fontFamily = "'Manjari', sans-serif";
        page.style.color = "#111827";
        page.style.overflow = "hidden";
        return page;
      };

      const waitForImages = async (container) => {
        const images = container.querySelectorAll("img");
        await Promise.all(
          [...images].map(
            (img) =>
              new Promise((resolve) => {
                if (img.complete) {
                  resolve();
                } else {
                  img.onload = resolve;
                  img.onerror = resolve;
                }
              }),
          ),
        );
      };

      const addPageToPDF = async (page, isFirstPage) => {
        printContainer.appendChild(page);
        await waitForImages(page);
        await new Promise((resolve) => setTimeout(resolve, 150));

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          width: page.offsetWidth,
          height: page.offsetHeight,
          windowWidth: page.scrollWidth,
          windowHeight: page.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        if (!isFirstPage) {
          pdf.addPage();
        }

        pdf.addImage(imgData, "JPEG", 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
        printContainer.removeChild(page);
      };

      let pdfPageCount = 0;

      for (
        let submissionIndex = 0;
        submissionIndex < monthlySubmissions.length;
        submissionIndex++
      ) {
        const item = monthlySubmissions[submissionIndex];
        const content = item.content || "";
        const lines = content.split(/\r?\n/);

        let page = createPage();

        const contributorHeader = document.createElement("div");
        contributorHeader.style.display = "flex";
        contributorHeader.style.alignItems = "flex-start";
        contributorHeader.style.gap = "10mm";
        contributorHeader.style.width = "100%";

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
          contributorHeader.appendChild(img);
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
          contributorHeader.appendChild(placeholder);
        }

        const contributorDetails = document.createElement("div");
        contributorDetails.style.paddingTop = "3mm";
        contributorDetails.style.flex = "1";
        contributorDetails.style.lineHeight = "1.6";
        contributorDetails.style.fontFamily = "'Manjari', sans-serif";

        const name = document.createElement("div");
        name.style.fontSize = "18px";
        name.style.fontWeight = "700";
        name.textContent = item.contributorNameMalayalam || "";
        contributorDetails.appendChild(name);

        const location = document.createElement("div");
        location.style.fontSize = "15px";
        location.style.marginTop = "3px";
        location.textContent = `${item.contributorCityMalayalam || ""}${
          item.contributorCityMalayalam && item.contributorDistrictMalayalam
            ? ", "
            : ""
        }${item.contributorDistrictMalayalam || ""}`;
        contributorDetails.appendChild(location);

        if (item.contributorEmail) {
          const email = document.createElement("div");
          email.style.fontFamily = "Arial, sans-serif";
          email.style.fontSize = "14px";
          email.style.marginTop = "4px";
          email.textContent = `mail/${item.contributorEmail}`;
          contributorDetails.appendChild(email);
        }

        contributorHeader.appendChild(contributorDetails);
        page.appendChild(contributorHeader);

        const titleContainer = document.createElement("div");
        titleContainer.style.marginTop = "18mm";
        titleContainer.style.width = "100%";

        const title = document.createElement("h1");
        title.style.fontFamily = "'Manjari', sans-serif";
        title.style.fontSize = "32px";
        title.style.lineHeight = "1.3";
        title.style.fontWeight = "700";
        title.style.margin = "0";
        title.style.color = "#111827";
        title.textContent = item.title || "";
        titleContainer.appendChild(title);
        page.appendChild(titleContainer);

        let contentContainer = document.createElement("div");
        contentContainer.style.marginTop = "14mm";
        contentContainer.style.fontFamily = "'Manjari', sans-serif";
        contentContainer.style.fontSize = "17px";
        contentContainer.style.lineHeight = "2";
        contentContainer.style.color = "#111827";
        contentContainer.style.width = "100%";
        page.appendChild(contentContainer);

        let currentLineIndex = 0;

        while (currentLineIndex < lines.length) {
          const line = lines[currentLineIndex];
          const lineElement = document.createElement("div");
          lineElement.style.whiteSpace = "pre-wrap";
          lineElement.style.minHeight = "34px";
          lineElement.textContent = line || "\u00A0";
          contentContainer.appendChild(lineElement);

          const pageContentBottom =
            MARGIN_TOP +
            contentContainer.offsetTop +
            contentContainer.offsetHeight;
          const maxContentBottom = PAGE_HEIGHT - MARGIN_BOTTOM;

          if (pageContentBottom > maxContentBottom) {
            contentContainer.removeChild(lineElement);

            if (contentContainer.textContent.trim().length > 0) {
              await addPageToPDF(page, pdfPageCount === 0);
              pdfPageCount++;
            }

            page = createPage();

            const continuationTitle = document.createElement("div");
            continuationTitle.style.fontFamily = "'Manjari', sans-serif";
            continuationTitle.style.fontSize = "14px";
            continuationTitle.style.color = "#78716c";
            continuationTitle.style.marginBottom = "8mm";
            continuationTitle.textContent = item.title || "";
            page.appendChild(continuationTitle);

            const newContentContainer = document.createElement("div");
            newContentContainer.style.fontFamily = "'Manjari', sans-serif";
            newContentContainer.style.fontSize = "17px";
            newContentContainer.style.lineHeight = "2";
            newContentContainer.style.color = "#111827";
            newContentContainer.style.width = "100%";
            page.appendChild(newContentContainer);

            contentContainer = newContentContainer;
            continue;
          }

          currentLineIndex++;
        }

        if (
          contentContainer.textContent.trim().length > 0 ||
          lines.length === 0
        ) {
          await addPageToPDF(page, pdfPageCount === 0);
          pdfPageCount++;
        }
      }

      document.body.removeChild(printContainer);

      const [year, month] = selectedMonth.split("-");
      const monthName = new Date(
        Number(year),
        Number(month) - 1,
      ).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });

      pdf.save(`Story-Poetry-${monthName.replace(" ", "-")}.pdf`);
    } catch (err) {
      console.error("Monthly PDF generation failed:", err);
      alert("Failed to generate monthly PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="p-4 md:p-6 mt-5">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Story, Poetry & Special Submissions
        </h1>
        <p className="text-xs md:text-sm text-stone-500 mt-1">
          Issue verified appreciation certificates to eligible contributors.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Certificate Candidate Section */}
      {!loading && submissions.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="px-5 py-5 border-b border-stone-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Award className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Certificate Management
                  </h2>
                  <p className="text-xs text-stone-500 mt-1">
                    Select candidates to render certificates and dispatch emails.
                  </p>
                </div>
              </div>

              
            </div>
          </div>

          <div className="px-5 py-4 border-b border-stone-200 bg-stone-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSelectAllCertificates}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-xs font-bold text-gray-700 cursor-pointer transition"
                >
                  <Check className="h-4 w-4 text-emerald-800" />
                  Select All
                </button>

                {selectedCertificateUsers.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCertificateSelection}
                    className="text-xs font-semibold text-stone-500 hover:text-red-600 cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}

                <span className="text-xs font-semibold text-stone-500">
                  {selectedCertificateUsers.length} selected
                </span>
              </div>

              <div className="relative w-full lg:w-80">
                <input
                  type="text"
                  value={certificateSearch}
                  onChange={(e) => setCertificateSearch(e.target.value)}
                  placeholder="Search contributor..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-gray-900 placeholder:text-stone-400 outline-none focus:border-emerald-900 focus:ring-2 focus:ring-emerald-900/10"
                />
              </div>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {filteredCertificateUsers.length === 0 ? (
              <div className="py-12 text-center">
                <Award className="h-9 w-9 mx-auto text-stone-300 mb-3" />
                <p className="text-sm font-semibold text-gray-700">
                  No certificate candidates found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {filteredCertificateUsers.map((item) => {
                  const selected = isCertificateUserSelected(
                    item.storyPoetryId,
                  );
                  return (
                    <div
                      key={item.storyPoetryId}
                      onClick={() => toggleCertificateUser(item.storyPoetryId)}
                      className={`px-5 py-4 flex items-center justify-between gap-4 cursor-pointer transition ${
                        selected ? "bg-emerald-50" : "hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                            selected
                              ? "bg-emerald-800 border-emerald-800"
                              : "bg-white border-stone-300"
                          }`}
                        >
                          {selected && (
                            <Check className="h-3.5 w-3.5 text-white" />
                          )}
                        </div>

                        {item.contributorProfileImageUrl ? (
                          <img
                            src={item.contributorProfileImageUrl}
                            alt={item.contributorNameMalayalam}
                            className="w-11 h-11 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                            <UserCircle className="h-6 w-6 text-stone-400" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">
                            {item.contributorNameMalayalam || "-"}
                          </p>
                          <p className="text-xs text-stone-500 truncate">
                            {item.contributorEmail || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:block text-right shrink-0">
                        <p className="text-xs font-semibold text-gray-700">
                          {item.title || "-"}
                        </p>
                        <span
                          className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${getTypeStyle(
                            item.type,
                          )}`}
                        >
                          {item.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-5 py-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-stone-500">
              Only candidates without certificates are listed above.
            </p>

            <button
              type="button"
              disabled={
                selectedCertificateUsers.length === 0 || certificateGenerating
              }
              onClick={handleOpenPreview}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b3b2b] hover:bg-emerald-950 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-sm font-bold cursor-pointer transition-colors"
            >
              <Eye className="h-4 w-4" />
              Preview & Generate Certificates ({selectedCertificateUsers.length})
            </button>
          </div>
        </div>
      )}

      

      {/* 1 / N Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-2 sm:p-6">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 border-b border-stone-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Award className="h-5 w-5 text-amber-600" />
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Certificate Preview ({previewIndex + 1} / {selectedUsersData.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 hover:bg-stone-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Center Body */}
            <div className="p-3 sm:p-6 bg-stone-100 flex-1 overflow-y-auto flex flex-col items-center justify-center">
              
              {/* Outer Centering Box */}
              <div className="w-full flex items-center justify-center overflow-hidden py-1">
                
                {/* Responsive Viewport Fitting Wrapper */}
                <div className="w-full max-w-[800px] flex items-center justify-center">
                  <div
                    className="w-full relative shadow-xl rounded-sm select-none overflow-hidden bg-white shrink-0"
                    style={{
                      aspectRatio: "800 / 565",
                      maxWidth: "800px",
                    }}
                  >
                    {/* Native Target for html2canvas & Preview */}
                    <div
                      ref={certRef}
                      className="w-full h-full relative"
                      style={{
                        boxSizing: "border-box",
                      }}
                    >
                      <img
                        src={certificateBg}
                        alt="Certificate Template"
                        className="w-full h-full object-fill block pointer-events-none"
                      />

                      {/* Malayalam Name (Exact 210px / 37.1% placement) */}
                      <div
                        className="absolute inset-x-0 flex items-center justify-center pointer-events-none"
                        style={{
                          top: "35%",
                          height: "10%",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Manjari', 'Gayathri', sans-serif",
                            fontSize: "clamp(11px, 2.5vw, 20px)",
                            lineHeight: "1.2",
                          }}
                          className="font-bold text-[#1b3b2b] tracking-normal text-center px-4 md:px-8 inline-block"
                        >
                          {currentPreviewUser.contributorNameMalayalam || "Contributor Name"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Carousel Controls */}
              <div className="flex items-center gap-4 mt-3 sm:mt-5 shrink-0">
                <button
                  type="button"
                  disabled={previewIndex === 0}
                  onClick={() => setPreviewIndex((prev) => prev - 1)}
                  className="p-2 rounded-full bg-white border border-stone-300 disabled:opacity-40 hover:bg-stone-50 cursor-pointer shadow-sm transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-stone-600">
                  {previewIndex + 1} of {selectedUsersData.length}
                </span>
                <button
                  type="button"
                  disabled={previewIndex === selectedUsersData.length - 1}
                  onClick={() => setPreviewIndex((prev) => prev + 1)}
                  className="p-2 rounded-full bg-white border border-stone-300 disabled:opacity-40 hover:bg-stone-50 cursor-pointer shadow-sm transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3.5 border-t border-stone-200 flex justify-between items-center bg-white shrink-0">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors"
              >
                Close Preview
              </button>

              <button
                type="button"
                disabled={certificateGenerating}
                onClick={handleConfirmAndSend}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#1b3b2b] hover:bg-emerald-950 disabled:bg-stone-300 text-white text-xs font-bold cursor-pointer transition-colors"
              >
                {certificateGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating & Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Confirm & Send to Contributors
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
