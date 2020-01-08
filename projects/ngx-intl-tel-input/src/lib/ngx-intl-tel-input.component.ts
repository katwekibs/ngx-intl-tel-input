import { Component, OnInit, forwardRef, SimpleChanges, OnChanges } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR,ReactiveFormsModule } from '@angular/forms';
import { CountryCode } from './data/country-code';
import { phoneNumberValidator } from './ngx-intl-tel-input.validator';
import { Country } from './model/country.model';
import * as lpn from 'google-libphonenumber';
import { SearchCountryField } from './enums/search-country-field.enum';
import {MyBaseClass}from './MyBaseClass';

@Component({
	selector: 'ngx-intl-tel-input',
	templateUrl: './ngx-intl-tel-input.component.html',
	styleUrls: ['./ngx-intl-tel-input.component.css'],
	providers: [
		CountryCode,
		{
			provide: NG_VALUE_ACCESSOR,
			// tslint:disable-next-line:no-forward-ref
			useExisting: forwardRef(() => NgxIntlTelInputComponent),
			multi: true
		},
		{
			provide: NG_VALIDATORS,
			useValue: phoneNumberValidator,
			multi: true,
		}
	]
})
export class NgxIntlTelInputComponent extends MyBaseClass implements OnInit, OnChanges  {

	constructor(private countryCodeData: CountryCode,) {
		super();
	}

	ngOnInit() {

		this.fetchCountryData();
		if (this.preferredCountries.length) {
			this.getPreferredCountries();
		}
		if (this.onlyCountries.length) {
			this.allCountries = this.allCountries.filter(c => this.onlyCountries.includes(c.iso2));
		}
		if (this.selectFirstCountry) {
			if (this.preferredCountriesInDropDown.length) {
				this.selectedCountry = this.preferredCountriesInDropDown[0];
			} else {
				this.selectedCountry = this.allCountries[0];
			}
		}
		this.getSelectedCountry();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (this.allCountries && changes['selectedCountryISO']
			&& changes['selectedCountryISO'].currentValue !== changes['selectedCountryISO'].previousValue) {
			this.getSelectedCountry();
		}
		if (changes.preferredCountries) {
			this.getPreferredCountries();
		}
	}

	getPreferredCountries() {
		if (this.preferredCountries.length) {
			this.preferredCountriesInDropDown = [];
			this.preferredCountries.forEach(iso2 => {
				const preferredCountry = this.allCountries.filter((c) => {
					return c.iso2 === iso2;
				});

				this.preferredCountriesInDropDown.push(preferredCountry[0]);
			});
		}
	}

	getSelectedCountry() {
		if (this.selectedCountryISO) {
			this.selectedCountry = this.allCountries.find(c => { return (c.iso2.toLowerCase() === this.selectedCountryISO.toLowerCase()); });
			if (this.selectedCountry) {
				if (this.phoneNumber) {
					this.onPhoneNumberChange();
				} else {
					this.propagateChange(undefined);
				}
			}
		}
	}


	/**
	 * Search country based on country name, iso2, dialCode or all of them.
	 */
	searchCountry() {
		if (!this.countrySearchText) {
			this.countryList.nativeElement.querySelector('li').scrollIntoView({ behavior: 'smooth' });
			return;
		}
		const countrySearchTextLower = this.countrySearchText.toLowerCase();
		const country = this.allCountries.filter(c => {
			if (this.searchCountryField.indexOf(SearchCountryField.All) > -1) {
				// Search in all fields
				if (c.iso2.toLowerCase().startsWith(countrySearchTextLower)) {
					return c;
				}
				if (c.name.toLowerCase().startsWith(countrySearchTextLower)) {
					return c;
				}
				if (c.dialCode.startsWith(this.countrySearchText)) {
					return c;
				}
			} else {
				// Or search by specific SearchCountryField(s)
				if (this.searchCountryField.indexOf(SearchCountryField.Iso2) > -1) {
					if (c.iso2.toLowerCase().startsWith(countrySearchTextLower)) {
						return c;
					}
				}
				if (this.searchCountryField.indexOf(SearchCountryField.Name) > -1) {
					if (c.name.toLowerCase().startsWith(countrySearchTextLower)) {
						return c;
					}
				}
				if (this.searchCountryField.indexOf(SearchCountryField.DialCode) > -1) {
					if (c.dialCode.startsWith(this.countrySearchText)) {
						return c;
					}
				}
			}
		});

		if (country.length > 0) {
			const el = this.countryList.nativeElement.querySelector('#' + country[0].iso2);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth' });
			}
		}
	}

	

	public onCountrySelect(country: Country, el: any): void {
		this.selectedCountry = country;

		if (this.phoneNumber.length > 0) {
			this.value = this.phoneNumber;

			let number: lpn.PhoneNumber;
			try {
				number = this.phoneUtil.parse(this.phoneNumber, this.selectedCountry.iso2.toUpperCase());
			} catch (e) {
			}

			this.propagateChange({
				number: this.value,
				internationalNumber: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.INTERNATIONAL) : '',
				nationalNumber: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.NATIONAL) : '',
				countryCode: this.selectedCountry.iso2.toUpperCase(),
				dialCode: '+' + this.selectedCountry.dialCode
			});
		}
		el.focus();

	}

	protected fetchCountryData(): void {
		this.countryCodeData.allCountries.forEach(c => {
			const country: Country = {
				name: c[0].toString(),
				iso2: c[1].toString(),
				dialCode: c[2].toString(),
				priority: +c[3] || 0,
				areaCodes: c[4] as string[] || undefined,
				flagClass: c[1].toString().toLocaleLowerCase(),
				placeHolder: ''
			};

			if (this.enablePlaceholder) {
				country.placeHolder = this.getPhoneNumberPlaceHolder(country.iso2.toUpperCase());
			}

			this.allCountries.push(country);
		});
	}

	protected getPhoneNumberPlaceHolder(countryCode: string): string {
		try {
			return this.phoneUtil.format(this.phoneUtil.getExampleNumber(countryCode), lpn.PhoneNumberFormat.INTERNATIONAL);
		} catch (e) {
			return e;
		}
	}

}

@Component({
	selector: 'ngx-telphone-input',
	templateUrl: './ngx-telphone-input.component.html',
	providers: [
		CountryCode,
		{
			provide: NG_VALUE_ACCESSOR,
			// tslint:disable-next-line:no-forward-ref
			useExisting: forwardRef(() => NgxTelphoneInputComponent),
			multi: true
		},
		{
			provide: NG_VALIDATORS,
			useValue: phoneNumberValidator,
			multi: true,
		}
	]
})
export class NgxTelphoneInputComponent extends MyBaseClass implements OnInit, OnChanges  {
	ngOnChanges(changes: SimpleChanges): void {
		throw new Error("Method not implemented.");
	}
	ngOnInit(): void {
		throw new Error("Method not implemented.");
	}

	public onInputKeyPress(event: KeyboardEvent): void {
		const allowedChars = /[0-9\+\-\ ]/;
		const allowedCtrlChars = /[axcv]/; // Allows copy-pasting
		const allowedOtherKeys = [
			'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown',
			'Home', 'End', 'Insert', 'Delete', 'Backspace'
		];

		if (!allowedChars.test(event.key)
			&& !(event.ctrlKey && allowedCtrlChars.test(event.key))
			&& !(allowedOtherKeys.includes(event.key))) {
			event.preventDefault();
		}
	}
}
