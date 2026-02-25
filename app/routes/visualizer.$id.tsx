import { Button } from "components/ui/Button";
import { generat3DView } from "lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams, useOutletContext } from "react-router";
import { getProjectById, updateProject } from "lib/puter.action";

const VisualizerId = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useOutletContext<AuthContext>();

    const { initialImage, initialRender, name: initialName } = (location.state as VisualizerLocationState) || {};

    const [project, setProject] = useState<DesignItem | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(!initialImage);
    const [processing, setProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(initialRender || null);

    const haseInitialGenerated = useRef(false);

    const handleBack = () => navigate('/');

    const runGeneration = async (sourceUrl: string) => {
        if (!sourceUrl) return;
        try {
            setProcessing(true);
            const result = await generat3DView({ sourceImage: sourceUrl });
            if (result.renderImage) {
                setCurrentImage(result.renderImage);
                // Update project in background
                if (id) {
                    await updateProject({
                        item: {
                            ...(project || {
                                id: id,
                                sourceImage: sourceUrl,
                                timestamp: Date.now()
                            }),
                            renderedImage: result.renderImage
                        }
                    });
                }
            }
        } catch (err) {
            console.error('Error generating 3D view:', err);
        } finally {
            setProcessing(false);
        }
    }

    // Load project if not in state
    useEffect(() => {
        async function fetchProject() {
            if (!id || initialImage) return;

            setIsProjectLoading(true);
            try {
                const data = await getProjectById({ id });
                if (data) {
                    setProject(data);
                    if (data.renderedImage) {
                        setCurrentImage(data.renderedImage);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch project", err);
            } finally {
                setIsProjectLoading(false);
            }
        }
        fetchProject();
    }, [id, initialImage]);

    useEffect(() => {
        const source = initialImage || project?.sourceImage;
        const render = initialRender || project?.renderedImage;

        if (!source || haseInitialGenerated.current) return;

        if (render) {
            setCurrentImage(render);
            haseInitialGenerated.current = true;
            return;
        }

        haseInitialGenerated.current = true;
        runGeneration(source);

    }, [initialImage, project, initialRender]);


    if (isProjectLoading) {
        return (
            <div className="visualizer flex items-center justify-center h-screen">
                <RefreshCcw className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    const displayName = initialName || project?.name || 'Untitled Project';
    const activeSourceImage = initialImage || project?.sourceImage;

    return (
        <div className="visualizer">
            <nav className="topbar">
                <div className="brand">
                    <Box className="logo" />
                    <span className="name">Room</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBack} className="exit" >
                    <X className="icon" /> Exit Editor
                </Button>
            </nav>

            <section className="content">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Project</p>
                            <h2>{displayName}</h2>
                            <p className="note">{project?.ownerId === userId ? 'Created by you' : 'Shared with you'}</p>
                        </div>
                        <div className="panel-action">
                            <Button
                                size="sm"
                                className="export"
                                onClick={() => {
                                    if (currentImage) {
                                        const link = document.createElement('a');
                                        link.href = currentImage;
                                        link.download = `${displayName.replace(/\s+/g, '_')}_render.png`;
                                        link.click();
                                    }
                                }}
                                disabled={!currentImage}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button
                                size="sm"
                                className="share"
                                onClick={() => {
                                    if (currentImage) {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("Link copied to clipboard!");
                                    }
                                }}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>


                    <div className={`render-area ${processing ? 'is-processing' : ''}`}>
                        {currentImage ? (
                            <img src={currentImage} alt="AI render" className="render-img" />
                        ) : (
                            <div className="render-placeholder">
                                {activeSourceImage && (
                                    <img src={activeSourceImage} alt="Original" className="render-fallback" />
                                )}
                            </div>
                        )}
                        {processing && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <RefreshCcw className="spinner" />
                                    <span className="title">Generating 3D view</span>
                                    <span className="subtitle">Please wait ...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default VisualizerId;
