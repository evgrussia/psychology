import { ApiHelper } from '../helpers/api';

/**
 * Seed utilities for E2E tests
 */
export class SeedHelper {
  private api: ApiHelper;

  constructor(api: ApiHelper) {
    this.api = api;
  }

  /**
   * Seed test user
   */
  async seedTestUser(email: string, password: string, displayName: string) {
    try {
      await this.api.registerUser(email, password, displayName);
      return await this.api.loginUser(email, password);
    } catch (error: any) {
      // User might already exist, try to login
      if (error.response?.status === 400) {
        return await this.api.loginUser(email, password);
      }
      throw error;
    }
  }

  /**
   * Seed test services (if needed)
   */
  async seedTestServices() {
    // Services should be seeded in backend test fixtures
    // This is a placeholder for frontend-specific seeding
    return await this.api.getServices();
  }

  /**
   * Seed test content (articles, resources)
   */
  async seedTestContent() {
    // Content should be seeded in backend test fixtures
    // This is a placeholder for frontend-specific seeding
    return {
      articles: await this.api.getArticles(),
      resources: await this.api.getInteractiveResources(),
    };
  }
}
