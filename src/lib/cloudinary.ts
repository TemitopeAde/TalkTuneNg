import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
    /**
     * Upload audio buffer to Cloudinary
     */
    static async uploadAudio(
        buffer: Buffer,
        fileName: string,
        folder: string = 'generated-audio'
    ): Promise<{ url: string; publicId: string; bytes: number }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video', // Audio files use 'video' resource type
                    folder,
                    public_id: fileName,
                    format: 'mp3',
                    overwrite: true,
                    invalidate: true,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else if (result) {
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                            bytes: result.bytes,
                        });
                    } else {
                        reject(new Error('Upload failed with no result'));
                    }
                }
            );

            uploadStream.end(buffer);
        });
    }

    /** Upload image buffer to Cloudinary */
    static async uploadImage(
        buffer: Buffer,
        fileName: string,
        folder: string = 'blogs'
    ): Promise<{ url: string; publicId: string; bytes: number; width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder,
                    public_id: fileName,
                    overwrite: true,
                    invalidate: true,
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Upload failed with no result'));
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        bytes: result.bytes,
                        width: result.width || 0,
                        height: result.height || 0,
                    });
                }
            );
            uploadStream.end(buffer);
        });
    }

    /** List images under a folder */
    static async listImages(folder: string = 'blogs', max = 50): Promise<{ publicId: string; url: string; filename: string }[]> {
        // Use Search API for flexibility
        const res: any = await cloudinary.search
            .expression(`folder:${folder}`)
            .sort_by('public_id','desc')
            .max_results(max)
            .execute();
        const resources = res.resources || [];
        return resources.map((r: any) => ({ publicId: r.public_id, url: r.secure_url, filename: (r.public_id.split('/').pop() || r.public_id) }));
    }
    

    /**
     * Delete audio from Cloudinary
     */
    static async deleteAudio(publicId: string): Promise<void> {
        try {
            await cloudinary.uploader.destroy(publicId, {
                resource_type: 'video',
            });
        } catch (error) {
            console.error('Error deleting from Cloudinary:', error);
            throw error;
        }
    }

    /**
     * Get audio URL by public ID
     */
    static getAudioUrl(publicId: string): string {
        return cloudinary.url(publicId, {
            resource_type: 'video',
            secure: true,
        });
    }
}

export default CloudinaryService;