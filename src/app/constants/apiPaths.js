export const ID_PARAM = "/:id";

export const ROOT_PATH = "/";

export const API_PREFIX = "/api";

export const USER_UPLOAD_PATH = (suffix) => `${ID_PARAM}/${suffix}`;

export const API_PATH = {
  AUTH: `${API_PREFIX}/auth`,
  USERS: `/users`,
  NEWS: "/news",
  SEARCH: "/search",
  HOME: "/",
};

export const AUTH_PATH = {
  REGISTER: "/register",
  LOGIN: "/login",
  ME: "/me",
  REFRESH_TOKEN: "/refresh",
}

export const USER_PATH = {
  SEARCH: "/search",

  UPLOAD_AVATAR: USER_UPLOAD_PATH("upload-avatar"),
  UPLOAD_MULTIPLE: USER_UPLOAD_PATH("upload-multiple"),
  UPLOAD_FILE: USER_UPLOAD_PATH("upload-file"),
  UPLOAD_FILES: USER_UPLOAD_PATH("upload-files"),

  GET_IMAGES: USER_UPLOAD_PATH("images"),
  GET_FILES: USER_UPLOAD_PATH("files"),

  DELETE_IMAGES: USER_UPLOAD_PATH("delete-images"),
  DELETE_FILES: USER_UPLOAD_PATH("delete-files"),
};