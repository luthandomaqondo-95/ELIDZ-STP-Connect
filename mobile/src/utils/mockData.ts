import { storage } from './storage';

export async function initializeMockData() {
  const existingTenants = await storage.getTenants();
  
  if (existingTenants.length === 0) {
    const mockTenants = [
      { id: '1', name: 'TechVenture Solutions', industry: 'Software Development', center: 'Digital Hub', description: 'Innovative software solutions for businesses' },
      { id: '2', name: 'GreenPower Innovations', industry: 'Renewable Energy', center: 'Renewable Energy', description: 'Solar and wind energy systems' },
      { id: '3', name: 'AutoParts Manufacturing', industry: 'Automotive', center: 'Automotive Incubator', description: 'Precision automotive components' },
      { id: '4', name: 'FoodSafe Labs', industry: 'Testing Services', center: 'Testing Lab', description: 'Food safety and quality testing' },
      { id: '5', name: 'Creative Design Studio', industry: 'Design', center: 'Design Centre', description: 'Product and brand design services' },
      { id: '6', name: 'IoT Solutions Africa', industry: 'Technology', center: 'Digital Hub', description: 'Internet of Things solutions' },
      { id: '7', name: 'Sustainable Packaging Co', industry: 'Manufacturing', center: 'Automotive Incubator', description: 'Eco-friendly packaging solutions' },
    ];
    
    await storage.setTenants(mockTenants);
  }

  const existingOpportunities = await storage.getOpportunities();
  
  if (existingOpportunities.length === 0) {
    const mockOpportunities = [
      { id: '1', title: 'R&D Tax Incentive Program', org: 'ELIDZ', type: 'Funding', deadline: 'Dec 31, 2025', description: 'Apply for tax incentives on research and development projects' },
      { id: '2', title: 'Clean Energy Innovation Grant', org: 'Renewable Energy Centre', type: 'Funding', deadline: 'Jan 15, 2026', description: 'Grants for renewable energy innovations' },
      { id: '3', title: 'Senior Developer Position', org: 'TechVenture Solutions', type: 'Job', deadline: 'Open', description: 'Full-stack developer with 5+ years experience' },
      { id: '4', title: 'Manufacturing Partnership', org: 'AutoParts Manufacturing', type: 'Collaboration', deadline: 'Feb 1, 2026', description: 'Looking for supply chain partners' },
      { id: '5', title: 'Startup Accelerator Program', org: 'Digital Hub', type: 'Project', deadline: 'Jan 31, 2026', description: '3-month intensive program for tech startups' },
      { id: '6', title: 'Product Design Internship', org: 'Creative Design Studio', type: 'Job', deadline: 'Open', description: 'Internship opportunity for design students' },
    ];
    
    await storage.setOpportunities(mockOpportunities);
  }

  const existingEvents = await storage.getEvents();
  
  if (existingEvents.length === 0) {
    const mockEvents = [
      { id: '1', title: 'Innovation Showcase 2025', date: 'Dec 15, 2025', time: '09:00 - 17:00', location: 'Digital Hub', rsvp: null, attendees: 45 },
      { id: '2', title: 'Renewable Energy Workshop', date: 'Dec 20, 2025', time: '14:00 - 16:00', location: 'Renewable Energy Centre', rsvp: null, attendees: 28 },
      { id: '3', title: 'Manufacturing Tech Expo', date: 'Jan 10, 2026', time: '10:00 - 18:00', location: 'Automotive Incubator', rsvp: null, attendees: 62 },
      { id: '4', title: 'Design Thinking Masterclass', date: 'Jan 15, 2026', time: '09:00 - 13:00', location: 'Design Centre', rsvp: null, attendees: 22 },
      { id: '5', title: 'Investor Pitch Night', date: 'Jan 25, 2026', time: '18:00 - 21:00', location: 'Main Auditorium', rsvp: null, attendees: 38 },
      { id: '6', title: 'Food Safety Compliance Seminar', date: 'Feb 5, 2026', time: '10:00 - 15:00', location: 'Testing Lab', rsvp: null, attendees: 15 },
    ];
    
    await storage.setEvents(mockEvents);
  }

  const existingNews = await storage.getNews();
  
  if (existingNews.length === 0) {
    const mockNews = [
      { id: '1', title: 'New Automotive Testing Facility Opens', date: '2 days ago', category: 'Facilities', excerpt: 'State-of-the-art automotive testing facility now available to all tenants and partners.' },
      { id: '2', title: 'STP Hosts Innovation Showcase', date: '5 days ago', category: 'Events', excerpt: 'Over 50 startups showcased their innovative solutions to investors and industry leaders.' },
      { id: '3', title: 'Partnership with Local Universities', date: '1 week ago', category: 'Partnership', excerpt: 'ELIDZ-STP partners with top universities to enhance research and development capabilities.' },
    ];
    
    await storage.setNews(mockNews);
  }
}

