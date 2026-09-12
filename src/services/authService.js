const API_URL = "http://localhost:8080/api/v1/login";

export async function fazerLogin(identificador, password) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identificador,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Usuário ou senha inválidos.");
  }

  return await response.json();
}

const RECUPERACAO_SENHA_URL = "http://localhost:8080/api/v1/recuperacao-senha";

export async function solicitarRecuperacaoSenha(identificador) {
  const response = await fetch(RECUPERACAO_SENHA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identificador,
    }),
  });

  if (!response.ok) {
    const texto = await response.text();

    console.error("ERRO RECUPERAÇÃO:", response.status, texto);

    throw new Error(
      "Não foi possível solicitar a recuperação da senha. Tente novamente.",
    );
  }
}

export async function redefinirSenha(token, novaSenha) {
  const response = await fetch(
    "http://localhost:8080/api/v1/recuperacao-senha/redefinir",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        novaSenha,
      }),
    },
  );

  if (!response.ok) {
    const texto = await response.text();

    console.error("ERRO REDEFINIÇÃO:", response.status, texto);

    throw new Error(
      "Não foi possível redefinir sua senha. Verifique o link e tente novamente.",
    );
  }
}
