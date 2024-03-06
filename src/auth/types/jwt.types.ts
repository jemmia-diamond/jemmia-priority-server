export type AccessTokenPayload = {
  id: string;
  name: string;
  authId: string;
  sub: string;
};

export type RefreshTokenPayload = {
  id: string;
  authId: string;
  sub: string;
};
