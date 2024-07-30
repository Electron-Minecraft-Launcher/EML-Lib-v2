export enum ErrorType {
  UNKNOWN_ERROR,
  TWOFA_CODE_REQUIRED,
  AUTH_ERROR,
  AUTH_CANCELLED,
  HASH_ERROR,
  DOWNLOAD_ERROR,
  UNKNOWN_OS,
  FETCH_ERROR,
  EXEC_ERROR
}

export type ErrorCode =
  | typeof ErrorType.UNKNOWN_ERROR
  | typeof ErrorType.TWOFA_CODE_REQUIRED
  | typeof ErrorType.AUTH_ERROR
  | typeof ErrorType.AUTH_CANCELLED
  | typeof ErrorType.DOWNLOAD_ERROR
  | typeof ErrorType.HASH_ERROR
  | typeof ErrorType.UNKNOWN_OS
  | typeof ErrorType.FETCH_ERROR
  | typeof ErrorType.EXEC_ERROR

export class ClientError extends Error {
  code: ErrorCode
  message: any

  constructor(code: ErrorCode, message: any) {
    super(message)
    this.code = code
  }
}
