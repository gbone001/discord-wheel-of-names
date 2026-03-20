/**
 * Uplup Wheel API Client
 * Handles all API calls to Uplup Wheel service via the REST API v1.
 *
 * Authentication: Bearer token (API key only, no secret needed).
 * Base URL: https://api.uplup.com/api/v1
 *
 * API v1 (ApiV1Controller) uses Bearer auth and is the external-facing API.
 * API v2 (WheelsController) uses session auth and is for the frontend only.
 */

export class UplupAPI {
  constructor(apiKey, baseUrl = 'https://api.uplup.com/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.accountInfo = null;
    this.accountInfoFetchedAt = null;
  }

  /**
   * Get authorization header for API requests.
   * The API uses Bearer token auth with the API key directly.
   */
  getAuthHeader() {
    return `Bearer ${this.apiKey}`;
  }

  /**
   * Make an API request
   */
  async request(endpoint, method = 'GET', body = null) {
    const url = `${this.baseUrl}${endpoint}`;

    const options = {
      method,
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error?.message || `API request failed with status ${response.status}`);
    }

    return data;
  }

  /**
   * Create a new wheel.
   * API v1 expects { wheel_name, names } where names is an array of strings
   * or objects with { Name: "..." } format.
   */
  async createWheel(name, entries) {
    return this.request('/wheels', 'POST', {
      wheel_name: name,
      names: entries
    });
  }

  /**
   * Get wheel details.
   * Note: API v1 GET /wheels returns a flat list, individual wheel
   * retrieval is not available in v1. Use listWheels() to find wheels.
   */
  async getWheel(wheelId) {
    // API v1 does not have a GET /wheels/{id} endpoint.
    // Fetch all wheels and find the one we need.
    const response = await this.listWheels(100, 0);
    const wheels = response.data || [];
    const wheel = wheels.find(w => w.wheel_id === wheelId);
    if (!wheel) {
      throw new Error('Wheel not found');
    }
    return { success: true, data: wheel };
  }

  /**
   * List all wheels.
   * API v1 returns { success, data: [{ wheel_id, wheel_name, created_at }] }
   */
  async listWheels(limit = 10, offset = 0) {
    return this.request('/wheels');
  }

  /**
   * Update a wheel (name and/or entries).
   * API v1 accepts PUT /wheels/{id} with { wheel_name, names }.
   */
  async updateWheel(wheelId, updates = {}) {
    const body = {};
    if (updates.name) body.wheel_name = updates.name;
    if (updates.entries) body.names = updates.entries;
    return this.request(`/wheels/${wheelId}`, 'PUT', body);
  }

  /**
   * Update wheel entries (convenience wrapper).
   */
  async updateWheelEntries(wheelId, entries) {
    return this.updateWheel(wheelId, { entries });
  }

  /**
   * Delete a wheel (soft-delete).
   */
  async deleteWheel(wheelId) {
    return this.request(`/wheels/${wheelId}`, 'DELETE');
  }

  /**
   * Get account info.
   * API v1 returns { success, data: { user_id, email } }.
   * Note: Plan limits are not currently exposed via API v1.
   * Caches for 5 minutes to reduce API calls.
   */
  async getAccountInfo(forceRefresh = false) {
    const cacheAge = this.accountInfoFetchedAt ? Date.now() - this.accountInfoFetchedAt : Infinity;
    const cacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes

    if (!forceRefresh && this.accountInfo && cacheValid) {
      return this.accountInfo;
    }

    const response = await this.request('/account');
    this.accountInfo = response.data;
    this.accountInfoFetchedAt = Date.now();
    return this.accountInfo;
  }
}