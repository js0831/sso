import { Injectable } from '@angular/core';
import { FormGroup, ValidationErrors, FormControl } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private titlecasePipe: TitleCasePipe
  ) { }

  // NOTE: You can use form.markAllAsTouched(). instead of this one
  markFormControlsDirty(form: FormGroup) {
    // tslint:disable-next-line: forin
    for (const i in form.controls) {
      const control = form.controls[i];

      if ((form.controls[i] as any).controls !== undefined) {
        this.markFormControlsDirty(control as FormGroup);
      } else {
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    }
  }

  getFormValidationErrors(f: FormGroup) {
    let errors = [];
    Object.keys(f.controls).forEach(key => {
        const controlErrors: ValidationErrors = f.get(key).errors;
        const value = f.get(key).value;
        if (typeof value === 'object' && value !== null) {
          const t = this.getFormValidationErrors((f.get(key) as FormGroup));
          if (t.length > 0 ) {
            errors = [...errors, ...t];
          }
        } else {
          if (controlErrors != null) {
            Object.keys(controlErrors).forEach(keyError => {
              errors.push({
                field: key,
                error: keyError,
                message: this.getFormErrorMessage(key, keyError, controlErrors)
              });
            });
          }
        }
    });
    return errors;
  }

  getFormErrorMessage(field, errorType, errorData) {
    const f = this.titlecasePipe.transform(field).replace(/\_/g, ' ');
    switch (errorType) {
      case 'required':
        return `${f} field is required`;
        break;
      case 'minlength':
        return `${f} must be at least ${errorData[errorType].requiredLength} characters long`;
        break;
      case 'email':
        return `Invalid Email Address`;
      default:
        return errorType + ' Default';
        break;
    }
  }

  encodeToURLParameters(obj: any, includeKeysWithoutValue = true) {
    let keys = Object.keys(obj);
    if (!includeKeysWithoutValue) {
      keys = keys.filter( x => obj[x] != null && (obj[x] + '').length > 0);
    }
    let url = '';
    keys.forEach( x => url += `${x}=${obj[x]}&`);
    return url.slice(0, -1);
  }
}
