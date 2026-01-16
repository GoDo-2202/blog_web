export const ERROR_MESSAGES = {
  AUTH: {
    UNAUTHORIZED: "Not authenticated",
    FORBIDDEN: "You do not have permission",
    INVALID_TOKEN: "Invalid or expired token",
    MISSING_REFRESH: "Missing refresh token",
    INVALID_REFRESH: "Invalid refresh token",
    INVALID_LOGIN: "Username and password are required",
    INVALID_OR_EXPIRED_REFRESH_TOKEN: "Invalid or expired refresh token"
  },
  USER: {
    USERNAME_USED: "Username already used",
    EMAIL_USED: "Email already used",
    USER_NOT_FOUND: "User not found",
    NO_LONGER_EXISTS: "User no longer exists"
  },
  FILE: {
    UPLOAD_FAIL: "File upload failed",
  },
};
