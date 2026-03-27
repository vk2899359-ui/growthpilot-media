import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import About from './components/About'
import Portfolio from './components/Portfolio'
import Industries from './components/Industries'
import Testimonials from './components/Testimonials'
import VideoShowreel from './components/VideoShowreel'
import WhyChooseUs from './components/WhyChooseUs'
import FreeAudit from './components/FreeAudit'
import Contact from './components/Contact'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import CursorFollower from './components/CursorFollower'
import ScrollProgress from './components/ScrollProgress'
import LoadingScreen from './components/LoadingScreen'

function App() {
  return (
    <>
      <LoadingScreen />
      <ScrollProgress />
      <CursorFollower />
      <Navbar />
      <main>
        <section id="home">
          <Hero />
        </section>
        <section id="services">
          <Services />
        </section>
        <section id="about">
          <About />
        </section>
        <section id="portfolio">
          <Portfolio />
        </section>
        <section id="industries">
          <Industries />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="showreel">
          <VideoShowreel />
        </section>
        <section id="why-us">
          <WhyChooseUs />
        </section>
        <section id="audit">
          <FreeAudit />
        </section>
        <section id="contact">
          <Contact />
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

export default App
