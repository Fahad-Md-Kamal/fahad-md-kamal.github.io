export interface Profile {
  name: string;
  role: string;
  tagline: string;
  summary: string;
  technicalSummary?: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  avatar: string;
  resumeUrl: string;
  resumeFallbackUrl?: string;
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    medium: string;
    stackoverflow: string;
    telegram?: string;
    portfolio: string;
  };
  availability: {
    status: 'open' | 'closed' | 'busy';
    message: string;
  };
  stats?: {
    clientsServed: string;
    techStackSize: string;
  };
  expertise?: {
    [key: string]: {
      label: string;
      technologies: string;
    };
  };
  career?: {
    startDate: string;
  };
}

export interface Skill {
  name: string;
  level: number;
  years: number;
}

export interface SkillCategory {
  name: string;
  icon: string;
  skills: Skill[];
}

export interface SkillsData {
  categories: SkillCategory[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  website?: string;
  logo?: string;
  description: string;
  highlights: string[];
  technologies: string[];
}

export interface ExperienceData {
  experiences: Experience[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string | null;
  website?: string;
  logo?: string;
  description: string;
  highlights?: string[];
}


export interface EducationData {
  education: Education[];
}

export interface Certification {
  id: string;
  hidden?: boolean;
  name: string;
  issuer?: string;
  score?: string;
  date?: string;
  credentialUrl?: string;
  logo?: string;
}

export interface CertificationsData {
  certifications: Certification[];
}

export interface Technology {
  name: string;
  color: string;
}

export interface ProjectLinks {
  live?: string | null;
  github?: string | null;
  demo?: string | null;
}

export interface ProjectMetrics {
  [key: string]: string | number;
}

export interface ProjectArchitecture {
  pattern: string;
  scale: string;
  infrastructure: string;
  messaging?: string;
  ai_stack?: string;
}

export interface ProjectImpact {
  [key: string]: string | undefined;
}

export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  type: 'NDA' | 'PERSONAL';
  description: string;
  image: string;
  category: string;
  featured: boolean;
  status: 'Completed' | 'In Progress' | 'Planning';
  startDate: string;
  endDate: string | null;
  technologies: Technology[];
  architecture?: ProjectArchitecture;
  impact?: ProjectImpact;
  context?: string;
  design_decisions?: string[];
  links: ProjectLinks;
  // Legacy support for old format
  features?: string[];
  metrics?: ProjectMetrics;
}

export interface ProjectCategory {
  name: string;
  count: number;
}

export interface ProjectsData {
  projects: Project[];
  aiProjects?: Project[];
  categories: ProjectCategory[];
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  forWho: string;
  summary: string;
  includes: string[];
  tech: string[];
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface ServicesData {
  headline: string;
  intro: string;
  services: Service[];
  process: ProcessStep[];
  engagements: string[];
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
  source?: string;
  link?: string;
}

export interface TestimonialsData {
  testimonials: Testimonial[];
}
