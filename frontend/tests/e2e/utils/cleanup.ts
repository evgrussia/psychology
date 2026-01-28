import { ApiHelper } from '../helpers/api';

/**
 * Cleanup utilities for E2E tests
 */
export class CleanupHelper {
  private api: ApiHelper;

  constructor(api: ApiHelper) {
    this.api = api;
  }

  /**
   * Clean up test data (appointments, diary entries, etc.)
   * This should be called after each test to ensure isolation
   */
  async cleanupTestData(accessToken: string) {
    try {
      // Get user appointments
      const appointments = await this.api.getUserAppointments(accessToken);

      // Cancel all test appointments
      // Note: This requires implementing cancel endpoint in API
      // For now, this is a placeholder
      for (const appointment of appointments.results || []) {
        // await this.api.cancelAppointment(accessToken, appointment.id);
      }
    } catch (error) {
      // Ignore cleanup errors in tests
      console.warn('Cleanup error:', error);
    }
  }

  /**
   * Clean up test user (if test user was created)
   */
  async cleanupTestUser(email: string) {
    // Note: This requires implementing user deletion endpoint
    // For now, this is a placeholder
    try {
      // await this.api.deleteUser(email);
    } catch (error) {
      console.warn('User cleanup error:', error);
    }
  }
}
