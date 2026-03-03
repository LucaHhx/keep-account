import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth';

// iOS/Android：使用 @tauri-apps/plugin-http 原生网络栈，绕过 WKWebView POST body 丢失问题。
declare const __TAURI_DEV_HOST__: string;
const isTauri = '__TAURI_INTERNALS__' in window;

function getBaseURL(): string {
  // 优先使用 .env 中配置的后端地址（dev 和 production 均可配置）
  if (import.meta.env.VITE_API_BASE_URL) {
    return `${import.meta.env.VITE_API_BASE_URL}/api/v1`;
  }

  // Tauri dev 模式：iOS/Android 使用 TAURI_DEV_HOST（宿主机 IP），桌面用 localhost
  if (isTauri) {
    const devHost = typeof __TAURI_DEV_HOST__ !== 'undefined' && __TAURI_DEV_HOST__
      ? __TAURI_DEV_HOST__
      : 'localhost';
    return `http://${devHost}:5723/api/v1`;
  }

  // Web 兜底：使用当前页面的 origin（适配任何部署地址，nginx 代理 /api/ 到后端）
  return `${window.location.origin}/api/v1`;
}

const baseURL = getBaseURL();

// 去掉 /api/v1，只展示服务器地址
export const serverEndpoint = baseURL.replace(/\/api\/v1\/?$/, '');

// On Tauri (desktop + mobile), use native HTTP plugin to avoid WKWebView body stripping.
// The plugin uses NSURLSession on iOS, so POST bodies are preserved.
async function tauriAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  console.log('[tauriAdapter] baseURL:', config.baseURL, 'url:', config.url, 'method:', config.method, 'params:', config.params);
  const { fetch: nativeFetch } = await import('@tauri-apps/plugin-http');

  // Join baseURL + url the same way Axios does (simple concatenation).
  // new URL() would break relative paths like "/auth/login" against "http://host/api/v1".
  let url: string;
  if (config.url && /^https?:\/\//i.test(config.url)) {
    url = config.url;
  } else {
    const base = (config.baseURL || '').replace(/\/+$/, '');
    const path = (config.url || '').replace(/^\/+/, '');
    url = base ? `${base}/${path}` : `/${path}`;
  }

  // Serialize config.params into query string (Axios does this automatically,
  // but our custom adapter bypasses that logic)
  if (config.params && typeof config.params === 'object') {
    const entries = Object.entries(config.params).filter(([, v]) => v != null);
    if (entries.length > 0) {
      const qs = new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const headers: Record<string, string> = {};
  if (config.headers) {
    // AxiosHeaders.toJSON() returns a plain object with only real headers
    const raw = typeof config.headers.toJSON === 'function'
      ? config.headers.toJSON()
      : config.headers;
    for (const [key, value] of Object.entries(raw)) {
      if (value != null) headers[key] = String(value);
    }
  }

  let body: BodyInit | undefined;
  if (config.data != null) {
    if (typeof config.data === 'string') {
      body = config.data;
    } else {
      body = JSON.stringify(config.data);
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
    }
  }

  const response = await nativeFetch(url, {
    method: (config.method || 'get').toUpperCase(),
    headers,
    body,
  });

  const responseData = await response.json().catch(() => null);

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  const axiosResponse: AxiosResponse = {
    data: responseData,
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    config,
  } as AxiosResponse;

  // Native fetch doesn't throw on 4xx/5xx. Replicate Axios default behavior
  // so that response error interceptors (e.g. 401 auto-logout) work correctly.
  if (response.status < 200 || response.status >= 300) {
    const error = new AxiosError(
      `Request failed with status code ${response.status}`,
      AxiosError.ERR_BAD_RESPONSE,
      config,
      null,
      axiosResponse,
    );
    throw error;
  }

  return axiosResponse;
}

const api = axios.create({
  baseURL,
  timeout: 10000,
  adapter: isTauri ? tauriAdapter : undefined,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      useAuthStore.getState().setToken(newToken);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/')) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
