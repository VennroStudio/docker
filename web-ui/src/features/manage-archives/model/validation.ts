export function isValidArchiveBaseName(value: string) {
  return /^[A-Za-z0-9._-]+$/.test(value);
}

export function isValidArchiveFileName(value: string) {
  return /^[A-Za-z0-9._-]+\.t(ar\.)?gz$/.test(value);
}
