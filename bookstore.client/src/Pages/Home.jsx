import React from 'react'
import Navbar from '../Components/Navbar'
import HeroSection from '../Components/HeroSection'
import BookSections from '../Components/BookSections'
import TopCategories from '../Components/TopCategories'
import EventsAndNewsletter from '../Components/Events'
import Footer from '../Components/Footer'


function Home() {
  return (
    <>

    <Navbar/>
    
    <HeroSection/>
    <BookSections/>
    <TopCategories/>
    <EventsAndNewsletter/>

    <Footer/>

    </>
  )
}

export default Home