import axios, { AxiosInstance } from 'axios';

/**
 * API helpers for E2E tests
 */
export class ApiHelper {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:8000') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: `${this.baseURL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Register a new user
   */
  async registerUser(email: string, password: string, displayName: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      display_name: displayName,
    });
    return response.data;
  }

  /**
   * Login user and get tokens
   */
  async loginUser(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  /**
   * Get authenticated client with token
   */
  getAuthenticatedClient(accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: `${this.baseURL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  /**
   * Get services list
   */
  async getServices() {
    const response = await this.client.get('/booking/services');
    return response.data;
  }

  /**
   * Get available slots for a service
   */
  async getAvailableSlots(serviceId: string, dateFrom: string, dateTo: string) {
    const response = await this.client.get(`/booking/services/${serviceId}/slots`, {
      params: {
        date_from: dateFrom,
        date_to: dateTo,
      },
    });
    return response.data;
  }

  /**
   * Create appointment
   */
  async createAppointment(accessToken: string, appointmentData: any) {
    const client = this.getAuthenticatedClient(accessToken);
    const response = await client.post('/booking/appointments', appointmentData);
    return response.data;
  }

  /**
   * Get user appointments
   */
  async getUserAppointments(accessToken: string) {
    const client = this.getAuthenticatedClient(accessToken);
    const response = await client.get('/cabinet/appointments');
    return response.data;
  }

  /**
   * Get articles
   */
  async getArticles(params?: { topic?: string; page?: number }) {
    const response = await this.client.get('/content/articles', { params });
    return response.data;
  }

  /**
   * Get interactive resources
   */
  async getInteractiveResources(type?: string) {
    const response = await this.client.get('/interactive/resources', { params: { type } });
    return response.data;
  }
}
