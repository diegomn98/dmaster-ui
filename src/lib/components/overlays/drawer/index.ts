export * from './drawer.service';
export * from './drawer.tokens';
export * from './drawer.types';

// DIALOG_DATA y DialogRef ya los reexporta el barrel del dialog (mismo símbolo
// del CDK). No se duplican aquí: el consumidor los importa de '@dmaster/ui'
// (inject(DIALOG_DATA) en el componente/template de contenido, inject(DialogRef)
// para cerrar con resultado).
