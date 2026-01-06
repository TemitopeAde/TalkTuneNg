/**
 * Auth-aware fetch wrapper that automatically handles authentication errors
 * and redirects to login when receiving 401 responses
 */

type FetchOptions = RequestInit & {
  // Allow extending with custom options if needed
}

class ApiClient {
  /**
   * Makes an authenticated API request
   * Automatically redirects to login on 401/403 errors
   */
  async fetch(url: string, options: FetchOptions = {}): Promise<Response> {
    // Ensure credentials are included for cookie-based auth
    const config: RequestInit = {
      ...options,
      credentials: options.credentials || 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        // Clear any local storage auth state
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user-storage')

          // Redirect to login with return URL
          const currentPath = window.location.pathname
          const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentPath)}`
          window.location.href = loginUrl
        }
      }

      return response
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  /**
   * GET request helper
   */
  async get(url: string, options: FetchOptions = {}) {
    return this.fetch(url, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request helper
   */
  async post(url: string, data?: any, options: FetchOptions = {}) {
    return this.fetch(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request helper
   */
  async put(url: string, data?: any, options: FetchOptions = {}) {
    return this.fetch(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request helper
   */
  async delete(url: string, options: FetchOptions = {}) {
    return this.fetch(url, {
      ...options,
      method: 'DELETE',
    })
  }

  /**
   * PATCH request helper
   */
  async patch(url: string, data?: any, options: FetchOptions = {}) {
    return this.fetch(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

// Export a singleton instance
export const apiClient = new ApiClient()

// Export the class for testing or custom instances
export default ApiClient
