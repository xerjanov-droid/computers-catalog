import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface StorageService {
    save(file: File, folder: string): Promise<string>;
    delete(filePath: string): Promise<void>;
}

export class LocalFileSystemStorage implements StorageService {
    private uploadDir: string;

    constructor() {
        // Path relative to the public directory
        this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    }

    async save(file: File, folder: string): Promise<string> {
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileExtension = path.extname(file.name);
            const fileName = `${uuidv4()}${fileExtension}`;

            // Construct the full directory path (e.g., public/uploads/products/123)
            const dirPath = path.join(this.uploadDir, folder);

            // Ensure the directory exists
            await fs.mkdir(dirPath, { recursive: true });

            const filePath = path.join(dirPath, fileName);
            await fs.writeFile(filePath, buffer);

            // Return relative URL for saving in DB
            return `/uploads/${folder}/${fileName}`;
        } catch (error) {
            console.error('Error in LocalFileSystemStorage.save:', error);
            throw new Error('Failed to save file');
        }
    }

    async delete(fileUrl: string): Promise<void> {
        try {
            // Convert URL to filesystem path
            // URL: /uploads/products/123/abc.jpg
            // Path: C:\...\public\uploads\products\123\abc.jpg
            if (!fileUrl.startsWith('/uploads/')) {
                console.warn('Invalid file URL format, skipping deletion:', fileUrl);
                return;
            }

            const relativePath = fileUrl.replace('/uploads/', '');
            const filePath = path.join(this.uploadDir, relativePath);

            await fs.unlink(filePath);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                console.warn('File not found for deletion:', fileUrl);
            } else {
                console.error('Error in LocalFileSystemStorage.delete:', error);
                throw new Error('Failed to delete file');
            }
        }
    }
}

// Singleton or factory could be used here. For now, exporting a default instance setup.
export const storageService = new LocalFileSystemStorage();
