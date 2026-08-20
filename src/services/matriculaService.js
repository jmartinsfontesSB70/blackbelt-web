import { apiFetch } from "./api";

const API_URL = "/matriculas";

export async function listarMatriculas(page = 0, size = 10) {
  return await apiFetch(`${API_URL}?page=${page}&size=${size}`);
}

export async function listarMatriculasParaSelecao() {
  const primeiraPagina = await listarMatriculas(0, 10);

  const matriculas = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarMatriculas(pagina, 10);

    matriculas.push(...dadosPagina.content);
  }

  return matriculas;
}

export async function cadastrarMatricula(matricula) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(matricula),
  });
}

export async function buscarMatriculaPorId(id) {
  return await apiFetch(`${API_URL}/${id}`);
}

export async function atualizarMatricula(id, matricula) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(matricula),
  });
}

export async function excluirMatricula(id) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
