import {Injectable} from '@angular/core';
import {BaseService} from './base.service';
import {Observable} from 'rxjs';
import {HttpService, SuccessfulResponse} from './http.service';
import {CurrenciesEnum} from '../models/currencies.models';

@Injectable({
  providedIn: 'root',
})
export class CurrenciesService extends BaseService {
  override url = 'pair';

  constructor(protected override service: HttpService) {
    super(service);
  }

  getCurrenciesRate(curr_left: CurrenciesEnum, curr_right: CurrenciesEnum): Observable<SuccessfulResponse> {
    this.service.setUrl(`${this.url}/${curr_left}/${curr_right}`);
    return this.service._get();
  }
}
