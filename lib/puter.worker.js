const PROJECT_PREFIX = 'project_';

// Simple router implementation
const routes = {
    GET: {},
    POST: {}
};

const router = {
    get: (path, handler) => routes.GET[path] = handler,
    post: (path, handler) => routes.POST[path] = handler,
    handle: async (request) => {
        const url = new URL(request.url);
        const method = request.method.toUpperCase();
        const handler = routes[method]?.[url.pathname];

        console.log(`Worker: ${method} ${url.pathname}`);

        if (handler) {
            try {
                // Mocking the user object structure expected by routes
                const user = { puter: puter };
                const result = await handler({ request, user });

                if (result instanceof Response) return result;

                return new Response(JSON.stringify(result), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            } catch (error) {
                console.error(`Worker error at ${url.pathname}:`, error);
                return jsonError(500, 'Internal Server Error', { message: error.message });
            }
        }
        return jsonError(404, 'Not Found');
    }
};

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ error: message, ...extra }), {
        status, headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();
        return user?.uuid || null;
    } catch {
        return null;
    }
}



router.post('/api/projects/save', async ({ request, user }) => {
    try {
        const userPuter = user.puter
        if (!userPuter) return jsonError(401, 'Unauthorized');
        const body = await request.json();
        const project = body?.project;
        if (!project?.id || !project?.sourceImage) return jsonError(400, 'Project not found');
        const payload = {
            ...project,
            updatedAt: new Date().toISOString(),
        }
        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Unauthorized');

        const key = `${PROJECT_PREFIX}${project.id}`;
        await userPuter.kv.put(key, payload);

        return { saved: true, id: project.id, project: payload };


    } catch (error) {
        console.error('Failed to save project:', error);
        return jsonError(500, 'Failed to save project', { message: error.message || 'Unknown error' });
    }
})

router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Unauthorized');

        const keys = await userPuter.kv.list();
        console.log("Worker: Raw keys from KV:", keys);

        const projectKeys = keys
            .map(k => typeof k === 'string' ? k : (k.key || k.name))
            .filter(key => key && key.startsWith(PROJECT_PREFIX));

        console.log("Worker: Filtered project keys:", projectKeys);

        const projects = await Promise.all(
            projectKeys.map(async (key) => {
                const project = await userPuter.kv.get(key);
                return project;
            })
        );

        return { projects: projects.filter(Boolean) };
    } catch (error) {
        console.error('Failed to list projects:', error);
        return jsonError(500, 'Failed to list projects', { message: error.message || 'Unknown error' });
    }
});

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user.puter;
        if (!userPuter) return jsonError(401, 'Unauthorized');

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonError(400, 'Project ID is required');

        const key = `${PROJECT_PREFIX}${id}`;
        const project = await userPuter.kv.get(key);

        if (!project) return jsonError(404, 'Project not found');

        return { project };
    } catch (error) {
        console.error('Failed to get project:', error);
        return jsonError(500, 'Failed to get project', { message: error.message || 'Unknown error' });
    }
});

// Puter worker entry point
puter.workers.on('request', async (request) => {
    return await router.handle(request);
});
