import React, { useState, useEffect } from "react";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import Swal from "sweetalert2";

import {
  getStoryPoetryEventReport,
  getEventCopyPreparationReport,
} from "../../services/storyPoetryService";
import { getEvents } from "../../services/eventService";

const Reports = () => {
  const [downloading, setDownloading] = useState(false);

  // =========================================================
  // DATE FILTER
  // =========================================================

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // =========================================================
  // EVENT COPY PREPARATION REPORT
  // =========================================================

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [eventCopyReport, setEventCopyReport] = useState([]);
  const [eventCopyLoading, setEventCopyLoading] = useState(false);
  const [eventCopyDownloading, setEventCopyDownloading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // =========================================================
  // LOAD EVENTS
  // =========================================================

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setEventsLoading(true);

        const data = await getEvents();

        setEvents(data?.data || data || []);
      } catch (error) {
        console.error("Failed to load events:", error);

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: error?.message || "Failed to load events.",
          showConfirmButton: false,
          timer: 3000,
        });
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();
  }, []);

  // =========================================================
  // DOWNLOAD STORY POETRY + EVENT REPORT
  // =========================================================

  const handleDownloadReport = async () => {
    // ---------------------------------------------------------
    // DATE VALIDATION
    // ---------------------------------------------------------

    if (fromDate && toDate && fromDate > toDate) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "From date cannot be later than To date.",
        showConfirmButton: false,
        timer: 2500,
      });

      return;
    }

    try {
      setDownloading(true);

      const data = await getStoryPoetryEventReport(fromDate, toDate);

      console.log("REPORT API RESPONSE:", data);
      console.log("IS ARRAY:", Array.isArray(data));
      console.log("REPORT LENGTH:", data?.length);

      console.log("FIRST REPORT ROW:", data?.[0]);
      console.log(
        "FIRST REPORT ROW KEYS:",
        data?.[0] ? Object.keys(data[0]) : [],
      );

      if (!Array.isArray(data) || data.length === 0) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "No report data available.",
          showConfirmButton: false,
          timer: 2500,
        });

        return;
      }

      // =====================================================
      // CSV COLUMNS
      // =====================================================

      const columns = [
        { key: "userId", label: "User ID" },
        { key: "writerName", label: "Writer Name" },
        { key: "submissionNumber", label: "Submission Number" },
        { key: "phone", label: "Phone" },
        { key: "address", label: "Address" },
        { key: "paymentDate", label: "Payment Date" },
        { key: "paymentAmount", label: "Payment Amount" },
        { key: "particularName", label: "Particular Name" },
        { key: "totalCopies", label: "Total Copies" },
        { key: "eventRegDate", label: "Event Registration Date" },
        { key: "eventAmount", label: "Event Amount" },
        { key: "spOrderStatus", label: "SP Order Status" },
        { key: "barcode", label: "Barcode" },
      ];

      // =====================================================
      // ESCAPE CSV VALUE
      // =====================================================

      const escapeCsvValue = (value) => {
        if (value === null || value === undefined) {
          return "";
        }

        const stringValue = String(value);

        return `"${stringValue.replace(/"/g, '""')}"`;
      };

      // =====================================================
      // HEADER ROW
      // =====================================================

      const headerRow = columns
        .map((column) => escapeCsvValue(column.label))
        .join(",");

      // =====================================================
      // DATA ROWS
      // =====================================================

      const dataRows = data.map((item) =>
        columns
          .map((column) => {
            let value = item?.[column.key];

            // -------------------------------------------------
            // PHONE NUMBER
            // -------------------------------------------------

            if (
              column.key === "phone" &&
              value !== null &&
              value !== undefined &&
              value !== ""
            ) {
              value = `'${String(value)}`;
            }

            // -------------------------------------------------
            // BARCODE
            // -------------------------------------------------

            if (
              column.key === "barcode" &&
              value !== null &&
              value !== undefined &&
              value !== ""
            ) {
              value = `'${String(value)}`;
            }

            return escapeCsvValue(value);
          })
          .join(","),
      );

      // =====================================================
      // CREATE CSV
      // =====================================================

      const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");

      // =====================================================
      // CREATE FILE
      // =====================================================

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `StoryPoetry_Event_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      // =====================================================
      // SUCCESS MESSAGE
      // =====================================================

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Report downloaded successfully.",
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (error) {
      console.error("Failed to download report:", error);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: error?.message || "Failed to download report.",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setDownloading(false);
    }
  };

  // =========================================================
  // DOWNLOAD EVENT COPY PREPARATION REPORT
  // =========================================================

  const handleDownloadEventCopyReport = () => {
    if (!eventCopyReport.length) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "No report data available.",
        showConfirmButton: false,
        timer: 2500,
      });

      return;
    }

    try {
      setEventCopyDownloading(true);

      const columns = [
        { key: "writerName", label: "Writer Name" },
        { key: "phone", label: "Phone" },
        { key: "bookTitle", label: "Book Title" },
        { key: "bookType", label: "Book Type" },
        { key: "particularName", label: "Particular" },
        { key: "submissionNumber", label: "Submission Number" },
        { key: "totalCopies", label: "Total Copies" },
        { key: "spOrderStatus", label: "Order Status" },
        { key: "barcode", label: "Barcode" },
        {
          key: "eventRegistrationDate",
          label: "Registration Date",
        },
      ];

      const escapeCsvValue = (value) => {
        if (value === null || value === undefined) {
          return "";
        }

        return `"${String(value).replace(/"/g, '""')}"`;
      };

      const headerRow = columns
        .map((column) => escapeCsvValue(column.label))
        .join(",");

      const dataRows = eventCopyReport.map((item) =>
        columns
          .map((column) => {
            let value = item?.[column.key];

            // Keep phone as text
            if (
              column.key === "phone" &&
              value !== null &&
              value !== undefined &&
              value !== ""
            ) {
              value = `'${String(value)}`;
            }

            // Keep barcode as text
            if (
              column.key === "barcode" &&
              value !== null &&
              value !== undefined &&
              value !== ""
            ) {
              value = `'${String(value)}`;
            }

            // Format registration date
            if (column.key === "eventRegistrationDate" && value) {
              value = new Date(value).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
            }

            return escapeCsvValue(value);
          })
          .join(","),
      );

      // BOM is important for Malayalam/Unicode in Excel
      const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\r\n");

      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      const selectedEvent = events.find(
        (event) => String(event.eventId) === String(selectedEventId),
      );

      const eventName =
        selectedEvent?.name || selectedEvent?.eventName || "Event";

      const safeEventName = eventName
        .replace(/[<>:"/\\|?*]+/g, "")
        .replace(/\s+/g, "-");

      link.download = `Event-Copy-Preparation-${safeEventName}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Event copy report downloaded successfully.",
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (error) {
      console.error("Failed to download event copy report:", error);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: error?.message || "Failed to download event copy report.",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setEventCopyDownloading(false);
    }
  };

  // =========================================================
  // GENERATE EVENT COPY PREPARATION REPORT
  // =========================================================

  const handleGenerateEventCopyReport = async () => {
    if (!selectedEventId) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "Please select an event.",
        showConfirmButton: false,
        timer: 2500,
      });

      return;
    }

    try {
      setEventCopyLoading(true);
      setEventCopyReport([]);

      const data = await getEventCopyPreparationReport(selectedEventId);

      console.log("EVENT COPY REPORT RESPONSE:", data);

      // Handle both:
      // [ ... ]
      // and
      // { data: [ ... ] }
      const reportData = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setEventCopyReport(reportData);

      // -------------------------------------------------------
      // Empty result
      // -------------------------------------------------------

      if (reportData.length === 0) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "No Story/Poetry submissions found for this event.",
          showConfirmButton: false,
          timer: 2500,
        });
      }
    } catch (error) {
      console.error("Failed to generate event copy report:", error);

      setEventCopyReport([]);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: error?.message || "Failed to generate event copy report.",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setEventCopyLoading(false);
    }
  };

  return (
    <div className="mt-5 p-4 md:p-6">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>

          <p className="mt-1 text-sm text-gray-500">
            Download combined Story, Poetry and Event Registration reports.
          </p>
        </div>

        {/* ==================================================
            DATE FILTER + DOWNLOAD
        ================================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {/* FROM DATE */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
              className="
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-800
                outline-none
                focus:border-emerald-700
                focus:ring-2
                focus:ring-emerald-700/10
              "
            />
          </div>

          {/* TO DATE */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
              className="
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-gray-800
                outline-none
                focus:border-emerald-700
                focus:ring-2
                focus:ring-emerald-700/10
              "
            />
          </div>

          {/* DOWNLOAD REPORT BUTTON */}

          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={downloading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-gray-900
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {downloading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download size={18} />
                Download Report
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================================================
          REPORT CARD
      ================================================== */}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <FileSpreadsheet size={24} className="text-emerald-700" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Story & Event Combined Report
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Download the combined Story/Poetry and Event Registration report.
              The report is generated directly from the backend report API.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-gray-500 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <span className="font-semibold text-gray-700">Writer</span>
                <p>Writer name and contact details</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Submission</span>
                <p>Submission number and particular</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Payment</span>
                <p>Payment date and amount</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Copies</span>
                <p>Total copies requested</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Event</span>
                <p>Registration date and amount</p>
              </div>

              <div>
                <span className="font-semibold text-gray-700">Order</span>
                <p>Order status and barcode</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          EVENT COPY PREPARATION REPORT
      ================================================== */}

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* HEADER */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <FileSpreadsheet size={24} className="text-emerald-700" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-gray-800">
                Event Copy Preparation
              </h2>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Prepare Story and Poetry copies for contributors registered for
                a selected event.
              </p>
            </div>
          </div>
        </div>

        {/* EVENT SELECTOR */}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Select Event
            </label>

            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setEventCopyReport([]);
              }}
              disabled={eventsLoading || eventCopyLoading}
              className="
                w-full
                rounded-lg
                border
                border-gray-300
                bg-white
                px-4
                py-2.5
                text-sm
                text-gray-800
                outline-none
                focus:border-emerald-700
                focus:ring-2
                focus:ring-emerald-700/10
                disabled:cursor-not-allowed
                disabled:bg-gray-100
              "
            >
              <option value="">
                {eventsLoading ? "Loading events..." : "Select an event"}
              </option>

              {events.map((event) => (
                <option key={event.eventId} value={event.eventId}>
                  {event.name || event.eventName}
                </option>
              ))}
            </select>
          </div>

          {/* GENERATE BUTTON */}

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerateEventCopyReport}
              disabled={!selectedEventId || eventCopyLoading}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-[#1b3b2b]
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-emerald-950
                disabled:cursor-not-allowed
                disabled:bg-gray-300
              "
            >
              {eventCopyLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileSpreadsheet size={18} />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* ==================================================
            REPORT RESULT
        ================================================== */}

        {selectedEventId && !eventCopyLoading && (
          <>
            {/* EMPTY STATE */}

            {eventCopyReport.length === 0 && (
              <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
                <FileSpreadsheet
                  size={36}
                  className="mx-auto mb-3 text-gray-300"
                />

                <p className="text-sm font-semibold text-gray-700">
                  No Story/Poetry submissions found for this event.
                </p>
              </div>
            )}

            {/* RESULTS */}

            {eventCopyReport.length > 0 && (
              <div className="mt-6">
                {/* RESULT HEADER */}

                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      Event Copy Preparation Report
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {eventCopyReport.length} submission
                      {eventCopyReport.length !== 1 ? "s" : ""} found.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadEventCopyReport}
                    disabled={eventCopyDownloading}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-lg
                      bg-gray-900
                      px-4
                      py-2.5
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-gray-800
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {eventCopyDownloading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        Download Report
                      </>
                    )}
                  </button>
                </div>

                {/* TABLE */}

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full min-w-[1100px] text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                          Writer Name
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                          Phone
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                          Book Title
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                          Type
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                          Particular
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                          Submission No
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-bold uppercase text-gray-500">
                          Total Copies
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                          Order Status
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                          Barcode
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">
                          Registration Date
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {eventCopyReport.map((item, index) => (
                        <tr
                          key={
                            item.submissionNumber || item.storyPoetryId || index
                          }
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {item.writerName || "-"}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {item.phone || "-"}
                          </td>

                          <td className="px-4 py-3 font-medium text-gray-800">
                            {item.bookTitle || "-"}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {item.bookType || "-"}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {item.particularName || "-"}
                          </td>

                          <td className="px-4 py-3 font-mono text-xs text-gray-600">
                            {item.submissionNumber || "-"}
                          </td>

                          <td className="px-4 py-3 text-center font-bold text-gray-800">
                            {item.totalCopies ?? 0}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {item.spOrderStatus || "-"}
                          </td>

                          <td className="px-4 py-3 font-mono text-xs text-gray-600">
                            {item.barcode || "-"}
                          </td>

                          <td className="px-4 py-3 text-gray-600">
                            {item.eventRegistrationDate
                              ? new Date(
                                  item.eventRegistrationDate,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;