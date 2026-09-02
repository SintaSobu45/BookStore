import React, { useState } from "react";

import Categories from "./Categories";
import Authors from "./Author";
import Publishers from "./Publishers";
import EditorManagement from "./EditorManagement";

function LibraryManagement() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="w-full mt-5">
      {/* =========================
            Header
        ========================= */}

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Library Management
        </h1>

        <p className="text-sm sm:text-base text-gray-500 mt-2">
          Manage categories, authors and publishers
        </p>
      </div>

      {/* =========================
            Tabs
        ========================= */}

      <div
        className="
                bg-white
                rounded-2xl
                shadow-sm
                border
                border-gray-200
                p-2
                mb-6
                overflow-x-auto
            "
      >
        <div className="flex gap-2 min-w-max">
          {/* Categories */}

          <button
            onClick={() => setActiveTab("categories")}
            className={`
                        flex
                        items-center
                        gap-2
                        px-4
                        sm:px-5
                        py-2.5
                        sm:py-3
                        rounded-xl
                        text-sm
                        sm:text-base
                        font-semibold
                        whitespace-nowrap
                        transition-all
                        duration-200
                        ${
                          activeTab === "categories"
                            ? "bg-gray-900 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
                    `}
          >
            <span className="text-base sm:text-lg">📂</span>
            Categories
          </button>

          {/* Authors */}

          <button
            onClick={() => setActiveTab("authors")}
            className={`
                        flex
                        items-center
                        gap-2
                        px-4
                        sm:px-5
                        py-2.5
                        sm:py-3
                        rounded-xl
                        text-sm
                        sm:text-base
                        font-semibold
                        whitespace-nowrap
                        transition-all
                        duration-200
                        ${
                          activeTab === "authors"
                            ? "bg-gray-900 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
                    `}
          >
            <span className="text-base sm:text-lg">✍️</span>
            Authors
          </button>

          {/* Publishers */}

          <button
            onClick={() => setActiveTab("publishers")}
            className={`
                        flex
                        items-center
                        gap-2
                        px-4
                        sm:px-5
                        py-2.5
                        sm:py-3
                        rounded-xl
                        text-sm
                        sm:text-base
                        font-semibold
                        whitespace-nowrap
                        transition-all
                        duration-200
                        ${
                          activeTab === "publishers"
                            ? "bg-gray-900 text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }
                    `}
          >
            <span className="text-base sm:text-lg">🏢</span>
            Publishers
          </button>

          {/* Editors */}

          <button
            onClick={() => setActiveTab("editors")}
            className={`
    flex
    items-center
    gap-2
    px-4
    sm:px-5
    py-2.5
    sm:py-3
    rounded-xl
    text-sm
    sm:text-base
    font-semibold
    whitespace-nowrap
    transition-all
    duration-200
    ${
      activeTab === "editors"
        ? "bg-gray-900 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }
  `}
          >
            <span className="text-base sm:text-lg">👥</span>
            Editors
          </button>
        </div>
      </div>

      {/* =========================
            Content
        ========================= */}

      <div className="w-full">
        {activeTab === "categories" && <Categories />}

        {activeTab === "authors" && <Authors />}

        {activeTab === "publishers" && <Publishers />}

         {activeTab === "editors" && <EditorManagement />}
      </div>
    </div>
  );
}

export default LibraryManagement;
