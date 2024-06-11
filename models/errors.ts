export const ERRORS = {
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  TWOFA_CODE_REQUIRED: '2FA_CODE_REQUIRED',
  OAUTH2_ERROR: 'OAUTH2_ERROR',
  AUTH_CANCELLED: 'AUTH_CANCELLED',
}

export class ClientError extends Error {
  code: keyof typeof ERRORS
  message: any

  constructor(code: keyof typeof ERRORS, message: any) {
    super(message)
    this.code = code
  }
}