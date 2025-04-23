/**
 * Enum representing error codes for exceptions.
 */
export enum ErrorCode {
  /** Error code for a generic code error. */
  CodeError = 'code_error',
  /** Error code for an invalid request. */
  InvalidRequest = 'invalid_request',
  /** Error code for a service that is unavailable. */
  ServiceUnavailable = 'service_unavailable',
  /** Error code for an unauthorized request. */
  Unauthorized = 'unauthorized',
  /** Error code for an unclassified error. */
  Unclassified = 'unclassified',
  DbConnectionRefused = 'db_connection_refused',
  DbInvalidEntry = 'db_invalid_entry',
  DbRecordNotFound = 'db_record_not_found',
  DbUniqueConstraint = 'db_unique_constraint',
  DbStandalone = 'db_standalone',
  DbUnknown = 'db_unknown',
}
