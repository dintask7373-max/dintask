const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1`;

const apiRequest = async (endpoint, options = {}) => {
  // Read token from localStorage (matching authStore configuration)
  const token = localStorage.getItem('dintask-auth-storage')
    ? JSON.parse(localStorage.getItem('dintask-auth-storage')).state.token
    : null;

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const fullUrl = `${BASE_URL}${endpoint}`;
    console.log(`[API Request] ${config.method || 'GET'} ${fullUrl}`);
    const response = await fetch(fullUrl, config);
    console.log(`[API Response] ${response.status} ${fullUrl}`);
    const data = await response.json();

    if (!response.ok) {
      // Check if response indicates subscription expiry
      if (data.subscriptionExpired || (response.status === 403 && data.message?.includes('subscription'))) {
        // Dispatch custom event for subscription expiry
        window.dispatchEvent(new CustomEvent('subscriptionExpired', {
          detail: {
            message: data.message || data.error,
            expiryDate: data.expiryDate
          }
        }));
      }

      if (data.isSuspended) {
        let role = data.role || '';
        
        // Fallback to storage if not in response
        if (!role) {
          try {
            const storage = JSON.parse(localStorage.getItem('dintask-auth-storage'));
            role = storage?.state?.user?.role || '';
          } catch (e) {
            console.error('Error getting role from storage:', e);
          }
        }

        const getLoginPath = (r) => {
          switch(r) {
            case 'admin': return '/admin/login';
            case 'manager': return '/manager/login';
            case 'sales': return '/sales/login';
            case 'partner': return '/partner/login';
            default: return '/employee/login';
          }
        };

        localStorage.removeItem('dintask-auth-storage');
        window.location.href = `${getLoginPath(role)}?status=suspended`;
      }

      throw new Error(data.error || data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export default apiRequest;

