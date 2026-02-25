import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "./utils";
import { getPuter } from "./puter";
import { PUTER_WORKER_URL } from "./constants";



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

export const createProject = async ({ item, visibility = 'private' }: CreateProjectParams): Promise<DesignItem | null | undefined> => {
    if (!PUTER_WORKER_URL) {
        console.warn("MISSING PUTER_WORKER_URL; skip history fetch; ");
        return null;
    }

    const puter = await getPuter();
    if (!puter) return null;

    const projectId = item.id;
    const hosting = await getOrCreateHostingConfig();

    const hostedSource = projectId ?
        await uploadImageToHosting({
            hosting,
            url: item.sourceImage,
            projectId: projectId,
            label: 'source'
        }) : null;

    const hostedRendered = projectId && item.renderedImage ?
        await uploadImageToHosting({
            hosting,
            url: item.renderedImage,
            projectId: projectId,
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
        console.log("Saving project to worker:", payload);
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ project: payload, visibility })
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to save project response:', errorText);
            return null;
        }
        const data = (await response.json()) as { project?: DesignItem | null };
        console.log("Project saved successfully:", data.project);

        return data?.project ?? null;
    } catch (e) {
        console.error('Failed to create project exception:', e);
        return null;
    }

}

export const getProject = async (projectId: string) => {
    if (!PUTER_WORKER_URL) {
        console.warn("MISSING PUTER_WORKER_URL; skip history fetch; ");
    }
    const puter = await getPuter();
    if (!puter) return [];

    try {
        console.log("Fetching project list from:", `${PUTER_WORKER_URL}/api/projects/list`);
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/list`, { method: 'GET' });
        if (!response.ok) {
            console.error('Failed to fetch project list:', await response.text());
            return [];
        }
        const data = (await response.json()) as { projects?: DesignItem[] | null };
        console.log("Fetched projects:", data?.projects?.length || 0);
        return Array.isArray(data?.projects) ? data?.projects : [];
    } catch (error) {
        console.error('Failed to get project', error);
        return [];
    }
}

export const getProjectById = async ({ id }: { id: string }) => {
    if (!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
        return null;
    }

    console.log("Fetching project with ID:", id);

    const puter = await getPuter();
    if (!puter) return null;

    try {
        const response = await puter.workers.exec(
            `${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`,
            { method: "GET" },
        );

        console.log("Fetch project response:", response);

        if (!response.ok) {
            console.error("Failed to fetch project:", await response.text());
            return null;
        }

        const data = (await response.json()) as {
            project?: DesignItem | null;
        };

        console.log("Fetched project data:", data);

        return data?.project ?? null;
    } catch (error) {
        console.error("Failed to fetch project:", error);
        return null;
    }
};

export const updateProject = async ({ item, visibility = 'private' }: CreateProjectParams): Promise<DesignItem | null | undefined> => {
    if (!PUTER_WORKER_URL) {
        console.warn("MISSING PUTER_WORKER_URL; skip update; ");
        return null;
    }

    const puter = await getPuter();
    if (!puter) return null;

    const projectId = item.id;
    const hosting = await getOrCreateHostingConfig();

    // Check if we need to upload new images (only if they are data URLs)
    const hostedSource = projectId && !isHostedUrl(item.sourceImage) ?
        await uploadImageToHosting({
            hosting,
            url: item.sourceImage,
            projectId: projectId,
            label: 'source'
        }) : null;

    const hostedRendered = projectId && item.renderedImage && !isHostedUrl(item.renderedImage) ?
        await uploadImageToHosting({
            hosting,
            url: item.renderedImage,
            projectId: projectId,
            label: 'rendered'
        }) : null;

    console.log("Hosted Source:", hostedSource);
    console.log("Hosted Rendered:", hostedRendered);

    const resolvedSource = hostedSource?.url || item.sourceImage;
    const resolvedRendered = hostedRendered?.url || item.renderedImage;

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
        updatedAt: new Date().getTime(),
    }

    try {
        console.log("Updating project in worker:", payload);
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ project: payload, visibility })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to update project response:', errorText);
            return null;
        }

        const data = (await response.json()) as { project?: DesignItem | null };
        console.log("Project updated successfully:", data.project);
        return data?.project ?? null;
    } catch (e) {
        console.error('Failed to update project exception:', e);
        return null;
    }
}




