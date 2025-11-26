import { Feather } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ProductLinesScreen } from '../screens/ProductLinesScreen';
import { TenantsScreen } from '../screens/TenantsScreen';
import { OpportunitiesScreen } from '../screens/OpportunitiesScreen';
import { ResourcesScreen } from '../screens/ResourcesScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { NetworkScreen } from '../screens/NetworkScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';

export type UserRole = 'Entrepreneur' | 'Researcher' | 'SME' | 'Student' | 'Investor' | 'Tenant';

export interface NavigationItem {
  name: string;
  component: React.ComponentType<any>;
  icon: keyof typeof Feather.glyphMap;
  roles: UserRole[];
  priority?: number; // Lower number = higher priority in menu
}

// Role-based navigation configuration
export const roleNavigationConfig: NavigationItem[] = [
  // Common screens available to all roles
  {
    name: 'Dashboard',
    component: DashboardScreen,
    icon: 'home',
    roles: ['Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant'],
    priority: 1,
  },
  {
    name: 'Product Lines',
    component: ProductLinesScreen,
    icon: 'grid',
    roles: ['Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant'],
    priority: 2,
  },
  {
    name: 'Opportunities',
    component: OpportunitiesScreen,
    icon: 'briefcase',
    roles: ['Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant'],
    priority: 3,
  },
  {
    name: 'Resources',
    component: ResourcesScreen,
    icon: 'book',
    roles: ['Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant'],
    priority: 4,
  },
  {
    name: 'Events',
    component: EventsScreen,
    icon: 'calendar',
    roles: ['Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant'],
    priority: 5,
  },
  {
    name: 'News',
    component: NewsScreen,
    icon: 'file-text',
    roles: ['Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant'],
    priority: 6,
  },
  
  // Role-specific screens
  {
    name: 'Tenants',
    component: TenantsScreen,
    icon: 'users',
    roles: ['Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant'],
    priority: 7,
  },
  {
    name: 'My Network',
    component: NetworkScreen,
    icon: 'users',
    roles: ['Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant'],
    priority: 8,
  },
  {
    name: 'My Profile',
    component: UserProfileScreen,
    icon: 'user',
    roles: ['Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant'],
    priority: 9,
  },
  {
    name: 'Settings',
    component: SettingsScreen,
    icon: 'settings',
    roles: ['Entrepreneur', 'Researcher', 'SME', 'Student', 'Investor', 'Tenant'],
    priority: 10,
  },
];

// Get navigation items for a specific role
export function getNavigationForRole(role: UserRole): NavigationItem[] {
  return roleNavigationConfig
    .filter(item => item.roles.includes(role))
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

// Role-specific screen priorities and interests
export const roleInterests: Record<UserRole, {
  primaryScreens: string[];
  secondaryScreens: string[];
  description: string;
}> = {
  Entrepreneur: {
    primaryScreens: ['Dashboard', 'Opportunities', 'Resources', 'My Network'],
    secondaryScreens: ['Product Lines', 'Events', 'News', 'Tenants'],
    description: 'Startup founders and business owners looking for funding, partnerships, and resources',
  },
  Researcher: {
    primaryScreens: ['Dashboard', 'Resources', 'Product Lines', 'News'],
    secondaryScreens: ['Opportunities', 'Events', 'My Network', 'Tenants'],
    description: 'Academic and industry researchers seeking labs, equipment, and collaboration opportunities',
  },
  SME: {
    primaryScreens: ['Dashboard', 'Opportunities', 'Tenants', 'Resources'],
    secondaryScreens: ['Product Lines', 'Events', 'News', 'My Network'],
    description: 'Small and medium enterprises looking for business opportunities and partnerships',
  },
  Student: {
    primaryScreens: ['Dashboard', 'Opportunities', 'Events', 'Resources'],
    secondaryScreens: ['Product Lines', 'News', 'My Network', 'Tenants'],
    description: 'Students and interns seeking internships, bursaries, training, and career opportunities',
  },
  Investor: {
    primaryScreens: ['Dashboard', 'Opportunities', 'Tenants', 'My Network'],
    secondaryScreens: ['Product Lines', 'Events', 'News', 'Resources'],
    description: 'Investors and funding organizations looking for investment opportunities and startups',
  },
  Tenant: {
    primaryScreens: ['Dashboard', 'Resources', 'Product Lines', 'Events'],
    secondaryScreens: ['Opportunities', 'News', 'My Network', 'Tenants'],
    description: 'Park tenant companies managing their presence and accessing park resources',
  },
};

