let puter: any = null;

async function getPuter() {
    if (typeof window === 'undefined') return null;
    if (puter) return puter;

    try {
        const module = await import("@heyputer/puter.js");
        puter = module.default || module;
        return puter;
    } catch (error) {
        console.error("Failed to load puter.js", error);
        return null;
    }
}

export const signIn = async () => {
    const p = await getPuter();
    return p?.auth.signIn();
};

export const signOut = async () => {
    const p = await getPuter();
    return p?.auth.signOut();
};

export const getCurrentUser = async () => {
    try {
        const p = await getPuter();
        if (!p) return null;
        return await p.auth.getUser();
    } catch {
        return null;
    }
}
