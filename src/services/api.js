const API_URL = "http://localhost:8080/api/v1";

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...options.headers,
  };

  const isFormData = options.body instanceof FormData;

  if (options.body && !isFormData && !headers["Content-Type"]) {
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

  // Licença expirada: encaminha o usuário para a ativação.
  if (response.status === 423) {
    let mensagem =
      "A avaliação expirou. Ative sua licença para continuar utilizando o BlackBelt.";

    try {
      const erro = await response.json();

      if (erro.mensagem) {
        mensagem = erro.mensagem;
      }
    } catch {
      // Mantém a mensagem padrão se a resposta não contiver JSON.
    }

    if (window.location.pathname !== "/licenca/ativar") {
      sessionStorage.setItem("licencaMensagem", mensagem);
      window.location.href = "/licenca/ativar";
    }

    throw new Error(mensagem);
  }

  if (!response.ok) {
    let mensagem = `Erro na comunicação com a API (${response.status}).`;

    try {
      const erro = await response.json();

      if (erro.mensagem) {
        mensagem = erro.mensagem;
      } else if (erro.message) {
        mensagem = erro.message;
      } else if (erro.detail) {
        mensagem = erro.detail;
      }
    } catch {
      // Resposta sem JSON: mantém a mensagem padrão.
    }

    throw new Error(mensagem);
  }

  if (response.status === 204) {
    return null;
  }

  if (options.responseType === "blob") {
    return await response.blob();
  }

  return await response.json();
}
