/**
 * Standardized JSON response helper function
 *
 * @param {import('express').Response} res Express response object
 * @param {number} statusCode HTTP status code
 * @param {boolean} success Success flag
 * @param {string} message Descriptive message
 * @param {any} [data=null] Payload data object or array
 * @param {any} [errors=null] Error details array or object
 */
export const sendResponse = (res, statusCode, success, message, data = null, errors = null) => {
  return res.status(statusCode).json({
    success: Boolean(success),
    message: message || (success ? 'Operation completed successfully' : 'An error occurred'),
    data: data !== undefined ? data : null,
    errors: errors !== undefined ? errors : null,
  });
};
