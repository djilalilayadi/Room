import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";

let _puter: any = null;
const getPuter = async () => {
    if (!_puter) {
        const mod = await import("@heyputer/puter.js");
        _puter = mod.default || mod;
    }
    return _puter;
};

export const signIn = async () => {
    const puter = await getPuter();
    return puter.auth.signIn();
};

export const signOut = async () => {
    const puter = await getPuter();
    return puter.auth.signOut();
};

export const getCurrentUser = async () => {
    try {
        const puter = await getPuter();
        return await puter.auth.getUser();
    } catch {
        return null;
    }
}

export const createProject = async ({ item }: CreateProjectParams): Promise<DesignItem | null | undefined> => {
    const porjectId = item.id;

    const hosting = await getOrCreateHostingConfig();

    const hostedSource = porjectId ?
        await uploadImageToHosting({
            hosting,
            url: item.sourceImage,
            projectId: porjectId,
            label: 'source'
        }) : null;

    const hostedRendered = porjectId && item.renderedImage ?
        await uploadImageToHosting({
            hosting,
            url: item.renderedImage,
            projectId: porjectId,
            label: 'rendered'
        }) : null;

    const resolvedSource = hostedSource?.url || (isHostedUrl(item.sourceImage) ? item.sourceImage : '');

    if (!resolvedSource) {
        console.warn('Failed to host source image');
        return null;
    }

    const resolvedRendered = hostedRendered?.url ? hostedRendered?.url : item.renderedImage && isHostedUrl(item.renderedImage) ? item.renderedImage : undefined;




    const {
        sourcePath: _sourcePath,
        renderedPath: _renderedPath,
        publicPath: _publicPath,
        ...rest
    } = item;

    const payload = {
        ...rest,
        sourceImage: resolvedSource,
        renderedImage: resolvedRendered,
    }

    try {
        //call puter worker to stor project in kv 
        return payload;
    } catch (e) {
        console.error('Failed to create project', e);
        return null;
    }

}





