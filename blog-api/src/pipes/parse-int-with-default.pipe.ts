import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntWithDefaultPipe implements PipeTransform<string> {
    constructor(private readonly defaultValue: number = 0) {}

    transform(value: string) {
        const val = parseInt(value);
        if (isNaN(val)) {
            return this.defaultValue;
        }
        return val;
    }
}
