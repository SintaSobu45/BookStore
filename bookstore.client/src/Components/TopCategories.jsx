import React, { useEffect, useState } from "react";
import { BookOpen, ArrowRight } from "lucide-react";
import { getCategories } from "../services/categoryService";
import { useNavigate } from "react-router-dom";

// =====================================================
// Category Images
// =====================================================

const getCategoryImages = (categoryName) => {
  const name = categoryName.toLowerCase();



  // =====================================================
  // Mystery
  // =====================================================
  if (name.includes("mystery") || name.includes("മിസ്റ്ററി")) {
    return {
      front:
        "https://cdn.wallpapersafari.com/14/3/VA3Wwa.jpg",

      back: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Fantasy
  // =====================================================
  if (name.includes("fantasy") || name.includes("ഫാന്റസി")) {
    return {
      front:
        "https://i.redd.it/d6v49z71j5ya1.jpg",

      back: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Thriller
  // =====================================================
  if (name.includes("thriller") || name.includes("ത്രില്ലർ")) {
    return {
      front:
        "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?auto=format&fit=crop&w=600&q=80",

      back: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Horror
  // =====================================================
  if (name.includes("horror") || name.includes("ഹൊറർ")) {
    return {
      front:
        "https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG9ycm9yJTIwd2FsbHBhcGVyfGVufDB8fDB8fHww",

      back: "https://images.unsplash.com/photo-1505635552518-3448ff116af3?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Fiction / Novel
  // =====================================================
  if (
    name.includes("fiction") ||
    name.includes("novel") ||
    name.includes("നോവൽ")
  ) {
    return {
      front:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",

      back: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Poetry
  // =====================================================
  if (
    name.includes("poetry") ||
    name.includes("poem") ||
    name.includes("കവിത")
  ) {
    return {
      front:
        "https://wallpapercave.com/wp/wp15480641.jpg",

      back: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // History
  // =====================================================
  if (name.includes("history") || name.includes("ചരിത്രം")) {
    return {
      front:
        "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80",

      back: "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Education
  // =====================================================
  if (
    name.includes("education") ||
    name.includes("educational") ||
    name.includes("വിദ്യാഭ്യാസം")
  ) {
    return {
      front:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",

      back: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Children
  // =====================================================
  if (
    name.includes("children") ||
    name.includes("kids") ||
    name.includes("child") ||
    name.includes("കുട്ടി")
  ) {
    return {
      front:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLAhPXGhR-tU36xzUPuifDWP_jMqZLT8lSUrDE5wzKlhgiLErvTTcC2ik&s=10",

      back: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Language
  // =====================================================
  if (name.includes("language") || name.includes("ഭാഷ")) {
    return {
      front:
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",

      back: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Romance
  // =====================================================
  if (
    name.includes("romance") ||
    name.includes("love") ||
    name.includes("പ്രണയം")
  ) {
    return {
      front:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKUJnlk_rCivA3RyYnxhfQBUhZ42XTMA0Fd2Fdk6mST40xh4MVg7I99GdE&s=10",

      back: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Biography
  // =====================================================
  if (
    name.includes("biography") ||
    name.includes("autobiography") ||
    name.includes("ജീവചരിത്രം")
  ) {
    return {
      front:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",

      back: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Motivation / Self Help
  // =====================================================
  if (
    name.includes("self") ||
    name.includes("motivation") ||
    name.includes("personal") ||
    name.includes("പ്രചോദനം")
  ) {
    return {
      front:
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80",

      back: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
// Motivation / Self Help
// =====================================================
if (
  name.includes("self") ||
  name.includes("motivation") ||
  name.includes("personal") ||
  name.includes("പ്രചോദനം")
) {
  return {
    front:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80",

    back:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
  };
}

// =====================================================
// Inspiration
// =====================================================
if (
  name.includes("inspiration") ||
  name.includes("inspirational") ||
  name.includes("inspire") ||
  name.includes("പ്രചോദന")
) {
  return {
    front:
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80",

    back:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=600&q=80",
  };
}

// =====================================================
// Religion / Spiritual
// =====================================================
if (
  name.includes("religion") ||
  name.includes("spiritual") ||
  name.includes("മതം")
) {
  return {
    front:
      "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=600&q=80",

    back:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80",
  };
}

  // =====================================================
  // Religion / Spiritual
  // =====================================================
  if (
    name.includes("religion") ||
    name.includes("spiritual") ||
    name.includes("മതം")
  ) {
    return {
      front:
        "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=600&q=80",

      back: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // World / International
  // =====================================================
  if (
    name.includes("world") ||
    name.includes("international") ||
    name.includes("ലോക")
  ) {
    return {
      front:
        "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=600&q=80",

      back: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Reference / Library
  // =====================================================
  if (name.includes("reference") || name.includes("library")) {
    return {
      front:
        "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80",

      back: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80",
    };
  }

  // =====================================================
  // Default
  // =====================================================
  return {
    front:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=600&q=80",

    back: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80",
  };
};

export default function TopCategories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // Load categories
  // =====================================================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);

        setError("");

        const data = await getCategories();

        console.log("Categories from backend:", data);

        const fixedCategories = [
          { id: 1, name: "Fiction" },
          { id: 2, name: "Poetry" },
          { id: 3, name: "Mystery" },
          { id: 4, name: "Fantasy" },
          { id: 5, name: "Thriller" },
          { id: 6, name: "Horror" },
          { id: 7, name: "Romance" },
          { id: 8, name: "History" },
          { id: 9, name: "Biography" },
          { id: 10, name: "Children" },
          { id: 11, name: "Education" },
          { id: 12, name: "Motivation" },
        ];

        // Only active categories
        // Maximum 12
        const activeCategories = data
          .filter((category) => category.isActive)
          .slice(0, 12)
          .map((category) => {
            const images = getCategoryImages(category.categoryName);

            return {
              id: category.categoryId,
              name: category.categoryName,
              frontImage: images.front,
              backImage: images.back,
            };
          });

        setCategories(activeCategories);

        
      } catch (error) {
        console.error("Failed to load categories:", error);

        setError("Unable to load categories.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  // =====================================================
  // Category click
  // =====================================================

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <section
      className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-10
        "
    >
      {/* ================================================= */}
      {/* Section Header */}
      {/* ================================================= */}

      <div
        className="
                flex
                items-center
                justify-between
                mb-7
            "
      >
        <div>
          <h2
            className="
                        text-2xl
                        sm:text-3xl
                        font-bold
                        text-gray-900
                    "
          >
            Top Categories
          </h2>

          <p
            className="
                        text-sm
                        text-gray-500
                        mt-1
                    "
          >
            Explore books by category
          </p>
        </div>
      </div>

      {/* ================================================= */}
      {/* Loading */}
      {/* ================================================= */}

      {loading && (
        <div
          className="
                    grid
                    grid-cols-2
                    sm:grid-cols-3
                    md:grid-cols-4
                    lg:grid-cols-5
                    xl:grid-cols-5
                    gap-4
                    sm:gap-5
                "
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
            <div
              key={item}
              className="
                                w-full
                                h-[280px]
                                sm:h-[320px]
                                rounded-2xl
                                bg-gray-100
                                animate-pulse
                            "
            />
          ))}
        </div>
      )}

      {/* ================================================= */}
      {/* Error */}
      {/* ================================================= */}

      {!loading && error && (
        <div
          className="
                    bg-red-50
                    border
                    border-red-100
                    text-red-600
                    rounded-xl
                    p-4
                    text-sm
                "
        >
          {error}
        </div>
      )}

      {/* ================================================= */}
      {/* Empty */}
      {/* ================================================= */}

      {!loading && !error && categories.length === 0 && (
        <div
          className="
                        text-center
                        py-10
                        text-gray-500
                    "
        >
          <BookOpen
            className="
                                mx-auto
                                mb-3
                                h-8
                                w-8
                                text-gray-400
                            "
          />

          <p>No categories available.</p>
        </div>
      )}

      {/* ================================================= */}
      {/* Categories */}
      {/* ================================================= */}

      {!loading && !error && categories.length > 0 && (
        <div
          className="
                        grid
                        grid-cols-2
                        sm:grid-cols-3
                        md:grid-cols-4
                        lg:grid-cols-5
                        xl:grid-cols-5
                        gap-4
                        sm:gap-5
                    "
        >
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              className="
                                        group
                                        w-full
                                        sm:max-w-[230px]
                                        mx-auto
                                        cursor-pointer
                                        [perspective:1000px]
                                        text-left
                                    "
            >
              {/* ================================================= */}
              {/* 3D Card */}
              {/* ================================================= */}

              <div
                className="
                                        relative
                                        w-full
                                        aspect-[4/5]
                                        transition-transform
                                        duration-700
                                        [transform-style:preserve-3d]
                                        group-hover:[transform:rotateY(180deg)]
                                    "
              >
                {/* ================================================= */}
                {/* FRONT */}
                {/* ================================================= */}

                <div
                  className="
                                            absolute
                                            inset-0
                                            overflow-hidden
                                            rounded-2xl
                                            bg-white
                                            border
                                            border-stone-200/90
                                            shadow-md
                                            group-hover:shadow-2xl
                                            [backface-visibility:hidden]
                                        "
                >
                  {/* Image */}

                  <div
                    className="
                                                relative
                                                w-full
                                                h-full
                                            "
                  >
                    <img
                      src={category.frontImage}
                      alt={category.name}
                      className="
                                                        w-full
                                                        h-full
                                                        object-cover
                                                        transition-transform
                                                        duration-700
                                                        group-hover:scale-105
                                                    "
                    />

                    {/* Bottom Gradient */}

                    <div
                      className="
                                                    absolute
                                                    inset-x-0
                                                    bottom-0
                                                    h-1/2
                                                    bg-gradient-to-t
                                                    from-black/80
                                                    via-black/30
                                                    to-transparent
                                                "
                    />

                    {/* Category Name */}

                    <div
                      className="
                                                    absolute
                                                    bottom-0
                                                    left-0
                                                    right-0
                                                    p-4
                                                    sm:p-5
                                                "
                    >
                      <h3
                        className="
                                                        text-base
                                                        sm:text-lg
                                                        font-bold
                                                        text-white
                                                        leading-tight
                                                        drop-shadow-md
                                                    "
                      >
                        {category.name}
                      </h3>

                      <p
                        className="
                                                        text-[10px]
                                                        sm:text-xs
                                                        text-white/75
                                                        mt-1
                                                        font-medium
                                                    "
                      >
                        Explore category
                      </p>
                    </div>
                  </div>
                </div>

                {/* ================================================= */}
                {/* BACK */}
                {/* ================================================= */}

                <div
                  className="
                                            absolute
                                            inset-0
                                            overflow-hidden
                                            rounded-2xl
                                            bg-emerald-900
                                            border
                                            border-emerald-800
                                            shadow-2xl
                                            [backface-visibility:hidden]
                                            [transform:rotateY(180deg)]
                                        "
                >
                  {/* Back Image */}

                  <img
                    src={category.backImage}
                    alt=""
                    className="
                                                    absolute
                                                    inset-0
                                                    w-full
                                                    h-full
                                                    object-cover
                                                "
                  />

                  {/* Dark Overlay */}

                  <div
                    className="
                                                absolute
                                                inset-0
                                                bg-emerald-950/75
                                            "
                  />

                  {/* Back Content */}

                  <div
                    className="
                                                relative
                                                z-10
                                                h-full
                                                flex
                                                flex-col
                                                items-center
                                                justify-center
                                                text-center
                                                p-5
                                                text-white
                                            "
                  >
                    <div
                      className="
                                                    w-12
                                                    h-12
                                                    rounded-full
                                                    bg-white/15
                                                    border
                                                    border-white/20
                                                    flex
                                                    items-center
                                                    justify-center
                                                    mb-4
                                                "
                    >
                      <BookOpen
                        className="
                                                            w-6
                                                            h-6
                                                            text-white
                                                        "
                      />
                    </div>

                    <h3
                      className="
                                                    text-lg
                                                    sm:text-xl
                                                    font-extrabold
                                                    leading-tight
                                                "
                    >
                      {category.name}
                    </h3>

                    <p
                      className="
                                                    text-xs
                                                    text-emerald-100
                                                    mt-2
                                                    leading-relaxed
                                                "
                    >
                      Discover books from this category
                    </p>

                    <div
                      className="
                                                    mt-5
                                                    inline-flex
                                                    items-center
                                                    gap-1.5
                                                    bg-white
                                                    text-emerald-900
                                                    px-4
                                                    py-2
                                                    rounded-xl
                                                    text-xs
                                                    font-bold
                                                    shadow-lg
                                                "
                    >
                      Explore
                      <ArrowRight
                        className="
                                                            w-3.5
                                                            h-3.5
                                                        "
                      />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
