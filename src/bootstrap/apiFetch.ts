const getOriginalFetch = (): typeof fetch => {
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    return window.fetch.bind(window);
  }
  if (typeof globalThis !== 'undefined' && typeof globalThis.fetch === 'function') {
    return globalThis.fetch.bind(globalThis);
  }
  return fetch;
};

const originalFetch = getOriginalFetch();

const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const shouldHandleApiRequest = typeof requestUrl === 'string' && requestUrl.startsWith('/api/');

  if (!shouldHandleApiRequest) {
    return originalFetch(input, init);
  }

  const headers = new Headers(init?.headers);
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return originalFetch(input, {
    ...init,
    headers,
  });
};

// Safely define fetch on window / globalThis without triggering getter-only TypeError
try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    writable: true,
    configurable: true,
    enumerable: true,
  });
} catch {
  try {
    Object.defineProperty(Window.prototype, 'fetch', {
      value: customFetch,
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch {
    try {
      (window as any).fetch = customFetch;
    } catch {
      try {
        (globalThis as any).fetch = customFetch;
      } catch (e) {
        console.warn('Unable to override global fetch:', e);
      }
    }
  }
}

export default customFetch;
