import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  cadastrarPerfil,
  buscarPerfilPorId,
  atualizarPerfil,
} from "../services/perfilService";

import { listarPermissoes } from "../services/permissaoService";

function agruparPermissoes(permissoes) {
  const grupos = {};

  permissoes.forEach((permissao) => {
    const partes = permissao.nome.split("_");

    const modulo = partes[0];

    if (!grupos[modulo]) {
      grupos[modulo] = [];
    }

    grupos[modulo].push(permissao);
  });

  return grupos;
}

function PerfilForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicao = Boolean(id);

  const [nome, setNome] = useState("");
  const [permissoes, setPermissoes] = useState([]);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState([]);

  const [carregando, setCarregando] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const gruposPermissoes = agruparPermissoes(permissoes);

  const perfilAdmin = modoEdicao && nome.trim().toLowerCase() === "admin";

  useEffect(() => {
    carregarDados();
  }, [id]);

  async function carregarDados() {
    try {
      setCarregando(true);
      setErro("");

      const listaPermissoes = await listarPermissoes();

      setPermissoes(listaPermissoes);

      if (modoEdicao) {
        const perfil = await buscarPerfilPorId(id);

        setNome(perfil.nome);

        setPermissoesSelecionadas(
          perfil.permissoes.map((permissao) => permissao.id),
        );
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  function alternarPermissao(permissaoId) {
    if (perfilAdmin) {
      return;
    }

    setPermissoesSelecionadas((selecionadas) => {
      if (selecionadas.includes(permissaoId)) {
        return selecionadas.filter((id) => id !== permissaoId);
      }

      return [...selecionadas, permissaoId];
    });
  }

  function alternarTodasDoModulo(permissoesDoModulo) {
    if (perfilAdmin) {
      return;
    }

    const ids = permissoesDoModulo.map((permissao) => permissao.id);

    const todasSelecionadas = ids.every((id) =>
      permissoesSelecionadas.includes(id),
    );

    setPermissoesSelecionadas((selecionadas) => {
      if (todasSelecionadas) {
        return selecionadas.filter((id) => !ids.includes(id));
      }

      return [...new Set([...selecionadas, ...ids])];
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");

    if (perfilAdmin) {
      setErro("O perfil admin é protegido e não pode ser alterado.");
      return;
    }

    if (!nome.trim()) {
      setErro("Informe o nome do perfil.");
      return;
    }

    try {
      setSalvando(true);

      const perfil = {
        nome: nome.trim(),
        permissaoIds: permissoesSelecionadas,
      };

      if (modoEdicao) {
        await atualizarPerfil(id, perfil);
      } else {
        await cadastrarPerfil(perfil);
      }

      navigate("/perfis");
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>{modoEdicao ? "Editar perfil" : "Novo perfil"}</h2>
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>{modoEdicao ? "Editar perfil" : "Novo perfil"}</h2>

          <p>
            {modoEdicao
              ? "Altere os dados e as permissões do perfil."
              : "Cadastre um novo perfil de acesso."}
          </p>
        </div>
      </div>

      {perfilAdmin && (
        <div className="form-message error-message">
          O perfil admin é protegido e não pode ser alterado.
        </div>
      )}

      {erro && <div className="form-message error-message">{erro}</div>}

      <form className="form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nome">Nome</label>

          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            disabled={salvando || perfilAdmin}
          />
        </div>

        <div className="form-group">
          <label>Permissões</label>

          <div className="permissions-groups">
            {Object.entries(gruposPermissoes).map(
              ([modulo, permissoesDoModulo]) => (
                <div className="permission-group" key={modulo}>
                  <div className="permission-group-header">
                    <strong>{modulo}</strong>

                    <label className="select-all-permissions">
                      <input
                        type="checkbox"
                        checked={permissoesDoModulo.every((permissao) =>
                          permissoesSelecionadas.includes(permissao.id),
                        )}
                        onChange={() =>
                          alternarTodasDoModulo(permissoesDoModulo)
                        }
                        disabled={salvando || perfilAdmin}
                      />

                      <span>Selecionar todas</span>
                    </label>
                  </div>

                  <div className="permission-group-items">
                    {permissoesDoModulo.map((permissao) => {
                      const acao = permissao.nome
                        .replace(`${modulo}_`, "")
                        .toLowerCase();

                      return (
                        <label key={permissao.id} className="permission-item">
                          <input
                            type="checkbox"
                            checked={permissoesSelecionadas.includes(
                              permissao.id,
                            )}
                            onChange={() => alternarPermissao(permissao.id)}
                            disabled={salvando || perfilAdmin}
                          />

                          <span>{acao}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/perfis")}
            disabled={salvando}
          >
            Voltar
          </button>

          {!perfilAdmin && (
            <button
              type="submit"
              className="primary-button"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}

export default PerfilForm;
