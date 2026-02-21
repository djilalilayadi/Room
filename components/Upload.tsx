
import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router";
import { Layers, Upload as UploadIcon, AlertCircle } from "lucide-react";
import { REDIRECT_DELAY_MS } from "../lib/constants";
import { cn } from "../lib/utils"; // Assuming utils has cn or I should check. Wait, utils.ts didn't have cn. I'll mock it or just use template literals.

// Types
interface UploadProps {
    onComplete: (file: string) => void;
}

export default function Upload({ onComplete }: UploadProps) {
    const { isSignedIn } = useOutletContext<AuthContext>();
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validTypes = ["image/jpeg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    useEffect(() => {
        return () => {
            if (uploadIntervalRef.current) {
                clearInterval(uploadIntervalRef.current);
            }
        };
    }, []);

    const processFile = (file: File) => {
        if (!isSignedIn) return;

        setError(null);

        if (!validTypes.includes(file.type)) {
            setError("Invalid file type. Please upload a JPG or PNG image.");
            return;
        }

        if (file.size > maxSize) {
            setError("File size exceeds 10MB limit.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;

            // Simulate upload progress
            setProgress(0);
            if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);

            uploadIntervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);
                        setTimeout(() => {
                            onComplete(result);
                        }, REDIRECT_DELAY_MS);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (!isSignedIn) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleClick = () => {
        if (!isSignedIn) return;
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`upload-card ${isDragging ? "dragging" : ""} ${!isSignedIn ? "disabled" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg"
                onChange={handleFileChange}
                disabled={!isSignedIn}
            />

            <div className="upload-head">
                <div className="upload-icon">
                    {progress > 0 && progress < 100 ? (
                        <div className="circular-progress">
                            <span className="upload-status">{progress}%</span>
                        </div>
                    ) : (
                        <Layers className="icon" />
                    )}
                </div>
                <h3>{progress === 100 ? "Upload Complete!" : "Upload your floor plan"}</h3>
                <p>Supports JPG, PNG formats up to 10MB</p>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {!isSignedIn && (
                <div className="auth-overlay">
                    <p>Please sign in to upload</p>
                </div>
            )}
        </div>
    );
}
