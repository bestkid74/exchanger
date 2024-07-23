import {HttpService} from './http.service';
import {HttpHeaders} from '@angular/common/http';

import {Observable} from 'rxjs';
import {GetParams} from '../models/response.models';

export class BaseService {
  url!: string;
  model!: string;

  constructor(protected service: HttpService) { }

  showFields(fields: string[]) {
    this.service.fields['fields'] = fields.toString();
    return this;
  }

  showExtraFields(fields: string[]) {
    this.service.fields['expand'] = fields.toString();
    return this;
  }

  setFields(fields?: any[] | GetParams | any): void {
    if (fields) {
      for (const key in fields) {
        this.service.fields[key] = fields[key];
      }
    }
  }

  setHeaders(headers: HttpHeaders): HttpHeaders {
    return this.service.headers = headers;
  }

  get(id?: string | number): Observable<any> {
    const idSting = `/${id}`;
    this.service.setUrl(`${this.url}${idSting}`);
    return this.service._get();
  }

  post(entity: any): Observable<any> {
    this.service.setUrl(`${this.url}/${entity.id}`);
    this.service.setEntity(entity);
    return this.service._post();
  }

  put(entity: any): Observable<any> {
    this.service.setUrl(`${this.url}/${entity.id}`);
    this.service.setEntity(entity);
    return this.service._put();
  }

  delete(id: number): Observable<any> {
    this.service.setUrl(`${this.url}/${id}`);
    return this.service._delete();
  }

  public isJson(str: string): boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
