import { authenticatedFetch } from '@shopify/app-bridge-utils';
import { useAppBridge } from '@shopify/app-bridge-react';
import deepMerge from '@shopify/app-bridge/actions/merge';
import { Redirect } from '@shopify/app-bridge/actions';

/**
 * A hook that returns an auth-aware fetch function.
 * @desc The returned fetch function that matches the browser's fetch API
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * It will provide the following functionality:
 *
 * 1. Add a `X-Shopify-Access-Token` header to the request.
 * 2. Check response for `X-Shopify-API-Request-Failure-Reauthorize` header.
 * 3. Redirect the user to the reauthorization URL if the header is present.
 *
 * @returns {Function} fetch function
 */
export function useAuthenticatedFetch() {
    const app = useAppBridge();
    const fetchFunction = authenticatedFetch(app);

    return async (uri: string, options?: RequestInit | undefined) => {
        const response = await fetchFunction(uri, options);
        checkHeadersForReauthorization(response.headers, app);
        return response;
    };
}
/**
 * A hook that returns an auth-aware fetch function.
 * @desc The returned fetch function that matches the browser's fetch API
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * It will provide the following functionality:
 *
 * 1. Add a `X-Shopify-Access-Token` header to the request.
 * 2. Check response for `X-Shopify-API-Request-Failure-Reauthorize` header.
 * 3. Redirect the user to the reauthorization URL if the header is present.
 *
 * @returns {Function} fetch function
 */
export function useAuthenticatedFetchPost() {
    const app = useAppBridge();
    const fetchFunction = authenticatedFetch(app);

    return async (uri: string, options: any) => {
        const aggregateOptions = deepMerge(options, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const response = await fetchFunction(uri, aggregateOptions);
        checkHeadersForReauthorization(response.headers, app);
        return response;
    };
}

function checkHeadersForReauthorization(headers: any, app: any) {
    if (headers.get('X-Shopify-API-Request-Failure-Reauthorize') === '1') {
        const authUrlHeader =
            headers.get('X-Shopify-API-Request-Failure-Reauthorize-Url') ||
            `/api/auth`;
        const redirect = Redirect.create(app);
        redirect.dispatch(
            Redirect.Action.REMOTE,
            authUrlHeader.startsWith('/')
                ? `https://${window.location.host}${authUrlHeader}`
                : authUrlHeader
        );
    }
}
