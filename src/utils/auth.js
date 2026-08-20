export function obterToken() {
  return localStorage.getItem("token");
}

export function obterPermissoes() {
  const token = obterToken();

  if (!token) {
    return [];
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return payload.authorities || [];
  } catch {
    return [];
  }
}

export function temPermissao(permissao) {
  return obterPermissoes().includes(permissao);
}
