export class CreatePostRequest {
    media: Express.Multer.File;
    title: string;
    description: string;
}
