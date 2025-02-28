import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ParseBoolean = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    let value = request.query[data];

    if (value === 'true') return true;
    if (value === 'false') return false;

    return value; // Giữ nguyên nếu không phải 'true' hoặc 'false'
  },
);
