import { apiFetch } from "./api";

const API_URL = "/tipos-cobranca";

export async function listarTiposCobranca() {
  return await apiFetch(API_URL);
}

export async function cadastrarTipoCobranca(tipoCobranca) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(tipoCobranca),
  });
}

export async function buscarTipoCobrancaPorId(id) {
  return await apiFetch(`${API_URL}/${id}`);
}

export async function atualizarTipoCobranca(id, tipoCobranca) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(tipoCobranca),
  });
}

export async function excluirTipoCobranca(id) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
