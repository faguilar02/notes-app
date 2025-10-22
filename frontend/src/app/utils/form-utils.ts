import { FormGroup, ValidationErrors } from '@angular/forms';

export class FormUtils {
  static getTextError(errors: ValidationErrors) {
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';

        case 'minlength':
          return `Mínimo de ${errors['minlength'].requiredLength} caracteres.`;

        default:
          return `Error de validación no controlado ${key}`;
      }
    }

    return null;
  }

  static isValidField(fieldName: string, form: FormGroup): boolean | null {
    return (
      !!form.controls[fieldName].errors && form.controls[fieldName].touched
    );
  }

  static getFieldError(fieldName: string, form: FormGroup): string | null {
    if (!form.controls[fieldName]) return null;

    const errors = form.controls[fieldName].errors ?? {};

    return FormUtils.getTextError(errors);
  }
}
