import {Observable, Subject, throwError} from 'rxjs';
import {map, catchError} from 'rxjs/operators';
import {
  HttpClient,
  HttpParams,
  HttpHeaders,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ApiResponse} from '../models/response.models';

enum ObserveEnum {
  body = 'body',
  response = 'response'
}

enum ResponseTypeEnum {
  json = 'json',
  arraybuffer = 'arraybuffer',
  blob = 'blob',
  text = 'text'
}

type ObserveOptions = ObserveEnum.body;

type ResponseTypeOptions = ResponseTypeEnum.json;

interface Options {
  headers?: HttpHeaders;
  observe?: ObserveOptions;
  params?: HttpParams;
  reportProgress?: boolean;
  responseType?: ResponseTypeOptions;
  withCredentials?: boolean;
  body?: any | null;
}

interface OptionsResponse {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  observe: 'response';
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
  responseType?: ResponseTypeEnum.json;
  withCredentials?: boolean;
}

interface ErrorMessageInterface {
  message?: string;
  error?: string;
  statusCode?: number;

  [key: string]: any | { message: string }[];
}

enum StatusCodeResponse {
  success = 0,
  forbidden = 403
}

export interface SuccessfulResponse {
  base_code: string;
  conversion_rate: number;
  documentation: string;
  result: string;
  target_code: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
}

@Injectable({
  providedIn: 'root',
})
export class HttpService {

  public url!: string;
  public headers!: HttpHeaders;
  public fields: string[] | any = [];
  public infoPartnerObserv: Subject<boolean> = new Subject();
  private defaultHeaders!: HttpHeaders;
  private entity: any;

  constructor(private http: HttpClient) {
  }

  setHeaders(sendFile = false): void {
    if (this.headers) {
      this.defaultHeaders = this.headers;
    } else {
      const headerJson: { [key: string]: string | number } = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Language': 'en',
      };

      this.defaultHeaders = new HttpHeaders(headerJson);
    }
  }

  setUrl(url: string, sendFile = false): void {
    this.setHeaders(sendFile);
    this.url = `https://v6.exchangerate-api.com/v6/2a82700ee1a79a52cf5209a7/` + url;
    this.addParameters();
  }

  private addParameters(): void {
    let qs = '';
    for (const key in this.fields) {
      const value = this.fields[key];
      qs += encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&';
    }
    if (qs.length > 0) {
      qs = qs.substring(0, qs.length - 1); //chop off last "&"
      this.url += '?' + qs;
    }
    this.fields = [];
  }

  setEntity(entity: any): void {
    this.entity = entity;
  }

  _get(params: any = []): Observable<any> {
    return this.http.get(this.url, this.getOptionsResponse(params)).pipe(
      map(x => this.handleResponse(x)),
      catchError(err => this.handleError(err))
    );
  }

  _post(options?: Options): Observable<any> {
    return this.http.post(this.url, this.entity, this.getOptions(options)).pipe(
      map((response) => this.handleResponse(response)),
      catchError(err => this.handleError(err))
    );
  }

  _put(): Observable<any> {
    return this.http.put(this.url, this.entity, this.getOptions()).pipe(
      map(x => this.handleResponse(x)),
      catchError(err => this.handleError(err)));
  }

  _delete(): Observable<any> {
    return this.http.delete(this.url, this.getOptions({body: this.entity})).pipe(
      map((response) => this.handleResponse(response)),
      catchError(err => this.handleError(err))
    );
  }

  protected handleResponse(response: Object | HttpResponse<any>, skipDefaultErrParse = false) {
    let responseBody;
    if (response instanceof HttpResponse) {
      responseBody = <ApiResponse>response.body;
    } else {
      responseBody = <ApiResponse>response;
    }

    this.clearEntity();

    if (skipDefaultErrParse) {
      return responseBody;
    } else if (responseBody.errors) {
      throw responseBody.errors;
    } else {
      return responseBody;
    }
  }

  private getOptions(params: any = [], responseType: ResponseTypeOptions | null = null,
                     observe: ObserveOptions | null = null, forceSetLanguageHeader?: string | undefined, body?:  any | null): Options {
    const options: Options = {};
    options.headers = this.defaultHeaders as HttpHeaders;

    if (params) {
      let paramsHttp: HttpParams = new HttpParams();
      for (const k in params) {
        if (params[k] || params[k] === false) {
          paramsHttp = paramsHttp.set(k, params[k].toString());
        }
      }
      options.params = paramsHttp;
    }
    if (observe) {
      options.observe = observe;
    }
    if (responseType) {
      options.responseType = responseType;
    }

    if (params.body) {
      options.body = params.body;
    }
    return options;
  }

  private getOptionsResponse(params: any = [], responseType: ResponseTypeOptions = ResponseTypeEnum.json, arrayParams?: string): OptionsResponse {
    const options: OptionsResponse = {observe: ObserveEnum.response};
    options.headers = this.defaultHeaders as HttpHeaders;

    if (params) {
      let paramsHttp: HttpParams = new HttpParams();
      for (const k in params) {
        if (params[k] || params[k] === false) {
          if (Array.isArray(params[k])) {
            params[k].forEach((p: any) => {
              paramsHttp = paramsHttp.append(k, p.toString())
            })
          } else {
            paramsHttp = paramsHttp.set(k, params[k].toString());
          }

        }
      }
      options.params = paramsHttp;
    }

    options.responseType = responseType;

    return options;
  }

  protected handleError(error: HttpErrorResponse) {
    let errList: ErrorMessageInterface = {};

    if (errList && errList.statusCode && errList.statusCode === StatusCodeResponse.forbidden) {
      this.infoPartnerObserv.next(true);
    }

    return throwError(() => errList);
  }

  private clearEntity(): void {
    if (this.entity) {
      this.setEntity(undefined);
    }
  }
}
