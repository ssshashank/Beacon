export const BASE_URL = "http://100.65.87.119:8000/api/v1";

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

const BaseURL: string = 'http://localhost:8080/';
const AppVersion: string = 'api/v1/';
const Module = {
  AUTH: 'auth/',
  ORG: 'org/',
  USER: 'user/',
  JOB: 'job/',
  JOBS: 'jobs/',
  SEEKER: 'seeker/',
  BENCH: 'bench/',
  SPACE: 'spaces/',
  CORE: 'core/',
  CANDIDATE: 'candidate/',
  OPTIONS: 'options/'
};

const AuthURLs = {
  LOGIN: 'login',
  SIGNUP: 'signup',
  REFRESH_TOKEN: 'refreshToken',
  LOGOUT: 'logout',
  SEND_OTP: 'sendOTP',
  RESEND_OTP: 'resendOTP',
  VERIFY_USER_ACCOUNT: 'verifyUserAccount',
  VERIFY_OTP: 'verifyOTP',
  FORGOT_PASSWORD: 'forgotPassword',
  RESET_PASSWORD: 'resetPassword',
};

const UserURLs = {
  PROFILE: 'profile',
  STATUS: 'status',
  PROFILE_PIC: 'profilePic',
  RESUME: 'resume',
  RESUMES: 'resumes',
  APPLICATIONS: 'applications',
  EDUCATION: 'education',
  CERTIFICATION: 'certification',
  ADDRESS: 'address',
  SEEKER_PROFILE: 'seeker/profile',
  RECRUITER_PROFILE: 'recruiter/profile',
  ACCEPT_INVITATION: 'acceptInvitation',
  PENDING_APPROVALS: 'pendingApprovals',
  INVITE: 'invite',
  APPROVE_USER: 'approveUser',
  LIST_INVITATIONS: 'invitations'
};

const OrgURLs = {
  CHECK_DOMAIN: 'checkDomain',
  SETUP: 'setupOrganization',
  JOIN: 'joinOrganization',
  PROFILE: 'profile',
  LOGO: 'logo',
  PRESIGN_LOGO: 'logo/presign-url',
  MEMBERS: 'members',
  MEMBERS_SEARCH: 'members/search',
};

const JobURLs = {
  UPLOAD: 'upload',
  CREATE: 'create',
  MATCHES: 'matches',
  MATCHES_AGENT: 'matches/agent',
  MY_JOBS: 'my-jobs',
  LISTINGS: 'listings',
  STATUS: 'status',
  APPLY: 'apply',
  SEARCH: 'search',
};

/** Public job board under /api/v1/jobs */
const JobsBoardURLs = {
  ROOT: '',
};

/** Seeker bookmarks under /api/v1/seeker */
const SeekerURLs = {
  SAVED_JOBS: 'saved-jobs',
};

const BenchURLs = {
  RESOURCE: 'resource',
  RESOURCES: 'resources',
  SEARCH: 'search',
};

const SpaceURLs = {
  ROOT: '',
  JOBS: 'jobs',
  RESOURCES: 'resources',
};

const CoreURLs = {
  ASK: 'ask',
};

const CandidateURLs = {
  ROOT: '',
};

export {
  HTTPStatusCode,
  ContentType,
  MimeExtension,
  HTTPMethod,
  BaseURL,
  AppVersion,
  Module,
  AuthURLs,
  UserURLs,
  OrgURLs,
  JobURLs,
  JobsBoardURLs,
  SeekerURLs,
  BenchURLs,
  SpaceURLs,
  CoreURLs,
  CandidateURLs,
};
export type { HTTPStatusCodeType, MimeExtensionType, HttpResponse, FileMetaType, HTTPMethodType };
