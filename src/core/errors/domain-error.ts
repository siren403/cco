export interface DomainErrorDetails {
  readonly exitCode?: number;
  readonly profileId?: string;
}

export class DomainError extends Error {
  readonly code: string;
  readonly details: DomainErrorDetails;

  constructor(code: string, message: string, details: DomainErrorDetails = {}) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.details = details;
  }
}
