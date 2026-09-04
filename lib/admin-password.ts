export type AdminPasswordCheck =
  | { readonly kind: 'valid' }
  | { readonly kind: 'invalid' }
  | { readonly kind: 'unconfigured' }

export function checkAdminPassword(
  input: string,
  configuredPassword: string | undefined,
): AdminPasswordCheck {
  if (!configuredPassword) {
    return { kind: 'unconfigured' }
  }
  if (input === configuredPassword) {
    return { kind: 'valid' }
  }
  return { kind: 'invalid' }
}
