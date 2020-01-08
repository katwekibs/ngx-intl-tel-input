import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgxIntlTelInputComponent, NgxTelphoneInputComponent } from './ngx-intl-tel-input.component';
import { CommonModule } from '@angular/common';
import { BsDropdownModule, TooltipModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxIntlTelInputService } from './ngx-intl-tel-input.service';

@NgModule({
	declarations: [NgxIntlTelInputComponent,NgxTelphoneInputComponent],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		BsDropdownModule.forRoot(),
		TooltipModule.forRoot()
	],
	exports: [NgxIntlTelInputComponent,NgxTelphoneInputComponent]
})
export class NgxIntlTelInputModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: NgxIntlTelInputModule,
			providers: [NgxIntlTelInputService]
		};
	}
}
