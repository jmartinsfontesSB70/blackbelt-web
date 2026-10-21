import { apiFetch } from "./api";

export async function consultarStatusLicenca() {
  return await apiFetch("/licenca/status");
}
