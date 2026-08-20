const API_URL = "http://localhost:8080/api/v1/login";

export async function fazerLogin(username, password) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Usuário ou senha inválidos.");
  }

  return await response.json();
}
