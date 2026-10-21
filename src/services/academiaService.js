import { apiFetch } from "./api";

const ENDPOINT = "/academia";

export async function verificarStatusInstalacao() {
  return await apiFetch(`${ENDPOINT}/status-instalacao`);
}

export async function cadastrarAcademia(academia, logo) {
  const formData = new FormData();

  formData.append(
    "academia",
    new Blob([JSON.stringify(academia)], {
      type: "application/json",
    }),
  );

  if (logo) {
    formData.append("logo", logo);
  }

  try {
    return await apiFetch(`${ENDPOINT}/instalacao`, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    console.error("ERRO CADASTRO ACADEMIA:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Não foi possível cadastrar a academia. Verifique os dados e tente novamente.",
    );
  }
}

export async function buscarAcademia() {
  return await apiFetch(ENDPOINT);
}

export async function atualizarAcademia(academia) {
  return await apiFetch(ENDPOINT, {
    method: "PUT",
    body: JSON.stringify(academia),
  });
}

export async function atualizarLogoAcademia(logo) {
  const formData = new FormData();

  formData.append("logo", logo);

  return await apiFetch(`${ENDPOINT}/logo`, {
    method: "PUT",
    body: formData,
  });
}

export async function buscarLogoAcademia() {
  return await apiFetch(`${ENDPOINT}/logo`, {
    responseType: "blob",
  });
}
