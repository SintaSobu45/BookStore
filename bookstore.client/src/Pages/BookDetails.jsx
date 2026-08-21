import React, { useEffect, useState } from "react";

import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  RefreshCw,
  ShieldCheck,
  Check,
  BookOpen,
  Layers,
  Building,
  Award,
  Calendar,
} from "lucide-react";

import { Link, useNavigate, useParams } from "react-router-dom";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

import { getBookById, getBooks } from "../services/bookService";

import { getReviewsByBookId, addReview } from "../services/reviewService";
import { getAuthorById } from "../services/authorService";
import { addToCart } from "../services/cartService";
import { notifyCartUpdated } from "../utils/cartEvents";
import { toast } from "react-toastify";

export default function BookDetail() {
  // =========================
  // URL
  // =========================

  const { id } = useParams();

  const navigate = useNavigate();

  // =========================
  // State
  // =========================

  const [activeTab, setActiveTab] = useState("about");

  const [book, setBook] = useState(null);

  const [relatedBooks, setRelatedBooks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [author, setAuthor] = useState(null);

  const [addingToCart, setAddingToCart] = useState(false);

  // =========================
  // Reviews State
  // =========================

  const [reviews, setReviews] = useState([]);

  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [reviewsError, setReviewsError] = useState("");

  const [showReviewForm, setShowReviewForm] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);

  const [reviewComment, setReviewComment] = useState("");

  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [reviewSuccess, setReviewSuccess] = useState("");

  const [reviewSubmitError, setReviewSubmitError] = useState("");

  // =========================
  // Load Book
  // =========================
  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBookById(id);

        console.log("Book details:", data);

        setBook(data);

        if (data.authorId) {
          const authorData = await getAuthorById(data.authorId);

          console.log("Author:", authorData);

          setAuthor(authorData);
        }
      } catch (error) {
        console.error("Failed to load book:", error);

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  // =========================
  // Load Reviews
  // =========================

  useEffect(() => {
    if (!id) return;

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);

        setReviewsError("");

        const data = await getReviewsByBookId(Number(id));

        console.log("Book reviews:", data);

        setReviews(data || []);
      } catch (error) {
        console.error("Error loading reviews:", error);

        setReviewsError("Failed to load reviews.");
      } finally {
        setReviewsLoading(false);
      }
    };

    loadReviews();
  }, [id]);

  // =========================
  // Load Related Books
  // =========================

  useEffect(() => {
    const loadRelatedBooks = async () => {
      try {
        const data = await getBooks();

        const filteredBooks = data
          .filter((item) => item.bookId !== Number(id) && item.isActive)
          .slice(0, 3);

        setRelatedBooks(filteredBooks);
      } catch (error) {
        console.error("Failed to load related books:", error);
      }
    };

    loadRelatedBooks();
  }, [id]);

  // =========================
  // Get Logged In User
  // =========================

  const getLoggedInUserId = () => {
    // Check direct userId
    const directUserId = localStorage.getItem("userId");

    if (directUserId) {
      return Number(directUserId);
    }

    // Check user object
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        const user = JSON.parse(userData);

        return Number(user.userId || user.id || user.UserId);
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }

    // Check loggedInUser object
    const loggedInUser = localStorage.getItem("loggedInUser");

    if (loggedInUser) {
      try {
        const user = JSON.parse(loggedInUser);

        return Number(user.userId || user.id || user.UserId);
      } catch (error) {
        console.error("Failed to parse logged in user:", error);
      }
    }

    return null;
  };

  // =========================
  // Add Review
  // =========================

  const handleAddReview = async () => {
    setReviewSubmitError("");

    setReviewSuccess("");

    const userId = getLoggedInUserId();

    if (!userId) {
      setReviewSubmitError("Please login to write a review.");

      return;
    }

    if (!reviewComment.trim()) {
      setReviewSubmitError("Please write a comment.");

      return;
    }

    try {
      setReviewSubmitting(true);

      const reviewData = {
        rating: Number(reviewRating),

        comment: reviewComment.trim(),

        bookId: Number(book.bookId || book.id),

        userId: Number(userId),
      };

      console.log("Submitting review:", reviewData);

      const response = await addReview(reviewData);

      console.log("Review added:", response);

      setReviewSuccess("Review added successfully!");

      setReviewComment("");

      setReviewRating(5);

      // Reload reviews
      const updatedReviews = await getReviewsByBookId(
        Number(book.bookId || book.id),
      );

      setReviews(updatedReviews || []);

      setShowReviewForm(false);
    } catch (error) {
      console.error("Failed to add review:", error);

      setReviewSubmitError(error.message || "Failed to add review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // =========================
  // Add To Cart
  // =========================

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);

      const bookId = Number(book.bookId || book.id);

      await addToCart(bookId, 1);

      notifyCartUpdated();

      toast.success("Book added to cart!", {
        autoClose: 500,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);

      toast.error(error.message || "Failed to add book to cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  // =========================
  // Buy Now
  // =========================

  const handleBuyNow = async () => {
    try {
      setAddingToCart(true);

      const bookId = Number(book.bookId || book.id);

      if (!bookId) {
        toast.error("Invalid book.");
        return;
      }

      if (book.stockQuantity <= 0) {
        toast.error("This book is out of stock.");
        return;
      }

      // Add the book to cart
      await addToCart(bookId, 1);

      // Notify navbar/cart components
      notifyCartUpdated();

      // Go directly to checkout
      navigate("/checkout");
    } catch (error) {
      console.error("Buy Now failed:", error);

      toast.error(error.message || "Unable to proceed to checkout.");
    } finally {
      setAddingToCart(false);
    }
  };

  // =========================
  // Calculate Average Rating
  // =========================

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading book details...</p>
        </div>

        <Footer />
      </>
    );
  }

  // =========================
  // Error / Not Found
  // =========================

  if (error || !book) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Book not found
            </h2>

            <p className="text-gray-500">
              {error || "Unable to load this book."}
            </p>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  // =========================
  // Return
  // =========================

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-white pb-16">
        {/* =========================
                    Breadcrumbs
                ========================= */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-xs sm:text-sm text-gray-500 font-medium">
          <span
            className="cursor-pointer hover:text-gray-900"
            onClick={() => navigate("/")}
          >
            Home
          </span>

          <span className="mx-1.5">&gt;</span>

          <Link to={"/all/books"} className="hover:text-black">
            Books
          </Link>

          <span className="mx-1.5">&gt;</span>

          <span className="text-gray-900 font-semibold">{book.title}</span>
        </div>

        {/* =========================
                    Main Book Section
                ========================= */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* =========================
                            Left Column
                        ========================= */}

            <div className="lg:col-span-5 space-y-4">
              {/* Main Image */}

              <div className="relative bg-[#FAF8F5] border border-stone-200/80 rounded-3xl p-6 flex items-center justify-center shadow-sm h-[420px]">
                {book.isBestseller && (
                  <span className="absolute top-4 left-4 bg-emerald-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    Bestseller
                  </span>
                )}

                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="max-h-full max-w-full object-contain rounded-xl shadow-md"
                  />
                ) : (
                  <div className="text-6xl">📚</div>
                )}
              </div>
            </div>

            {/* =========================
                            Middle Column
                        ========================= */}

            <div className="lg:col-span-4 space-y-5">
              {/* Category + Title */}

              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  {book.categoryName || "Book"}
                </span>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 mb-1">
                  {book.title}
                </h1>

                <p className="text-sm text-gray-600">
                  by
                  <span className="font-semibold text-gray-900 ml-1">
                    {book.authorName || "Unknown Author"}
                  </span>
                </p>
              </div>

              {/* Ratings & Sold Count */}

              <div className="flex items-center space-x-3 text-sm border-y border-stone-100 py-3">
                <div className="flex items-center space-x-1 text-amber-500 font-bold">
                  <Star className="h-4 w-4 fill-current" />

                  <span className="text-gray-900">{averageRating}</span>

                  <span className="text-gray-400 font-normal">
                    ({reviews.length} Reviews)
                  </span>
                </div>

                <span className="text-stone-300">|</span>

                <span className="text-gray-500 font-medium">Available</span>
              </div>

              {/* Description */}

              <p className="text-sm text-gray-600 leading-relaxed pt-2">
                {book.description || "No description available for this book."}
              </p>

              {/* Additional Details */}

              <div className="bg-stone-50/80 border border-stone-200/60 rounded-2xl p-4 space-y-2 text-xs text-gray-700">
                {/* Publisher */}

                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center">
                    <Building className="h-3.5 w-3.5 mr-1.5" />
                    Publisher
                  </span>

                  <span className="font-semibold">
                    {book.publisherName || "-"}
                  </span>
                </div>

                {/* ISBN */}

                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center">
                    <Award className="h-3.5 w-3.5 mr-1.5" />
                    ISBN
                  </span>

                  <span className="font-semibold">{book.isbn || "-"}</span>
                </div>

                {/* Published Date */}

                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    Published on
                  </span>

                  <span className="font-semibold">
                    {book.publishedDate
                      ? new Date(book.publishedDate).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* =========================
                            Right Column
                        ========================= */}

            <div className="lg:col-span-3 space-y-6">
              {/* Buy Box */}

              <div className="bg-white border border-stone-200/80 rounded-3xl p-6 space-y-5 shadow-sm">
                {/* Pricing */}

                {/* Pricing */}

                <div className="flex items-baseline flex-wrap gap-3">
                  {/* Discounted / Current Price */}
                  <span className="text-3xl font-extrabold text-gray-900">
                    ₹{Number(book.discountedPrice ?? book.price).toFixed(0)}
                  </span>

                  {/* Original Price */}
                  {Number(book.discountPercentage || 0) > 0 &&
                    Number(book.discountedPrice) < Number(book.price) && (
                      <span className="text-sm text-gray-400 line-through font-medium">
                        ₹{Number(book.price).toFixed(0)}
                      </span>
                    )}

                  {/* Discount Badge */}
                  {Number(book.discountPercentage || 0) > 0 &&
                    Number(book.discountedPrice) < Number(book.price) && (
                      <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-1 rounded-md">
                        {Number(book.discountPercentage)}% OFF
                      </span>
                    )}
                </div>

                {/* Stock Badge */}

                <div
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    book.stockQuantity > 0
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />

                  <span>
                    {book.stockQuantity > 0
                      ? `In Stock (${book.stockQuantity})`
                      : "Out of Stock"}
                  </span>
                </div>

                {/* Language & Format */}

                <div className="space-y-2.5 pt-2 border-t border-stone-100 text-xs text-gray-700">
                  {/* Language */}

                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center">
                      <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                      Language
                    </span>

                    <span className="font-bold text-gray-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                      Malayalam
                    </span>
                  </div>

                  {/* Format */}

                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 flex items-center">
                      <Layers className="h-3.5 w-3.5 mr-1.5" />
                      Format
                    </span>

                    <span className="font-bold text-gray-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                      Paperback
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}

                <div className="space-y-3 pt-3 border-t border-stone-100">
                  {/* Add Cart */}

                  <button
                    onClick={handleAddToCart}
                    disabled={book.stockQuantity <= 0 || addingToCart}
                    className={`w-full font-medium py-3 px-4 rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-colors text-sm ${
                      book.stockQuantity > 0 && !addingToCart
                        ? "bg-emerald-900 hover:bg-emerald-800 text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />

                    <span>{addingToCart ? "Adding..." : "Add to Cart"}</span>
                  </button>

                  {/* Buy + Wishlist */}

                  <div className="flex space-x-2">
                    <button
                      onClick={handleBuyNow}
                      disabled={book.stockQuantity <= 0 || addingToCart}
                      className={`flex-1 border border-emerald-900 text-emerald-900 font-medium py-2.5 px-3 rounded-xl transition-colors text-xs ${
                        book.stockQuantity > 0 && !addingToCart
                          ? "hover:bg-emerald-50 cursor-pointer"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {addingToCart ? "Processing..." : "Buy Now"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Policies Box */}

              <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-4 shadow-sm text-sm">
                {/* Free Shipping */}


                {/* Payment */}

                <div className="flex items-start space-x-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-800 shrink-0 mt-0.5" />

                  <div>
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm">
                      Secure Payment
                    </h4>

                    <p className="text-xs text-gray-500">
                      100% secure checkout
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================
                        Bottom Section
                    ========================= */}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
            {/* =========================
                            Tabs
                        ========================= */}

            <div className="lg:col-span-8 bg-white border border-stone-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              {/* Tab Headers */}

              <div className="flex border-b border-stone-200 space-x-8 text-sm font-semibold mb-6">
                {/* About */}

                <button
                  onClick={() => setActiveTab("about")}
                  className={`pb-3 transition-colors relative cursor-pointer ${
                    activeTab === "about"
                      ? "text-emerald-900 border-b-2 border-emerald-900 font-bold"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  About the Book
                </button>

                {/* Author */}

                <button
                  onClick={() => setActiveTab("author")}
                  className={`pb-3 transition-colors relative cursor-pointer ${
                    activeTab === "author"
                      ? "text-emerald-900 border-b-2 border-emerald-900 font-bold"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  Author
                </button>

                {/* Reviews */}

                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-3 transition-colors relative cursor-pointer ${
                    activeTab === "reviews"
                      ? "text-emerald-900 border-b-2 border-emerald-900 font-bold"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
              </div>

              {/* =========================
                                About
                            ========================= */}

              {activeTab === "about" && (
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                  <p>
                    {book.description ||
                      "No description available for this book."}
                  </p>
                </div>
              )}

              {/* =========================
                                Author
                            ========================= */}

              {activeTab === "author" && (
                <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                  <div>
                    <h4 className="font-bold text-green-900 text-lg">
                      {author?.authorName ||
                        book.authorName ||
                        "Unknown Author"}
                    </h4>
                  </div>

                  <div className="pt-3 border-t border-stone-100">
                    <p>
                      {author?.biography
                        ? author.biography
                        : "No biography available for this author."}
                    </p>
                  </div>
                </div>
              )}

              {/* =========================
                                Reviews
                            ========================= */}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Review Header */}

                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div>
                      <h4 className="font-bold text-gray-900">
                        Customer Reviews
                      </h4>

                      <p className="text-xs text-gray-500">
                        {reviews.length > 0
                          ? `Based on ${reviews.length} customer review${reviews.length === 1 ? "" : "s"}`
                          : "No reviews yet"}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowReviewForm(!showReviewForm);
                        setReviewSuccess("");
                        setReviewSubmitError("");
                      }}
                      className="bg-emerald-900 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                    >
                      {showReviewForm ? "Cancel" : "Write a Review"}
                    </button>
                  </div>

                  {/* Review Form */}

                  {showReviewForm && (
                    <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-5 space-y-4">
                      <h4 className="font-bold text-gray-900 text-sm">
                        Write Your Review
                      </h4>

                      {/* Rating */}

                      <div>
                        <p className="text-xs text-gray-500 mb-2">
                          Your Rating
                        </p>

                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewRating(rating)}
                              className="cursor-pointer"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  rating <= reviewRating
                                    ? "text-amber-500 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}

                      <div>
                        <p className="text-xs text-gray-500 mb-2">
                          Your Review
                        </p>

                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          maxLength={1000}
                          rows={4}
                          placeholder="Write your review..."
                          className="w-full bg-white border border-stone-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-700 resize-none"
                        />

                        <p className="text-right text-xs text-gray-400 mt-1">
                          {reviewComment.length}/1000
                        </p>
                      </div>

                      {/* Error */}

                      {reviewSubmitError && (
                        <p className="text-xs text-red-600">
                          {reviewSubmitError}
                        </p>
                      )}

                      {/* Success */}

                      {reviewSuccess && (
                        <p className="text-xs text-emerald-700 font-medium">
                          {reviewSuccess}
                        </p>
                      )}

                      {/* Submit */}

                      <button
                        onClick={handleAddReview}
                        disabled={reviewSubmitting}
                        className={`bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold px-5 py-2.5 rounded-xl ${
                          reviewSubmitting
                            ? "opacity-60 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  )}

                  {/* Reviews Error */}

                  {reviewsError && (
                    <div className="text-sm text-red-600">{reviewsError}</div>
                  )}

                  {/* Loading Reviews */}

                  {reviewsLoading && (
                    <div className="text-sm text-gray-500">
                      Loading reviews...
                    </div>
                  )}

                  {/* Real Reviews */}

                  {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.reviewId}
                          className="bg-stone-50/60 border border-stone-200/50 rounded-2xl p-4 space-y-2"
                        >
                          {/* Name + Date */}

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 text-sm">
                              {review.userName || "Anonymous"}
                            </span>

                            <span className="text-xs text-gray-400">
                              {review.createdDate
                                ? new Date(
                                    review.createdDate,
                                  ).toLocaleDateString()
                                : ""}
                            </span>
                          </div>

                          {/* Stars */}

                          <div className="flex text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 ${
                                  star <= Number(review.rating)
                                    ? "fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Comment */}

                          {review.comment && (
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Reviews */}

                  {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                    <div className="text-sm text-gray-500">
                      No customer reviews available yet.
                    </div>
                  )}
                </div>
              )}

              {/* =========================
                                Q&A
                            ========================= */}

              {activeTab === "qa" && (
                <div className="space-y-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">
                    Have a question about this book?
                  </p>

                  <input
                    type="text"
                    placeholder="Ask a question..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs outline-none focus:border-emerald-700"
                  />
                </div>
              )}
            </div>

            {/* =========================
                            Related Books
                        ========================= */}

            <div className="lg:col-span-4 bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-base">
                  You May Also Like
                </h3>

                <button
                  onClick={() => navigate("/")}
                  className="text-xs text-emerald-800 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {relatedBooks.map((item) => (
                  <div
                    key={item.bookId}
                    onClick={() => navigate(`/book/${item.bookId}`)}
                    className="flex items-center space-x-4 p-2 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer border border-transparent hover:border-stone-100"
                  >
                    {/* Image */}

                    <div className="h-16 w-14 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-stone-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          📚
                        </div>
                      )}
                    </div>

                    {/* Details */}

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">
                        {item.title}
                      </h4>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-emerald-900">
                          ₹
                          {Number(item.discountedPrice ?? item.price).toFixed(
                            0,
                          )}
                        </span>

                        {Number(item.discountPercentage || 0) > 0 &&
                          Number(item.discountedPrice) < Number(item.price) && (
                            <span className="text-[10px] text-gray-400 line-through">
                              ₹{Number(item.price).toFixed(0)}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                ))}

                {relatedBooks.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No related books available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
