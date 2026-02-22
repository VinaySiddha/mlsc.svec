import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://mlscsvec.in';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  details?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('accessToken', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('refreshToken', token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await this.getToken();

    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && data.code === 'ERROR_INVALID_TOKEN') {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          return this.request(endpoint, options);
        }
        // If refresh failed, clear tokens and throw error
        await this.clearTokens();
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data?.token) {
        await this.setToken(data.data.token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Authentication endpoints
  async login(username: string, password: string) {
    const data = await this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data.success && data.data) {
      await this.setToken(data.data.token);
      await this.setRefreshToken(data.data.refreshToken);
    }

    return data;
  }

  async logout() {
    const refreshToken = await this.getRefreshToken();
    if (refreshToken) {
      try {
        await this.request('/api/v1/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }
    await this.clearTokens();
  }

  // Application endpoints
  async submitApplication(formData: FormData) {
    return this.request('/api/v1/applications', {
      method: 'POST',
      body: formData,
    });
  }

  async getApplication(referenceId: string) {
    return this.request(`/api/v1/applications?referenceId=${referenceId}`);
  }

  // Event endpoints
  async registerForEvent(eventId: string, data: any) {
    return this.request(`/api/v1/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Jobs endpoint
  async getJobs() {
    return this.request('/api/v1/jobs');
  }

  // Admin endpoints
  async getApplications(params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/v1/admin/applications?${queryString}`);
  }

  async reviewApplication(referenceId: string, reviewData: any) {
    return this.request(`/api/v1/admin/applications/${referenceId}/review`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async updateAttendance(firestoreId: string, attended: boolean) {
    return this.request(`/api/v1/admin/applications/${firestoreId}/attendance`, {
      method: 'PATCH',
      body: JSON.stringify({ attended }),
    });
  }

  async getAnalytics(interviewOnly: boolean = false) {
    return this.request(`/api/v1/admin/analytics?interviewOnly=${interviewOnly}`);
  }

  async inviteTeamMember(data: any) {
    return this.request('/api/v1/admin/team/invite', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export default new ApiClient(API_BASE_URL);
