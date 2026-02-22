import { Button } from "components/ui/Button";
import { generat3DView } from "lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

const visualizerId = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const { initialImage, initialRender, name } = location.state || {};

    const haseInitialGenerated = useRef(false);
    const [processing, setProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState(initialRender || null);
    const handleBack = () => navigate('/');
    const runGeneration = async () => {
        if (!initialImage) return;
        try {
            setProcessing(true);
            const result = await generat3DView({ sourceImage: initialImage });
            if (result.renderImage) {
                setCurrentImage(result.renderImage);
            }
        } catch (err) {
            console.error('Error generating 3D view:', err);
        } finally {
            setProcessing(false);
        }
    }

    useEffect(() => {
        if (!initialImage || haseInitialGenerated.current) return

        if (initialRender) {
            setCurrentImage(initialRender);
            haseInitialGenerated.current = true;
            return;
        }
        haseInitialGenerated.current = true;
        runGeneration();

    }, [initialImage, initialRender]);


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
                            <h2>{name || 'Untitled Project'}</h2>

                            <p className="note">Created by you</p>
                        </div>
                        <div className="panel-action">
                            <Button
                                size="sm"
                                className="export"
                                onClick={() => { }}
                                disabled={!currentImage}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button
                                size="sm"
                                className="share"
                                onClick={() => { }}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>


                    <div className={`render-area ${processing ? 'is-processing' : ''}`}>
                        {currentImage ? (

                            <img src={currentImage} alt="AI render" className="render-img" />) : (
                            <div className="render-placeholder">
                                {initialImage && (
                                    <img src={initialImage} alt="Original" className="render-fallback" />
                                )}

                            </div>
                        )}
                        {processing && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <RefreshCcw className="spinner" />
                                    <span className="title">Generating 3D view</span>
                                    <span className="subtitle">Generating ...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

        </div>

    );
}

export default visualizerId;
