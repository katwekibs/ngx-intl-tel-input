import { Input, ViewChild, ElementRef } from '@angular/core';
import { SearchCountryField, TooltipLabel, CountryISO } from '../public_api';
import { Country } from './model/country.model';
import * as lpn from 'google-libphonenumber';

export class MyBaseClass{
    @Input() value = '';
	@Input() preferredCountries: Array<string> = [];
	@Input() enablePlaceholder = true;
	@Input() cssClass = 'form-control';
	@Input() onlyCountries: Array<string> = [];
	@Input() enableAutoCountrySelect = true;
	@Input() searchCountryFlag = false;
	@Input() searchCountryField: SearchCountryField[] = [SearchCountryField.All];
	@Input() maxLength = '';
	@Input() tooltipField: TooltipLabel;
	@Input() selectFirstCountry = true;
	@Input() selectedCountryISO: CountryISO;
	@Input() phoneValidation = true;
	@Input() inputControl = null;
	selectedCountry: Country = {
		areaCodes: undefined,
		dialCode: '',
		flagClass: '',
		iso2: '',
		name: '',
		placeHolder: '',
		priority: 0
	};

	phoneNumber = '';
	allCountries: Array<Country> = [];
	preferredCountriesInDropDown: Array<Country> = [];
	// Has to be 'any' to prevent a need to install @types/google-libphonenumber by the package user...
	phoneUtil: any = lpn.PhoneNumberUtil.getInstance();
	disabled = false;
	errors: Array<any> = ['Phone number is required.'];
	countrySearchText = '';

	@ViewChild('countryList') countryList: ElementRef;

	onTouched = () => { };
    propagateChange = (_: any) => { };
    
    registerOnChange(fn: any): void {
		this.propagateChange = fn;
	}

	registerOnTouched(fn: any) {
		this.onTouched = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this.disabled = isDisabled;
	}

	writeValue(obj: any): void {
		if (typeof obj !== 'object') {
			this.phoneNumber = obj;
		}
		setTimeout(() => {
			this.onPhoneNumberChange();
		}, 1);
    }
    
    public onPhoneNumberChange(): void {
		this.value = this.phoneNumber;

		let number: lpn.PhoneNumber;
		try {
			number = this.phoneUtil.parse(this.phoneNumber, this.selectedCountry.iso2.toUpperCase());
		} catch (e) {
		}

		let countryCode = this.selectedCountry.iso2;
		// auto select country based on the extension (and areaCode if needed) (e.g select Canada if number starts with +1 416)
		if (this.enableAutoCountrySelect) {
			countryCode = number && number.getCountryCode()
				? this.getCountryIsoCode(number.getCountryCode(), number)
				: this.selectedCountry.iso2;
			if (countryCode && countryCode !== this.selectedCountry.iso2) {
				const newCountry = this.allCountries.find(c => c.iso2 === countryCode);
				if (newCountry) {
					this.selectedCountry = newCountry;
				}
			}
		}
		countryCode = countryCode ? countryCode : this.selectedCountry.iso2;

		if (!this.value) {
			// tslint:disable-next-line:no-null-keyword
			this.propagateChange(null);
		} else {
			this.propagateChange({
				number: this.value,
				internationalNumber: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.INTERNATIONAL) : '',
				nationalNumber: number ? this.phoneUtil.format(number, lpn.PhoneNumberFormat.NATIONAL) : '',
				countryCode: countryCode.toUpperCase(),
				dialCode: '+' + this.selectedCountry.dialCode
			});
		}
    }
    private getCountryIsoCode(countryCode: number, number: lpn.PhoneNumber): string | undefined {
		// Will use this to match area code from the first numbers
		const rawNumber = number['values_']['2'].toString();
		// List of all countries with countryCode (can be more than one. e.x. US, CA, DO, PR all have +1 countryCode)
		const countries = this.allCountries.filter(c => c.dialCode === countryCode.toString());
		// Main country is the country, which has no areaCodes specified in country-code.ts file.
		const mainCountry = countries.find(c => c.areaCodes === undefined);
		// Secondary countries are all countries, which have areaCodes specified in country-code.ts file.
		const secondaryCountries = countries.filter(c => c.areaCodes !== undefined);
		let matchedCountry = mainCountry ? mainCountry.iso2 : undefined;

		/*
			Interate over each secondary country and check if nationalNumber starts with any of areaCodes available.
			If no matches found, fallback to the main country.
		*/
		secondaryCountries.forEach(country => {
			country.areaCodes.forEach(areaCode => {
				if (rawNumber.startsWith(areaCode)) {
					matchedCountry = country.iso2;
				}
			});
		});

		return matchedCountry;
	}

}