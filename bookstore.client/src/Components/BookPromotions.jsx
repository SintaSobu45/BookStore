import React, { useEffect, useState } from "react";
import { getActivePromotionBanners } from "../services/promotionBannerService";
import { useNavigate } from "react-router-dom";

const BookPromotions = () => {
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadBanners();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await getActivePromotionBanners();
      setBanners(data || []);
    } catch (error) {
      console.error("Failed to load promotion banners:", error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && banners.length === 0) {
    return null;
  }

  return (
    <section className="container my-10 sm:my-12 lg:my-16">
      {/* Section heading */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-emerald-900" />
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Featured 
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Discover our latest offers and special collections
            </p>
          </div>
        </div>
      </div>

      {/* Loading skeleton matching desktop 450px height */}
      {loading && (
        <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-100 animate-pulse">
          <div className="w-full h-52 sm:h-72 lg:h-[450px]" />
        </div>
      )}

      {/* Carousel */}
      {!loading && banners.length > 0 && (
        <div id="promotionBannerCarousel" className="carousel slide relative">
          {/* Slides */}
          <div
            className="
              carousel-inner
              overflow-hidden
              rounded-2xl
              sm:rounded-3xl
              border
              border-gray-200
              shadow-sm
              cursor-pointer
            "
            onClick={() => navigate("/all/books")}
          >
            {banners.map((banner, index) => (
              <div
                key={banner.promotionBannerId}
                className={`carousel-item ${
                  index === activeIndex ? "active" : ""
                }`}
              >
                <picture>
                  {/* Mobile */}
                  <source
                    media="(max-width: 767px)"
                    srcSet={banner.mobileImageUrl}
                  />

                  {/* Tablet */}
                  <source
                    media="(max-width: 1023px)"
                    srcSet={banner.tabletImageUrl}
                  />

                  {/* Desktop */}
                  <img
                    src={banner.desktopImageUrl}
                    alt="Promotion banner"
                    className="
                      promotion-banner-image
                      w-full
                      lg:h-[450px]
                      h-auto
                      block
                      transition-transform
                      duration-500
                      hover:scale-[1.01]
                    "
                  />
                </picture>
              </div>
            ))}
          </div>

          {/* Round Circle Indicators at Bottom */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center items-center gap-2">
              {banners.map((banner, index) => (
                <button
                  key={banner.promotionBannerId}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(index);
                  }}
                  className={`
                    w-3 h-3 rounded-full transition-all duration-300 backdrop-blur-sm
                    ${
                      index === activeIndex
                        ? "bg-white scale-125 shadow-md"
                        : "bg-white/50 hover:bg-white/80"
                    }
                  `}
                  aria-current={index === activeIndex ? "true" : undefined}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default BookPromotions;