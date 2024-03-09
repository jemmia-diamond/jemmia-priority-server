import { EUserRole } from '../../user/enums/user-role.enum';

export type AccessTokenPayload = {
  id: string;
  authId: string;
  haravanId: string;
  sub: string;
  role: EUserRole;
};

export type RefreshTokenPayload = {
  id: string;
  authId: string;
  sub: string;
};
