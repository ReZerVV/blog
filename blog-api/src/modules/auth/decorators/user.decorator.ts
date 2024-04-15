import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserWith } from 'src/modules/users/types';

export const User = createParamDecorator((data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserWith;
});
