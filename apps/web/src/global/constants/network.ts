const BASE_URL=import.meta.env.VITE_BASE_URL;

const HTTPStatusCode = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  FOUND: 302,
  NOT_MODIFIED: 304,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const;
type HTTPStatusCodeType = (typeof HTTPStatusCode)[keyof typeof HTTPStatusCode];

const ContentType = {
  JSON: 'application/json; charset=UTF-8',
  FORM_TYPE: 'multipart/form-data',
  IMAGE: 'image/jpeg',
} as const;

const MimeExtension = {
  JPG: 'image/jpeg',
  JPEG: 'image/jpeg',
  PNG: 'image/png',
  GIF: 'image/gif',
  HEIC: 'image/heic',
  BMP: 'image/bmp',
  WEBP: 'image/webp',
  SVG: 'image/svg+xml',
  MP4: 'video/mp4',
  MOV: 'video/quicktime',
} as const;
type MimeExtensionType = (typeof MimeExtension)[keyof typeof MimeExtension];

type HttpResponse = {
  statusCode: number;
  responseBody: any;
};

type FileMetaType = {
  fileName: string;
  mimeType: MimeExtensionType | string;
};

const HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

type HTTPMethodType = (typeof HTTPMethod)[keyof typeof HTTPMethod];

export {
  BASE_URL,
  HTTPStatusCode,
  ContentType,
  MimeExtension,
  HTTPMethod,
};

export type {
  HTTPStatusCodeType,
  MimeExtensionType,
  HttpResponse,
  FileMetaType,
  HTTPMethodType
};
