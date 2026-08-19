import React, { useEffect } from "react";
import Navbar from "../Components/Navbar";
import HeroSection from "../Components/HeroSection";
import BookSections from "../Components/BookSections";
import TopCategories from "../Components/TopCategories";
import EventsAndNewsletter from "../Components/Events";
import Footer from "../Components/Footer";
import { toast } from "react-toastify";


function Home() {

 
  useEffect(() => {
    const successMessage = localStorage.getItem("storyPoetrySuccessMessage");

    if (successMessage) {
      toast.success(successMessage);

      localStorage.removeItem("storyPoetrySuccessMessage");
    }

   
  }, []);

  return (
    <>
      <Navbar />

      <HeroSection />
      <BookSections />
      <TopCategories />
      <EventsAndNewsletter />

      <Footer />
    </>
  );
}

export default Home;
