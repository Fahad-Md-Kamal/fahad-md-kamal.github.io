import { Suspense, lazy, useEffect } from 'react'
import AmbientBackground from './components/AmbientBackground'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Education from './components/Education'
import Certifications from './components/Certifications'
import GithubActivity from './components/GithubActivity'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { SideDock } from './components/SideDock'
import { ThemeButtons } from './components/ThemeToggle'
import { ContactButtons } from './components/ContactDock'
import { EffectsButtons } from './components/EffectsToggle'
import BackgroundEffects from './components/BackgroundEffects'
import Blogs from './components/Blogs'
import Services from './components/Services'
import Testimonials from './components/Testimonials'

// The Playground and its tools load on demand so the main page stays light.
const Playground = lazy(() => import('./components/Playground'))

// Import data
import profileData from './data/profile.json'
import skillsData from './data/skills.json'
import experienceData from './data/experience.json'
import educationData from './data/education.json'
import certificationsData from './data/certifications.json'
import projectsData from './data/projects.json'
import servicesData from './data/services.json'
import testimonialsData from './data/testimonials.json'

// Import types
import type { Profile, SkillsData, ExperienceData, EducationData, CertificationsData, ProjectsData, ServicesData, TestimonialsData } from './types'

function App() {
  const profile = profileData as Profile
  const skills = skillsData as SkillsData
  const experience = experienceData as ExperienceData
  const education = educationData as EducationData
  const certifications = certificationsData as CertificationsData
  const projects = projectsData as ProjectsData
  const services = servicesData as ServicesData
  const testimonials = testimonialsData as TestimonialsData
  const visibleCertifications: CertificationsData = {
    certifications: certifications.certifications.filter(c => !c.hidden),
  }
  const hasCertifications = visibleCertifications.certifications.length > 0
  const hasTestimonials = testimonials.testimonials.length > 0

  const totalProjects = (projects.projects?.length || 0) + (projects.aiProjects?.length || 0)

  useEffect(() => {
    // Update document title with profile name
    document.title = `${profile.name} - ${profile.role}`
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', profile.summary)
    }
  }, [profile])

  return (
    <div className="min-h-screen bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <AmbientBackground />
      <Header profile={profile} hasCertifications={hasCertifications} hasTestimonials={hasTestimonials} />
      
      <main>
        <Hero profile={profile} projectCount={totalProjects} />
        <About profile={profile} projectCount={totalProjects} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Services services={services} profile={profile} />
        <Testimonials testimonials={testimonials} />
        <Experience experience={experience} profile={profile} />
        <Education education={education} />
        {hasCertifications && <Certifications certifications={visibleCertifications} />}
        <GithubActivity profile={profile} />
        <Blogs />
        <Suspense fallback={<div id="playground" className="min-h-[24rem]" />}>
          <Playground />
        </Suspense>
        <Contact profile={profile} />
      </main>
      
      <Footer profile={profile} />
      {/* After the sections, so it paints above their backgrounds but below their (lifted) content */}
      <BackgroundEffects />
      <SideDock>
        <ContactButtons profile={profile} />
        <ThemeButtons />
        <EffectsButtons />
      </SideDock>
    </div>
  )
}

export default App
