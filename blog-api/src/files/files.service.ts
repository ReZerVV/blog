import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import * as path from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class FilesService {
    async upload(file: Express.Multer.File): Promise<string> {
        const fileName: string = `${v4()}${path.extname(file.originalname)}`;
        const dirPath: string = path.join(__dirname, '..', '..', 'static');
        const filePath: string = path.join(dirPath, fileName);
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
        await fs.writeFile(filePath, file.buffer);
        return fileName;
    }

    async remove(fileName: string) {
        const filePath: string = path.join(__dirname, '..', '..', 'static', fileName);
        await fs.rm(filePath);
    }
}
