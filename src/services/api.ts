// API Configuration and Services for HR Portal Frontend
// This file handles all backend API communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hrhivetech-production.up.railway.app/api';

// Debug logging for development
const isDevelopment = import.meta.env.DEV;

// Helper function to make API calls with auth token
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get auth token from localStorage
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }


  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    // Handle various HTTP error codes
    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        // Response wasn't JSON, use statusText
      }

      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = '/'; // Redirect to login
        throw new Error('Session expired. Please login again.');
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error('You do not have permission to access this resource.');
      }

      // Handle 404 Not Found
      if (response.status === 404) {
        throw new Error('Resource not found.');
      }

      // Handle 422 Unprocessable Entity (Validation errors)
      if (response.status === 422) {
        throw new Error(errorMessage);
      }

      // Handle 500 Server Error
      if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    // Log fetch errors (network, CORS, etc.)
    if (isDevelopment) {
      console.error(`❌ API Error: ${url}`, error);
    }

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(
        `Cannot connect to backend at ${API_BASE_URL}. Make sure the backend server is running on http://localhost:5000`
      );
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }

    throw error;
  }
}

// ==================== Authentication APIs ====================

export const authAPI = {
  register: async (credentials: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  login: async (email: string, password: string) => {
    const response = await apiCall<{
      success: boolean;
      data: {
        id: string;
        username: string;
        email: string;
        role: string;
        token: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }

    return response.data;
  },

  getMe: async () => {
    return apiCall('/auth/me', {
      method: 'GET',
    });
  },

  updateDetails: async (userData: Record<string, any>) => {
    return apiCall('/auth/updatedetails', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    return apiCall('/auth/updatepassword', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  logout: async () => {
    try {
      await apiCall('/auth/logout', {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  },
};

// ==================== Employee APIs ====================

export const employeeAPI = {
  getAll: async (page = 1, limit = 10, filters?: Record<string, any>) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...Object.fromEntries(
        Object.entries(filters || {}).map(([k, v]) => [k, String(v)])
      ),
    });
    return apiCall(`/employees?${params}`, {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiCall(`/employees/${id}`, {
      method: 'GET',
    });
  },

  create: async (employeeData: Record<string, any>) => {
    return apiCall('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  update: async (id: string, employeeData: Record<string, any>) => {
    return apiCall(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async () => {
    return apiCall('/employees/stats/overview', {
      method: 'GET',
    });
  },
};

// ==================== Attendance APIs ====================

export const attendanceAPI = {
  getAll: async (page = 1, limit = 10, filters?: Record<string, any>) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...Object.fromEntries(
        Object.entries(filters || {}).map(([k, v]) => [k, String(v)])
      ),
    });
    return apiCall(`/attendance?${params}`, {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiCall(`/attendance/${id}`, {
      method: 'GET',
    });
  },

  create: async (attendanceData: Record<string, any>) => {
    return apiCall('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  },

  update: async (id: string, attendanceData: Record<string, any>) => {
    return apiCall(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(attendanceData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/attendance/${id}`, {
      method: 'DELETE',
    });
  },

  checkOut: async (employeeId: string | number, date?: string, location?: Record<string, any>, checkOut?: Date | string) => {
    return apiCall('/api/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ employeeId, date, location, checkOut }),
    });
  },
};

// ==================== Leave APIs ====================

export const leaveAPI = {
  getAll: async (page = 1, limit = 10, filters?: Record<string, any>) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...Object.fromEntries(
        Object.entries(filters || {}).map(([k, v]) => [k, String(v)])
      ),
    });
    return apiCall(`/leaves?${params}`, {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiCall(`/leaves/${id}`, {
      method: 'GET',
    });
  },

  create: async (leaveData: Record<string, any>) => {
    return apiCall('/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  },

  update: async (id: string, leaveData: Record<string, any>) => {
    return apiCall(`/leaves/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leaveData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/leaves/${id}`, {
      method: 'DELETE',
    });
  },

  approve: async (id: string, approvalComment: string) => {
    return apiCall(`/leaves/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approvalComment }),
    });
  },

  reject: async (id: string, rejectionReason: string) => {
    return apiCall(`/leaves/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ rejectionReason }),
    });
  },

  getBalance: async (employeeId: string) => {
    return apiCall(`/leaves/balance/${employeeId}`, {
      method: 'GET',
    });
  },
};

// ==================== Payroll APIs ====================

export const payrollAPI = {
  getAll: async (page = 1, limit = 10, filters?: Record<string, any>) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...Object.fromEntries(
        Object.entries(filters || {}).map(([k, v]) => [k, String(v)])
      ),
    });
    return apiCall(`/payroll?${params}`, {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiCall(`/payroll/${id}`, {
      method: 'GET',
    });
  },

  create: async (payrollData: Record<string, any>) => {
    return apiCall('/payroll', {
      method: 'POST',
      body: JSON.stringify(payrollData),
    });
  },

  update: async (id: string, payrollData: Record<string, any>) => {
    return apiCall(`/payroll/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payrollData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/payroll/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Performance APIs ====================

export const performanceAPI = {
  getAll: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return apiCall(`/performance?${params}`, {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiCall(`/performance/${id}`, {
      method: 'GET',
    });
  },

  create: async (performanceData: Record<string, any>) => {
    return apiCall('/performance', {
      method: 'POST',
      body: JSON.stringify(performanceData),
    });
  },

  update: async (id: string, performanceData: Record<string, any>) => {
    return apiCall(`/performance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(performanceData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/performance/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Interview APIs ====================

export const interviewAPI = {
  getAll: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return apiCall(`/interviews?${params}`, {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiCall(`/interviews/${id}`, {
      method: 'GET',
    });
  },

  create: async (interviewData: Record<string, any>) => {
    return apiCall('/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
  },

  update: async (id: string, interviewData: Record<string, any>) => {
    return apiCall(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(interviewData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/interviews/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Document APIs ====================

export const documentAPI = {
  getAll: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return apiCall(`/documents?${params}`, {
      method: 'GET',
    });
  },

  upload: async (documentData: FormData | Record<string, any>) => {
    return apiCall('/documents', {
      method: 'POST',
      body: documentData instanceof FormData ? documentData : JSON.stringify(documentData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/documents/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Announcement APIs ====================

export const announcementAPI = {
  getAll: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return apiCall(`/announcements?${params}`, {
      method: 'GET',
    });
  },

  create: async (announcementData: Record<string, any>) => {
    return apiCall('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  },

  update: async (id: string, announcementData: Record<string, any>) => {
    return apiCall(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(announcementData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/announcements/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Holiday APIs ====================

export const holidayAPI = {
  getAll: async () => {
    return apiCall('/holidays', {
      method: 'GET',
    });
  },

  create: async (holidayData: Record<string, any>) => {
    return apiCall('/holidays', {
      method: 'POST',
      body: JSON.stringify(holidayData),
    });
  },

  update: async (id: string, holidayData: Record<string, any>) => {
    return apiCall(`/holidays/${id}`, {
      method: 'PUT',
      body: JSON.stringify(holidayData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/holidays/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Analytics APIs ====================

export const analyticsAPI = {
  getDashboard: async () => {
    return apiCall('/analytics/overview', {
      method: 'GET',
    });
  },

  getAttendanceAnalytics: async (filters?: Record<string, any>) => {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters || {}).map(([k, v]) => [k, String(v)])
      )
    );
    return apiCall(`/analytics/attendance?${params}`, {
      method: 'GET',
    });
  },

  getPayrollAnalytics: async (filters?: Record<string, any>) => {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filters || {}).map(([k, v]) => [k, String(v)])
      )
    );
    return apiCall(`/analytics/payroll?${params}`, {
      method: 'GET',
    });
  },
};

// ==================== User APIs ====================

export const userAPI = {
  getAll: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    return apiCall(`/users?${params}`, {
      method: 'GET',
    });
  },

  create: async (userData: Record<string, any>) => {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  update: async (id: string, userData: Record<string, any>) => {
    return apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id: string) => {
    return apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export default {
  authAPI,
  employeeAPI,
  attendanceAPI,
  leaveAPI,
  payrollAPI,
  performanceAPI,
  interviewAPI,
  documentAPI,
  announcementAPI,
  holidayAPI,
  analyticsAPI,
  userAPI,
};
