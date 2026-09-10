import React, { useEffect, useMemo, useState } from "react";

import {
  Home,
  ChevronRight,
  Leaf,
  BookOpen,
  Sparkles,
  ArrowRight,
  Lock,
  User,
  Mail,
  Phone,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { addStoryPoetry } from "../services/storyPoetryService";
import { getProfile } from "../services/profileService";

import { getPageWarningByPage } from "../services/pageWarningService";

export default function UploadPoetry() {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // AUTH
  // =========================================================

  const [isLoggedIn] = useState(!!localStorage.getItem("token"));

  // =========================================================
  // FORM STATES
  // =========================================================

  const [contentType, setContentType] = useState("Poetry");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  //show priview
  const [showPreview, setShowPreview] = useState(false);

  const [draftRestored, setDraftRestored] = useState(false);

  //important notice

  const [pageWarning, setPageWarning] = useState(null);

  //prefill unused data
  const DRAFT_STORAGE_KEY = "storyPoetryFormData";

  // =========================================================
  // CONTRIBUTOR DETAILS
  // =========================================================

  const [contributorNameMalayalam, setContributorNameMalayalam] = useState("");

  const [contributorDistrictMalayalam, setContributorDistrictMalayalam] =
    useState("");

  const [contributorCityMalayalam, setContributorCityMalayalam] = useState("");

  const [contributorEmail, setContributorEmail] = useState("");
  const [contributorPhone, setContributorPhone] = useState("");

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const [contributorProfileImage, setContributorProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");

  // =========================================================
  // UI STATES
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // =========================================================
  // SUCCESS TOAST
  // =========================================================

  const [successToast, setSuccessToast] = useState("");

  // =========================================================
  // CONTENT LIMIT CONFIGURATION
  // =========================================================

  const LINES_PER_SIDE = 30;
  const MAX_CHARACTERS_PER_LINE = 45;

  const STORY_MAX_LINES = LINES_PER_SIDE * 4;
  const POETRY_MAX_LINES = LINES_PER_SIDE;

  // =========================================================
  // COUNT MALAYALAM GRAPHEME CLUSTERS
  // =========================================================

  const countCharacters = (text) => {
    if (!text) return 0;

    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter("ml", {
        granularity: "grapheme",
      });

      return [...segmenter.segment(text)].length;
    }

    return [...text].length;
  };

  // =========================================================
  // CALCULATE VISUAL LINES
  // =========================================================

  const calculateVisualLineCount = (text) => {
    if (!text) return 0;

    const explicitLines = text.split(/\r?\n/);

    let visualLineCount = 0;

    explicitLines.forEach((line) => {
      if (line.length === 0) {
        visualLineCount += 1;
        return;
      }

      const characterCount = countCharacters(line);

      visualLineCount += Math.ceil(characterCount / MAX_CHARACTERS_PER_LINE);
    });

    return visualLineCount;
  };

  // =========================================================
  // CONTENT LINE INFORMATION
  // =========================================================

  const contentLineCount = useMemo(() => {
    return calculateVisualLineCount(content);
  }, [content]);

  // =========================================================
  // MAXIMUM ALLOWED LINES
  // =========================================================

  const maxContentLines = useMemo(() => {
    if (contentType === "Story") {
      return STORY_MAX_LINES;
    }

    if (contentType === "Poetry") {
      return POETRY_MAX_LINES;
    }

    return Infinity;
  }, [contentType]);

  // =========================================================
  // REQUIRED PAGES / SIDES
  // =========================================================

  const requiredSides = useMemo(() => {
    if (!content.trim()) {
      return 0;
    }

    return Math.max(1, Math.ceil(contentLineCount / LINES_PER_SIDE));
  }, [content, contentLineCount]);

  // =========================================================
  // CONTENT OVER LIMIT
  // =========================================================

  const isContentOverLimit =
    contentType !== "Special" && contentLineCount > maxContentLines;

  // =========================================================
  // WORD COUNT
  // =========================================================

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  // =========================================================
  // MALAYALAM VALIDATION
  // =========================================================

  const isMalayalamText = (text) => {
    if (!text.trim()) return true;

    // Just check that the content contains Malayalam characters
    return /\p{Script=Malayalam}/u.test(text);
  };

  const validateMalayalamField = (value, fieldName) => {
    if (value.trim() && !isMalayalamText(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: "മലയാളത്തിൽ മാത്രം നൽകുക.",
      }));

      return false;
    }

    setFieldErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    return true;
  };

  // =========================================================
  // HANDLE TITLE
  // =========================================================

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  // =========================================================
  // HANDLE CONTENT
  // =========================================================

  const handleContentChange = (e) => {
    const value = e.target.value;

    setContent(value);

    if (fieldErrors.content) {
      setFieldErrors((prev) => ({
        ...prev,
        content: "",
      }));
    }

    setError("");
  };

  // =========================================================
  // HANDLE IMAGE
  // =========================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    // FILE TYPE
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    // FILE SIZE
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    // SET IMAGE
    setContributorProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));

    setFieldErrors((prev) => ({
      ...prev,
      contributorProfileImage: "",
    }));
  };

  // =========================================================
  // SHOW SUCCESS TOAST
  // =========================================================

  const showSuccessToast = (type) => {
    setSuccessToast(`${type} submitted successfully!`);

    setTimeout(() => {
      navigate("/your/uploads");
    }, 1800);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const errors = {};

    // =======================================================
    // MALAYALAM ONLY VALIDATION
    // =======================================================

    if (title.trim() && !isMalayalamText(title)) {
      errors.title = "മലയാളത്തിൽ മാത്രം നൽകുക.";
    }

    if (content.trim() && !isMalayalamText(content)) {
      errors.content = "മലയാളത്തിൽ മാത്രം നൽകുക.";
    }

    if (
      contributorNameMalayalam.trim() &&
      !isMalayalamText(contributorNameMalayalam)
    ) {
      errors.contributorNameMalayalam = "മലയാളത്തിൽ മാത്രം നൽകുക.";
    }

    if (
      contributorDistrictMalayalam.trim() &&
      !isMalayalamText(contributorDistrictMalayalam)
    ) {
      errors.contributorDistrictMalayalam = "മലയാളത്തിൽ മാത്രം നൽകുക.";
    }

    if (
      contributorCityMalayalam.trim() &&
      !isMalayalamText(contributorCityMalayalam)
    ) {
      errors.contributorCityMalayalam = "മലയാളത്തിൽ മാത്രം നൽകുക.";
    }

    // =======================================================
    // TITLE
    // =======================================================

    if (!title.trim()) {
      errors.title = "* Please enter a title.";
    }

    // =======================================================
    // CONTENT
    // =======================================================

    if (!content.trim()) {
      errors.content = "Please write your content.";
    } else if (isContentOverLimit) {
      if (contentType === "Story") {
        errors.content = `കഥയ്ക്ക് പരമാവധി 4 sides (120 visual lines) മാത്രമാണ് അനുവദനീയമായത്. ഇപ്പോൾ ${contentLineCount} visual lines ഉണ്ട്.`;
      } else if (contentType === "Poetry") {
        errors.content = `കവിതയ്ക്ക് പരമാവധി 1 side (30 visual lines) മാത്രമാണ് അനുവദനീയമായത്. ഇപ്പോൾ ${contentLineCount} visual lines ഉണ്ട്.`;
      }
    }

    // =======================================================
    // CONTRIBUTOR NAME
    // =======================================================

    if (!contributorNameMalayalam.trim()) {
      errors.contributorNameMalayalam = "* Please enter contributor name.";
    }

    // =======================================================
    // DISTRICT
    // =======================================================

    if (!contributorDistrictMalayalam.trim()) {
      errors.contributorDistrictMalayalam =
        "* Please enter contributor district.";
    }

    // =======================================================
    // CITY
    // =======================================================

    if (!contributorCityMalayalam.trim()) {
      errors.contributorCityMalayalam = "* Please enter contributor city.";
    }

    // =======================================================
    // EMAIL
    // =======================================================

    if (!contributorEmail.trim()) {
      errors.contributorEmail = "* Please enter contributor email.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(contributorEmail.trim())) {
        errors.contributorEmail = "* Please enter a valid email address.";
      }
    }

    // =======================================================
    // PHONE
    // =======================================================

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(contributorPhone)) {
      errors.contributorPhone =
        "Phone number must be 10 digits and start with 6, 7, 8, or 9.";
    }

    // =======================================================
    // PROFILE IMAGE
    // =======================================================

    if (!contributorProfileImage) {
      errors.contributorProfileImage = "* Please upload your profile image.";
    }

    // =======================================================
    // STOP IF THERE ARE ERRORS
    // =======================================================

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    // =======================================================
    // LOGIN
    // =======================================================

    if (!isLoggedIn) {
      setError("Please login to submit your contribution.");
      return;
    }

    // =======================================================
    // EMAIL VALIDATION
    // =======================================================

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(contributorEmail.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // =======================================================
    // SUBMIT STORY / POETRY
    // =======================================================

    try {
      setLoading(true);

      // =====================================================
      // FORM DATA
      // =====================================================

      const storyPoetryData = {
        title: title.trim(),
        type: contentType,

        // Send original content exactly as entered.
        content: content.trim(),

        contributorNameMalayalam: contributorNameMalayalam.trim(),

        contributorDistrictMalayalam: contributorDistrictMalayalam.trim(),

        contributorCityMalayalam: contributorCityMalayalam.trim(),

        contributorEmail: contributorEmail.trim(),

        contributorPhone: contributorPhone,

        contributorProfileImage: contributorProfileImage,
      };

      console.log("Submitting Story/Poetry:", storyPoetryData);

      // =====================================================
      // CREATE STORY / POETRY
      // =====================================================

      const submissionResponse = await addStoryPoetry(storyPoetryData);

      console.log("Story/Poetry submission response:", submissionResponse);

      // =====================================================
      // GET CREATED STORYPOETRY ID
      // =====================================================

      const submission = submissionResponse?.data || submissionResponse;

      const storyPoetryId =
        submission?.storyPoetryId || submission?.StoryPoetryId;

      if (!storyPoetryId) {
        throw new Error(
          "Story/Poetry was submitted, but submission ID was not received.",
        );
      }

      console.log("Created StoryPoetryId:", storyPoetryId);

      // =====================================================
      // SUBMISSION SUCCESS
      // =====================================================

      setLoading(false);

      const contributionName =
        contentType === "Poetry"
          ? "Poetry"
          : contentType === "Story"
            ? "Story"
            : "Special contribution";

      // =====================================================
      // SHOW MODERN TOAST
      // =====================================================

      showSuccessToast(contributionName);

      //clear all fields
      showSuccessToast(contributionName);

      // Clear form after successful submission
      setTitle("");
      setContent("");

      setContributorNameMalayalam("");
      setContributorDistrictMalayalam("");
      setContributorCityMalayalam("");
      setContributorEmail("");
      setContributorPhone("");

      setContributorProfileImage(null);
      setProfileImagePreview("");

      setContentType("Poetry");
      setFieldErrors({});
    } catch (error) {
      console.error("Story/Poetry submission failed:", error);

      setError(error.message || "Failed to submit Story/Poetry.");

      setLoading(false);
    }
  };

  // =========================================================
  // SAVE DRAFT
  // =========================================================

  const handleSaveDraft = () => {
    if (!isLoggedIn) {
      setError("Please login to save a draft.");
      return;
    }

    const draft = {
      title,
      type: contentType,
      content,
      contributorNameMalayalam,
      contributorDistrictMalayalam,
      contributorCityMalayalam,
      contributorEmail,
      contributorPhone,
    };

    localStorage.setItem("storyPoetryDraft", JSON.stringify(draft));

    setSuccess("Draft saved successfully.");
  };

  // =========================================================
  // LOGIN / REGISTER
  // =========================================================

  const handleLogin = () => {
    navigate("/login", {
      state: {
        from: "/book/upload",
      },
    });
  };

  // =========================================================
  // TYPE OPTIONS
  // =========================================================

  const typeOptions = [
    {
      value: "Poetry",
      title: "Poetry",
      description: "Poems, verses, and creative expressions",
      icon: Leaf,
    },
    {
      value: "Story",
      title: "Story",
      description: "Short stories, articles, and write-ups",
      icon: BookOpen,
    },
    {
      value: "Special",
      title: "Special",
      description: "Special contributions and featured content",
      icon: Sparkles,
    },
  ];

  // important notice

  useEffect(() => {
    const loadPageWarning = async () => {
      try {
        const warning = await getPageWarningByPage("StoryPoetry");

        setPageWarning(warning);
      } catch (error) {
        console.error("Failed to load page warning:", error);
      }
    };

    loadPageWarning();
  }, []);

  // =========================================================
  // RESTORE DRAFT ON PAGE LOAD
  // =========================================================

  useEffect(() => {
    const savedData = sessionStorage.getItem(DRAFT_STORAGE_KEY);

    if (savedData) {
      try {
        const draft = JSON.parse(savedData);

        setContentType(draft.contentType || "Poetry");
        setTitle(draft.title || "");
        setContent(draft.content || "");

        setContributorNameMalayalam(draft.contributorNameMalayalam || "");

        setContributorDistrictMalayalam(
          draft.contributorDistrictMalayalam || "",
        );

        setContributorCityMalayalam(draft.contributorCityMalayalam || "");

        setContributorEmail(draft.contributorEmail || "");

        setContributorPhone(draft.contributorPhone || "");
      } catch (error) {
        console.error("Failed to restore Story/Poetry draft:", error);

        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }

    // Important: restoration is finished
    setDraftRestored(true);
  }, []);

  // =========================================================
  // SAVE FORM DATA AFTER DRAFT HAS BEEN RESTORED
  // =========================================================

  useEffect(() => {
    if (!draftRestored) {
      return;
    }

    const draftData = {
      contentType,
      title,
      content,
      contributorNameMalayalam,
      contributorDistrictMalayalam,
      contributorCityMalayalam,
      contributorEmail,
      contributorPhone,
    };

    sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
  }, [
    draftRestored,
    contentType,
    title,
    content,
    contributorNameMalayalam,
    contributorDistrictMalayalam,
    contributorCityMalayalam,
    contributorEmail,
    contributorPhone,
  ]);

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();

        console.log("Logged-in user profile:", profile);

        setContributorEmail(profile.email || "");
        setContributorPhone(profile.phone || "");
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    if (isLoggedIn) {
      loadProfile();
    }
  }, [isLoggedIn]);

  // =========================================================
  // LIMIT LABEL
  // =========================================================

  const limitLabel =
    contentType === "Story"
      ? `Story: ${contentLineCount}/${STORY_MAX_LINES} visual lines`
      : contentType === "Poetry"
        ? `Poetry: ${contentLineCount}/${POETRY_MAX_LINES} visual lines`
        : `Special: ${contentLineCount} visual lines (Unlimited pages)`;

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <>
      <Navbar />

      {/* =====================================================
        SUCCESS TOAST
    ===================================================== */}

      {successToast && (
        <div className="fixed top-5 right-5 z-[9999] w-[calc(100%-2rem)] max-w-sm">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-4 shadow-2xl">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-gray-900">
                {successToast}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuccessToast("")}
              className="shrink-0 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
        PAGE
    ===================================================== */}

      <div className="min-h-screen bg-stone-50/60 pb-16">
        {/* ===================================================
          HERO
      =================================================== */}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="bg-[#1b3b2b] border border-emerald-100/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-sm">
            <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-xl z-10 mb-6 md:mb-0">
              {/* BREADCRUMB */}

              <div className="flex items-center space-x-2 text-xs sm:text-sm text-emerald-200/80 font-medium mb-3">
                <Link
                  to="/"
                  className="hover:text-white flex items-center transition-colors"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>

                <ChevronRight className="h-3.5 w-3.5 text-stone-400" />

                <span className="text-white font-semibold">
                  Upload Poetry / Story
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                Share Your Creativity
              </h1>

              <p className="text-white text-xs sm:text-base leading-relaxed max-w-md font-medium">
                Submit your original poetry, stories, and special contributions
                to our community.
              </p>
            </div>

            {/* HERO IMAGE */}

            <div className="relative z-10 w-full md:w-[36%] flex justify-center">
              <div className="relative group w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-[#1b3b2b] rounded-2xl blur opacity-15" />

                <img
                  src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80"
                  alt="Writing poetry and stories"
                  className="relative rounded-xl sm:rounded-2xl object-cover w-full h-[120px] sm:h-[160px] md:h-[190px] shadow-md border border-white/80"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
          SUBMISSION NOTICE
      ===================================================== */}

        {/* =====================================================
    SUBMISSION NOTICE
===================================================== */}

        <div className="mx-3 sm:mx-4 md:mx-6 mb-4 sm:mb-6 overflow-hidden rounded-xl border border-red-200 bg-red-50">
          {/* MOBILE */}
          <div className="block sm:hidden px-3 py-3">
            {/* IMPORTANT */}
            <div className="mb-2">
              <span className="inline-block rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-extrabold text-red-700">
                IMPORTANT
              </span>
            </div>

            {/* STATIC CONTENT */}
            {pageWarning && (
              <p className="w-full text-[11px] leading-relaxed font-semibold text-red-700">
                {pageWarning.message}
              </p>
            )}
          </div>

          {/* DESKTOP */}
          <div className="hidden sm:flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
            {/* IMPORTANT */}
            <div className="shrink-0">
              <span className="inline-block rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-extrabold text-red-700">
                IMPORTANT
              </span>
            </div>

            {/* MOVING CONTENT CONTAINER */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="relative w-full overflow-hidden">
                {pageWarning && (
                  <div
                    className="whitespace-nowrap text-sm font-semibold text-red-700"
                    style={{
                      display: "inline-block",
                      animation: "submissionNoticeMarquee 30s linear infinite",
                      paddingLeft: "100%",
                    }}
                  >
                    {pageWarning.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DESKTOP MARQUEE ANIMATION */}
          <style>
            {`
      @keyframes submissionNoticeMarquee {
        0% {
          transform: translateX(0);
        }

        100% {
          transform: translateX(-100%);
        }
      }
    `}
          </style>
        </div>

        {/* ===================================================
          MAIN
      =================================================== */}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* MESSAGES */}

          {error && (
            <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* =================================================
            FORM WRAPPER
        ================================================= */}

          <div className="relative">
            {/* =================================================
              FORM
          ================================================= */}

            <div
              className={
                !isLoggedIn ? "blur-[1px] pointer-events-none select-none" : ""
              }
            >
              {/* =================================================
                IMPORTANT:

                MOBILE:
                grid-cols-1
                => Type
                => Content
                => Author

                DESKTOP:
                lg:grid-cols-12
                => Type | Content | Author

                NOTHING IS SWAPPED.
            ================================================= */}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5">
                {/* =================================================
                  COLUMN 1
                  TYPE
              ================================================= */}

                <div className="lg:col-span-3 bg-white border border-stone-200/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm">
                  <div className="mb-3 sm:mb-4">
                    <h3 className="font-bold text-gray-900 text-sm">
                      1. Choose Type
                    </h3>

                    <p className="text-[11px] text-stone-500">
                      Select your submission type
                    </p>
                  </div>

                  {/* =================================================
                    TYPE OPTIONS

                    DESKTOP:
                    Original vertical cards

                    MOBILE:
                    Compact horizontal cards
                ================================================= */}

                  <div className="space-y-2 sm:space-y-3">
                    {typeOptions.map((option) => {
                      const Icon = option.icon;
                      const selected = contentType === option.value;

                      return (
                        <div
                          key={option.value}
                          onClick={() => {
                            setContentType(option.value);

                            setFieldErrors((prev) => ({
                              ...prev,
                              content: "",
                            }));
                          }}
                          className={`
                          border-2
                          rounded-xl
                          sm:rounded-2xl
                          p-2.5
                          sm:p-3.5
                          cursor-pointer
                          transition-all

                          ${
                            selected
                              ? "border-[#1b3b2b] bg-emerald-50/30"
                              : "border-stone-200 hover:border-stone-300"
                          }
                        `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0 space-x-2.5 sm:space-x-3">
                              <div
                                className={`
                                p-2
                                sm:p-2
                                rounded-lg
                                sm:rounded-xl
                                shrink-0

                                ${
                                  selected
                                    ? "bg-[#1b3b2b] text-white"
                                    : "bg-emerald-100 text-emerald-900"
                                }
                              `}
                              >
                                <Icon className="h-4 w-4" />
                              </div>

                              <div className="min-w-0">
                                <h4 className="font-bold text-gray-900 text-xs sm:text-xs">
                                  {option.title}
                                </h4>

                                {/* Hide long descriptions on mobile
                                  to save vertical space */}

                                <p className="hidden sm:block text-[10px] text-stone-500 mt-0.5 leading-relaxed">
                                  {option.description}
                                </p>
                              </div>
                            </div>

                            <input
                              type="radio"
                              name="contentType"
                              checked={selected}
                              onChange={() => setContentType(option.value)}
                              className="accent-[#1b3b2b] shrink-0 ml-2"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* =================================================
                    LIMIT INFORMATION
                ================================================= */}

                  {/* <div className="mt-3 sm:mt-5 bg-stone-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-stone-200">
                    <p className="text-[10px] text-stone-600 leading-relaxed">
                      {contentType === "Story" ? (
                        <>
                          <strong className="text-stone-800">Story</strong>
                          <br />
                          4 sides / 2 sheets
                          <br />
                          30 visual lines per side
                          <br />
                        </>
                      ) : contentType === "Poetry" ? (
                        <>
                          <strong className="text-stone-800">Poetry</strong>
                          <br />
                          1 side
                          <br />
                          30 visual lines
                          <br />
                        </>
                      ) : (
                        <>
                          <strong className="text-stone-800">Special</strong>
                          <br />
                          Unlimited pages
                          <br />
                          30 visual lines per side
                          <br />
                        </>
                      )}
                    </p>
                  </div> */}
                </div>

                {/* =================================================
                  COLUMN 2
                  CONTENT

                  MOBILE:
                  Full width below Choose Type

                  DESKTOP:
                  SAME position as before
              ================================================= */}

                <div
                  className="
                  lg:col-span-5
                  w-full
                  min-w-0
                  bg-white
                  border
                  border-stone-200/80
                  rounded-2xl
                  sm:rounded-3xl
                  p-3
                  sm:p-5
                  shadow-sm
                  flex
                  flex-col
                "
                >
                  <div className="flex-1">
                    <div className="mb-3 sm:mb-4">
                      <h3 className="font-bold text-gray-900 text-sm">
                        3. Write Your {contentType}
                      </h3>

                      <p className="text-[11px] text-stone-500">
                        Write your title and original content in Malayalam.
                      </p>
                    </div>

                    {/* =================================================
                      TITLE
                  ================================================= */}

                    <div className="mb-3 sm:mb-4">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        Title (മലയാളം)
                        <span className="text-red-500"> *</span>
                      </label>

                      <input
                        type="text"
                        placeholder={`മലയാളത്തിൽ ${
                          contentType === "Poetry"
                            ? "കവിതയുടെ"
                            : contentType === "Story"
                              ? "കഥയുടെ"
                              : "രചനയുടെ"
                        } പേര് നൽകുക`}
                        value={title}
                        onChange={(e) => {
                          const value = e.target.value;

                          handleTitleChange(e);

                          validateMalayalamField(value, "title");
                        }}
                        maxLength={200}
                        lang="ml"
                        className={`
                        w-full
                        bg-stone-50/75
                        border
                        rounded-xl
                        px-3.5
                        py-2.5
                        text-sm
                        text-gray-800
                        focus:outline-none

                        ${
                          fieldErrors.title
                            ? "border-red-400 focus:border-red-500"
                            : "border-stone-200 focus:border-emerald-800"
                        }
                      `}
                      />

                      <div className="flex items-center justify-between mt-1">
                        <p
                          className={`
                          text-[9px]

                          ${
                            fieldErrors.title
                              ? "text-red-500"
                              : "text-stone-400"
                          }
                        `}
                        >
                          {fieldErrors.title ||
                            `${title.length}/200 characters`}
                        </p>

                        {!fieldErrors.title && (
                          <p className="text-[9px] text-stone-400">
                            {title.length}/200 characters
                          </p>
                        )}
                      </div>
                    </div>

                    {/* =================================================
                      CONTENT
                  ================================================= */}

                    <div>
                      <div
                        className={`
                        border
                        rounded-xl
                        sm:rounded-2xl
                        overflow-hidden
                        bg-stone-50/30
                        transition-colors

                        ${
                          fieldErrors.content || isContentOverLimit
                            ? "border-red-400"
                            : "border-stone-200"
                        }
                      `}
                      >
                        <textarea
                          rows={14}
                          placeholder={
                            contentType === "Poetry"
                              ? "മലയാളത്തിൽ നിങ്ങളുടെ കവിത ഇവിടെ എഴുതുക..."
                              : contentType === "Story"
                                ? "മലയാളത്തിൽ നിങ്ങളുടെ കഥ ഇവിടെ എഴുതുക..."
                                : "മലയാളത്തിൽ നിങ്ങളുടെ രചന ഇവിടെ എഴുതുക..."
                          }
                          value={content}
                          onChange={(e) => {
                            handleContentChange(e);

                            validateMalayalamField(e.target.value, "content");
                          }}
                          lang="ml"
                          spellCheck={false}
                          className="
                          w-full
                          min-w-0
                          p-3
                          sm:p-4
                          bg-transparent
                          text-[10px]
                          sm:text-sm
                          text-gray-800
                          focus:outline-none
                          resize-none
                          leading-relaxed
                          whitespace-pre-wrap
                          break-words
                          overflow-x-hidden
                          overflow-y-auto
                        "
                        />

                        {/* CONTENT COUNTER */}

                        <div
                          className={`
                          border-t
                          px-3
                          sm:px-4
                          py-2
                          text-[10px]
                          font-medium
                          flex
                          items-center
                          justify-between

                          ${
                            isContentOverLimit
                              ? "bg-red-50 border-red-200 text-red-600"
                              : "bg-stone-50 border-stone-200 text-stone-500"
                          }
                        `}
                        >
                          <span>Words: {wordCount}</span>

                          <span>{limitLabel}</span>
                        </div>
                      </div>

                      {/* EMPTY CONTENT ERROR */}

                      {fieldErrors.content && (
                        <p className="text-[10px] text-red-500 mt-1 font-medium">
                          {fieldErrors.content}
                        </p>
                      )}
                    </div>

                    {/* CONTENT ERROR / WARNING */}

                    {isContentOverLimit && (
                      <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        <p className="text-[10px] font-semibold text-red-600">
                          ⚠️{" "}
                          {contentType === "Story"
                            ? `Story is over the 4-side limit. Current: ${contentLineCount} visual lines / maximum: ${STORY_MAX_LINES}.`
                            : `Poetry is over the 1-side limit. Current: ${contentLineCount} visual lines / maximum: ${POETRY_MAX_LINES}.`}
                        </p>

                        <p className="text-[9px] text-red-500 mt-0.5">
                          The complete pasted content is kept. Please shorten
                          the content before submitting.
                        </p>
                      </div>
                    )}

                    {/* LIMIT REACHED */}

                    {!isContentOverLimit &&
                      contentLineCount > 0 &&
                      contentType !== "Special" &&
                      contentLineCount === maxContentLines && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          <p className="text-[10px] font-semibold text-amber-700">
                            ⚠️ You have reached the maximum allowed content
                            size.
                          </p>

                          <p className="text-[9px] text-amber-600 mt-0.5">
                            No additional visual lines can be added.
                          </p>
                        </div>
                      )}

                    {/* SPECIAL INFORMATION */}

                    {contentType === "Special" && contentLineCount > 0 && (
                      <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                        <p className="text-[10px] font-semibold text-emerald-700">
                          ✓ Special category has no page limit.
                        </p>

                        <p className="text-[9px] text-emerald-600 mt-0.5">
                          Current estimated length: {requiredSides}{" "}
                          {requiredSides === 1 ? "side" : "sides"}.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 sm:mt-3 bg-stone-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-stone-200">
                    <p className="text-[10px] text-stone-500 leading-relaxed">
                      Your submission will be reviewed by our administrators
                      before it is published.
                    </p>
                  </div>
                </div>

                {/* =================================================
                  COLUMN 3
                  AUTHOR

                  MOBILE:
                  Comes AFTER Content

                  DESKTOP:
                  REMAINS ON RIGHT
              ================================================= */}

                <div className="lg:col-span-4 bg-white border border-stone-200/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm">
                  <div className="mb-3 sm:mb-4">
                    <h3 className="font-bold text-gray-900 text-sm">
                      2. Author Details
                    </h3>

                    <p className="text-[11px] text-stone-500">
                      Enter your personal information in (malayalam)
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-3.5">
                    {/* =================================================
                      NAME
                  ================================================= */}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        പേര്
                        <span className="text-red-500"> *</span>
                      </label>

                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                        <input
                          type="text"
                          value={contributorNameMalayalam}
                          onChange={(e) => {
                            const value = e.target.value;

                            setContributorNameMalayalam(value);

                            validateMalayalamField(
                              value,
                              "contributorNameMalayalam",
                            );
                          }}
                          placeholder="Enter your name"
                          maxLength={200}
                          className={`
                          w-full
                          bg-stone-50/75
                          border
                          rounded-xl
                          py-2.5
                          pl-9
                          pr-3
                          text-xs
                          text-gray-800
                          focus:outline-none
                          focus:border-emerald-800

                          ${
                            fieldErrors.contributorNameMalayalam
                              ? "border-red-500"
                              : "border-stone-200"
                          }
                        `}
                        />
                      </div>

                      {fieldErrors.contributorNameMalayalam && (
                        <p className="text-[10px] text-red-500 font-medium mt-1">
                          {fieldErrors.contributorNameMalayalam}
                        </p>
                      )}
                    </div>

                    {/* =================================================
                      DISTRICT + CITY

                      DESKTOP:
                      SIDE BY SIDE

                      MOBILE:
                      ALSO SIDE BY SIDE
                      => SAVES SPACE
                  ================================================= */}

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                      {/* DISTRICT */}

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                          ജില്ല
                          <span className="text-red-500"> *</span>
                        </label>

                        <input
                          type="text"
                          value={contributorDistrictMalayalam}
                          onChange={(e) => {
                            const value = e.target.value;

                            setContributorDistrictMalayalam(value);

                            validateMalayalamField(
                              value,
                              "contributorDistrictMalayalam",
                            );
                          }}
                          placeholder="District"
                          maxLength={100}
                          className={`
                          w-full
                          bg-stone-50/75
                          border
                          rounded-xl
                          py-2.5
                          px-3
                          text-xs
                          text-gray-800
                          focus:outline-none
                          focus:border-emerald-800

                          ${
                            fieldErrors.contributorDistrictMalayalam
                              ? "border-red-500"
                              : "border-stone-200"
                          }
                        `}
                        />

                        {fieldErrors.contributorDistrictMalayalam && (
                          <p className="text-[10px] text-red-500 font-medium mt-1">
                            {fieldErrors.contributorDistrictMalayalam}
                          </p>
                        )}
                      </div>

                      {/* CITY */}

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                          നഗരം
                          <span className="text-red-500"> *</span>
                        </label>

                        <input
                          type="text"
                          value={contributorCityMalayalam}
                          onChange={(e) => {
                            const value = e.target.value;

                            setContributorCityMalayalam(value);

                            validateMalayalamField(
                              value,
                              "contributorCityMalayalam",
                            );
                          }}
                          placeholder="City"
                          maxLength={100}
                          className={`
                          w-full
                          bg-stone-50/75
                          border
                          rounded-xl
                          py-2.5
                          px-3
                          text-xs
                          text-gray-800
                          focus:outline-none
                          focus:border-emerald-800

                          ${
                            fieldErrors.contributorCityMalayalam
                              ? "border-red-500"
                              : "border-stone-200"
                          }
                        `}
                        />

                        {fieldErrors.contributorCityMalayalam && (
                          <p className="text-[10px] text-red-500 font-medium mt-1">
                            {fieldErrors.contributorCityMalayalam}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* =================================================
                      EMAIL
                  ================================================= */}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        Email
                        <span className="text-red-500"> *</span>
                      </label>

                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                        <input
                          type="email"
                          value={contributorEmail}
                          onChange={(e) => {
                            setContributorEmail(e.target.value);

                            if (fieldErrors.contributorEmail) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                contributorEmail: "",
                              }));
                            }
                          }}
                          placeholder="Enter your email"
                          maxLength={150}
                          className={`
                          w-full
                          bg-stone-50/75
                          border
                          rounded-xl
                          py-2.5
                          pl-9
                          pr-3
                          text-xs
                          text-gray-800
                          focus:outline-none
                          focus:border-emerald-800

                          ${
                            fieldErrors.contributorEmail
                              ? "border-red-500"
                              : "border-stone-200"
                          }
                        `}
                        />
                      </div>

                      {fieldErrors.contributorEmail && (
                        <p className="text-[10px] text-red-500 font-medium mt-1">
                          {fieldErrors.contributorEmail}
                        </p>
                      )}
                    </div>

                    {/* =================================================
                      PHONE
                  ================================================= */}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        Phone Number
                        <span className="text-red-500"> *</span>
                      </label>

                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />

                        <input
                          type="text"
                          value={contributorPhone}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);

                            setContributorPhone(value);

                            if (fieldErrors.contributorPhone) {
                              setFieldErrors((prev) => ({
                                ...prev,
                                contributorPhone: "",
                              }));
                            }
                          }}
                          placeholder="10 digit phone number"
                          maxLength={10}
                          className={`
                          w-full
                          bg-stone-50/75
                          border
                          rounded-xl
                          py-2.5
                          pl-9
                          pr-3
                          text-xs
                          text-gray-800
                          focus:outline-none
                          focus:border-emerald-800

                          ${
                            fieldErrors.contributorPhone
                              ? "border-red-500"
                              : "border-stone-200"
                          }
                        `}
                        />
                      </div>

                      {fieldErrors.contributorPhone && (
                        <p className="text-[10px] text-red-500 font-medium mt-1">
                          {fieldErrors.contributorPhone}
                        </p>
                      )}
                    </div>

                    {/* =================================================
                      PROFILE IMAGE
                  ================================================= */}

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        പ്രൊഫൈൽ ചിത്രം
                        <span className="text-red-500"> *</span>
                      </label>

                      <div className="flex items-center gap-3">
                        {profileImagePreview && (
                          <img
                            src={profileImagePreview}
                            alt="Profile preview"
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                          />
                        )}

                        <label className="flex-1 cursor-pointer">
                          <div
                            className={`
                            border
                            border-dashed
                            rounded-xl
                            px-3
                            py-2.5
                            transition-colors

                            ${
                              fieldErrors.contributorProfileImage
                                ? "border-red-400 bg-red-50"
                                : "border-stone-300 hover:bg-stone-50"
                            }
                          `}
                          >
                            <p className="text-[10px] font-semibold text-gray-700 truncate">
                              {contributorProfileImage
                                ? contributorProfileImage.name
                                : "Choose profile image"}
                            </p>

                            <p className="text-[9px] text-stone-400 mt-0.5">
                              JPG, PNG • Max 5 MB
                            </p>
                          </div>

                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <p className="text-[9px] text-red-600 mt-1.5 font-medium">
                        ⚠ Please upload a clear, high-quality profile image with
                        a plain/no background.
                      </p>

                      {fieldErrors.contributorProfileImage && (
                        <p className="text-[10px] text-red-500 mt-1 font-medium">
                          {fieldErrors.contributorProfileImage}
                        </p>
                      )}
                    </div>

                    {/* =================================================
                      ACTIONS
                  ================================================= */}

                    <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                      {/* PREVIEW */}

                      <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        disabled={!title.trim() && !content.trim()}
                        className="
                        flex-1
                        border
                        border-[#1b3b2b]
                        text-[#1b3b2b]
                        hover:bg-emerald-50
                        font-bold
                        py-2.5
                        sm:py-3
                        px-3
                        sm:px-4
                        rounded-xl
                        transition-colors
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-xs
                        cursor-pointer
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                      >
                        <BookOpen className="h-4 w-4" />

                        <span>Preview</span>
                      </button>

                      {/* SUBMIT */}

                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || isContentOverLimit}
                        className="
                        flex-1
                        bg-[#1b3b2b]
                        hover:bg-emerald-950
                        text-white
                        font-bold
                        py-2.5
                        sm:py-3
                        px-3
                        sm:px-4
                        rounded-xl
                        shadow-md
                        transition-colors
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-xs
                        cursor-pointer
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : isContentOverLimit ? (
                          <span>
                            {contentType === "Story"
                              ? "4 Sides Maximum"
                              : "1 Side Maximum"}
                          </span>
                        ) : (
                          <>
                            <span>Submit</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                LOGIN OVERLAY
            ================================================= */}

            {!isLoggedIn && (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="bg-white/95  border border-stone-200 shadow-2xl rounded-3xl px-8 py-9 text-center max-w-sm w-full mx-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-5">
                    <Lock className="w-7 h-7 text-[#1b3b2b]" />
                  </div>

                  <h2 className="text-xl font-extrabold text-gray-900">
                    Login Required
                  </h2>

                  <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                    Please login to upload your story or poetry and share your
                    creativity with our community.
                  </p>

                  <button
                    onClick={handleLogin}
                    className="mt-6 w-full bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Login</span>

                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-xs text-stone-400 mt-4">
                    New user?{" "}
                    <button
                      onClick={() => navigate("/register")}
                      className="text-[#1b3b2b] font-bold hover:underline cursor-pointer"
                    >
                      Register here
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
        POETRY / CONTENT PREVIEW
    ===================================================== */}

      {showPreview && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6">
          <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            {/* HEADER */}

            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-stone-200">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Preview
                </h2>

                <p className="text-[9px] sm:text-xs text-stone-500 mt-0.5">
                  This is how your {contentType.toLowerCase()} will appear.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600" />
              </button>
            </div>

            {/* PREVIEW BODY */}

            <div className="max-h-[calc(95vh-65px)] sm:max-h-[calc(90vh-80px)] overflow-y-auto">
              {/* TITLE */}

              <div className="px-4 sm:px-8 pt-5 sm:pt-8">
                <h1 className="text-lg sm:text-3xl font-extrabold text-[#1b3b2b] break-words">
                  {title || "Untitled"}
                </h1>

                <div className="mt-2 h-1 w-10 sm:w-16 bg-[#1b3b2b] rounded-full" />
              </div>

              {/* CONTENT */}

              <div className="px-3 sm:px-8 py-5 sm:py-8">
                <div
                  className="
                  w-full
                  overflow-hidden
                  rounded-2xl
                  bg-stone-50
                  border
                  border-stone-200
                  p-3
                  sm:p-6
                "
                >
                  <div
                    className="
                    w-full
                    whitespace-pre-wrap
                    break-words
                    text-[11px]
                    sm:text-lg
                    text-gray-800
                    leading-[1.7]
                    sm:leading-[2]
                    font-medium
                  "
                  >
                    {content || "No content written yet."}
                  </div>
                </div>
              </div>

              {/* AUTHOR */}

              <div className="px-4 sm:px-8 pb-5 sm:pb-8">
                <div className="border-t border-stone-200 pt-3 sm:pt-4">
                  <p className="text-[11px] sm:text-sm font-bold text-gray-800">
                    {contributorNameMalayalam || "Contributor"}
                  </p>

                  <p className="text-[9px] sm:text-xs text-stone-500 mt-1">
                    {contributorCityMalayalam}

                    {contributorCityMalayalam && contributorDistrictMalayalam
                      ? ", "
                      : ""}

                    {contributorDistrictMalayalam}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
