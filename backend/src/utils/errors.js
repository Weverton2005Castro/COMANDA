export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function notFound(message = 'Registro nao encontrado') {
  const error = new Error(message);
  error.status = 404;
  return error;
}

export function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}
