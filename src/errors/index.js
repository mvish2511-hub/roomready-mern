'use strict';

/** A refusal the app gives. Services throw these; the error middleware turns them into problem+json. */
class DomainError extends Error {
  constructor(status, type, title, detail) {
    super(detail);
    this.status = status;
    this.type = type;
    this.title = title;
  }

  /** Extra fields for this refusal's answer (none by default). */
  extras() {
    return {};
  }
}

class ValidationError extends DomainError {
  /** @param errors [{ field, message }] */
  constructor(errors) {
    super(400, '/errors/validation', 'Invalid request', 'The request is not valid');
    this.errors = errors;
  }

  extras() {
    return { errors: this.errors };
  }
}

class NoSuchProperty extends DomainError {
  constructor(property) {
    super(404, '/errors/no-such-property', 'No such property', `There is no property ${property}`);
  }
}

class NoSuchRoom extends DomainError {
  constructor(no) {
    super(404, '/errors/no-such-room', 'No such room', `There is no room ${no} in this property`);
  }
}

module.exports = { DomainError, ValidationError, NoSuchProperty, NoSuchRoom };