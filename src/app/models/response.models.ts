export type ContentResponse = any;

export interface ErrorsResponse {
  code: string;
  message: string;
  details: string[] | string;
  description?: string;
}

export interface ApiResponse {
  success: boolean;
  content?: ContentResponse;
  errors?: ErrorsResponse;
  body?: ContentResponse;
}

export interface GetParams {
  [key: string]: number | string;
}
