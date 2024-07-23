import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CurrenciesService} from './services/currencies.service';
import {CurrenciesEnum} from './models/currencies.models';
import {forkJoin, switchMap, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'exchanger';
  leftForm: FormGroup;
  rightForm: FormGroup;
  currenciesList = Object.values(CurrenciesEnum);
  headerRates: {
    currency: CurrenciesEnum;
    rate: number;
  }[] = [];
  destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private currenciesService: CurrenciesService,
  ) {
  }

  ngOnInit(): void {
    this.getRatesForHeader();
    this.initForms();
  }

  getRatesForHeader(): void {
    forkJoin({
      toUSD: this.currenciesService.getCurrenciesRate(CurrenciesEnum.UAH, CurrenciesEnum.USD),
      toEUR: this.currenciesService.getCurrenciesRate(CurrenciesEnum.UAH, CurrenciesEnum.EUR),
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (res) => {
        this.headerRates = [
          {
            currency: CurrenciesEnum.USD,
            rate: res.toUSD.conversion_rate,
          },
          {
            currency: CurrenciesEnum.EUR,
            rate: res.toEUR.conversion_rate,
          }
        ];
      }
    });
  }

  initForms() {
    this.leftForm = this.fb.group({
      amount: [null],
      currency: [CurrenciesEnum.UAH]
    });
    this.rightForm = this.fb.group({
      amount: [null],
      currency: [CurrenciesEnum.USD]
    });

    this.leftForm.valueChanges.pipe(
      switchMap((value) => {
        if (!value.amount) {
          this.rightForm.patchValue({
            amount: null,
          }, {emitEvent: false});
        }
        return this.currenciesService.getCurrenciesRate(value.currency, this.rightForm.value.currency).pipe(
          tap(resp => {
            this.rightForm.patchValue({
              amount: value.amount * resp.conversion_rate,
            }, {emitEvent: false});
          }),
          takeUntilDestroyed(this.destroyRef),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();

    this.rightForm.valueChanges.pipe(
      switchMap((value) => {
        if (!value.amount) {
          this.leftForm.patchValue({
            amount: null,
          }, {emitEvent: false});
        }
        return this.currenciesService.getCurrenciesRate(this.leftForm.value.currency, value.currency).pipe(
          tap(resp => {
            this.leftForm.patchValue({
              amount: value.amount / resp.conversion_rate,
            }, {emitEvent: false});
          }),
          takeUntilDestroyed(this.destroyRef),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }
}
