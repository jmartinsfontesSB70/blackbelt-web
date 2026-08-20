import { apiFetch } from "./api";

const API_URL = "/usuarios";

export async function listarUsuarios() {
  return await apiFetch(API_URL);
}

export async function buscarUsuarioPorId(id) {
  return await apiFetch(`${API_URL}/${id}`);
}

export async function cadastrarUsuario(usuario) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(usuario),
  });
}

export async function atualizarUsuario(id, usuario) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(usuario),
  });
}

export async function excluirUsuario(id) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
