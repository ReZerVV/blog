import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import * as path from 'path';
import { promises as fs } from 'fs';

const STATICS_FOLDER_NAME = 'statics';

@Injectable()
export class FilesService {
    async upload(file: Express.Multer.File): Promise<string> {
        const fileName: string = `${v4()}${path.extname(file.originalname)}`;
        const dirPath: string = path.join(__dirname, '..', '..', STATICS_FOLDER_NAME);
        const filePath: string = path.join(dirPath, fileName);
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
        await fs.writeFile(filePath, file.buffer);
        return fileName;
    }

    async delete(fileName: string) {
        const filePath: string = path.join(__dirname, '..', '..', STATICS_FOLDER_NAME, fileName);
        await fs.rm(filePath);
    }
}
