/** Why a file was turned away during validation. */
export type DmFileRejectReason = 'type' | 'size' | 'count';

/** A file that failed validation, paired with the reason it was rejected. */
export interface DmFileRejection {
  /** The file the consumer tried to add. */
  file: File;
  /** Which rule the file broke: MIME/extension, byte size, or the count cap. */
  reason: DmFileRejectReason;
}

/** Localisable copy for the inline `role="alert"` shown after a rejection. */
export type DmFileUploadMessages = Record<DmFileRejectReason, string>;
