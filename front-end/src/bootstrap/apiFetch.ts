const originalFetch = window.fetch.bind(window);

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const shouldHandleApiRequest = requestUrl.startsWith('/api/');

  if (!shouldHandleApiRequest) {
    return originalFetch(input, init);
  }

  const headers = new Headers(init?.headers);
  const token = localStorage.getItem('auth_token');

  headers.set('Accept', 'application/json');

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return originalFetch(input, {
    ...init,
    headers,
  });
};
