export * from './drawer.service';
export * from './drawer.tokens';
export * from './drawer.types';

// Re-export para que el consumidor no dependa directamente del CDK ni tenga que
// importar `@dmaster/ui/dialog` solo por esto: inject(DIALOG_DATA) en el
// componente de contenido, inject(DialogRef) para cerrar con resultado. Es el
// MISMO símbolo que reexporta `@dmaster/ui/dialog` (el del CDK), así que el
// `export *` de ambos en el punto de entrada principal no es ambiguo.
export { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
