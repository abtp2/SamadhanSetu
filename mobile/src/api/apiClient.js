import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

const PRODUCTION_BACKEND_URL = 'https://samadhansetu-api.onrender.com/api';

// Extract the laptop's host IP when running via Expo Go / Metro
const getDetectedHostIp = () => {
  // 1. Expo Go hostUri (e.g. "10.48.12.85:8081" or "192.168.1.10:8081")
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.experienceUrl;

  if (hostUri) {
    const rawIp = hostUri.split(':')[0]?.replace(/.*:\/\//, '');
    if (rawIp && rawIp !== 'localhost' && rawIp !== '127.0.0.1') {
      return rawIp;
    }
  }

  // 2. React Native packager scriptURL (e.g. "http://10.48.12.85:8081/index.bundle...")
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^/:]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return match[1];
    }
  }

  // 3. Fallback to current development machine LAN IP
  return '10.48.12.85';
};

const getCandidateBaseUrls = () => {
  const customUrl = process.env.EXPO_PUBLIC_API_URL;
  if (customUrl) {
    return [customUrl];
  }

  if (!__DEV__) {
    return [PRODUCTION_BACKEND_URL];
  }

  const hosts = [];
  const detectedIp = getDetectedHostIp();
  if (detectedIp) hosts.push(detectedIp);
  if (!hosts.includes('10.48.12.85')) hosts.push('10.48.12.85');

  // Android emulator loopback
  if (Platform.OS === 'android') {
    hosts.push('10.0.2.2');
  }
  hosts.push('localhost');

  const candidates = hosts.map((h) => `http://${h}:5000/api`);
  return [...new Set(candidates)];
};

let activeBaseUrl = null;

export const setApiBaseUrl = (url) => {
  activeBaseUrl = url;
};

export const getApiBaseUrl = () => activeBaseUrl || getCandidateBaseUrls()[0];

// Fast background probe to lock activeBaseUrl on app launch
const probeCandidateBaseUrls = async () => {
  if (activeBaseUrl) return;
  const candidates = getCandidateBaseUrls();
  for (const url of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${url}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        activeBaseUrl = url;
        return;
      }
    } catch (_) {
      // Continue probing other candidates
    }
  }
};
probeCandidateBaseUrls();

export const mobileApi = {
  request: async (endpoint, options = {}) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const token = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    // 25s for POST requests (AI analysis may take 2-6s), 10s for other operations
    const timeoutMs = options.timeoutMs || (options.method === 'POST' ? 25000 : 10000);

    // 1. If activeBaseUrl is already known and working, try it directly
    if (activeBaseUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        const res = await fetch(`${activeBaseUrl}${cleanEndpoint}`, {
          ...config,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          // Server responded with an HTTP error status (e.g. 400 Bad Request)
          throw new Error(data.message || `Request failed (${res.status})`);
        }
        return data;
      } catch (err) {
        const isNetworkError =
          err.name === 'AbortError' ||
          err.message?.includes('Network') ||
          err.message?.includes('fetch failed') ||
          err.message?.includes('canceled');

        if (isNetworkError) {
          // Server went down or Wi-Fi IP changed; invalidate cached base URL and try candidates
          activeBaseUrl = null;
        } else {
          // Real application error from the reachable server; re-throw immediately
          throw err;
        }
      }
    }

    // 2. Try candidate URLs in order (detected device LAN IP first)
    const candidates = getCandidateBaseUrls();
    let lastError = null;

    for (const baseUrl of candidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        let res;
        try {
          res = await fetch(`${baseUrl}${cleanEndpoint}`, {
            ...config,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        // Successfully reached a responsive server host!
        activeBaseUrl = baseUrl;

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          // Responsive server returned an application error; stop fallback loop and throw
          throw new Error(data.message || `Request failed (${res.status})`);
        }
        return data;
      } catch (err) {
        lastError = err;
        const isNetworkError =
          err.name === 'AbortError' ||
          err.message?.includes('Network') ||
          err.message?.includes('fetch failed') ||
          err.message?.includes('canceled');

        // If the server answered with an HTTP error code, don't ping other candidates
        if (!isNetworkError && activeBaseUrl) {
          throw err;
        }
      }
    }

    throw lastError || new Error('Network connection failed. Could not reach server.');
  },

  get: (endpoint, options = {}) => mobileApi.request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => mobileApi.request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => mobileApi.request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => mobileApi.request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => mobileApi.request(endpoint, { ...options, method: 'DELETE' }),
};
