import { useState, useEffect, useCallback } from 'react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface UseFetchOptions {
	method?: HttpMethod;
	headers?: HeadersInit;
	body?: any;
	skip?: boolean;
}

interface UseFetchResult<T> {
	data: T | null;
	error: Error | null;
	loading: boolean;
	refetch: (overrideUrl?: string, overrideOptions?: UseFetchOptions) => void;
}

function useFetch<T = any>(url: string | null, options?: UseFetchOptions): UseFetchResult<T> {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const [fetchUrl, setFetchUrl] = useState<string | null>(url);
	const [fetchOptions, setFetchOptions] = useState<UseFetchOptions | undefined>(options);

	const fetchData = useCallback((currentUrl: string, currentOptions?: UseFetchOptions) => {
		if (!currentUrl) return;

		let isMounted = true;
		setLoading(true);
		setError(null);

		const { method = 'GET', headers, body } = currentOptions || {};

		const fetchInit: RequestInit = {
			method,
			headers,
		};

		if (body) {
			if (
				typeof body === 'object' &&
				!(body instanceof FormData) &&
				!(body instanceof URLSearchParams)
			) {
				fetchInit.body = JSON.stringify(body);
				fetchInit.headers = {
					'Content-Type': 'application/json',
					...headers,
				};
			} else {
				fetchInit.body = body;
			}
		}

		fetch(currentUrl, fetchInit)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP error! Status: ${res.status}`);
				}
				// Try parse JSON, fallback to text
				const contentType = res.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					return res.json() as Promise<T>;
				}
				return res.text() as unknown as Promise<T>;
			})
			.then((result) => {
				if (isMounted) {
					setData(result);
					setLoading(false);
				}
			})
			.catch((err) => {
				if (isMounted) {
					setError(err as Error);
					setLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (fetchUrl && !fetchOptions?.skip) {
			const cleanup = fetchData(fetchUrl, fetchOptions);
			return cleanup;
		}
	}, [fetchUrl, fetchOptions, fetchData]);

	const refetch = (overrideUrl?: string, overrideOptions?: UseFetchOptions) => {
		if (overrideUrl) setFetchUrl(overrideUrl);
		if (overrideOptions) setFetchOptions(overrideOptions);
		else setFetchOptions(options);
	};

	return { data, error, loading, refetch };
}

export { useFetch };
