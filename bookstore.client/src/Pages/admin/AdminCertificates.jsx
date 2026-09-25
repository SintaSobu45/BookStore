import React, { useEffect, useState, useRef } from "react";
import {
  BookOpen,
  Leaf,
  Eye,
  Loader2,
  X,
  UserCircle,
  Download,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import certificateBg from "../../assets/certificate.jpg";

import {
  getCertificateCandidates,
  getEventCertificates,
  bulkGenerateCertificates,
  sendCertificatePdf,
} from "../../services/certificateService";

import { getEvents } from "../../services/eventService";

export default function AdminCertificate() {
  // =========================================================
  // GENERAL STATES
  // =========================================================

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // EVENT STATES
  // =========================================================

  const [events, setEvents] = useState([]);

  const [selectedEventId, setSelectedEventId] = useState("");

  const [eventCertificates, setEventCertificates] = useState([]);

  const [eventCertificatesLoading, setEventCertificatesLoading] =
    useState(false);

  const [eventCertificatesError, setEventCertificatesError] = useState("");

  // =========================================================
  // MAIL CERTIFICATE STATES
  // =========================================================

  const [selectedCertificateUsers, setSelectedCertificateUsers] =
    useState([]);

  const [certificateSearch, setCertificateSearch] = useState("");

  const [certificateGenerating, setCertificateGenerating] = useState(false);

  // =========================================================
  // PREVIEW STATES
  // =========================================================

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [previewIndex, setPreviewIndex] = useState(0);

  const certRef = useRef(null);

  // =========================================================
  // PRINT / DOWNLOAD STATES
  // =========================================================

  const [printingCertificateId, setPrintingCertificateId] = useState(null);

  const [selectedEventCertificateIds, setSelectedEventCertificateIds] =
    useState([]);

  const [printingAllCertificates, setPrintingAllCertificates] =
    useState(false);

  // =========================================================
  // LOAD ALL EVENTS
  // =========================================================

  const loadEvents = async () => {
    try {
      const data = await getEvents();

      const eventList = Array.isArray(data) ? data : [];

      console.log("📅 EVENTS:", eventList);

      setEvents(eventList);

      return eventList;
    } catch (err) {
      console.error("❌ Failed to load events:", err);

      setEvents([]);

      return [];
    }
  };

  // =========================================================
  // LOAD MAIL CANDIDATES
  //
  // IMPORTANT:
  //
  // Backend now requires eventId for /candidates.
  //
  // To keep the MAIL section unfiltered in the UI,
  // we request candidates for every event and merge them.
  // =========================================================

  const loadCandidates = async (eventList = events) => {
    try {
      setLoading(true);
      setError("");

      if (!Array.isArray(eventList) || eventList.length === 0) {
        console.warn("⚠️ No events available for candidate loading.");

        setSubmissions([]);

        return;
      }

      const candidateMap = new Map();

      for (const event of eventList) {
        const eventId = event?.eventId;

        if (!eventId) {
          continue;
        }

        try {
          console.log(
            `🔎 Loading certificate candidates for event ${eventId}`,
          );

          const data = await getCertificateCandidates(eventId);

          console.log(`📋 Candidates for event ${eventId}:`, data);

          if (!Array.isArray(data)) {
            continue;
          }

          data.forEach((candidate) => {
            if (!candidate?.storyPoetryId) {
              return;
            }

            const existing = candidateMap.get(candidate.storyPoetryId);

            if (!existing) {
              candidateMap.set(candidate.storyPoetryId, candidate);
            } else {
              // Keep submission number if another event response
              // contains it.
              if (
                !existing.submissionNumber &&
                candidate.submissionNumber
              ) {
                existing.submissionNumber = candidate.submissionNumber;
              }
            }
          });
        } catch (eventError) {
          console.error(
            `❌ Failed to load candidates for event ${eventId}:`,
            eventError,
          );
        }
      }

      const mergedCandidates = Array.from(candidateMap.values());

      console.log(
        "✅ MERGED MAIL CERTIFICATE CANDIDATES:",
        mergedCandidates,
      );

      mergedCandidates.forEach((candidate) => {
        console.log("📌 Candidate submission number:", {
          storyPoetryId: candidate.storyPoetryId,
          contributor: candidate.contributorNameMalayalam,
          submissionNumber: candidate.submissionNumber,
        });
      });

      setSubmissions(mergedCandidates);
    } catch (err) {
      console.error("❌ Failed to load certificate candidates:", err);

      setError(
        err?.message || "Failed to load certificate candidates.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const initialize = async () => {
      const eventList = await loadEvents();

      await loadCandidates(eventList);
    };

    initialize();
  }, []);

  // =========================================================
  // LOAD EXISTING CERTIFICATES FOR SELECTED EVENT
  //
  // ONLY PRINT/DOWNLOAD SECTION USES THIS.
  // =========================================================

  const handleEventChange = async (eventId) => {
    setSelectedEventId(eventId);

    setEventCertificates([]);

    setEventCertificatesError("");

    setSelectedEventCertificateIds([]);

    if (!eventId) {
      return;
    }

    try {
      setEventCertificatesLoading(true);

      console.log(
        "🖨️ Loading existing certificates for event:",
        eventId,
      );

      const data = await getEventCertificates(eventId);

      console.log(
        "🖨️ EXISTING EVENT CERTIFICATES:",
        data,
      );

      if (Array.isArray(data)) {
        data.forEach((certificate) => {
          console.log("📜 Existing certificate:", {
            certificateId: certificate.certificateId,
            storyPoetryId: certificate.storyPoetryId,
            recipientName: certificate.recipientName,
            submissionNumber: certificate.submissionNumber,
          });
        });
      }

      setEventCertificates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "❌ Failed to load event certificates:",
        err,
      );

      setEventCertificatesError(
        err?.message || "Failed to load event certificates.",
      );
    } finally {
      setEventCertificatesLoading(false);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
  // MAIL CERTIFICATE SEARCH
  //
  // NO EVENT FILTER HERE.
  // =========================================================

  const filteredCertificateUsers = submissions.filter((item) => {
    const search = certificateSearch.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      item.contributorNameMalayalam
        ?.toLowerCase()
        .includes(search) ||
      item.title?.toLowerCase().includes(search) ||
      item.contributorEmail
        ?.toLowerCase()
        .includes(search) ||
      item.submissionNumber
        ?.toLowerCase()
        .includes(search)
    );
  });

  // =========================================================
  // MAIL SELECTION
  // =========================================================

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

    const allSelected =
      filteredIds.length > 0 &&
      filteredIds.every((id) =>
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

  const currentPreviewUser =
    selectedUsersData[previewIndex] || {};

  // =========================================================
  // PREVIEW
  // =========================================================

  const handleOpenPreview = () => {
    if (selectedCertificateUsers.length === 0) {
      alert("Please select at least one contributor.");
      return;
    }

    setPreviewIndex(0);

    setIsPreviewOpen(true);
  };

  // =========================================================
  // GET SUBMISSION NUMBER
  //
  // For MAIL flow:
  // candidate.submissionNumber
  //
  // For PRINT flow:
  // certificate.submissionNumber
  // =========================================================

  const getSubmissionNumber = (data) => {
    const submissionNumber =
      data?.submissionNumber ||
      data?.SubmissionNumber ||
      "";

    console.log("🔢 Submission number lookup:", {
      storyPoetryId: data?.storyPoetryId,
      certificateId: data?.certificateId,
      submissionNumber,
    });

    return submissionNumber;
  };

  // =========================================================
  // CREATE CERTIFICATE DOM
  //
  // THIS IS THE IMPORTANT PART.
  //
  // The same coordinates are used for:
  //
  // 1. Mail PDF
  // 2. Admin print
  // 3. Admin download
  //
  // Submission number is directly below the logo area.
  // =========================================================

  const createCertificateElement = ({
    recipientName,
    submissionNumber,
  }) => {
    const certificate = document.createElement("div");

    certificate.style.position = "relative";
    certificate.style.width = "1122px";
    certificate.style.height = "793px";
    certificate.style.background = "#ffffff";
    certificate.style.overflow = "hidden";
    certificate.style.boxSizing = "border-box";
    certificate.style.flexShrink = "0";

    // =======================================================
    // BACKGROUND
    // =======================================================

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

    // =======================================================
    // SUBMISSION NUMBER
    //
    // SAME POSITION FOR MAIL + PRINT + DOWNLOAD
    //
    // Adjust ONLY top if you want to move it vertically.
    // =======================================================

    const submissionWrapper =
      document.createElement("div");

    submissionWrapper.style.position = "absolute";

    submissionWrapper.style.left = "0";

    // This is below the Old Library logo.
    submissionWrapper.style.top = "205px";

    submissionWrapper.style.width = "1122px";

    submissionWrapper.style.height = "35px";

    submissionWrapper.style.display = "flex";

    submissionWrapper.style.alignItems = "center";

    submissionWrapper.style.justifyContent = "center";

    submissionWrapper.style.pointerEvents = "none";

    submissionWrapper.style.boxSizing = "border-box";

    const submissionText =
      document.createElement("span");

    const finalSubmissionNumber =
      submissionNumber || "";

    submissionText.textContent = finalSubmissionNumber
      ? `Submission No: ${finalSubmissionNumber}`
      : "";

    console.log(
      "🧾 Rendering submission number:",
      finalSubmissionNumber,
    );

    submissionText.style.fontFamily =
      "'Manjari', 'Gayathri', sans-serif";

    submissionText.style.fontSize = "14px";

    submissionText.style.lineHeight = "1.2";

    submissionText.style.fontWeight = "600";

    submissionText.style.color = "#1b3b2b";

    submissionText.style.textAlign = "center";

    submissionText.style.whiteSpace = "nowrap";

    submissionText.style.display = "inline-block";

    submissionWrapper.appendChild(submissionText);

    certificate.appendChild(submissionWrapper);

    // =======================================================
    // RECIPIENT NAME
    // =======================================================

    const nameWrapper = document.createElement("div");

    nameWrapper.style.position = "absolute";

    nameWrapper.style.left = "0";

    nameWrapper.style.top = "260px";

    nameWrapper.style.width = "1122px";

    nameWrapper.style.height = "80px";

    nameWrapper.style.display = "flex";

    nameWrapper.style.alignItems = "center";

    nameWrapper.style.justifyContent = "center";

    nameWrapper.style.pointerEvents = "none";

    nameWrapper.style.boxSizing = "border-box";

    const name = document.createElement("span");

    name.textContent =
      recipientName || "Contributor Name";

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

    return {
      certificate,
      background,
    };
  };

  // =========================================================
  // WAIT FOR IMAGES
  // =========================================================

  const waitForImage = async (image) => {
    await new Promise((resolve) => {
      if (image.complete) {
        resolve();
        return;
      }

      image.onload = resolve;

      image.onerror = resolve;
    });
  };

  // =========================================================
  // WAIT FOR FONTS
  // =========================================================

  const waitForCertificateFonts = async () => {
    if (document.fonts?.load) {
      try {
        await document.fonts.load(
          "600 14px Manjari",
        );

        await document.fonts.load(
          "700 20px Manjari",
        );
      } catch (error) {
        console.warn(
          "⚠️ Manjari font could not be explicitly loaded:",
          error,
        );
      }
    }

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  };

  // =========================================================
  // RENDER CERTIFICATE TO CANVAS
  // =========================================================

  const renderCertificateToCanvas = async ({
    recipientName,
    submissionNumber,
  }) => {
    console.log(
      "🎨 Rendering certificate:",
      {
        recipientName,
        submissionNumber,
      },
    );

    const certificateContainer =
      document.createElement("div");

    certificateContainer.style.position = "fixed";

    certificateContainer.style.left = "-100000px";

    certificateContainer.style.top = "0";

    certificateContainer.style.width = "1122px";

    certificateContainer.style.height = "793px";

    certificateContainer.style.background = "#ffffff";

    certificateContainer.style.overflow = "hidden";

    certificateContainer.style.margin = "0";

    certificateContainer.style.padding = "0";

    certificateContainer.style.boxSizing = "border-box";

    document.body.appendChild(
      certificateContainer,
    );

    try {
      const {
        certificate,
        background,
      } = createCertificateElement({
        recipientName,
        submissionNumber,
      });

      certificateContainer.appendChild(
        certificate,
      );

      await waitForImage(background);

      await waitForCertificateFonts();

      await new Promise((resolve) =>
        requestAnimationFrame(resolve),
      );

      await new Promise((resolve) =>
        requestAnimationFrame(resolve),
      );

      const canvas = await html2canvas(
        certificate,
        {
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

          onclone: async (
            clonedDocument,
          ) => {
            if (
              clonedDocument.fonts?.ready
            ) {
              await clonedDocument.fonts.ready;
            }
          },
        },
      );

      return canvas;
    } finally {
      if (
        certificateContainer.parentNode
      ) {
        document.body.removeChild(
          certificateContainer,
        );
      }
    }
  };

  // =========================================================
  // CREATE PDF
  // =========================================================

  const createCertificatePDF = async ({
    recipientName,
    submissionNumber,
  }) => {
    const canvas =
      await renderCertificateToCanvas({
        recipientName,
        submissionNumber,
      });

    const pdf = new jsPDF(
      "l",
      "mm",
      "a4",
    );

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const imgData =
      canvas.toDataURL(
        "image/jpeg",
        0.98,
      );

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

    return pdf;
  };

  // =========================================================
  // CONFIRM + GENERATE + SEND EMAIL
  //
  // THIS SECTION DOES NOT USE EVENT FILTERING.
  // =========================================================

  const handleConfirmAndSend = async () => {
    if (
      selectedCertificateUsers.length === 0
    ) {
      return;
    }

    try {
      setCertificateGenerating(true);

      console.log(
        "🚀 Starting MAIL certificate workflow",
      );

      console.log(
        "👥 Selected users:",
        selectedUsersData,
      );

      // =======================================================
      // 1. GENERATE BACKEND CERTIFICATE RECORDS
      // =======================================================

      const generatedRecords =
        await bulkGenerateCertificates(
          selectedCertificateUsers,
        );

      console.log(
        "✅ Generated certificate records:",
        generatedRecords,
      );

      if (!Array.isArray(generatedRecords)) {
        throw new Error(
          "Invalid certificate response from backend.",
        );
      }

      // =======================================================
      // 2. GENERATE EACH PDF + SEND
      // =======================================================

      for (
        let i = 0;
        i < selectedUsersData.length;
        i++
      ) {
        const user =
          selectedUsersData[i];

        const certRecord =
          generatedRecords.find(
            (c) =>
              c.storyPoetryId ===
              user.storyPoetryId,
          );

        if (
          !certRecord ||
          !certRecord.certificateId
        ) {
          console.warn(
            "⚠️ No generated certificate record:",
            user,
          );

          continue;
        }

        // =====================================================
        // USE BACKEND CERTIFICATE SUBMISSION NUMBER FIRST
        // =====================================================

        const submissionNumber =
          getSubmissionNumber(
            certRecord,
          ) ||
          getSubmissionNumber(user);

        console.log(
          "📨 MAIL CERTIFICATE DATA:",
          {
            certificateId:
              certRecord.certificateId,

            storyPoetryId:
              certRecord.storyPoetryId,

            recipientName:
              certRecord.recipientName ||
              user.contributorNameMalayalam,

            certificateSubmissionNumber:
              certRecord.submissionNumber,

            candidateSubmissionNumber:
              user.submissionNumber,

            finalSubmissionNumber:
              submissionNumber,
          },
        );

        setPreviewIndex(i);

        const pdf =
          await createCertificatePDF({
            recipientName:
              certRecord.recipientName ||
              user.contributorNameMalayalam,

            submissionNumber,
          });

        const pdfBlob =
          pdf.output("blob");

        console.log(
          "📦 PDF created:",
          {
            certificateId:
              certRecord.certificateId,

            submissionNumber,

            blobSize:
              pdfBlob.size,
          },
        );

        await sendCertificatePdf(
          certRecord.certificateId,
          pdfBlob,
          `Certificate-${
            user.contributorNameMalayalam ||
            user.storyPoetryId
          }.pdf`,
        );

        console.log(
          "✅ Certificate sent:",
          {
            certificateId:
              certRecord.certificateId,

            submissionNumber,
          },
        );
      }

      alert(
        `Success! Certificates have been sent to ${selectedUsersData.length} contributor(s).`,
      );

      setIsPreviewOpen(false);

      setSelectedCertificateUsers([]);

      await loadCandidates(events);
    } catch (err) {
      console.error(
        "❌ Certificate mail workflow failed:",
        err,
      );

      alert(
        err?.message ||
          "Failed to generate and send certificates.",
      );
    } finally {
      setCertificateGenerating(false);
    }
  };

  // =========================================================
  // PRINT EXISTING CERTIFICATE
  //
  // ONLY EXISTING CERTIFICATES FROM SELECTED EVENT.
  // =========================================================

  const handlePrintExistingCertificate =
    async (certificate) => {
      if (
        !certificate?.certificateId
      ) {
        alert("Invalid certificate.");

        return;
      }

      try {
        setPrintingCertificateId(
          certificate.certificateId,
        );

        const submissionNumber =
          getSubmissionNumber(
            certificate,
          );

        console.log(
          "🖨️ PRINT CERTIFICATE:",
          {
            certificateId:
              certificate.certificateId,

            storyPoetryId:
              certificate.storyPoetryId,

            recipientName:
              certificate.recipientName,

            submissionNumber:
              certificate.submissionNumber,

            finalSubmissionNumber:
              submissionNumber,
          },
        );

        const pdf =
          await createCertificatePDF({
            recipientName:
              certificate.recipientName,

            submissionNumber,
          });

        const pdfBlob =
          pdf.output("blob");

        console.log(
          "🖨️ PRINT PDF CREATED:",
          {
            certificateId:
              certificate.certificateId,

            submissionNumber,

            blobSize:
              pdfBlob.size,
          },
        );

        const pdfUrl =
          URL.createObjectURL(
            pdfBlob,
          );

        const printWindow =
          window.open(
            pdfUrl,
            "_blank",
          );

        if (!printWindow) {
          console.warn(
            "⚠️ Popup blocked. Downloading instead.",
          );

          pdf.save(
            `Certificate-${
              certificate.certificateNumber ||
              certificate.certificateId
            }.pdf`,
          );
        }
      } catch (err) {
        console.error(
          "❌ Failed to print certificate:",
          err,
        );

        alert(
          err?.message ||
            "Failed to print certificate.",
        );
      } finally {
        setPrintingCertificateId(
          null,
        );
      }
    };

  // =========================================================
  // DOWNLOAD EXISTING CERTIFICATE
  // =========================================================

  const generateAndDownloadExistingCertificatePDF =
    async (certificate) => {
      if (
        !certificate?.certificateId
      ) {
        throw new Error(
          "Invalid certificate.",
        );
      }

      const submissionNumber =
        getSubmissionNumber(
          certificate,
        );

      console.log(
        "⬇️ DOWNLOAD CERTIFICATE:",
        {
          certificateId:
            certificate.certificateId,

          storyPoetryId:
            certificate.storyPoetryId,

          recipientName:
            certificate.recipientName,

          submissionNumber:
            certificate.submissionNumber,

          finalSubmissionNumber:
            submissionNumber,
        },
      );

      const pdf =
        await createCertificatePDF({
          recipientName:
            certificate.recipientName,

          submissionNumber,
        });

      const fileName =
        `Certificate-${
          certificate.certificateNumber ||
          certificate.certificateId
        }.pdf`;

      console.log(
        "⬇️ Downloading:",
        {
          fileName,
          submissionNumber,
        },
      );

      pdf.save(fileName);
    };

  // =========================================================
  // SELECT EVENT CERTIFICATE
  // =========================================================

  const toggleEventCertificateSelection =
    (certificateId) => {
      setSelectedEventCertificateIds(
        (prev) => {
          if (
            prev.includes(certificateId)
          ) {
            return prev.filter(
              (id) =>
                id !== certificateId,
            );
          }

          return [
            ...prev,
            certificateId,
          ];
        },
      );
    };

  // =========================================================
  // SELECT ALL EVENT CERTIFICATES
  // =========================================================

  const handleSelectAllEventCertificates =
    () => {
      const allIds =
        eventCertificates.map(
          (certificate) =>
            certificate.certificateId,
        );

      const allSelected =
        allIds.length > 0 &&
        allIds.every((id) =>
          selectedEventCertificateIds.includes(
            id,
          ),
        );

      if (allSelected) {
        setSelectedEventCertificateIds(
          [],
        );
      } else {
        setSelectedEventCertificateIds(
          allIds,
        );
      }
    };

  const clearEventCertificateSelection =
    () => {
      setSelectedEventCertificateIds(
        [],
      );
    };

  const allEventCertificatesSelected =
    eventCertificates.length > 0 &&
    eventCertificates.every(
      (certificate) =>
        selectedEventCertificateIds.includes(
          certificate.certificateId,
        ),
    );

  // =========================================================
  // DOWNLOAD SELECTED EVENT CERTIFICATES
  // =========================================================

  const handleDownloadSelectedCertificates =
    async () => {
      if (
        selectedEventCertificateIds.length ===
        0
      ) {
        alert(
          "Please select at least one certificate.",
        );

        return;
      }

      try {
        setPrintingAllCertificates(
          true,
        );

        const selectedCertificates =
          eventCertificates.filter(
            (certificate) =>
              selectedEventCertificateIds.includes(
                certificate.certificateId,
              ),
          );

        console.log(
          "⬇️ SELECTED EVENT CERTIFICATES:",
          selectedCertificates,
        );

        for (
          let i = 0;
          i < selectedCertificates.length;
          i++
        ) {
          const certificate =
            selectedCertificates[i];

          console.log(
            `⬇️ Downloading ${i + 1}/${selectedCertificates.length}`,
          );

          await generateAndDownloadExistingCertificatePDF(
            certificate,
          );

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                300,
              ),
          );
        }

        alert(
          `${selectedCertificates.length} certificate${
            selectedCertificates.length >
            1
              ? "s"
              : ""
          } downloaded successfully.`,
        );

        setSelectedEventCertificateIds(
          [],
        );
      } catch (error) {
        console.error(
          "❌ Failed to download selected certificates:",
          error,
        );

        alert(
          error?.message ||
            "Failed to download selected certificates.",
        );
      } finally {
        setPrintingAllCertificates(
          false,
        );
      }
    };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="p-4 md:p-6 mt-5">

      {/* =======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">
          Story, Poetry & Special Submissions
        </h1>

        <p className="text-xs md:text-sm text-stone-500 mt-1">
          Manage contributor certificates.
        </p>
      </div>

      {/* =======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* =======================================================
          SECTION 1
          MAIL CERTIFICATES
          
          NO EVENT FILTER
      ======================================================= */}

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm mb-6 overflow-hidden">

        <div className="px-5 py-5 border-b border-stone-200">

          <div className="flex items-start gap-3">

            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5 text-amber-700" />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Certificate Management
              </h2>

              <p className="text-xs text-stone-500 mt-1">
                Select contributors and send their certificates by email.
              </p>
            </div>

          </div>

        </div>

        {/* SEARCH + SELECT */}

        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={
                  handleSelectAllCertificates
                }
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-xs font-bold text-gray-700 cursor-pointer transition"
              >
                <Check className="h-4 w-4 text-emerald-800" />

                Select All
              </button>

              {selectedCertificateUsers.length >
                0 && (
                <button
                  type="button"
                  onClick={
                    clearCertificateSelection
                  }
                  className="text-xs font-semibold text-stone-500 hover:text-red-600"
                >
                  Clear Selection
                </button>
              )}

              <span className="text-xs font-semibold text-stone-500">
                {selectedCertificateUsers.length}{" "}
                selected
              </span>

            </div>

            <div className="relative w-full lg:w-80">

              <input
                type="text"
                value={certificateSearch}
                onChange={(e) =>
                  setCertificateSearch(
                    e.target.value,
                  )
                }
                placeholder="Search contributor..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-gray-900 placeholder:text-stone-400 outline-none focus:border-emerald-900 focus:ring-2 focus:ring-emerald-900/10"
              />

            </div>

          </div>

        </div>

        {/* CANDIDATES */}

        <div className="max-h-[420px] overflow-y-auto">

          {loading ? (
            <div className="py-12 text-center">

              <Loader2 className="h-7 w-7 mx-auto text-emerald-800 animate-spin mb-3" />

              <p className="text-sm font-semibold text-gray-700">
                Loading certificate candidates...
              </p>

            </div>
          ) : filteredCertificateUsers.length ===
            0 ? (
            <div className="py-12 text-center">

              <Award className="h-9 w-9 mx-auto text-stone-300 mb-3" />

              <p className="text-sm font-semibold text-gray-700">
                No certificate candidates found
              </p>

            </div>
          ) : (
            <div className="divide-y divide-stone-100">

              {filteredCertificateUsers.map(
                (item) => {
                  const selected =
                    isCertificateUserSelected(
                      item.storyPoetryId,
                    );

                  return (
                    <div
                      key={
                        item.storyPoetryId
                      }
                      onClick={() =>
                        toggleCertificateUser(
                          item.storyPoetryId,
                        )
                      }
                      className={`px-5 py-4 flex items-center justify-between gap-4 cursor-pointer transition ${
                        selected
                          ? "bg-emerald-50"
                          : "hover:bg-stone-50"
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
                            src={
                              item.contributorProfileImageUrl
                            }
                            alt={
                              item.contributorNameMalayalam
                            }
                            className="w-11 h-11 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                            <UserCircle className="h-6 w-6 text-stone-400" />
                          </div>
                        )}

                        <div className="min-w-0">

                          <p className="font-bold text-gray-900 truncate">
                            {item.contributorNameMalayalam ||
                              "-"}
                          </p>

                          <p className="text-xs text-stone-500 truncate">
                            {item.contributorEmail ||
                              "-"}
                          </p>

                          <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                            Submission No:{" "}
                            {item.submissionNumber ||
                              "-"}
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
                },
              )}

            </div>
          )}

        </div>

        {/* FOOTER */}

        <div className="px-5 py-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <p className="text-xs text-stone-500">
            Candidates are loaded across available events. No event filter is applied to this mail section.
          </p>

          <button
            type="button"
            disabled={
              selectedCertificateUsers.length ===
                0 ||
              certificateGenerating
            }
            onClick={
              handleOpenPreview
            }
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b3b2b] hover:bg-emerald-950 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-sm font-bold cursor-pointer transition-colors"
          >
            <Eye className="h-4 w-4" />

            Preview & Generate Certificates (
            {selectedCertificateUsers.length}
            )
          </button>

        </div>

      </div>

      {/* =======================================================
          SECTION 2
          ADMIN PRINT / DOWNLOAD
          
          EVENT FILTER
      ======================================================= */}

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm mb-6 overflow-hidden">

        <div className="px-5 py-5 border-b border-stone-200">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-start gap-3">

              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <Download className="h-5 w-5 text-emerald-700" />
              </div>

              <div>

                <h2 className="text-base font-bold text-gray-900">
                  Admin Print / Download
                </h2>

                <p className="text-xs text-stone-500 mt-1">
                  Select an event to print or download already-generated certificates.
                </p>

              </div>

            </div>

            <div className="w-full lg:w-80">

              <select
                value={selectedEventId}
                onChange={(e) =>
                  handleEventChange(
                    e.target.value,
                  )
                }
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-gray-900 outline-none focus:border-emerald-900 focus:ring-2 focus:ring-emerald-900/10"
              >

                <option value="">
                  Select Event
                </option>

                {events.map((event) => (
                  <option
                    key={event.eventId}
                    value={event.eventId}
                  >
                    {event.name ||
                      event.eventName}
                  </option>
                ))}

              </select>

            </div>

          </div>

        </div>

        {!selectedEventId && (
          <div className="px-5 py-12 text-center">

            <Award className="h-9 w-9 mx-auto text-stone-300 mb-3" />

            <p className="text-sm font-semibold text-gray-700">
              Select an event to view certificates
            </p>

          </div>
        )}

        {selectedEventId &&
          eventCertificatesLoading && (
            <div className="px-5 py-12 text-center">

              <Loader2 className="h-7 w-7 mx-auto text-emerald-800 animate-spin mb-3" />

              <p className="text-sm font-semibold text-gray-700">
                Loading event certificates...
              </p>

            </div>
          )}

        {selectedEventId &&
          !eventCertificatesLoading &&
          eventCertificatesError && (
            <div className="px-5 py-8 text-center">

              <p className="text-sm font-semibold text-red-600">
                {eventCertificatesError}
              </p>

            </div>
          )}

        {selectedEventId &&
          !eventCertificatesLoading &&
          !eventCertificatesError &&
          eventCertificates.length === 0 && (
            <div className="px-5 py-12 text-center">

              <Award className="h-9 w-9 mx-auto text-stone-300 mb-3" />

              <p className="text-sm font-semibold text-gray-700">
                No certificates available for this event.
              </p>

            </div>
          )}

        {selectedEventId &&
          !eventCertificatesLoading &&
          !eventCertificatesError &&
          eventCertificates.length > 0 && (
            <>
              {/* SELECT CONTROLS */}

              <div className="px-5 py-4 border-b border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div className="flex items-center gap-3">

                  <button
                    type="button"
                    onClick={
                      handleSelectAllEventCertificates
                    }
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-xs font-bold text-gray-700"
                  >
                    <Check className="h-4 w-4 text-emerald-800" />

                    {allEventCertificatesSelected
                      ? "Clear All"
                      : "Select All"}
                  </button>

                  {selectedEventCertificateIds.length >
                    0 && (
                    <button
                      type="button"
                      onClick={
                        clearEventCertificateSelection
                      }
                      className="text-xs font-semibold text-stone-500 hover:text-red-600"
                    >
                      Clear Selection
                    </button>
                  )}

                  <span className="text-xs font-semibold text-stone-500">
                    {
                      selectedEventCertificateIds.length
                    }{" "}
                    selected
                  </span>

                </div>

                <button
                  type="button"
                  disabled={
                    selectedEventCertificateIds.length ===
                      0 ||
                    printingAllCertificates
                  }
                  onClick={
                    handleDownloadSelectedCertificates
                  }
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1b3b2b] hover:bg-emerald-950 disabled:bg-stone-300 text-white text-xs font-bold"
                >

                  {printingAllCertificates ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />

                      Download Selected
                    </>
                  )}

                </button>

              </div>

              {/* CERTIFICATE TABLE */}

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-stone-50 border-b border-stone-200">

                    <tr>

                      <th className="px-5 py-3 text-left text-xs font-bold text-stone-500 uppercase">
                        Select
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold text-stone-500 uppercase">
                        Name
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold text-stone-500 uppercase">
                        Submission No
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold text-stone-500 uppercase">
                        Certificate No
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-bold text-stone-500 uppercase">
                        Issued Date
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-bold text-stone-500 uppercase">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-stone-100">

                    {eventCertificates.map(
                      (certificate) => {

                        const selected =
                          selectedEventCertificateIds.includes(
                            certificate.certificateId,
                          );

                        return (
                          <tr
                            key={
                              certificate.certificateId
                            }
                            className="hover:bg-stone-50"
                          >

                            <td className="px-5 py-4">

                              <button
                                type="button"
                                onClick={() =>
                                  toggleEventCertificateSelection(
                                    certificate.certificateId,
                                  )
                                }
                                className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                  selected
                                    ? "bg-emerald-800 border-emerald-800"
                                    : "bg-white border-stone-300"
                                }`}
                              >
                                {selected && (
                                  <Check className="h-3.5 w-3.5 text-white" />
                                )}
                              </button>

                            </td>

                            <td className="px-5 py-4">

                              <p className="font-bold text-gray-900">
                                {certificate.recipientName ||
                                  "-"}
                              </p>

                            </td>

                            <td className="px-5 py-4">

                              <span className="font-mono text-xs text-emerald-800 font-semibold">
                                {certificate.submissionNumber ||
                                  "-"}
                              </span>

                            </td>

                            <td className="px-5 py-4">

                              <span className="font-mono text-xs text-stone-700">
                                {certificate.certificateNumber ||
                                  "-"}
                              </span>

                            </td>

                            <td className="px-5 py-4 text-stone-600">

                              {formatDate(
                                certificate.issuedDate,
                              )}

                            </td>

                            <td className="px-5 py-4">

                              <div className="flex justify-end gap-2">

                                <button
                                  type="button"
                                  disabled={
                                    printingCertificateId ===
                                    certificate.certificateId
                                  }
                                  onClick={() =>
                                    handlePrintExistingCertificate(
                                      certificate,
                                    )
                                  }
                                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1b3b2b] hover:bg-emerald-950 disabled:bg-stone-300 text-white text-xs font-bold"
                                >

                                  {printingCertificateId ===
                                  certificate.certificateId ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />

                                      Preparing...
                                    </>
                                  ) : (
                                    <>
                                      <Download className="h-4 w-4" />

                                      Print
                                    </>
                                  )}

                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      },
                    )}

                  </tbody>

                </table>

              </div>
            </>
          )}

      </div>

      {/* =======================================================
          PREVIEW MODAL
      ======================================================= */}

      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-2 sm:p-6">

          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden">

            {/* HEADER */}

            <div className="px-4 sm:px-6 py-3.5 border-b border-stone-200 flex items-center justify-between shrink-0">

              <div className="flex items-center gap-2.5">

                <Award className="h-5 w-5 text-amber-600" />

                <h3 className="text-sm sm:text-base font-bold text-gray-900">

                  Certificate Preview (
                  {previewIndex + 1} /{" "}
                  {selectedUsersData.length}
                  )

                </h3>

              </div>

              <button
                type="button"
                onClick={() =>
                  setIsPreviewOpen(false)
                }
                className="p-1.5 hover:bg-stone-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* BODY */}

            <div className="p-3 sm:p-6 bg-stone-100 flex-1 overflow-y-auto flex flex-col items-center justify-center">

              <div className="w-full flex items-center justify-center overflow-hidden py-1">

                <div className="w-full max-w-[800px] flex items-center justify-center">

                  <div
                    className="w-full relative shadow-xl rounded-sm select-none overflow-hidden bg-white shrink-0"
                    style={{
                      aspectRatio:
                        "800 / 565",
                      maxWidth: "800px",
                    }}
                  >

                    <div
                      ref={certRef}
                      className="w-full h-full relative"
                    >

                      <img
                        src={certificateBg}
                        alt="Certificate Template"
                        className="w-full h-full object-fill block pointer-events-none"
                      />

                      {/* =================================================
                          SUBMISSION NUMBER
                          
                          SAME VISUAL POSITION AS PRINT/PDF
                      ================================================= */}

                      <div
                        className="absolute inset-x-0 flex items-center justify-center pointer-events-none"
                        style={{
                          top: "25.85%",
                          height: "4.4%",
                        }}
                      >

                        <span
                          style={{
                            fontFamily:
                              "'Manjari', 'Gayathri', sans-serif",

                            fontSize:
                              "clamp(9px, 1.75vw, 14px)",

                            lineHeight:
                              "1.2",

                            fontWeight: "600",
                          }}
                          className="text-[#1b3b2b] tracking-normal text-center px-4 md:px-8 inline-block whitespace-nowrap"
                        >

                          {currentPreviewUser.submissionNumber
                            ? `Submission No: ${currentPreviewUser.submissionNumber}`
                            : ""}

                        </span>

                      </div>

                      {/* =================================================
                          RECIPIENT NAME
                      ================================================= */}

                      <div
                        className="absolute inset-x-0 flex items-center justify-center pointer-events-none"
                        style={{
                          top: "35%",
                          height: "10%",
                        }}
                      >

                        <span
                          style={{
                            fontFamily:
                              "'Manjari', 'Gayathri', sans-serif",

                            fontSize:
                              "clamp(11px, 2.5vw, 20px)",

                            lineHeight:
                              "1.2",
                          }}
                          className="font-bold text-[#1b3b2b] tracking-normal text-center px-4 md:px-8 inline-block"
                        >

                          {currentPreviewUser.contributorNameMalayalam ||
                            "Contributor Name"}

                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* CAROUSEL */}

              <div className="flex items-center gap-4 mt-3 sm:mt-5 shrink-0">

                <button
                  type="button"
                  disabled={
                    previewIndex === 0
                  }
                  onClick={() =>
                    setPreviewIndex(
                      (prev) =>
                        prev - 1,
                    )
                  }
                  className="p-2 rounded-full bg-white border border-stone-300 disabled:opacity-40 hover:bg-stone-50 shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-xs font-bold text-stone-600">
                  {previewIndex + 1} of{" "}
                  {selectedUsersData.length}
                </span>

                <button
                  type="button"
                  disabled={
                    previewIndex ===
                    selectedUsersData.length -
                      1
                  }
                  onClick={() =>
                    setPreviewIndex(
                      (prev) =>
                        prev + 1,
                    )
                  }
                  className="p-2 rounded-full bg-white border border-stone-300 disabled:opacity-40 hover:bg-stone-50 shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

              </div>

            </div>

            {/* FOOTER */}

            <div className="px-4 sm:px-6 py-3.5 border-t border-stone-200 flex justify-between items-center bg-white shrink-0">

              <button
                type="button"
                onClick={() =>
                  setIsPreviewOpen(false)
                }
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                Close Preview
              </button>

              <button
                type="button"
                disabled={
                  certificateGenerating
                }
                onClick={
                  handleConfirmAndSend
                }
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#1b3b2b] hover:bg-emerald-950 disabled:bg-stone-300 text-white text-xs font-bold"
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