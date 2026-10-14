import { apiFetch } from "./api.js";

export async function ativarLicenca(token) {
  return await apiFetch("/licenca/ativar", {
    method: "POST",
    body: JSON.stringify({
      token,
    }),
  });
}
