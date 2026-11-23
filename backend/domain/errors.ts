export type DomainErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "TEMPLATE_NOT_FOUND"
  | "INVALID_IMGFLIP_CREDENTIALS"
  | "RENDER_FAILED";

export class DomainError extends Error {
  constructor(
    readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "Missing or invalid token.") {
    super("UNAUTHORIZED", message);
  }
}
export class ValidationError extends DomainError {
  constructor(message: string) {
    super("VALIDATION", message);
  }
}
export class TemplateNotFoundError extends DomainError {
  constructor(id: string) {
    super("TEMPLATE_NOT_FOUND", `Template "${id}" not found.`);
  }
}
export class InvalidImgflipCredentialsError extends DomainError {
  constructor(message = "Imgflip rejected these credentials.") {
    super("INVALID_IMGFLIP_CREDENTIALS", message);
  }
}
export class RenderFailedError extends DomainError {
  constructor(message = "Imgflip failed to render the meme.") {
    super("RENDER_FAILED", message);
  }
}
