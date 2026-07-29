export interface DomainErrorDetails {
  readonly apiStatus?: number;
  readonly command?: string;
  readonly exitCode?: number;
  readonly flag?: string;
  readonly profileId?: string;
  readonly profilesFile?: string;
  readonly topic?: string;
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
