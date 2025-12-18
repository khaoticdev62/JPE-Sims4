/**
 * API Service for JPE Sims 4 Mod Translator Mobile App
 * Handles communication with the backend translation engine
 */

import axios, { AxiosResponse, AxiosError } from 'axios';

// Configuration constants
const DEFAULT_BASE_URL = 'http://localhost:8000'; // Default for local development
const API_VERSION = 'v1';

interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  apiKey?: string;
}

class ApiService {
  private baseUrl: string;
  private apiKey?: string;
  private axiosInstance;

  constructor(config: ApiConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.API_BASE_URL || DEFAULT_BASE_URL;
    this.apiKey = config.apiKey;

    // Create axios instance with default configuration
    this.axiosInstance = axios.create({
      baseURL: `${this.baseUrl}/api/${API_VERSION}`,
      timeout: config.timeout || 30000, // 30 seconds default timeout
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
    });

    // Add request interceptor to include auth token if available
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle common error patterns
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get authentication token from storage
   */
  private getAuthToken(): string | null {
    // In a real implementation, this would retrieve from secure storage
    return null;
  }

  /**
   * Handle API errors appropriately
   */
  private handleApiError(error: AxiosError): void {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized access - please login again');
          break;
        case 403:
          console.error('Forbidden access');
          break;
        case 404:
          console.error('Requested resource not found');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error(`API Error: ${error.response.status} - ${error.response.statusText}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received from server');
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
    }
  }

  /**
   * Get project list from the backend
   */
  async getProjects(): Promise<AxiosResponse> {
    try {
      const response = await this.axiosInstance.get('/projects');
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a specific project by ID
   */
  async getProject(projectId: string): Promise<AxiosResponse> {
    try {
      const response = await this.axiosInstance.get(`/projects/${projectId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async createProject(projectData: any): Promise<AxiosResponse> {
    try {
      const response = await this.axiosInstance.post('/projects', projectData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(projectId: string, projectData: any): Promise<AxiosResponse> {
    try {
      const response = await this.axiosInstance.put(`/projects/${projectId}`, projectData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<AxiosResponse> {
    try {
      const response = await this.axiosInstance.delete(`/projects/${projectId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate a project
   */
  async validateProject(projectId: string, projectData: any): Promise<AxiosResponse> {
    try {
      const response = await this.axiosInstance.post(`/projects/${projectId}/validate`, projectData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Build a project
   */
  async buildProject(projectId: string, buildOptions: any = {}): Promise<AxiosResponse> {
    try {
      const response = await this.axiosInstance.post(`/projects/${projectId}/build`, buildOptions);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Export a project
   */
  async exportProject(projectId: string, exportOptions: any = {}): Promise<AxiosResponse> {
    try {
      const response = await this.axiosInstance.post(`/projects/${projectId}/export`, exportOptions, {
        responseType: 'blob', // For file downloads
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload a file to a project
   */
  async uploadFileToProject(projectId: string, file: any, fileName: string): Promise<AxiosResponse> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: fileName,
      });
      formData.append('filename', fileName);

      const response = await this.axiosInstance.post(`/projects/${projectId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get build reports for a project
   */
  async getBuildReports(projectId: string): Promise<AxiosResponse> {
    try {
      const response = await this.axiosInstance.get(`/projects/${projectId}/reports`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get the latest build report for a project
   */
  async getLatestBuildReport(projectId: string): Promise<AxiosResponse> {
    try {
      const response = await this.axiosInstance.get(`/projects/${projectId}/reports/latest`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

// Create a singleton instance of the API service
const apiService = new ApiService();

export { ApiService, apiService };