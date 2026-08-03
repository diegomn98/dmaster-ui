export * from './dialog.service';
export * from './dialog.types';

// Re-export para que el consumidor no dependa directamente del CDK:
// inject(DIALOG_DATA) en el componente de contenido, inject(DialogRef) para cerrar.
export { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
