const query = '{' + 'A'.repeat(6000) + '}'

export const QUERY_TOO_LARGE = {
  query,
  variables: null,
}
