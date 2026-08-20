import { apiFetch } from "./api";

const API_URL = "/presencas";

export async function listarPresencas(page = 0, size = 10) {
  return await apiFetch(`${API_URL}?page=${page}&size=${size}`);
}

export async function cadastrarPresenca(presenca) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(presenca),
  });
}

export async function buscarPresencaPorId(id) {
  return await apiFetch(`${API_URL}/${id}`);
}

export async function atualizarPresenca(id, presenca) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(presenca),
  });
}

export async function excluirPresenca(id) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
