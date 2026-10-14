import { apiFetch } from "./api";

const API_URL = "/cobrancas";

export async function listarCobrancas(
  page = 0,
  size = 10,
  pesquisa = "",
  sort = "dataVencimento",
  direction = "desc",
) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort,
    direction,
  });

  if (pesquisa.trim()) {
    params.append("pesquisa", pesquisa.trim());
  }

  return await apiFetch(`${API_URL}?${params.toString()}`);
}

export async function listarCobrancasPorMatricula(matriculaId) {
  return await apiFetch(`${API_URL}/matricula/${matriculaId}`);
}

export async function buscarCobrancaPorId(id) {
  return await apiFetch(`${API_URL}/${id}`);
}

export async function cadastrarCobranca(cobranca) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(cobranca),
  });
}

export async function cancelarCobranca(id) {
  return await apiFetch(`${API_URL}/${id}/cancelar`, {
    method: "PATCH",
  });
}

export async function listarPagamentos(cobrancaId) {
  return await apiFetch(`${API_URL}/${cobrancaId}/pagamentos`);
}

export async function cadastrarPagamento(cobrancaId, pagamento) {
  return await apiFetch(`${API_URL}/${cobrancaId}/pagamentos`, {
    method: "POST",
    body: JSON.stringify(pagamento),
  });
}

export async function excluirCobranca(id) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}

export async function excluirPagamento(cobrancaId, pagamentoId) {
  return await apiFetch(`${API_URL}/${cobrancaId}/pagamentos/${pagamentoId}`, {
    method: "DELETE",
  });
}
