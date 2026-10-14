const API_URL = "http://localhost:8080/api/v1/academia";

export async function verificarStatusInstalacao() {
  const response = await fetch(`${API_URL}/status-instalacao`);

  if (!response.ok) {
    throw new Error("Não foi possível verificar a instalação do BlackBelt.");
  }

  return await response.json();
}

export async function cadastrarAcademia(academia, logo) {
  const formData = new FormData();

  formData.append(
    "academia",
    new Blob([JSON.stringify(academia)], { type: "application/json" }),
  );

  if (logo) {
    formData.append("logo", logo);
  }

  const response = await fetch(`${API_URL}/instalacao`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const texto = await response.text();

    console.error("ERRO CADASTRO ACADEMIA:", response.status, texto);

    throw new Error(
      "Não foi possível cadastrar a academia. Verifique os dados e tente novamente.",
    );
  }

  return await response.json();
}
