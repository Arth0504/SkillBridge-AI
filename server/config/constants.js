export const ROLES = Object.freeze({
  CANDIDATE: 'candidate',
  COMPANY: 'company',
});

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
});

export const JWT_EXPIRATION = Object.freeze({
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
});
