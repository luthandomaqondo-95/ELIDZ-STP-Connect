import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface SupportedSubject {
    code: string;
    name: string;
    active: boolean;
    classLevel: string[];
    color: string;
    colorClass: string;
}
interface Subscription {
    code: string;
    name: string;
    description: string;
    active: boolean;
}

// User Setup State
export interface GeneralState {
	appName: string,
    appVersion: string | null;
	dbVersion: number,
	appState: boolean,
	
	connected: boolean;
	networkConnection: {
		isConnected: boolean;
		isInternetReachable: boolean;
		type: string;
	};
	personalizationObject: {
		demographics: {
			active: boolean;
			title: string;
			description: string;
			options: { code: string; name: string; description: string; active: boolean; }[];
		};
		subjects: {
			active: boolean;
			title: string;
			description: string;
			options: SupportedSubject[];
		};
		// ai: {
		// 	active: boolean;
		// 	title: string;
		// 	description: string;
		// 	options: { code: string; name: string; description: string; active: boolean }[];
		// };
		// subscription: {
		// 	active: boolean;
		// 	title: string;
		// 	description: string;
		// 	options: Subscription[];
		// };
	} | null;
}

// Initial State
const initialState: GeneralState = {
	appName: "Appimate",
    appVersion: null,
	dbVersion: 1,
	appState: true,

	connected: false,
    networkConnection: {
		isConnected: false,
		isInternetReachable: false,
		type: '',
	},
	personalizationObject: {
		demographics: {
			active: true,
			title: 'Select Your Level',
			description: 'Choose your current education level',
			options: [
				{ code: 'school', name: 'High School', description: 'Secondary education level', active: false },
				{ code: 'college', name: 'College', description: 'Post-secondary education', active: false  },
				{ code: 'varsity', name: 'University', description: 'Higher education institution', active: false },
				{ code: 'all', name: 'All', description: 'All education levels', active: false }
			]
		},
		subjects: {
			active: false,
			title: 'Select Your Subjects',
			description: 'Choose your current subjects',
			options: [
				{ code: 'math', name: 'Math', classLevel: ['school', 'college', 'varsity', 'all'], color: '#000000', colorClass: 'bg-black', active: false },
				{ code: 'science', name: 'Science', classLevel: ['school', 'college', 'varsity', 'all'], color: '#000000', colorClass: 'bg-black', active: false },
				{ code: 'history', name: 'History', classLevel: ['school', 'college', 'varsity', 'all'], color: '#000000', colorClass: 'bg-black', active: false },
				{ code: 'trivia', name: 'Trivia', classLevel: ['school', 'college', 'varsity', 'all'], color: '#000000', colorClass: 'bg-black', active: true }
			]
		},
		// ai: {
		// 	active: false,
		// 	title: 'Choose Your AI Voice and Style',
		// 	description: 'Choose your AI voice',
		// 	options: [
		// 		{ code: 'alloy', name: 'Male', description: 'Male voice', active: false },
		// 		{ code: 'female', name: 'Female', description: 'Female voice', active: false },
		// 		{ code: 'robot', name: 'Robot', description: 'Robot voice', active: false },
		// 		{ code: 'all', name: 'All', description: 'All voices', active: false }
		// 	]
		// },
		// subscription: {
		// 	active: false,
		// 	title: 'Select Your Subscription',
		// 	description: 'Choose your subscription plan',
		// 	options: [
		// 		{ code: 'premium_monthly', name: 'Premium Monthly', description: 'Premium Monthly', active: false },
		// 		{ code: 'premium_yearly', name: 'Premium Yearly', description: 'Premium Yearly', active: false }
		// 	]
		// }
	},
}
// User Setup Slice
const generalSlice = createSlice({
	name: 'general',
	initialState,
    reducers: {
        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
			state.connected = action.payload;
		},
		setNetworkConnection: (state, action: PayloadAction<{ isConnected: boolean, isInternetReachable: boolean, type: string }>) => {
			state.networkConnection.isConnected = action.payload.isConnected;
			state.networkConnection.isInternetReachable = action.payload.isInternetReachable;
			state.networkConnection.type = action.payload.type;
		},
		setPersonalizationObject: (state, action: PayloadAction<any>) => {
			if (action.payload.supportedSubjects && state.personalizationObject) {
				state.personalizationObject.subjects.options = action.payload.supportedSubjects;
			};
			if (action.payload.demographics && state.personalizationObject) {
				state.personalizationObject.demographics = action.payload.demographics;
			}
			if (action.payload.subjects && state.personalizationObject) {
				state.personalizationObject.subjects = action.payload.subjects;
			}
		},
		setDemographics: (state, action: PayloadAction< any>) => {
			if (state.personalizationObject) {
				state.personalizationObject.demographics = action.payload;
			}
		},
		setCategories: (state, action: PayloadAction<any>) => {
			if (state.personalizationObject) {
				state.personalizationObject.subjects = action.payload;
			}
		},
        setAppState: (state, action) => {
            state.appState = action.payload.value;
        },
		setAppVersion: (state, action: PayloadAction<string>) => {
			state.appVersion = action.payload;
		}
    },
});

export const { 
	setConnectionStatus, 
	setNetworkConnection,
	setPersonalizationObject, 
	setDemographics, 
	setCategories, 
	setAppState,
	setAppVersion 
} = generalSlice.actions;
export default generalSlice.reducer;

