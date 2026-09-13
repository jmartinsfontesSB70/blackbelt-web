import { apiFetch } from "./api";

const API_URL = "/perfis";

export async function listarPerfis(
  page = 0,
  size = 10,
  sort = "nome",
  direction = "desc",
) {
  const params = new URLSearchParams({
    page,
    size,
    sort,
    direction,
  });

  return await apiFetch(`${API_URL}?${params.toString()}`);
}

export async function listarPerfisParaSelecao() {
  const primeiraPagina = await listarPerfis(0, 10);

  const perfis = [...primeiraPagina.content];

  for (let pagina = 1; pagina < primeiraPagina.totalPages; pagina++) {
    const dadosPagina = await listarPerfis(pagina, 10);

    perfis.push(...dadosPagina.content);
  }

  return perfis;
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
