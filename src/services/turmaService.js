import { apiFetch } from "./api";

const API_URL = "/turmas";

export async function listarTurmas(page = 0, size = 10) {
  return await apiFetch(`${API_URL}?page=${page}&size=${size}`);
}

export async function listarTurmasParaSelecao() {
  const primeiraPagina = await listarTurmas(0, 10);

  const turmas = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarTurmas(pagina, 10);

    turmas.push(...dadosPagina.content);
  }

  return turmas;
}

export async function buscarTurmaPorId(id) {
  return await apiFetch(`${API_URL}/${id}`);
}

export async function cadastrarTurma(turma) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(turma),
  });
}

export async function atualizarTurma(id, turma) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(turma),
  });
}

export async function excluirTurma(id) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
