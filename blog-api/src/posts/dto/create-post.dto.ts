export class CreatePostDto {
    media: Express.Multer.File;
    title: string;
    description: string;
}
