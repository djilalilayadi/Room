/**
 * Fetches an image from a URL and converts it to a Data URL (base64).
 * This function works in the browser environment as it uses FileReader.
 * 
 * @param url - The URL of the image to fetch.
 * @returns A Promise that resolves to the Data URL string.
 */
import { Import, Ratio } from "lucide-react";
import { getPuter, puter } from "./puter";
import { ROOMIFY_RENDER_PROMPT } from "./constants";


export async function fetchAsDataUrl(url: string): Promise<string> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to convert blob to Data URL."));
            }
        };

        reader.onerror = () => {
            reject(reader.error || new Error("FileReader error occurred."));
        };

        reader.readAsDataURL(blob);
    });
}

export const generat3DView = async ({ sourceImage }: Generate3DViewParams) => {
    await getPuter();
    const dataUrl = sourceImage.startsWith('data:')

        ? sourceImage
        : await fetchAsDataUrl(sourceImage);

    const base64Data = dataUrl.split(',')[1];
    const mimeType = dataUrl.split(';')[0].split(':')[1];

    if (!mimeType || !base64Data) {
        throw new Error("Invalid data URL");
    }
    const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
        provider: 'gemini',
        model: 'gemini-2.5-flash-image-preview',
        input_image: base64Data,
        input_image_mime_type: mimeType,
        ratio: { w: 1024, h: 1024 }
    });

    const rawImageUrl = (response as HTMLImageElement).src ?? null;

    if (!rawImageUrl) return {
        renderImage: null,
        renderPath: undefined
    }
    const renderImage = rawImageUrl.startsWith('data:')
        ? rawImageUrl
        : await fetchAsDataUrl(rawImageUrl);

    return {
        renderImage,
        renderPath: undefined
    }

}
