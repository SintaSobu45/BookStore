
import React, { useEffect, useState } from "react";
import {
    Feather,
    BookOpen,
    BookMarked,
    PenTool,
    Smile,
    User,
    Heart,
    Sparkles,
    GraduationCap,
    History,
    Languages,
    Baby,
    Globe,
    Library,
    Search,
    Wand2,
    Zap,
    Ghost,
} from "lucide-react";
import { getCategories } from "../services/categoryService";
import { useNavigate } from "react-router-dom";


// =====================================================
// Icon mapping based on category name
// =====================================================

const getCategoryIcon = (categoryName) => {

    const name = categoryName.toLowerCase();

    // Mystery
    if (
        name.includes("mystery") ||
        name.includes("മിസ്റ്ററി")
    ) {
        return Search;
    }

    // Fantasy
    if (
        name.includes("fantasy") ||
        name.includes("ഫാന്റസി")
    ) {
        return Wand2;
    }

    // Thriller
    if (
        name.includes("thriller") ||
        name.includes("ത്രില്ലർ")
    ) {
        return Zap;
    }

    // Horror
    if (
        name.includes("horror") ||
        name.includes("ഹൊറർ")
    ) {
        return Ghost;
    }

    // Fiction / Novel
    if (
        name.includes("fiction") ||
        name.includes("novel") ||
        name.includes("നോവൽ")
    ) {
        return BookOpen;
    }

    // Poetry
    if (
        name.includes("poetry") ||
        name.includes("poem") ||
        name.includes("കവിത")
    ) {
        return Feather;
    }

    // History
    if (
        name.includes("history") ||
        name.includes("ചരിത്രം")
    ) {
        return History;
    }

    // Education
    if (
        name.includes("education") ||
        name.includes("educational") ||
        name.includes("വിദ്യാഭ്യാസം")
    ) {
        return GraduationCap;
    }

    // Children
    if (
        name.includes("children") ||
        name.includes("kids") ||
        name.includes("child") ||
        name.includes("കുട്ടി")
    ) {
        return Baby;
    }

    // Language
    if (
        name.includes("language") ||
        name.includes("ഭാഷ")
    ) {
        return Languages;
    }

    // Romance
    if (
        name.includes("romance") ||
        name.includes("love") ||
        name.includes("പ്രണയം")
    ) {
        return Heart;
    }

    // Biography
    if (
        name.includes("biography") ||
        name.includes("autobiography") ||
        name.includes("ജീവചരിത്രം")
    ) {
        return User;
    }

    // Motivation / Self Help
    if (
        name.includes("self") ||
        name.includes("motivation") ||
        name.includes("personal") ||
        name.includes("പ്രചോദനം")
    ) {
        return Sparkles;
    }

    // Religion / Spiritual
    if (
        name.includes("religion") ||
        name.includes("spiritual") ||
        name.includes("മതം")
    ) {
        return Smile;
    }

    // World / International
    if (
        name.includes("world") ||
        name.includes("international") ||
        name.includes("ലോക")
    ) {
        return Globe;
    }

    // Reference / Library
    if (
        name.includes("reference") ||
        name.includes("library")
    ) {
        return Library;
    }

    // Default
    return BookMarked;
};


export default function TopCategories() {

    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =====================================================
    // Load real categories from backend
    // =====================================================

    useEffect(() => {

        const loadCategories = async () => {

            try {

                setLoading(true);

                setError("");

                const data = await getCategories();

                console.log("Categories from backend:", data);


                // Only show active categories
                const activeCategories = data
                    .filter((category) => category.isActive)
                    .map((category) => ({
                        id: category.categoryId,
                        name: category.categoryName,
                        icon: getCategoryIcon(
                            category.categoryName
                        ),
                    }));


                setCategories(activeCategories);

            } catch (error) {

                console.error(
                    "Failed to load categories:",
                    error
                );

                setError(
                    "Unable to load categories."
                );

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

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">


            {/* ================================================= */}
            {/* Section Header */}
            {/* ================================================= */}

            <div className="flex items-center justify-between mb-6">

                <div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Top Categories
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Explore books by category
                    </p>

                </div>

            </div>


            {/* ================================================= */}
            {/* Loading */}
            {/* ================================================= */}

            {loading && (

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">

                    {[1, 2, 3, 4, 5, 6].map((item) => (

                        <div
                            key={item}
                            className="
                                h-32
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

                <div className="
                    bg-red-50
                    border
                    border-red-100
                    text-red-600
                    rounded-xl
                    p-4
                    text-sm
                ">

                    {error}

                </div>

            )}


            {/* ================================================= */}
            {/* Empty */}
            {/* ================================================= */}

            {!loading &&
                !error &&
                categories.length === 0 && (

                    <div className="
                        text-center
                        py-10
                        text-gray-500
                    ">

                        <BookOpen className="mx-auto mb-3 h-8 w-8 text-gray-400" />

                        <p>
                            No categories available.
                        </p>

                    </div>

                )}


            {/* ================================================= */}
            {/* Categories */}
            {/* ================================================= */}

            {!loading &&
                !error &&
                categories.length > 0 && (

                    <div className="
                        grid
                        grid-cols-2
                        sm:grid-cols-3
                        md:grid-cols-4
                        lg:grid-cols-6
                        gap-4
                    ">

                        {categories.map((category) => {

                            const IconComponent =
                                category.icon;


                            return (

                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                        handleCategoryClick(
                                            category.id
                                        )
                                    }
                                    className="
                                        group
                                        bg-white
                                        border
                                        border-gray-100
                                        rounded-2xl
                                        p-6
                                        min-h-[140px]
                                        flex
                                        flex-col
                                        items-center
                                        justify-center
                                        text-center
                                        shadow-sm
                                        hover:shadow-lg
                                        hover:-translate-y-1
                                        hover:border-emerald-200
                                        transition-all
                                        duration-300
                                        cursor-pointer
                                    "
                                >

                                    {/* Icon */}

                                    <div className="
                                        w-14
                                        h-14
                                        rounded-2xl
                                        bg-emerald-50
                                        text-emerald-700
                                        flex
                                        items-center
                                        justify-center
                                        mb-4
                                        group-hover:bg-emerald-700
                                        group-hover:text-white
                                        group-hover:scale-110
                                        transition-all
                                        duration-300
                                    ">

                                        <IconComponent
                                            className="w-7 h-7"
                                        />

                                    </div>


                                    {/* Category Name */}

                                    <span className="
                                        text-sm
                                        font-semibold
                                        text-gray-800
                                        group-hover:text-emerald-700
                                        transition-colors
                                        duration-300
                                        leading-5
                                    ">

                                        {category.name}

                                    </span>

                                </button>

                            );

                        })}

                    </div>

                )}

        </section>

    );

}

