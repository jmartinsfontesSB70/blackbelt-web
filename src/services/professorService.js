import { apiFetch } from "./api";

const API_URL = "/professores";

export async function listarProfessores(page = 0, size = 10) {
  return await apiFetch(`${API_URL}?page=${page}&size=${size}`);
}

export async function listarProfessoresParaSelecao() {
  const primeiraPagina = await listarProfessores(0, 10);

  const professores = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarProfessores(pagina, 10);

    professores.push(...dadosPagina.content);
  }

  return professores;
}

export async function buscarProfessorPorId(id) {
  return await apiFetch(`${API_URL}/${id}`);
}

export async function cadastrarProfessor(professor) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(professor),
  });
}

export async function atualizarProfessor(id, professor) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(professor),
  });
}

export async function excluirProfessor(id) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
