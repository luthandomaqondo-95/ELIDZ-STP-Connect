/**
 * Static center-of-excellence content. Used by CenterService and center-detail / product-lines.
 */

export type CenterContact = {
  name: string;
  phone: string;
  cell?: string;
  email?: string;
  website?: string;
};

export type CenterDetail = {
  id: string;
  name: string;
  icon: 'droplet' | 'pen-tool' | 'zap' | 'globe' | 'home' | 'trending-up' | 'users';
  colorClass: string;
  description: string;
  services: string[];
  equipment: string[];
  contact?: CenterContact;
  additionalInfo?: string;
};

export const CENTER_DATA: Record<string, Omit<CenterDetail, 'id' | 'name' | 'icon' | 'colorClass'>> = {
  '1': {
    description: 'The East London Industrial Development Zone (ELIDZ) Consulting and Analytical Services (CAS) Laboratory is an accredited laboratory by the South African National Accreditation System (SANAS), accreditation No T 0626. The ELIDZ CAS Laboratory, boasting state of the art equipment, enhances the analytical testing capabilities for water, food, and soil. The laboratory adheres to government and industry regulations, which establish guidelines for acceptable pathogenic and non-pathogenic micro-organisms in specific samples and food groups. It also ensures compliance by following green drop specifications and adhering to SANAS 241, which serves as a benchmark for environmental testing. The ELIDZ CAS Laboratory is staffed with skilled chemists, biochemists, and microbiologists, offering a wide spectrum of chemical and microbiological analysis services.',
    services: [
      'Surface water analysis (Rivers, lakes, dams, pools)',
      'Groundwater analysis (Boreholes, wells, spring water)',
      'Drinking water analysis (Tap water, Bottled water, treated surface or ground water)',
      'Waste water analysis',
      'Inorganic analysis – major cations/anions',
      'Physico chemical analysis',
      'Organic analysis',
      'Microbiological analysis',
      'Borehole water quality testing and analysis',
      'Metal Scan',
      'Chemical Analysis',
      'Microbiology Analysis',
    ],
    equipment: [
      'State-of-the-art analytical equipment',
      'SANAS accredited testing facilities (Accreditation No T 0626)',
      'Equipment compliant with SANAS 241 standards',
      'Green drop specification compliant systems',
      'Advanced chemical and microbiological analysis instruments',
    ],
    contact: { name: 'Kaylene Bell', phone: '+27 43 702 8217' },
  },
  '2': {
    description: 'The Science and Technology Park (STP), a component of the East London Industrial Development Zone (EL IDZ), has established the Design Centre to assist entrepreneurs, researchers and industry in rapid prototyping. The facility offers prototype support services through laser cutting and engraving, 3D printing, and machine milling (desktop and CNC Lathe). Whether you are looking for a faster way of producing your ideas into reality or you are just wanting to get creative and 3D print, laser cut or laser engrave onto wood, metals, and plastics for your next assignment – we are here to help.',
    services: [
      '3D Printing - Additive manufacturing for parts and tools at rates much lower than traditional machining',
      'Laser Cutting / Engraving - Intricate detail on wood, acrylic, plastics and metals for single items to large production runs',
      'CNC Lathe Machining - Shaping of metal and other solid materials from solid blocks, pre-machined parts, castings or forgings',
      'Training Programs - AutoCAD, 3D Printing, Laser Cutting, and Machining (desktop milling and CNC Lathe)',
    ],
    equipment: [
      'Multiple 3D printers with expertise to ensure desired end results',
      'Laser cutter / engraver for wood, acrylic, plastics and metals',
      'CNC Lathe machines with expert machine operator support',
      'Desktop machining equipment (desktop milling)',
    ],
    contact: { name: 'Mqondisi Goba', phone: '+27 43 101 0195' },
  },
  '5': {
    description: 'In response to the current and expected future demand and growth within the "Green Economy" of South Africa, the Renewable Energy Centre of Excellence was set up within the East London Industrial Development Zone Science and Technology Park (ELIDZ) in partnership with Master Artisan Academy (SA). The centre will be a catalyst and leader in the development and growth of skills within the sector, not only within the Eastern Cape, but also South Africa and into Africa. The Renewable Energy Centre of Excellence is based at the ELIDZ within the STP unit.',
    services: [
      'Training for qualified artisans wanting to up-skill towards renewable energy',
      'Career preparation programs for school leavers entering renewable energy',
      'Up-skilling for skilled workers to participate in construction and maintenance phases of renewable projects',
      'Training and development for management and decision-makers in public and private sector',
      'Support for current RIPPP providers and potential investors',
      'Prototyping services and facilities',
    ],
    equipment: [
      'Renewable energy training facilities',
      'Prototyping equipment and laboratories',
      'State-of-the-art training infrastructure',
      'Partnership resources with Master Artisan Academy (SA)',
      'Skills development and certification facilities',
    ],
  },
  '6': {
    description: 'In today\'s globalised knowledge economy, access to the best ideas, capabilities and technologies has become crucial for organisations around the world. Initially, innovation and technology advancement within various organisations (private & public) has traditionally depended on a small network of individuals and researchers within their network. This has restricted the supply chain to the usual solution providers and subsequently limited the potential for accessing new ideas for addressing persistent challenges or exploiting opportunities to increase efficiency, growth and in essence the level of early-stage entrepreneurial activity in Southern Africa. Piloted by the ELIDZ Science and Technology Park in 2013, Connect + Solve is a trusted online open innovation platform that enables private and public organisations to solve business needs by accessing a wider and more \'open\' network of innovative solutions in the Eastern Cape, South Africa and beyond. With Connect + Solve, the innovation process within government departments and private companies is accelerated while creating a channel for innovative small enterprises to break into the supply chain of large organisations.',
    services: [
      'Solve Challenges - Post business needs as challenges to attract solution providers from multiple industries outside traditional networks',
      'Showcase Technology - Display unique and innovative ideas/concepts/products as technology demonstrators to attract customers, solution seekers, venture capitalists and research partners',
      'Inbound Open Innovation - Collaborate with suppliers and customers by integrating external knowledge, monitoring the external environment for existing solutions',
      'Outbound Open Innovation - Seek external organisations with suitable business models to commercialise technology, especially when technology is a spin-off or when businesses cannot realise sufficient revenue in their own market',
      'Intellectual Property Management - Secure IP before submission, with clear ownership retention for registered users',
    ],
    equipment: [
      'Online open innovation platform',
      'Challenge posting and response system',
      'Technology showcase capabilities',
      'Knowledge flow management tools',
      'IP protection and management systems',
    ],
    contact: { name: 'Kaylene Bell', phone: '+27 43 702 8217', website: 'Visit our website' },
    additionalInfo: 'By submitting a response to a Challenge or a Technology Offer, you acknowledge that the submission does not and will not be deemed to contain any confidential information. ELIDZ STP requires that any submission via this platform does not contain proprietary, confidential, or enabling information unless your Intellectual Property has been secured appropriately. Registered users responding to Challenges or submitting Technology Offers retain ownership of all intellectual property rights that were held prior to their submission.',
  },
  '7': {
    description: 'The Science & Technology Park is an innovation driven entity within the East London IDZ. The aim of this park is to nurture new innovative companies thus enhancing industrial development, further improving economic development. ELIDZ STP provides high quality hot desk space to knowledge-based enterprises through the INNOSPACE services. The INNOSPACE is a collaborative workspace that involves multiple workers using a single physical workstation or surface during different times. Communal facilities such as a reception and meeting rooms are available for all residents to use. This workspace is designed to stimulate creativity and allow for effective and efficient exchange of ideas. We have seven (7) available hot desk spaces available for booking at all times.',
    services: [
      'Hot Desk Spaces - Seven (7) available hot desk spaces for booking, collaborative workspace for knowledge-based enterprises',
      'Boardroom - Maximum seating of 14 people, 40.2 m², available for hire on per hour basis, suitable for media interviews or business engagements',
      'Project Room - Six (6)-seater boardroom, 26.1 m², available for hire on per hour basis, perfect for mid-sized meetings',
      'STP Meeting Lounge - Accommodates up to five (5) people, 26-33 m², ideal for small discussions with modern soft seating',
      'Informal Lounge - Bright and comfortable space for unstructured sessions, lunch area, includes pool table and play station',
    ],
    equipment: [
      'Projector and presentation equipment',
      'Presentation clipboard with markers',
      'ISDN line',
      'White board',
      'Telephone',
      'Video conferencing facilities',
      'Wireless connection',
    ],
    contact: {
      name: 'Kaylene Bell',
      phone: '+27 43 702 8217',
      cell: '+27 76 511 5931',
      email: 'kaylene@elidz.co.za',
    },
    additionalInfo: 'Value Added Features & Benefits: 24/7 security access and CCTV cameras, secure parking, dedicated STP Management Team, outdoor chess set. Location: Situated in Lower Chester Road, in the beautiful and leafy suburb of Sunnyridge, East London. The STP is only about five (5) minute drive from the East London Airport, away from the crowded CBD and its heavy traffic.',
  },
  '8': {
    description: 'Tenants Chemin, ECITI and the Cortex Hub have well established reputations for offering start-ups the assistance they need to become fully fledged businesses. Should your business not fall within the services offered by these incubators, the ELIDZ STP will endeavor to find the right incubation support for your start-up.',
    services: [
      'Chemin - Business incubator specialising in downstream chemicals industry. Provides lab space, testing facilities, manufacturing equipment, office space, access to seed finance and collaboration with universities, industrial experts, financing agencies and government departments. Website: www.chemin.co.za',
      'ECITI - Business incubator specialising in Information Communications Technology (ICT) and Film sector. Assists early stage development through infrastructure, mentorship and training, linkages to industry and academic networks. Established as a non-profit organisation by the ECDC in 2004. Website: www.eciti.co.za',
      'The Cortex Hub - Technology incubator and accelerator that helps young entrepreneurs build something that people want and build great teams and businesses. Provides early stage funding for startups and offers both Incubation and Acceleration programmes. Website: www.thecortexhub.com',
      'ECNGOC - The Eastern Cape NGO Coalition is a representative structure of Civil Society organisations supporting NGOs and CBOs throughout the Eastern Cape Province. Services include NGO Legislation & Compliance, Asset Based Community Driven Development (ABCD), and sustainability of the NGO Sector. Website: ecngoc.co.za',
    ],
    equipment: [
      'Incubation infrastructure and facilities',
      'Mentorship and training programs',
      'Access to seed finance and funding',
      'Industry and academic network linkages',
      'Lab space and testing facilities (Chemin)',
      'Office space and manufacturing equipment',
      'Early stage funding programs (Cortex Hub)',
    ],
    additionalInfo: 'Each incubator specializes in different sectors: Chemin focuses on chemical technology, ECITI on ICT and film, Cortex Hub on technology startups, and ECNGOC on NGO support and community development. The ELIDZ STP works to match startups with the appropriate incubator based on their business needs and sector focus.',
  },
  '9': {
    description: 'The Regional Innovation Networking Platform (RINP) is an initiative of the Department of Science & Innovation (DSI) in support of Eastern Cape innovation community. ELIDZ Science and Technology Park is acting as an agency that coordinates, supports and maintains, the development of RINP facilitating the meeting and the working together of the Multiple Helix members of the Eastern Cape province from different institutions. The steering committee members are led by ELIDZ Science and Technology Park as Lead Facilitator.',
    services: [
      'STIMULATE - Bridging the gap between research and industry, highlighting comparative and competitive advantages, identifying gaps and opportunities, creating synergies through networking',
      'SUPPORT - Creating linkages between role players, facilitating an enabling environment, hosting relevant workshops, assisting with access to finance, lobbying for innovation seed funding',
      'PROMOTE - Providing a united voice and approach to innovation, publicising success stories, publicising opportunities and gaps, organising relevant networking events and training events',
      'Eastern Cape Innovation Challenge (ECIC) - Cultivating high-impact, responsible, competent, and confident young entrepreneurs with innovative solutions for local service delivery or societal challenges',
      'Networking Events - Regular networking events and calendar to facilitate collaboration',
      'Training Programs - 3D printing and Laser Engraving/cutting, Solar Energy PV Rooftop Installation (SAPVIA Accredited), Tooling manufacturing',
    ],
    equipment: [
      'Regional innovation networking infrastructure',
      'Workshop and training facilities',
      'Networking event coordination systems',
      'Innovation challenge program management',
      'Multiple Helix collaboration platforms',
    ],
    additionalInfo: 'RINP Focus Areas: Automotive and related component manufacturing (including tooling and composites), Energy (with emphasis on renewable and alternative sources), Agriculture (Aquaculture, Agro-Processing, indigenous medicines/pharmaceuticals, wastewater treatment), Advanced Manufacturing, and ICT. RINP programs fall into three main areas: Fostering a culture of innovation; Lobbying and facilitating increased investment in R&D and Innovation; Supporting and facilitating the linking of knowledge generators to regional socio-economic development efforts.',
  },
};

/** List metadata for product-lines and home: id, name, icon, description, colorClass */
export const CENTER_LIST_META: Record<string, { name: string; icon: CenterDetail['icon']; colorClass: string; description: string }> = {
  '1': { name: 'Analytical Laboratory', icon: 'droplet', colorClass: 'bg-primary', description: 'SANAS accredited CAS Laboratory for water, food, and soil analysis' },
  '2': { name: 'Design Centre', icon: 'pen-tool', colorClass: 'bg-secondary', description: 'Rapid prototyping services: 3D printing, laser cutting, CNC machining, and training' },
  '5': { name: 'Renewable Energy Centre of Excellence', icon: 'zap', colorClass: 'bg-primary', description: 'Training facility for skills development in the Green Economy sector' },
  '6': { name: 'Connect + Solve', icon: 'globe', colorClass: 'bg-secondary', description: 'Open innovation platform connecting solution seekers with innovative providers' },
  '7': { name: 'Innospace', icon: 'home', colorClass: 'bg-accent', description: 'Collaborative workspace with hot desks, meeting rooms, and modern facilities' },
  '8': { name: 'Incubators', icon: 'trending-up', colorClass: 'bg-primary', description: 'Startup incubation support: Chemin, ECITI, Cortex Hub, and ECNGOC' },
  '9': { name: 'Regional Innovation Networking Platform (RINP)', icon: 'users', colorClass: 'bg-secondary', description: 'DSI initiative coordinating innovation community networking and collaboration' },
};
