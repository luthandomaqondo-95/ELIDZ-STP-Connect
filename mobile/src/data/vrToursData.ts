// Types for VR Tour Data
export interface VRHotspot {
    id: string;
    text: string;
    position: { x: number; y: number; z: number };
    targetSceneId: string;
}

export interface VRRegion {
    id: string;
    name: string;
    angle: number;
    width: number;
}

export interface VRScene {
    id: string;
    image: any;
    title: string;
    hotspots: VRHotspot[];
    regions?: VRRegion[];
}

export interface VRSection {
    title: string;
    description: string;
    details: string[];
    hasVR?: boolean;
    vrSceneId?: string;
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
    contact_email?: string;
    contact_phone?: string;
    website?: string;
    application_url?: string;
}

// Mock Data from Tenants/Facilities
export const FACILITIES: Facility[] = [
    {
        id: 'food-water',
        name: 'Analytical Laboratory',
        type: 'Facility',
        location: 'Analytical Laboratory',
        description: 'Advanced testing facilities, including Food & Water Testing and Technology Labs',
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
        name: 'ANALYTICAL LABORATORY',
        icon: 'droplet',
        description: 'SANAS accredited laboratory for comprehensive analytical testing services',
        color: '#0066CC',
        initialSceneId: 'main-lab',
        scenes: {
            'main-lab': {
                id: 'main-lab',
                title: 'Analytical Laboratory',
                image: require('../../assets/videos/360-tours/analytical-laboratory/analyticlaboratory.jpeg'),
                hotspots: [],
                regions: [
                    { id: 'lab-benches', name: 'Lab Benches', angle: 0, width: 90 },
                    { id: 'equipment', name: 'Testing Equipment', angle: 120, width: 60 },
                    { id: 'storage', name: 'Sample Storage', angle: 240, width: 60 }
                ]
            }
        },
        sections: [
            { title: 'Analytical Services', description: 'Full-service analytical testing laboratory with SANAS accreditation.', details: ['Sample intake and documentation', 'Microbiology testing', 'Chemical analysis', 'Water quality testing', 'Food safety testing', 'Environmental testing'], hasVR: true, vrSceneId: 'main-lab' },
            { title: 'Food & Technology Lab', description: 'Specialized food and water technology services.', details: ['Advanced food safety analysis', 'Water purification testing', 'Technology development'], hasVR: true, vrSceneId: 'main-lab' },
        ],
    },
    'design-centre': {
        name: 'Design Centre',
        icon: 'pen-tool',
        description: 'Creative hub for product design and prototyping',
        color: '#FF6600',
        initialSceneId: 'cad-3d-printing',
        scenes: {
            // 'overview': {
            //     id: 'overview',
            //     title: 'Design Centre Overview',
            //     image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/360-degree_panorama_of_the_ESO_Headquarters_%28hqe-pano1%29.jpg/2560px-360-degree_panorama_of_the_ESO_Headquarters_%28hqe-pano1%29.jpg',
            //     hotspots: []
            // },
            'cad-3d-printing': {
                id: 'cad-3d-printing',
                title: 'CAD and 3D Printing',
                image: require('../../assets/videos/360-tours/design-centre/cadand3dprinting.jpeg'),
                hotspots: [],
                regions: [
                    { id: '3d-printers', name: '3D Printers', angle: 0, width: 60 },
                    { id: 'workstations', name: 'CAD Workstations', angle: 90, width: 60 },
                    { id: 'entrance', name: 'Entrance', angle: 180, width: 60 },
                    { id: 'materials', name: 'Material Storage', angle: 270, width: 60 },
                ]
            },
            'cnc-milling': {
                id: 'cnc-milling',
                title: 'CNC Milling',
                image: require('../../assets/videos/360-tours/design-centre/cncmilling.jpeg'),
                hotspots: [],
                regions: [
                    { id: 'cnc-machine', name: 'CNC Machine', angle: 30, width: 80 },
                    { id: 'control-panel', name: 'Control Panel', angle: 0, width: 40 },
                    { id: 'tools', name: 'Tool Storage', angle: 200, width: 60 },
                    { id: 'materials', name: 'Material Area', angle: 300, width: 60 }
                ]
            }
        },
        sections: [
            { title: 'CAD and 3D Printing', description: 'Professional design and rapid prototyping.', details: ['CAD workstations', '3D printers', 'Design software'], hasVR: true, vrSceneId: 'cad-3d-printing' },
            { title: 'CNC Milling', description: 'Precision machining and fabrication.', details: ['CNC mills', 'Precision tools', 'Material processing'], hasVR: true, vrSceneId: 'cnc-milling' },
        ],
    },
    'digital-hub': {
        name: 'Digital Hub',
        icon: 'monitor',
        description: 'Technology acceleration center',
        color: '#28A745',
        initialSceneId: 'broadcasting',
        scenes: {
            // 'overview': {
            //     id: 'overview',
            //     title: 'Digital Hub Overview',
            //     image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Hilo_Base_Facility_Control_Room_360_Panorama_%282022_03_29_Hilo_360_Control_Room_2-CC%29.jpg/2560px-Hilo_Base_Facility_Control_Room_360_Panorama_%282022_03_29_Hilo_360_Control_Room_2-CC%29.jpg',
            //     hotspots: []
            // },
            'auditorium': {
                id: 'auditorium',
                title: 'Auditorium',
                image: require('../../assets/videos/360-tours/digital-hub/auditorium/auditorium.jpeg'),
                hotspots: [],
                regions: [
                    { id: 'seating', name: 'Seating Area', angle: 0, width: 120 },
                    { id: 'stage', name: 'Presentation Stage', angle: 180, width: 60 },
                    { id: 'screen', name: 'Projection Screen', angle: 180, width: 40 },
                    { id: 'entrance', name: 'Main Entrance', angle: 270, width: 40 }
                ]
            },
            'broadcasting': {
                id: 'broadcasting',
                title: 'Broadcasting and Videography',
                image: require('../../assets/videos/360-tours/digital-hub/broadcasting-studio/broadcastingandvideography.jpeg'),
                hotspots: [],
                regions: [
                    { id: 'podcast-area', name: 'Podcast Station', angle: 0, width: 70 },
                    { id: 'lighting', name: 'Studio Lighting', angle: 90, width: 60 },
                    { id: 'camera', name: 'Camera Equipment', angle: 180, width: 60 },
                    { id: 'green-screen', name: 'Backdrop Area', angle: 270, width: 80 }
                ]
            },
            'digital-units': {
                id: 'digital-units',
                title: 'Digital Units',
                image: require('../../assets/videos/360-tours/digital-hub/digital-units/digitalunits.jpeg'),
                hotspots: [],
                regions: [
                    { id: 'workstations', name: 'Tech Workstations', angle: 0, width: 100 },
                    { id: 'meeting-area', name: 'Meeting Area', angle: 120, width: 60 },
                    { id: 'relax-zone', name: 'Relaxation Zone', angle: 240, width: 60 }
                ]
            }
        },
        sections: [
            { title: 'Auditorium', description: 'Professional presentation and event space.', details: ['Stage lighting', 'Sound system', 'Seating for 100+'], hasVR: true, vrSceneId: 'auditorium' },
            { title: 'Broadcasting and Videography', description: 'Complete video production studio.', details: ['HD cameras', 'Lighting equipment', 'Editing software'], hasVR: true, vrSceneId: 'broadcasting' },
            { title: 'Digital Units', description: 'Technology development and innovation spaces.', details: ['Co-working areas', 'Tech labs', 'Innovation hubs'], hasVR: true, vrSceneId: 'digital-units' },
        ],
    },
    'automotive-incubator': {
        name: 'Automotive & Manufacturing Incubator',
        icon: 'settings',
        description: 'Advanced manufacturing and automotive innovation incubator',
        color: '#6F42C1',
        initialSceneId: 'ancillary-services',
        scenes: {
            // 'overview': {
            //     id: 'overview',
            //     title: 'Incubator Overview',
            //     image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Motive_Power_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7900-7908.TIF/lossy-page1-2560px-Motive_Power_Gallery_-_360_Degree_Equirectangular_View_-_BITM_-_Kolkata_2015-06-30_7900-7908.TIF.jpg',
            //     hotspots: []
            // },
            // 'industrial-incubation': {
            //     id: 'industrial-incubation',
            //     title: 'Industrial Incubation Unit',
            //     image: require('../../../assets/videos/360-tours/automotive-incubator/industrial-incubation-units/industrial-incubation-main.mp4'),
            //     hotspots: []
            // },
            'ancillary-services': {
                id: 'ancillary-services',
                title: 'Shared Ancillary Services',
                image: require('../../assets/videos/360-tours/automotive-incubator/shared-ancillary-services/sharedancilary.jpeg'),
                hotspots: [],
                regions: [
                    { id: 'meeting-space', name: 'Meeting Space', angle: 0, width: 100 },
                    { id: 'office-cubicles', name: 'Office Cubicles', angle: 120, width: 80 },
                    { id: 'lounge', name: 'Lounge Area', angle: 240, width: 60 }
                ]
            }
        },
        sections: [
            { title: 'Industrial Incubation Unit', description: 'Dedicated manufacturing space for automotive startups.', details: ['Advanced manufacturing equipment', 'Prototyping facilities', 'Testing and validation labs'] },
            { title: 'Shared Ancillary Services', description: 'Common facilities supporting all incubator tenants.', details: ['Meeting rooms', 'Conference facilities', 'Business support services'], hasVR: true, vrSceneId: 'ancillary-services' },
        ],
    },
    'renewable-energy': {
        name: 'Renewable Energy Centre',
        icon: 'zap',
        description: 'Clean energy solutions and sustainability projects',
        color: '#E83E8C',
        initialSceneId: 'main-facility',
        scenes: {
            'main-facility': {
                id: 'main-facility',
                title: 'Renewable Energy Centre',
                image: require('../../assets/videos/360-tours/renewable-energy/renewableenergy.jpeg'),
                hotspots: [],
                regions: [
                    { id: 'training-benches', name: 'Training Workstations', angle: 0, width: 100 },
                    { id: 'electrical-panels', name: 'Electrical Panels', angle: 90, width: 60 },
                    { id: 'control-systems', name: 'Control Systems', angle: 270, width: 60 },
                    { id: 'storage', name: 'Equipment Storage', angle: 180, width: 60 }
                ]
            }
        },
        sections: [
            { title: 'Complete Renewable Energy Services', description: 'Full-service clean energy and sustainability center.', details: ['Solar panel testing', 'Wind energy testing', 'Battery storage solutions', 'Energy efficiency research', 'Sustainable technology development'], hasVR: true, vrSceneId: 'main-facility' },
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

