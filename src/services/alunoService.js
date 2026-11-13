import { apiFetch } from "./api";

const API_URL = "/alunos";

export async function buscarEnderecoPorCep(cep) {
  const cepLimpo = cep.replace(/\D/g, "");

  return await apiFetch(`/ceps/${cepLimpo}`);
}

export async function listarAlunos(
  page = 0,
  size = 10,
  pesquisa = "",
  sort = "id",
  direction = "desc",
) {
  const params = new URLSearchParams({
    page,
    size,
    sort,
    direction,
  });

  if (pesquisa.trim()) {
    params.append("pesquisa", pesquisa.trim());
  }

  return await apiFetch(`${API_URL}?${params.toString()}`);
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

export async function enviarFotoAluno(id, arquivo) {
  const formData = new FormData();

  formData.append("foto", arquivo);

  return await apiFetch(`${API_URL}/${id}/foto`, {
    method: "POST",
    body: formData,
  });
}

export async function buscarFotoAluno(id) {
  return await apiFetch(`${API_URL}/${id}/foto`, {
    responseType: "blob",
  });
}

export async function excluirFotoAluno(id) {
  return await apiFetch(`${API_URL}/${id}/foto`, {
    method: "DELETE",
  });
}
