import { AccessTokenPayload } from '../../auth/types/jwt.types';

export type RequestPayload = {
  user: AccessTokenPayload;
};
