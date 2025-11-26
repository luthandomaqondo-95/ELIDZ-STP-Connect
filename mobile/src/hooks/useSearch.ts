import { useQuery } from '@tanstack/react-query';
import { tenantService } from '@/services/tenant.service';
import { smeService } from '@/services/sme.service';
import { OpportunityService } from '@/services/opportunity.service';
import { chatService } from '@/services/chat.service';
import { ResourceService } from '@/services/resource.service';
import { connectionService } from '@/services/connection.service';

export const useTenantsSearch = (search: string = '') => {
  return useQuery({
    queryKey: ['tenants', search],
    queryFn: () => tenantService.getTenants(undefined, search),
  });
};

export const useFacilitiesSearch = (search: string = '') => {
  return useQuery({
    queryKey: ['facilities', search],
    queryFn: () => tenantService.getCentersOfExcellence(search),
  });
};

export const useBusinessSearch = (search: string = '') => {
  return useQuery({
    queryKey: ['businesses', search],
    queryFn: () => smeService.getAllSMEsWithServicesProducts(search),
  });
};

export const useOpportunitiesSearch = (search: string = '', type: string = 'All') => {
  return useQuery({
    queryKey: ['opportunities', search, type],
    queryFn: () => OpportunityService.getOpportunities(type, search),
  });
};

export const useChatSearch = (userId: string, search: string = '') => {
  return useQuery({
    queryKey: ['chats', userId, search],
    queryFn: () => chatService.getUserChats(userId, search),
    enabled: !!userId,
  });
};

export const useContactsSearch = (userId: string, search: string = '') => {
  return useQuery({
    queryKey: ['contacts', userId, search],
    queryFn: () => connectionService.getAllContacts(userId, search),
    enabled: !!userId,
  });
};

export const useResourcesSearch = (search: string = '') => {
  return useQuery({
    queryKey: ['resources', search],
    queryFn: () => ResourceService.getServicesResources(search),
  });
};
