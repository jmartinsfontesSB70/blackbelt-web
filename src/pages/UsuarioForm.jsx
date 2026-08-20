import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  cadastrarUsuario,
  buscarUsuarioPorId,
  atualizarUsuario,
} from "../services/usuarioService";

import { listarPerfis } from "../services/perfilService";

function UsuarioForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicao = Boolean(id);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ativo, setAtivo] = useState(true);
  const [perfilId, setPerfilId] = useState("");

  const [perfis, setPerfis] = useState([]);
  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const listaPerfis = await listarPerfis();

      setPerfis(listaPerfis);

      if (modoEdicao) {
        const usuario = await buscarUsuarioPorId(id);

        setUsername(usuario.username);
        setAtivo(usuario.ativo);
        setPerfilId(String(usuario.perfilId));
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    if (!username.trim()) {
      setErro("Informe o nome do usuário.");
      return;
    }

    if (!modoEdicao && !password.trim()) {
      setErro("Informe a senha.");
      return;
    }

    if (!perfilId) {
      setErro("Selecione um perfil.");
      return;
    }

    try {
      setSalvando(true);

      const usuario = {
        username: username.trim(),
        ativo,
        perfilId: Number(perfilId),
      };

      if (password.trim()) {
        usuario.password = password;
      }

      if (modoEdicao) {
        await atualizarUsuario(id, usuario);
      } else {
        await cadastrarUsuario({
          ...usuario,
          password: password.trim(),
        });
      }

      navigate("/usuarios");
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>{modoEdicao ? "Editar usuário" : "Novo usuário"}</h2>
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>{modoEdicao ? "Editar usuário" : "Novo usuário"}</h2>

          <p>
            {modoEdicao
              ? "Altere os dados do usuário."
              : "Cadastre um novo usuário do sistema."}
          </p>
        </div>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuário</label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            maxLength={50}
            disabled={salvando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Senha
            {modoEdicao && " (deixe em branco para manter a atual)"}
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={salvando}
          />
        </div>

        <div className="form-group">
          <label htmlFor="perfilId">Perfil</label>

          <select
            id="perfilId"
            value={perfilId}
            onChange={(event) => setPerfilId(event.target.value)}
            disabled={salvando}
          >
            <option value="">Selecione um perfil</option>

            {perfis.map((perfil) => (
              <option key={perfil.id} value={perfil.id}>
                {perfil.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="ativo">Status</label>

          <select
            id="ativo"
            value={ativo ? "true" : "false"}
            onChange={(event) => setAtivo(event.target.value === "true")}
            disabled={salvando}
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/usuarios")}
            disabled={salvando}
          >
            Cancelar
          </button>

          <button type="submit" className="primary-button" disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default UsuarioForm;
