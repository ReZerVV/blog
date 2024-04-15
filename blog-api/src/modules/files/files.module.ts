import { Global, Module } from '@nestjs/common';
import { FilesService } from './services/files.service';

@Global()
@Module({
    providers: [FilesService],
    exports: [FilesService],
})
export class FilesModule {}
