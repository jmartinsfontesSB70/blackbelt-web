const API_URL = "http://localhost:8080/api/v1";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";

    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  if (response.status === 403) {
    throw new Error("Você não possui permissão para realizar esta operação.");
  }

  if (!response.ok) {
    throw new Error(`Erro na comunicação com a API (${response.status}).`);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}
