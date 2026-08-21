import React, { useEffect, useState } from "react";
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
} from "lucide-react";

import { getAllStoryPoetry } from "../../services/storyPoetryService";
import { useNavigate } from "react-router-dom";

export default function AdminStoryPoetry() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);

  // ================= LOAD ALL SUBMISSIONS =================

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllStoryPoetry();

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

  // ================= FORMAT DATE =================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ================= TYPE ICON =================

  const renderTypeIcon = (type) => {
    if (type === "Poetry") {
      return <Leaf className="h-4 w-4 text-emerald-800" />;
    }

    return <BookOpen className="h-4 w-4 text-emerald-800" />;
  };

  // ================= TYPE COLOR =================

  const getTypeStyle = (type) => {
    if (type === "Poetry") {
      return "bg-emerald-100 text-emerald-800";
    }

    if (type === "Special") {
      return "bg-purple-100 text-purple-800";
    }

    return "bg-blue-100 text-blue-800";
  };

  // ================= PAYMENT STATUS COLOR =================

  const getPaymentStyle = (status) => {
    if (status === "Paid") {
      return "bg-emerald-100 text-emerald-800";
    }

    return "bg-amber-100 text-amber-800";
  };

  // search poetry
  const filteredSubmissions = submissions.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      item.title?.toLowerCase().includes(search) ||
      item.contributorNameMalayalam?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="p-6">
      {/* ================= HEADER ================= */}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Story, Poetry & Special Submissions
        </h1>

        <p className="text-sm text-stone-500 mt-1">
          View all Story, Poetry and Special submissions from contributors.
        </p>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading ? (
        <div className="bg-white border border-stone-200 rounded-2xl py-20 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-900" />

          <span className="ml-2 text-sm text-stone-500">
            Loading submissions...
          </span>
        </div>
      ) : submissions.length === 0 ? (
        /* ================= EMPTY ================= */

        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <BookOpen className="h-10 w-10 mx-auto text-stone-300 mb-3" />

          <h3 className="font-bold text-gray-900">No submissions found</h3>

          <p className="text-sm text-stone-500 mt-1">
            There are currently no Story, Poetry or Special submissions.
          </p>
        </div>
      ) : (
        /* ================= TABLE ================= */

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
          {/* ================= SEARCH HEADER ================= */}

          <div className="px-5 py-4 border-b border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* LEFT SIDE */}

              <div>
                <h2 className="text-base font-bold text-gray-900">
                  All Submissions
                </h2>

                <p className="text-xs text-stone-500 mt-0.5">
                  {filteredSubmissions.length} submission
                  {filteredSubmissions.length !== 1 ? "s" : ""} found
                </p>
              </div>

              {/* SEARCH BAR */}

              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

                {/* CLEAR SEARCH */}

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
          </div>

          {/* ================= NO SEARCH RESULTS ================= */}

          {filteredSubmissions.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-stone-300 mb-3" />

              <h3 className="font-bold text-gray-900">No submissions found</h3>

              <p className="text-sm text-stone-500 mt-1">
                No submissions match "{searchTerm}".
              </p>

              <button
                type="button"
                onClick={() => setSearchTerm("")}
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
                Clear Search
              </button>
            </div>
          ) : (
            /* ================= TABLE ================= */

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                {/* ================= TABLE HEADER ================= */}

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
                      Details
                    </th>
                  </tr>
                </thead>

                {/* ================= TABLE BODY ================= */}

                <tbody className="divide-y divide-stone-100">
                  {filteredSubmissions.map((item) => (
                    <tr
                      key={item.storyPoetryId}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      {/* ================= SUBMISSION ================= */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                            {renderTypeIcon(item.type)}
                          </div>

                          <div>
                            <p className="font-bold text-gray-900">
                              {item.title}
                            </p>

                            <p className="text-[11px] text-stone-500 mt-0.5">
                              ID #{item.storyPoetryId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ================= CONTRIBUTOR ================= */}

                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800">
                          {item.contributorNameMalayalam || "-"}
                        </p>
                      </td>

                      {/* ================= TYPE ================= */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${getTypeStyle(
                            item.type,
                          )}`}
                        >
                          {item.type || "-"}
                        </span>
                      </td>

                      {/* ================= PAYMENT ================= */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${getPaymentStyle(
                            item.paymentStatus,
                          )}`}
                        >
                          {item.paymentStatus || "Pending"}
                        </span>
                      </td>

                      {/* ================= DATE ================= */}

                      <td className="px-5 py-4 text-stone-600 text-xs font-medium">
                        {formatDate(item.createdDate)}
                      </td>

                      {/* ================= VIEW ================= */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() =>
                              navigate(`/admin/story/${item.storyPoetryId}`)
                            }
                            className="
                      flex
                      items-center
                      gap-2
                      px-3
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
                            <Eye className="h-4 w-4" />
                            View
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

      {/* ================= DETAILS MODAL ================= */}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* ================= MODAL HEADER ================= */}

            <div className="flex items-start justify-between px-6 py-5 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    {renderTypeIcon(selectedItem.type)}
                  </div>

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getTypeStyle(
                      selectedItem.type,
                    )}`}
                  >
                    {selectedItem.type}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mt-3">
                  {selectedItem.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ================= MODAL BODY ================= */}

            <div className="p-6">
              {/* ================= CONTRIBUTOR SECTION ================= */}

              <div className="flex flex-col md:flex-row justify-between gap-8">
                {/* LEFT SIDE - CONTRIBUTOR DETAILS */}

                <div className="flex-1">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-5">
                    Contributor Details
                  </h3>

                  <div className="space-y-4">
                    {/* NAME */}

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                        <UserCircle className="h-5 w-5 text-stone-600" />
                      </div>

                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-400">
                          Name
                        </p>

                        <p className="text-sm font-bold text-gray-800">
                          {selectedItem.contributorNameMalayalam || "-"}
                        </p>
                      </div>
                    </div>

                    {/* EMAIL */}

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-stone-600" />
                      </div>

                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-400">
                          Email
                        </p>

                        <p className="text-sm font-semibold text-gray-800">
                          {selectedItem.contributorEmail || "-"}
                        </p>
                      </div>
                    </div>

                    {/* PHONE */}

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                        <Phone className="h-4 w-4 text-stone-600" />
                      </div>

                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-400">
                          Phone
                        </p>

                        <p className="text-sm font-semibold text-gray-800">
                          {selectedItem.contributorPhone || "-"}
                        </p>
                      </div>
                    </div>

                    {/* ADDRESS */}

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-stone-600" />
                      </div>

                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-400">
                          Address
                        </p>

                        <p className="text-sm font-semibold text-gray-800">
                          {selectedItem.contributorAddressMalayalam || "-"}
                        </p>

                        <p className="text-xs text-stone-500 mt-1">
                          {selectedItem.contributorCityMalayalam || "-"}
                          {selectedItem.contributorDistrictMalayalam &&
                            `, ${selectedItem.contributorDistrictMalayalam}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE - PROFILE IMAGE */}

                <div className="flex flex-col items-center md:w-52">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
                    Contributor
                  </h3>

                  {selectedItem.contributorProfileImageUrl ? (
                    <img
                      src={selectedItem.contributorProfileImageUrl}
                      alt={selectedItem.contributorNameMalayalam}
                      className="w-36 h-36 rounded-2xl object-cover border-4 border-stone-100 shadow-sm"
                    />
                  ) : (
                    <div className="w-36 h-36 rounded-2xl bg-emerald-50 border-4 border-stone-100 flex items-center justify-center">
                      <UserCircle className="h-16 w-16 text-emerald-800" />
                    </div>
                  )}

                  <p className="text-sm font-bold text-gray-800 mt-3 text-center">
                    {selectedItem.contributorNameMalayalam}
                  </p>
                </div>
              </div>

              {/* ================= SUBMISSION INFO ================= */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-stone-200">
                {/* TYPE */}

                <div className="bg-stone-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-stone-400 mb-2">
                    <FileText className="h-4 w-4" />

                    <span className="text-[10px] uppercase font-bold">
                      Submission Type
                    </span>
                  </div>

                  <p className="text-sm font-bold text-gray-800">
                    {selectedItem.type || "-"}
                  </p>
                </div>

                {/* PAYMENT */}

                <div className="bg-stone-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-stone-400 mb-2">
                    <CreditCard className="h-4 w-4" />

                    <span className="text-[10px] uppercase font-bold">
                      Payment Status
                    </span>
                  </div>

                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getPaymentStyle(
                      selectedItem.paymentStatus,
                    )}`}
                  >
                    {selectedItem.paymentStatus || "Pending"}
                  </span>
                </div>

                {/* DATE */}

                <div className="bg-stone-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-stone-400 mb-2">
                    <CalendarDays className="h-4 w-4" />

                    <span className="text-[10px] uppercase font-bold">
                      Submitted
                    </span>
                  </div>

                  <p className="text-sm font-bold text-gray-800">
                    {formatDate(selectedItem.createdDate)}
                  </p>
                </div>
              </div>

              {/* ================= FULL CONTENT ================= */}

              <div className="mt-8">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                  Full {selectedItem.type} Content
                </h3>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 max-h-[400px] overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-7">
                    {selectedItem.content}
                  </p>
                </div>
              </div>
            </div>

            {/* ================= MODAL FOOTER ================= */}

            <div className="flex justify-end px-6 py-4 border-t border-stone-200">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-5 py-2.5 bg-[#1b3b2b] hover:bg-emerald-950 text-white rounded-xl text-sm font-bold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
