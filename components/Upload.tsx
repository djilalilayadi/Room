import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router";

const Upload = ({ onUploadComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const { isSignedIn } = useOutletContext<AuthContext>();


    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (!isSignedIn || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

        const droppedFile = e.dataTransfer.files[0];
        await processFile(droppedFile);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn || !e.target.files || e.target.files.length === 0) return;
        const selectedFile = e.target.files[0];
        await processFile(selectedFile);
    };

    const processFile = async (file: File) => {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert("Please upload a valid image file (JPG, PNG).");
            return;
        }

        // Validate file size (50MB)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            alert("File size exceeds 50MB limit.");
            return;
        }

        setFile(file);
        // Simulate upload/analysis progress
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 5;
            if (currentProgress >= 100) {
                clearInterval(interval);
                if (onUploadComplete) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                            onUploadComplete(reader.result);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
            setProgress(currentProgress);
        }, 100);
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? "is-dragging" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".JPG,.PNG,.JPEG"
                        disabled={!isSignedIn}
                        onChange={handleFileSelect}
                    />
                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />

                        </div>
                        <p>
                            {isSignedIn ? "Click or drag file here to upload" : "Sign in to upload"}
                        </p>
                        <p className="help">Maximum file size is 50 MB.</p>
                    </div>
                </div>


            ) : (
                <div className="upload-stauts">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check" />
                            ) : (
                                <ImageIcon className="image" />
                            )}
                        </div>
                        <h3>{file.name}</h3>
                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }} />
                            <p className="status-text">{progress < 100 ? 'Analysing floor plan... ' : 'Redirecting...'}</p>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface AuthState {
    isSignedIn: boolean;
    userName: string | null;
    userId: string | null;
}

interface AuthContext extends AuthState {
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

interface UploadProps {
    onUploadComplete?: (base64: string) => void | Promise<boolean>;
}

export default Upload;