import React, { useEffect, useMemo, useState } from "react";
import {
  Truck,
  Download,
  Loader2,
  Users,
  Package,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User,
  Search,
  X,
  CalendarDays,
  Filter,
} from "lucide-react";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";

import { getAllStoryPoetry } from "../../services/storyPoetryService";

export default function CourierDetails() {
  // =========================================================
  // STATE
  // =========================================================

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedParticular, setSelectedParticular] = useState("All");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("All");

  const [selectedMonth, setSelectedMonth] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // UI
  const [expandedContributor, setExpandedContributor] = useState(null);

  const [generatingDocx, setGeneratingDocx] = useState(false);

  // =========================================================
  // LOAD SUBMISSIONS
  // =========================================================

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllStoryPoetry();

      console.log("Courier submissions response:", data);

      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load courier submissions:", err);

      setError(
        err?.message || "Failed to load Story, Poetry and Special submissions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // =========================================================
  // NORMALIZE
  // =========================================================

  const normalize = (value) => {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

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
  // GET PARTICULAR NAME
  // =========================================================

  const getParticularName = (item) => {
    return (
      item?.particularName ||
      item?.particularNameSnapshot ||
      item?.particular ||
      item?.particularTitle ||
      "-"
    );
  };

  // =========================================================
  // GET CONTRIBUTOR NAME
  // =========================================================

  const getContributorName = (item) => {
    return (
      item?.contributorNameMalayalam ||
      item?.contributorName ||
      item?.name ||
      "-"
    );
  };

  // =========================================================
  // GET CONTRIBUTOR EMAIL
  // =========================================================

  const getContributorEmail = (item) => {
    return item?.contributorEmail || item?.email || item?.userEmail || "";
  };

  // =========================================================
  // GET CONTRIBUTOR PHONE
  // =========================================================

  const getContributorPhone = (item) => {
    return (
      item?.contributorPhone ||
      item?.phone ||
      item?.phoneNumber ||
      item?.mobileNumber ||
      "-"
    );
  };

  // =========================================================
  // GET CONTRIBUTOR ADDRESS
  // =========================================================

  const getContributorAddress = (item) => {
    return (
      item?.contributorAddress || item?.address || item?.fullAddress || "-"
    );
  };

  // =========================================================
  // GET PINCODE
  // =========================================================

  const getContributorPincode = (item) => {
    return item?.contributorPincode || item?.pincode || item?.pinCode || "-";
  };

  // =========================================================
  // GET COPIES
  // =========================================================
  //
  // Your backend may use totalCopies.
  //
  // We also check complimentaryCopies and copies as fallbacks.
  // =========================================================

  const getCopies = (item) => {
    return (
      Number(item?.totalCopies) ||
      Number(item?.complimentaryCopies) ||
      Number(item?.copies) ||
      0
    );
  };

  // =========================================================
  // GET SP ORDER STATUS
  // =========================================================

  const getSpOrderStatus = (item) => {
    const status = String(item?.spOrderStatus || "").trim();

    if (status === "Prebook") {
      return "Prebook";
    }

    if (status === "Dispatched") {
      return "Dispatched";
    }

    return null;
  };

  // =========================================================
  // GET CONTRIBUTOR GROUP KEY
  // =========================================================

  const getContributorKey = (item) => {
    // -------------------------------------------------------
    // FIRST: STABLE USER ID
    // -------------------------------------------------------

    const userId =
      item?.userId ||
      item?.contributorId ||
      item?.user_id ||
      item?.contributorUserId;

    if (userId) {
      return `user:${String(userId).trim()}`;
    }

    // -------------------------------------------------------
    // SECOND: EMAIL + PHONE
    // -------------------------------------------------------

    const email = normalize(getContributorEmail(item));
    const phone = normalize(getContributorPhone(item));

    if (email || phone) {
      return `contact:${email}|${phone}`;
    }

    // -------------------------------------------------------
    // THIRD: NAME + ADDRESS + PINCODE
    // -------------------------------------------------------

    const name = normalize(getContributorName(item));
    const address = normalize(getContributorAddress(item));
    const pincode = normalize(getContributorPincode(item));

    return `details:${name}|${address}|${pincode}`;
  };

  // =========================================================
  // PARTICULAR OPTIONS
  // =========================================================

  const particularOptions = useMemo(() => {
    const values = new Set();

    submissions.forEach((item) => {
      const particular = getParticularName(item);

      if (particular && particular !== "-") {
        values.add(particular);
      }
    });

    return Array.from(values).sort((a, b) =>
      String(a).localeCompare(String(b)),
    );
  }, [submissions]);

  // =========================================================
  // FILTERED SUBMISSIONS
  // =========================================================

  const filteredSubmissions = useMemo(() => {
    const search = normalize(searchTerm);

    return submissions.filter((item) => {
      // -----------------------------------------------------
      // SEARCH
      // -----------------------------------------------------

      const matchesSearch =
        !search ||
        normalize(item?.submissionNumber).includes(search) ||
        normalize(item?.title).includes(search) ||
        normalize(item?.storyPoetryId).includes(search) ||
        normalize(getContributorName(item)).includes(search) ||
        normalize(getContributorEmail(item)).includes(search) ||
        normalize(getContributorPhone(item)).includes(search) ||
        normalize(getParticularName(item)).includes(search);

      // -----------------------------------------------------
      // TYPE
      // -----------------------------------------------------

      const itemType = String(item?.type || "").trim();

      const matchesType =
        selectedType === "All" ||
        normalize(itemType) === normalize(selectedType);

      // -----------------------------------------------------
      // PARTICULAR
      // -----------------------------------------------------

      const matchesParticular =
        selectedParticular === "All" ||
        normalize(getParticularName(item)) === normalize(selectedParticular);

      // -----------------------------------------------------
      // PAYMENT
      // -----------------------------------------------------

      const paymentStatus = String(item?.paymentStatus || "Pending")
        .trim()
        .toLowerCase();

      const matchesPayment =
        selectedPaymentStatus === "All" ||
        paymentStatus === selectedPaymentStatus.toLowerCase();

      // -----------------------------------------------------
      // DATE
      // -----------------------------------------------------

      const rawDate =
        item?.createdDate ||
        item?.createdAt ||
        item?.submissionDate ||
        item?.date;

      let matchesDate = true;

      if (rawDate) {
        const date = new Date(rawDate);

        if (!Number.isNaN(date.getTime())) {
          const year = date.getFullYear();

          const month = String(date.getMonth() + 1).padStart(2, "0");

          const day = String(date.getDate()).padStart(2, "0");

          const dateString = `${year}-${month}-${day}`;

          const monthString = `${year}-${month}`;

          // Month
          if (selectedMonth && monthString !== selectedMonth) {
            matchesDate = false;
          }

          // From
          if (fromDate && dateString < fromDate) {
            matchesDate = false;
          }

          // To
          if (toDate && dateString > toDate) {
            matchesDate = false;
          }
        }
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesParticular &&
        matchesPayment &&
        matchesDate
      );
    });
  }, [
    submissions,
    searchTerm,
    selectedType,
    selectedParticular,
    selectedPaymentStatus,
    selectedMonth,
    fromDate,
    toDate,
  ]);

  // =========================================================
  // ONLY PAID SUBMISSIONS FOR COURIER
  // =========================================================

  const paidFilteredSubmissions = useMemo(() => {
    return filteredSubmissions.filter(
      (item) =>
        String(item?.paymentStatus || "")
          .trim()
          .toLowerCase() === "paid",
    );
  }, [filteredSubmissions]);

  // =========================================================
  // GROUP CONTRIBUTORS
  // =========================================================

  const courierContributors = useMemo(() => {
    const grouped = new Map();

    paidFilteredSubmissions.forEach((item) => {
      const key = getContributorKey(item);

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,

          contributorName: getContributorName(item),

          contributorAddress: getContributorAddress(item),

          contributorPincode: getContributorPincode(item),

          contributorPhone: getContributorPhone(item),

          contributorEmail: getContributorEmail(item),

          particulars: [],

          totalCopies: 0,

          submissions: [],
        });
      }

      const contributor = grouped.get(key);

      // -----------------------------------------------------
      // PARTICULAR
      // -----------------------------------------------------

      const particularName = getParticularName(item);

      const copies = getCopies(item);

      // -----------------------------------------------------
      // COMBINE SAME PARTICULAR
      // -----------------------------------------------------

      const existingParticular = contributor.particulars.find(
        (particular) =>
          normalize(particular.name) === normalize(particularName),
      );

      if (existingParticular) {
        existingParticular.copies += copies;
      } else {
        contributor.particulars.push({
          name: particularName,
          copies,
        });
      }

      // -----------------------------------------------------
      // TOTAL COPIES
      // -----------------------------------------------------

      contributor.totalCopies += copies;

      // -----------------------------------------------------
      // ORIGINAL SUBMISSION
      // -----------------------------------------------------

      contributor.submissions.push(item);
    });

    return Array.from(grouped.values());
  }, [paidFilteredSubmissions]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalContributors = courierContributors.length;

  const totalCopies = useMemo(() => {
    return courierContributors.reduce(
      (total, contributor) => total + contributor.totalCopies,
      0,
    );
  }, [courierContributors]);

  // =========================================================
  // FORMAT COPIES
  // =========================================================

  const formatCopies = (copies) => {
    return `${copies} ${copies === 1 ? "copy" : "copies"}`;
  };

  // =========================================================
  // TOGGLE CONTRIBUTOR
  // =========================================================

  const toggleContributor = (key) => {
    setExpandedContributor((previous) => (previous === key ? null : key));
  };

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("All");
    setSelectedParticular("All");
    setSelectedPaymentStatus("All");
    setSelectedMonth("");
    setFromDate("");
    setToDate("");
  };

  // =========================================================
  // ACTIVE FILTERS
  // =========================================================

  const hasFilters =
    searchTerm ||
    selectedType !== "All" ||
    selectedParticular !== "All" ||
    selectedPaymentStatus !== "All" ||
    selectedMonth ||
    fromDate ||
    toDate;

  // =========================================================
  // GENERATE DOCX
  // =========================================================

  const generateCourierDOCX = async () => {
    if (courierContributors.length === 0) {
      alert("No paid courier details found.");
      return;
    }

    try {
      setGeneratingDocx(true);

      const children = [];

      // =====================================================
      // TITLE
      // =====================================================

      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,

          spacing: {
            after: 120,
          },

          children: [
            new TextRun({
              text: "Courier Details",
              bold: true,
              size: 34,

              font: {
                name: "Arial",
                eastAsia: "Arial",
                complexScript: "Arial",
              },
            }),
          ],
        }),
      );

      // =====================================================
      // FILTER INFO
      // =====================================================

      const filterParts = [];

      if (selectedType !== "All") {
        filterParts.push(`Type: ${selectedType}`);
      }

      if (selectedParticular !== "All") {
        filterParts.push(`Particular: ${selectedParticular}`);
      }

      if (selectedPaymentStatus !== "All") {
        filterParts.push(`Payment: ${selectedPaymentStatus}`);
      }

      if (selectedMonth) {
        filterParts.push(`Month: ${selectedMonth}`);
      }

      if (fromDate) {
        filterParts.push(`From: ${formatDate(fromDate)}`);
      }

      if (toDate) {
        filterParts.push(`To: ${formatDate(toDate)}`);
      }

      if (filterParts.length > 0) {
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,

            spacing: {
              after: 100,
            },

            children: [
              new TextRun({
                text: filterParts.join(" • "),
                size: 18,
                italics: true,

                font: {
                  name: "Arial",
                  eastAsia: "Arial",
                },
              }),
            ],
          }),
        );
      }

      // =====================================================
      // SUMMARY
      // =====================================================

      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,

          spacing: {
            after: 300,
          },

          children: [
            new TextRun({
              text: `${totalContributors} contributor${
                totalContributors === 1 ? "" : "s"
              } • ${totalCopies} ${totalCopies === 1 ? "copy" : "copies"}`,

              size: 22,

              font: {
                name: "Arial",
                eastAsia: "Arial",
              },
            }),
          ],
        }),
      );

      // =====================================================
      // CONTRIBUTORS
      // =====================================================

      courierContributors.forEach((contributor, index) => {
        // -------------------------------------------------
        // LEFT COLUMN - CONTRIBUTOR DETAILS
        // -------------------------------------------------

        const contributorDetails = [];

        // NAME
        contributorDetails.push(
          new Paragraph({
            spacing: {
              after: 100,
            },

            children: [
              new TextRun({
                text: `${index + 1}. ${contributor.contributorName || "-"}`,

                bold: true,
                size: 30,

                font: {
                  name: "Manjari",
                  eastAsia: "Manjari",
                  complexScript: "Manjari",
                },
              }),
            ],
          }),
        );

        // ADDRESS
        contributorDetails.push(
          new Paragraph({
            spacing: {
              after: 50,
              line: 260,
            },

            children: [
              new TextRun({
                text: `Address: ${contributor.contributorAddress || "-"}`,

                size: 23,

                font: {
                  name: "Manjari",
                  eastAsia: "Manjari",
                  complexScript: "Manjari",
                },
              }),
            ],
          }),
        );

        // PINCODE
        contributorDetails.push(
          new Paragraph({
            spacing: {
              after: 50,
            },

            children: [
              new TextRun({
                text: `Pincode: ${contributor.contributorPincode || "-"}`,

                size: 23,

                font: {
                  name: "Arial",
                  eastAsia: "Arial",
                },
              }),
            ],
          }),
        );

        // PHONE
        contributorDetails.push(
          new Paragraph({
            spacing: {
              after: 50,
            },

            children: [
              new TextRun({
                text: `Phone: ${contributor.contributorPhone || "-"}`,

                size: 23,

                font: {
                  name: "Arial",
                  eastAsia: "Arial",
                },
              }),
            ],
          }),
        );

        // EMAIL
        if (contributor.contributorEmail) {
          contributorDetails.push(
            new Paragraph({
              spacing: {
                after: 50,
              },

              children: [
                new TextRun({
                  text: `Email: ${contributor.contributorEmail}`,

                  size: 21,

                  font: {
                    name: "Arial",
                    eastAsia: "Arial",
                  },
                }),
              ],
            }),
          );
        }

        // -------------------------------------------------
        // RIGHT COLUMN - COMPLIMENTARY COPIES
        // -------------------------------------------------

        const copyDetails = [];

        // TITLE
        copyDetails.push(
          new Paragraph({
            spacing: {
              after: 100,
            },

            children: [
              new TextRun({
                text: "Complimentary Copies",

                bold: true,
                size: 25,

                font: {
                  name: "Arial",
                  eastAsia: "Arial",
                },
              }),
            ],
          }),
        );

        // PARTICULARS
        contributor.particulars.forEach((particular) => {
          copyDetails.push(
            new Paragraph({
              bullet: {
                level: 0,
              },

              spacing: {
                after: 40,
              },

              children: [
                new TextRun({
                  text: `${particular.name} — ${formatCopies(
                    particular.copies,
                  )}`,

                  size: 23,

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

        // TOTAL
        copyDetails.push(
          new Paragraph({
            alignment: AlignmentType.RIGHT,

            spacing: {
              before: 100,
              after: 50,
            },

            children: [
              new TextRun({
                text: `Total Copies: ${formatCopies(contributor.totalCopies)}`,

                bold: true,
                size: 25,

                font: {
                  name: "Arial",
                  eastAsia: "Arial",
                },
              }),
            ],
          }),
        );

        // -------------------------------------------------
        // CONTRIBUTOR TABLE
        // -------------------------------------------------

        children.push(
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },

            borders: {
              top: {
                style: BorderStyle.NONE,
                size: 0,
                color: "FFFFFF",
              },

              bottom: {
                style: BorderStyle.NONE,
                size: 0,
                color: "FFFFFF",
              },

              left: {
                style: BorderStyle.NONE,
                size: 0,
                color: "FFFFFF",
              },

              right: {
                style: BorderStyle.NONE,
                size: 0,
                color: "FFFFFF",
              },

              insideHorizontal: {
                style: BorderStyle.NONE,
                size: 0,
                color: "FFFFFF",
              },

              insideVertical: {
                style: BorderStyle.NONE,
                size: 0,
                color: "FFFFFF",
              },
            },

            rows: [
              new TableRow({
                children: [
                  // -----------------------------------------
                  // LEFT
                  // -----------------------------------------

                  new TableCell({
                    width: {
                      size: 55,
                      type: WidthType.PERCENTAGE,
                    },

                    children: contributorDetails,

                    margins: {
                      top: 0,
                      bottom: 0,
                      left: 0,
                      right: 200,
                    },
                  }),

                  // -----------------------------------------
                  // RIGHT
                  // -----------------------------------------

                  new TableCell({
                    width: {
                      size: 45,
                      type: WidthType.PERCENTAGE,
                    },

                    children: copyDetails,

                    margins: {
                      top: 0,
                      bottom: 0,
                      left: 200,
                      right: 0,
                    },
                  }),
                ],
              }),
            ],
          }),
        );

        // -------------------------------------------------
        // DIVIDER
        // -------------------------------------------------

        if (index < courierContributors.length - 1) {
          children.push(
            new Paragraph({
              spacing: {
                before: 80,
                after: 80,
              },

              children: [
                new TextRun({
                  text: "────────────────────────────────────────",
                  size: 16,
                }),
              ],
            }),
          );
        }
      });

      // =====================================================
      // DOCUMENT
      // =====================================================

      const doc = new Document({
        creator: "The Old Library",

        title: "Courier Details",

        description:
          "Grouped courier details for story, poetry and special submissions",

        styles: {
          default: {
            document: {
              run: {
                font: "Manjari",
                size: 24,
              },

              paragraph: {
                spacing: {
                  line: 280,
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
                  top: 650,
                  bottom: 650,
                  left: 800,
                  right: 800,
                },
              },
            },

            children,
          },
        ],
      });

      // =====================================================
      // BLOB
      // =====================================================

      const blob = await Packer.toBlob(doc);

      if (!blob || blob.size === 0) {
        throw new Error("Courier DOCX file is empty.");
      }

      // =====================================================
      // DOWNLOAD
      // =====================================================

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = "Courier-Details.docx";

      link.style.display = "none";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1500);
    } catch (err) {
      console.error("Courier DOCX generation failed:", err);

      alert(
        `Failed to generate courier details DOCX.\n\n${
          err?.message || "Unknown error"
        }`,
      );
    } finally {
      setGeneratingDocx(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-emerald-800 animate-spin" />

          <p className="text-sm font-semibold text-stone-500">
            Loading courier details...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-8 text-center">
        <Truck className="h-10 w-10 mx-auto text-red-300 mb-3" />

        <h2 className="font-bold text-gray-900">
          Failed to load courier details
        </h2>

        <p className="text-sm text-red-600 mt-2">{error}</p>

        <button
          type="button"
          onClick={loadSubmissions}
          className="
            mt-5
            px-4
            py-2
            rounded-xl
            bg-emerald-900
            hover:bg-emerald-800
            text-white
            text-sm
            font-bold
            cursor-pointer
          "
        >
          Try Again
        </button>
      </div>
    );
  }

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="space-y-5">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Truck className="h-5 w-5 text-emerald-800" />
            </div>

            <div>
              <h1 className="text-xl font-extrabold text-gray-900">
                Courier Details
              </h1>

              <p className="text-sm text-stone-500 mt-0.5">
                Manage complimentary copies and courier information.
              </p>
            </div>
          </div>
        </div>

        {/* DOWNLOAD */}

        <button
          type="button"
          onClick={generateCourierDOCX}
          disabled={generatingDocx || courierContributors.length === 0}
          className="
            inline-flex
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
              Download Courier Details
            </>
          )}
        </button>
      </div>

      {/* =====================================================
          FILTER PANEL
      ===================================================== */}

      <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-emerald-800" />

            <h2 className="text-sm font-bold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* SEARCH */}

            <div className="xl:col-span-2">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block mb-2">
                Search
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search contributor, title, submission number, particular..."
                  className="
                    w-full
                    pl-10
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

            {/* TYPE */}

            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block mb-2">
                Submission Type
              </label>

              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setSelectedParticular("All");
                }}
                className="
                  w-full
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
                  cursor-pointer
                "
              >
                <option value="All">All Types</option>
                <option value="Story">Story</option>
                <option value="Poetry">Poetry</option>
                <option value="Special">Special</option>
              </select>
            </div>

            {/* PARTICULAR */}

            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block mb-2">
                Particular
              </label>

              <select
                value={selectedParticular}
                onChange={(e) => setSelectedParticular(e.target.value)}
                className="
                  w-full
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
                  cursor-pointer
                "
              >
                <option value="All">All Particulars</option>

                {particularOptions.map((particular) => (
                  <option key={particular} value={particular}>
                    {particular}
                  </option>
                ))}
              </select>
            </div>

            {/* PAYMENT */}

            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block mb-2">
                Payment Status
              </label>

              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="
                  w-full
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
                  cursor-pointer
                "
              >
                <option value="All">All Payment Status</option>

                <option value="Paid">Paid</option>

                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* MONTH */}

            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block mb-2">
                Month
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />

                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="
                    w-full
                    pl-10
                    pr-4
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
            </div>

            {/* FROM DATE */}

            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block mb-2">
                From Date
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="
                  w-full
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

            {/* TO DATE */}

            <div>
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide block mb-2">
                To Date
              </label>

              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => setToDate(e.target.value)}
                className="
                  w-full
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
                disabled={!hasFilters}
                className="
                  w-full
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-stone-200
                  bg-white
                  hover:bg-stone-100
                  disabled:bg-stone-50
                  disabled:text-stone-300
                  disabled:cursor-not-allowed
                  text-stone-700
                  text-sm
                  font-bold
                  cursor-pointer
                  transition-colors
                "
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* FILTER SUMMARY */}

        <div className="px-5 py-3 bg-stone-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-stone-500">
            Showing{" "}
            <span className="font-bold text-stone-700">
              {filteredSubmissions.length}
            </span>{" "}
            submission
            {filteredSubmissions.length !== 1 ? "s" : ""}
          </p>

          <p className="text-xs text-stone-500">
            Courier entries:{" "}
            <span className="font-bold text-emerald-800">
              {totalContributors}
            </span>
          </p>
        </div>
      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* PAID */}

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5">
          <p className="text-xs text-stone-500 font-semibold">
            Paid Submissions
          </p>

          <p className="text-2xl font-extrabold text-gray-900 mt-1">
            {paidFilteredSubmissions.length}
          </p>
        </div>

        {/* CONTRIBUTORS */}

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 font-semibold">
                Contributors
              </p>

              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {totalContributors}
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-800" />
            </div>
          </div>
        </div>

        {/* COPIES */}

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 font-semibold">
                Total Complimentary Copies
              </p>

              <p className="text-2xl font-extrabold text-gray-900 mt-1">
                {totalCopies}
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Package className="h-5 w-5 text-emerald-800" />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          NO COURIER RESULTS
      ===================================================== */}

      {courierContributors.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm">
          <div className="py-16 px-6 text-center">
            <Truck className="h-10 w-10 mx-auto text-stone-300 mb-3" />

            <h3 className="font-bold text-gray-900">
              No courier details found
            </h3>

            <p className="text-sm text-stone-500 mt-1">
              {filteredSubmissions.length === 0
                ? "No submissions match the selected filters."
                : "No paid submissions are available for courier processing."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="
                  mt-4
                  px-4
                  py-2
                  rounded-xl
                  bg-emerald-900
                  hover:bg-emerald-800
                  text-white
                  text-xs
                  font-bold
                  cursor-pointer
                "
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* =================================================
              CONTRIBUTOR LIST
          ================================================= */}

          <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200">
              <h2 className="text-base font-bold text-gray-900">
                Courier Contributors
              </h2>

              <p className="text-xs text-stone-500 mt-0.5">
                Each contributor appears only once, even if they submitted
                multiple particulars.
              </p>
            </div>

            <div className="divide-y divide-stone-100">
              {courierContributors.map((contributor, index) => {
                const isExpanded = expandedContributor === contributor.key;

                return (
                  <div key={contributor.key}>
                    {/* ROW */}

                    <button
                      type="button"
                      onClick={() => toggleContributor(contributor.key)}
                      className="
                          w-full
                          px-5
                          py-4
                          flex
                          items-center
                          justify-between
                          gap-4
                          text-left
                          hover:bg-stone-50
                          transition-colors
                          cursor-pointer
                        "
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* NUMBER */}

                        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <span className="text-xs font-extrabold text-emerald-800">
                            {index + 1}
                          </span>
                        </div>

                        {/* INFO */}

                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">
                            {contributor.contributorName || "-"}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span className="text-xs text-stone-500">
                              {contributor.particulars.length} particular
                              {contributor.particulars.length !== 1 ? "s" : ""}
                            </span>

                            <span className="text-xs font-semibold text-emerald-700">
                              {formatCopies(contributor.totalCopies)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CHEVRON */}

                      <div className="shrink-0 text-stone-400">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </button>

                    {/* DETAILS */}

                    {isExpanded && (
                      <div className="px-5 pb-5">
                        <div className="rounded-xl bg-stone-50 border border-stone-200 p-5">
                          {/* CUSTOMER */}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* NAME */}

                            <div className="flex items-start gap-3">
                              <User className="h-4 w-4 text-emerald-800 mt-0.5" />

                              <div>
                                <p className="text-[11px] text-stone-500">
                                  Contributor
                                </p>

                                <p className="text-sm font-bold text-gray-900 mt-0.5">
                                  {contributor.contributorName || "-"}
                                </p>
                              </div>
                            </div>

                            {/* PHONE */}

                            <div className="flex items-start gap-3">
                              <Phone className="h-4 w-4 text-emerald-800 mt-0.5" />

                              <div>
                                <p className="text-[11px] text-stone-500">
                                  Phone
                                </p>

                                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                  {contributor.contributorPhone || "-"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* ADDRESS */}

                          <div className="flex items-start gap-3 mt-4">
                            <MapPin className="h-4 w-4 text-emerald-800 mt-0.5 shrink-0" />

                            <div>
                              <p className="text-[11px] text-stone-500">
                                Address
                              </p>

                              <p className="text-sm font-medium text-gray-900 mt-0.5 leading-6">
                                {contributor.contributorAddress || "-"}
                              </p>

                              <p className="text-xs text-stone-500 mt-1">
                                Pincode: {contributor.contributorPincode || "-"}
                              </p>
                            </div>
                          </div>

                          {/* PARTICULARS */}

                          <div className="mt-5">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-sm font-bold text-gray-900">
                                Complimentary Copies
                              </h3>

                              <span className="text-xs font-bold text-emerald-800">
                                Total: {formatCopies(contributor.totalCopies)}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {contributor.particulars.map(
                                (particular, particularIndex) => (
                                  <div
                                    key={`${contributor.key}-${particular.name}-${particularIndex}`}
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                        rounded-lg
                                        bg-white
                                        border
                                        border-stone-200
                                        px-4
                                        py-3
                                      "
                                  >
                                    <p className="text-sm font-semibold text-gray-900">
                                      {particular.name}
                                    </p>

                                    <span className="text-sm font-bold text-emerald-800 shrink-0">
                                      {formatCopies(particular.copies)}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* SUBMISSION COUNT */}

                          <div className="mt-4 pt-4 border-t border-stone-200">
                            <p className="text-xs text-stone-500">
                              This contributor has{" "}
                              <span className="font-bold text-stone-700">
                                {contributor.submissions.length}
                              </span>{" "}
                              paid submission
                              {contributor.submissions.length !== 1 ? "s" : ""}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="px-5 py-4 bg-stone-50 border border-stone-200 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-xs text-stone-500">
                Multiple submissions from the same contributor are combined into
                one courier entry.
              </p>

              <p className="text-xs font-bold text-stone-700">
                {totalContributors} courier
                {totalContributors !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
