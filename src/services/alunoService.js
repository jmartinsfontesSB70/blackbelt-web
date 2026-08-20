import { apiFetch } from "./api";

const API_URL = "/alunos";

export async function listarAlunos(page = 0, size = 10) {
  return await apiFetch(`${API_URL}?page=${page}&size=${size}`);
}

export async function listarAlunosParaSelecao() {
  const primeiraPagina = await listarAlunos(0, 10);

  const alunos = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarAlunos(pagina, 10);

    alunos.push(...dadosPagina.content);
  }

  return alunos;
}

export async function cadastrarAluno(aluno) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(aluno),
  });
}

export async function buscarAlunoPorId(id) {
  return await apiFetch(`${API_URL}/${id}`);
}

export async function atualizarAluno(id, aluno) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(aluno),
  });
}

export async function excluirAluno(id) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
