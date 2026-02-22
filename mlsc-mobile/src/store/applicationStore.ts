import { create } from 'zustand';
import apiClient from '../services/api';
import { Application } from '../types';

interface ApplicationState {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  hasNextPage: boolean;
  filters: {
    status?: string;
    domain?: string;
    year?: string;
    branch?: string;
    search?: string;
  };

  // Actions
  fetchApplications: (page?: number) => Promise<void>;
  setFilters: (filters: Partial<ApplicationState['filters']>) => void;
  clearFilters: () => void;
  refreshApplications: () => Promise<void>;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  isLoading: false,
  error: null,
  currentPage: 1,
  hasNextPage: false,
  filters: {},

  fetchApplications: async (page = 1) => {
    set({ isLoading: true, error: null });

    try {
      const { filters } = get();
      const params: any = {
        page: page.toString(),
        limit: '20',
        ...filters,
      };

      // Add last visible ID for pagination if not first page
      if (page > 1 && get().applications.length > 0) {
        const lastApp = get().applications[get().applications.length - 1];
        params.lastVisibleId = lastApp.firestoreId;
      }

      const response = await apiClient.getApplications(params);

      if (response.success && response.data) {
        const newApplications =
          page === 1 ? response.data.applications : [...get().applications, ...response.data.applications];

        set({
          applications: newApplications,
          currentPage: page,
          hasNextPage: response.data.hasNextPage || false,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch applications',
        isLoading: false,
      });
    }
  },

  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  refreshApplications: async () => {
    await get().fetchApplications(1);
  },
}));
