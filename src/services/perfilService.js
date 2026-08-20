import { apiFetch } from "./api";

const API_URL = "/perfis";

export async function listarPerfis() {
  return await apiFetch(API_URL);
}

export async function buscarPerfilPorId(id) {
  return await apiFetch(`${API_URL}/${id}`);
}

export async function cadastrarPerfil(perfil) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(perfil),
  });
}

export async function atualizarPerfil(id, perfil) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(perfil),
  });
}

export async function excluirPerfil(id) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
