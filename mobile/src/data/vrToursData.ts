// Types for VR Tour Data
export interface VRHotspot {
    id: string;
    text: string;
    position: { x: number; y: number; z: number };
    targetSceneId: string;
}

export interface VRScene {
    id: string;
    image: string;
    title: string;
    hotspots: VRHotspot[];
}

export interface VRSection {
    title: string;
    description: string;
    details: string[];
}

export interface VRTourData {
    name: string;
    icon: string;
    description: string;
    color: string;
    initialSceneId: string;
    scenes: Record<string, VRScene>;
    sections: VRSection[];
}

export interface Facility {
    id: string;
    name: string;
    type: string;
    location: string;
    description: string;
    image: any;
    icon: string;
    color: string;
}

export interface Tenant {
    id: string;
    name: string;
    location: string;
    description: string;
}

// Mock Data from Tenants/Facilities
export const FACILITIES: Facility[] = [
    {
        id: 'food-water',
        name: 'Food & Water Testing Lab',
        type: 'Facility',
        location: 'Analytical Laboratory',
        description: 'Advanced testing facilities for food safety and water quality analysis',
        image: require('../../assets/images/connect-solve.png'),
        icon: 'droplet',
        color: '#0066CC',
    },
    {
        id: 'design-centre',
        name: 'Design Centre',
        type: 'Facility',
        location: 'Design Centre',
        description: 'Innovation hub for product design and prototyping',
        image: require('../../assets/images/design-centre.png'),
        icon: 'pen-tool',
        color: '#FF6600',
    },
    {
        id: 'digital-hub',
        name: 'Digital Hub',
        type: 'Facility',
        location: 'Digital Hub',
        description: 'Technology acceleration and digital transformation center',
        image: require('../../assets/images/innospace.png'),
        icon: 'monitor',
        color: '#28A745',
    },
    {
        id: 'automotive-incubator',
        name: 'Automotive & Manufacturing Incubator',
        type: 'Facility',
        location: 'Incubators',
        description: 'Advanced manufacturing and automotive innovation incubator',
        image: require('../../assets/images/renewable-energy.png'),
        icon: 'settings',
        color: '#6F42C1',
    },
    {
        id: 'renewable-energy',
        name: 'Renewable Energy Centre',
        type: 'Facility',
        location: 'Renewable Energy Centre',
        description: 'Clean energy solutions and sustainability projects',
        image: require('../../assets/images/renewable-energy.png'),
        icon: 'zap',
        color: '#E83E8C',
    },
];

export const TENANTS: Tenant[] = [
    { id: '1', name: 'SAMRC', location: 'Digital Hub', description: 'Medical Research' },
    { id: '2', name: 'Phokophela Investment Holdings', location: 'Digital Hub', description: 'Investment' },
    { id: '3', name: 'ECNGOC', location: 'Incubators', description: 'NGO Services' },
    { id: '4', name: 'MSC Artisan Academy', location: 'Renewable Energy Centre', description: 'Education & Training' },
    { id: '5', name: 'MFURAA Projects', location: 'Digital Hub', description: 'Consulting' },
    { id: '6', name: 'Long Life ABET Consulting', location: 'Digital Hub', description: 'Education & Training' },
    { id: '7', name: 'KGI BPO', location: 'Digital Hub', description: 'Business Process Outsourcing' },
    { id: '8', name: 'ECSA', location: 'Digital Hub', description: 'Professional Services' },
    { id: '9', name: 'Cortex Hub', location: 'Incubators', description: 'Technology Incubator' },
    { id: '10', name: 'Chemin', location: 'Incubators', description: 'Chemical Technology' },
];

// VR Data for specific tours
export const VR_TOUR_DATA: Record<string, VRTourData> = {
    'food-water': {
        name: 'Food & Water Testing Lab',
        icon: 'droplet',
        description: 'Comprehensive testing facility equipped with state-of-the-art analytical instruments',
        color: '#0066CC',
        initialSceneId: 'main-lab',
        scenes: {
            'main-lab': {
                id: 'main-lab',
                title: 'Main Laboratory',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Biotechnology_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7621-7627.TIF/lossy-page1-2560px-Biotechnology_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7621-7627.TIF.jpg',
                hotspots: [
                    { id: 'to-analytics', text: 'Go to Analytics Room', position: { x: 400, y: -50, z: -300 }, targetSceneId: 'analytics' },
                ]
            },
            'analytics': {
                id: 'analytics',
                title: 'Analytics Room',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Mathematics_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7741-7747.TIF/lossy-page1-2560px-Mathematics_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7741-7747.TIF.jpg',
                hotspots: [
                    { id: 'back-to-main', text: 'Back to Main Lab', position: { x: -400, y: 0, z: 300 }, targetSceneId: 'main-lab' }
                ]
            }
        },
        sections: [
            { title: 'Reception & Sample Intake', description: 'Where all samples are received and logged.', details: ['Sample documentation', 'Quality check-in'] },
            { title: 'Microbiological Testing Lab', description: 'Dedicated lab for food safety analysis.', details: ['Culture plates', 'Incubators', 'Microscopes'] },
            { title: 'Analytical Chemistry Lab', description: 'Advanced chemical analysis equipment.', details: ['GC-MS', 'HPLC', 'Spectrometers'] },
        ],
    },
    'design-centre': {
        name: 'Design Centre',
        icon: 'pen-tool',
        description: 'Creative hub for product design and prototyping',
        color: '#FF6600',
        initialSceneId: 'atrium',
        scenes: {
            'atrium': {
                id: 'atrium',
                title: 'Main Atrium',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/360-degree_panorama_of_the_ESO_Headquarters_%28hqe-pano1%29.jpg/2560px-360-degree_panorama_of_the_ESO_Headquarters_%28hqe-pano1%29.jpg',
                hotspots: [
                    { id: 'to-workshop', text: 'Go to Workshop', position: { x: 300, y: 0, z: 400 }, targetSceneId: 'workshop' }
                ]
            },
            'workshop': {
                id: 'workshop',
                title: 'Design Workshop',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Hilo_Base_Facility_Control_Room_360_Panorama_%282022_03_29_Hilo_360_Control_Room_2-CC%29.jpg/2560px-Hilo_Base_Facility_Control_Room_360_Panorama_%282022_03_29_Hilo_360_Control_Room_2-CC%29.jpg',
                hotspots: [
                    { id: 'back-to-atrium', text: 'Back to Atrium', position: { x: -300, y: 0, z: -400 }, targetSceneId: 'atrium' }
                ]
            }
        },
        sections: [
            { title: 'Concept Studio', description: 'Collaborative space for initial design.', details: ['Workstations', 'Digital sketching'] },
            { title: 'CAD Lab', description: 'Professional 3D modeling stations.', details: ['High-performance PCs', 'CAD software'] },
            { title: '3D Printing', description: 'Rapid prototyping facility.', details: ['FDM Printers', 'SLA Printers'] },
        ],
    },
    'digital-hub': {
        name: 'Digital Hub',
        icon: 'monitor',
        description: 'Technology acceleration center',
        color: '#28A745',
        initialSceneId: 'control-room',
        scenes: {
            'control-room': {
                id: 'control-room',
                title: 'Control Room',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Hilo_Base_Facility_Control_Room_360_Panorama_%282022_03_29_Hilo_360_Control_Room_2-CC%29.jpg/2560px-Hilo_Base_Facility_Control_Room_360_Panorama_%282022_03_29_Hilo_360_Control_Room_2-CC%29.jpg',
                hotspots: []
            }
        },
        sections: [
            { title: 'Co-working Space', description: 'Flexible workspace for startups.', details: ['Hot desks', 'High-speed internet'] },
            { title: 'Server Room', description: 'Secure data center infrastructure.', details: ['Rack servers', 'Cooling systems'] },
            { title: 'Meeting Rooms', description: 'Professional presentation spaces.', details: ['Video conferencing', 'Smart boards'] },
        ],
    },
    'automotive-incubator': {
        name: 'Automotive Incubator',
        icon: 'settings',
        description: 'Manufacturing innovation center',
        color: '#6F42C1',
        initialSceneId: 'assembly',
        scenes: {
            'assembly': {
                id: 'assembly',
                title: 'Assembly Line',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Motive_Power_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7900-7908.TIF/lossy-page1-2560px-Motive_Power_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7900-7908.TIF.jpg',
                hotspots: [
                    { id: 'to-transport', text: 'Go to Transport Gallery', position: { x: 400, y: 0, z: 0 }, targetSceneId: 'transport' }
                ]
            },
            'transport': {
                id: 'transport',
                title: 'Transport Gallery',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Transport_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7833-7840.tif/lossy-page1-2560px-Transport_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7833-7840.tif.jpg',
                hotspots: [
                    { id: 'back-to-assembly', text: 'Back to Assembly', position: { x: -400, y: 0, z: 0 }, targetSceneId: 'assembly' }
                ]
            }
        },
        sections: [
            { title: 'Assembly Line', description: 'Simulated manufacturing environment.', details: ['Conveyors', 'Robotic arms'] },
            { title: 'QC Station', description: 'Quality control and testing.', details: ['Measurement tools', 'Inspection'] },
        ],
    },
    'renewable-energy': {
        name: 'Renewable Energy Centre',
        icon: 'zap',
        description: 'Green technology solutions',
        color: '#E83E8C',
        initialSceneId: 'solar-lab',
        scenes: {
            'solar-lab': {
                id: 'solar-lab',
                title: 'Solar Lab',
                image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Electricity_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7637-7643.TIF/lossy-page1-2560px-Electricity_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7637-7643.TIF.jpg',
                hotspots: []
            }
        },
        sections: [
            { title: 'Solar Lab', description: 'PV panel testing facility.', details: ['Solar simulators', 'Efficiency testing'] },
            { title: 'Battery Storage', description: 'Energy storage research.', details: ['Battery banks', 'Charge controllers'] },
        ],
    },
};

// Helper function to get facility by ID
export const getFacilityById = (id: string): Facility | undefined => {
    return FACILITIES.find(f => f.id === id);
};

// Helper function to get VR tour data by ID
export const getVRTourDataById = (id: string): VRTourData | undefined => {
    return VR_TOUR_DATA[id];
};

// Helper function to get tenants by location
export const getTenantsByLocation = (location: string): Tenant[] => {
    return TENANTS.filter(t => t.location === location);
};

