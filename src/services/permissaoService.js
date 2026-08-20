import { apiFetch } from "./api";

const API_URL = "/permissoes";

export async function listarPermissoes() {
  return await apiFetch(API_URL);
}
