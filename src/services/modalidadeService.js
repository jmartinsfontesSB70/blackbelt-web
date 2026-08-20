import { apiFetch } from "./api";

const API_URL = "/modalidades";

export async function listarModalidades(page = 0, size = 10) {
  return await apiFetch(`${API_URL}?page=${page}&size=${size}`);
}

export async function listarModalidadesParaSelecao() {
  const primeiraPagina = await listarModalidades(0, 10);

  const modalidades = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarModalidades(pagina, 10);

    modalidades.push(...dadosPagina.content);
  }

  return modalidades;
}

export async function buscarModalidadePorId(id) {
  return await apiFetch(`${API_URL}/${id}`);
}

export async function cadastrarModalidade(modalidade) {
  return await apiFetch(API_URL, {
    method: "POST",
    body: JSON.stringify(modalidade),
  });
}

export async function atualizarModalidade(id, modalidade) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "PUT",
    body: JSON.stringify(modalidade),
  });
}

export async function excluirModalidade(id) {
  return await apiFetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
