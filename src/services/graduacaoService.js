import { apiFetch } from "./api";

const API_URL = "/graduacoes";

export async function listarGraduacoesPorModalidade(modalidadeId) {
  return await apiFetch(`${API_URL}/modalidade/${modalidadeId}`);
}

export async function buscarGraduacaoPorId(id) {
  return await apiFetch(`${API_URL}/${id}`);
}

export async function cadastrarGraduacao(graduacao) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(graduacao),
  });
}

export async function atualizarGraduacao(id, graduacao) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(graduacao),
  });
}

export async function excluirGraduacao(id) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
