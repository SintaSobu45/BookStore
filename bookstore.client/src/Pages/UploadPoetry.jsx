
import React, { useEffect, useState } from 'react';
import {
  Home,
  ChevronRight,
  Leaf,
  BookOpen,
  Save,
  ArrowRight
} from 'lucide-react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { Link, useNavigate } from 'react-router-dom';

import { addStoryPoetry } from '../services/storyPoetryService';
import { getCategories } from '../services/categoryService';

export default function UploadPoetry() {
  const navigate = useNavigate();

  const [contentType, setContentType] = useState('Poetry');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Word count
  const wordCount = content.trim()
    ? content.trim().split(/\s+/).length
    : 0;

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);

        const data = await getCategories();

        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setError('Failed to load categories.');
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Submit
  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Please enter a title.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    if (!content.trim()) {
      setError('Please write your content.');
      return;
    }

    try {
      setLoading(true);

      const storyPoetryData = {
        title: title.trim(),
        type: contentType,
        categoryId: Number(category),
        content: content.trim()
      };

      console.log('Submitting:', storyPoetryData);

      await addStoryPoetry(storyPoetryData);

      setSuccess(
        `${contentType} submitted successfully! Waiting for admin approval.`
      );

      setTitle('');
      setCategory('');
      setContent('');

    } catch (error) {
      console.error('Story/Poetry submission failed:', error);

      setError(
        error.message || 'Failed to submit Story/Poetry.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Save Draft
  const handleSaveDraft = () => {
    const draft = {
      title,
      type: contentType,
      category,
      content
    };

    localStorage.setItem(
      'storyPoetryDraft',
      JSON.stringify(draft)
    );

    setSuccess('Draft saved successfully.');
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-stone-50/60 pb-16">

        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">

          <div className="flex items-center space-x-2 text-xs text-stone-500 mb-2 font-medium">

            <span className="hover:text-emerald-900 cursor-pointer flex items-center">
              <Link
                to="/"
                className="d-flex hover:text-black"
              >
                <Home className="h-3.5 w-3.5 mr-1" />
                Home
              </Link>
            </span>

            <ChevronRight className="h-3.5 w-3.5 text-stone-400" />

            <span className="text-gray-900 font-semibold">
              Upload Poetry / Story
            </span>

          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950 tracking-tight">
            Upload Poetry / Story
          </h1>

          <p className="text-sm text-stone-600 font-medium mt-1">
            Share your creativity with the world
          </p>

        </div>

        {/* Main */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Messages */}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-semibold">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ========================= */}
            {/* COLUMN 1 - TYPE */}
            {/* ========================= */}

            <div className="lg:col-span-3 bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm">

              <div className="mb-5">

                <h3 className="font-bold text-gray-900 text-sm">
                  1. Choose Type
                </h3>

                <p className="text-[11px] text-stone-500">
                  Select what you want to submit
                </p>

              </div>

              <div className="space-y-4">

                {/* Poetry */}

                <div
                  onClick={() => setContentType('Poetry')}
                  className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                    contentType === 'Poetry'
                      ? 'border-[#1b3b2b] bg-emerald-50/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div className="flex items-start space-x-3">

                      <div className="bg-emerald-100 text-emerald-900 p-2 rounded-xl">
                        <Leaf className="h-4 w-4" />
                      </div>

                      <div>

                        <h4 className="font-bold text-gray-900 text-xs">
                          Poetry
                        </h4>

                        <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                          Short poems, verses, and creative expressions
                        </p>

                      </div>

                    </div>

                    <input
                      type="radio"
                      name="contentType"
                      checked={contentType === 'Poetry'}
                      onChange={() => setContentType('Poetry')}
                      className="accent-[#1b3b2b] mt-1"
                    />

                  </div>

                </div>

                {/* Story */}

                <div
                  onClick={() => setContentType('Story')}
                  className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                    contentType === 'Story'
                      ? 'border-[#1b3b2b] bg-emerald-50/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div className="flex items-start space-x-3">

                      <div className="bg-emerald-100 text-emerald-900 p-2 rounded-xl">
                        <BookOpen className="h-4 w-4" />
                      </div>

                      <div>

                        <h4 className="font-bold text-gray-900 text-xs">
                          Story
                        </h4>

                        <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                          Short stories, articles, and write-ups
                        </p>

                      </div>

                    </div>

                    <input
                      type="radio"
                      name="contentType"
                      checked={contentType === 'Story'}
                      onChange={() => setContentType('Story')}
                      className="accent-[#1b3b2b] mt-1"
                    />

                  </div>

                </div>

              </div>

            </div>


            {/* ========================= */}
            {/* COLUMN 2 - DETAILS */}
            {/* ========================= */}

            <div className="lg:col-span-4 bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm">

              <div className="mb-5">

                <h3 className="font-bold text-gray-900 text-sm">
                  2. Enter Details
                </h3>

                <p className="text-[11px] text-stone-500">
                  Provide basic information
                </p>

              </div>

              <div className="space-y-5">

                {/* Title */}

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Title <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={200}
                    className="w-full bg-stone-50/75 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-emerald-800"
                  />

                  <p className="text-[10px] text-stone-400 mt-1">
                    {title.length}/200 characters
                  </p>

                </div>


                {/* Category */}

                <div>

                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={loadingCategories}
                    className="w-full bg-stone-50/75 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-600 focus:outline-none focus:border-emerald-800 font-medium disabled:opacity-50"
                  >

                    <option value="">
                      {loadingCategories
                        ? 'Loading categories...'
                        : 'Select category'}
                    </option>

                    {categories.map((item) => (
                      <option
                        key={item.categoryId}
                        value={item.categoryId}
                      >
                        {item.categoryName}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

            </div>


            {/* ========================= */}
            {/* COLUMN 3 - CONTENT */}
            {/* ========================= */}

            <div className="lg:col-span-5 bg-white border border-stone-200/80 rounded-3xl p-6 shadow-sm flex flex-col">

              <div className="flex-1">

                <div className="mb-4">

                  <h3 className="font-bold text-gray-900 text-sm">
                    3. Write Content
                  </h3>

                  <p className="text-[11px] text-stone-500">
                    Write your {contentType.toLowerCase()} here
                  </p>

                </div>


                {/* Content */}

                <div className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/30">

                  <textarea
                    rows="16"
                    placeholder={`Start writing your ${contentType.toLowerCase()} here...`}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-4 bg-transparent text-xs text-gray-800 focus:outline-none resize-none leading-relaxed"
                  />

                  <div className="bg-stone-50 border-t border-stone-200 px-4 py-2 text-[11px] text-stone-500 font-medium">
                    Words: {wordCount}
                  </div>

                </div>

              </div>


              {/* Actions */}

              <div className="flex items-center space-x-3 pt-5">

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 bg-white border border-stone-300 hover:bg-stone-50 text-gray-800 font-bold py-3 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 text-xs cursor-pointer"
                >

                  <Save className="h-4 w-4 text-stone-600" />

                  <span>
                    Save Draft
                  </span>

                </button>


                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-[#1b3b2b] hover:bg-emerald-950 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2 text-xs cursor-pointer disabled:opacity-50"
                >

                  <span>
                    {loading
                      ? 'Submitting...'
                      : 'Submit'}
                  </span>

                  <ArrowRight className="h-4 w-4" />

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

      <Footer />
    </>
  );
}

