let _puter: any = null;

/**
 * Lazily loads and returns the Puter SDK.
 * This should be used for all Puter interactions to ensure consistent initialization
 * and to prevent issues in non-browser environments.
 */
export const getPuter = async () => {
    if (typeof window === 'undefined') return null;
    if (!_puter) {
        try {
            const mod = await import("@heyputer/puter.js");
            _puter = mod.default || mod;
        } catch (error) {
            console.error("Failed to load @heyputer/puter.js", error);
            return null;
        }
    }
    return _puter;
};

/**
 * A proxy object that provides synchronous access to the Puter SDK.
 * This is primarily for use in the browser where the SDK is expected to be available.
 * It will throw if used before the SDK is loaded or in non-browser environments.
 */
export const puter = new Proxy({} as any, {
    get: (target, prop) => {
        if (typeof window === 'undefined') {
            throw new Error("Puter SDK cannot be accessed on the server.");
        }
        if (!_puter) {
            // If someone tries to access it synchronously before it's loaded, 
            // we return the global puter if it exists (some puter environments inject it)
            // or throw a more helpful error.
            if (window.puter) {
                _puter = window.puter;
                return _puter[prop];
            }
            throw new Error("Puter SDK is not yet loaded. Call getPuter() first or ensure it is loaded.");
        }
        return _puter[prop];
    }
});

declare global {
    interface Window {
        Puter: any;
    }
}
