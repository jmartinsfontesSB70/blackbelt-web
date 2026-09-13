import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import { listarPerfis, excluirPerfil } from "../services/perfilService";

import ConfirmModal from "../components/ConfirmModal";
import Permissao from "../components/Permissao";

function Perfis() {
  const navigate = useNavigate();

  const [perfis, setPerfis] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [sort, setSort] = useState("nome");
  const [direction, setDirection] = useState("desc");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarPerfis() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarPerfis(paginaAtual, 10, sort, direction);

      setPerfis(dados.content);
      setTotalPaginas(dados.totalPages);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPerfis();
  }, [paginaAtual, sort, direction]);

  function ordenarPor(campo) {
    if (sort === campo) {
      setDirection((valorAtual) => (valorAtual === "asc" ? "desc" : "asc"));
    } else {
      setSort(campo);
      setDirection("asc");
    }

    setPaginaAtual(0);
  }

  function irParaPaginaAnterior() {
    if (paginaAtual > 0) {
      setPaginaAtual(paginaAtual - 1);
    }
  }

  function irParaProximaPagina() {
    if (paginaAtual < totalPaginas - 1) {
      setPaginaAtual(paginaAtual + 1);
    }
  }

  function handleExcluir(perfil) {
    setErro("");
    setPerfilSelecionado(perfil);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!perfilSelecionado) {
      return;
    }

    try {
      setExcluindo(true);
      setErro("");

      await excluirPerfil(perfilSelecionado.id);

      setModalExcluirAberto(false);
      setPerfilSelecionado(null);

      if (perfis.length === 1 && paginaAtual > 0) {
        setPaginaAtual(paginaAtual - 1);
      } else {
        await carregarPerfis();
      }
    } catch (error) {
      setModalExcluirAberto(false);
      setPerfilSelecionado(null);
      setErro(error.message);
    } finally {
      setExcluindo(false);
    }
  }

  function cancelarExclusao() {
    if (excluindo) {
      return;
    }

    setModalExcluirAberto(false);
    setPerfilSelecionado(null);
  }

  function perfilAdmin(perfil) {
    return perfil.nome?.trim().toLowerCase() === "admin";
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>Perfis</h2>
        <p>Carregando perfis...</p>
      </main>
    );
  }

  if (erro && perfis.length === 0) {
    return (
      <main className="main">
        <h2>Perfis</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Perfis</h2>

          <p>Gerencie os perfis de acesso do sistema.</p>
        </div>

        <Permissao nome="PERFIL_CRIAR">
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/perfis/novo")}
          >
            + Novo perfil
          </button>
        </Permissao>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>

              <th
                onClick={() => ordenarPor("nome")}
                style={{ cursor: "pointer" }}
              >
                Perfil{" "}
                {sort === "nome" ? (direction === "asc" ? "↑" : "↓") : ""}
              </th>

              <th>Permissões</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {perfis.map((perfil) => (
              <tr key={perfil.id}>
                <td>{perfil.id}</td>

                <td className="name-cell">{perfil.nome}</td>

                <td>{perfil.permissoes?.length ?? 0}</td>

                <td>
                  <div className="action-buttons">
                    {!perfilAdmin(perfil) && (
                      <>
                        <Permissao nome="PERFIL_EDITAR">
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => navigate("/perfis/" + perfil.id)}
                            title="Editar perfil"
                          >
                            <Pencil size={18} />
                          </button>
                        </Permissao>

                        <Permissao nome="PERFIL_EXCLUIR">
                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => handleExcluir(perfil)}
                            title="Excluir perfil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </Permissao>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          type="button"
          className="pagination-button"
          onClick={irParaPaginaAnterior}
          disabled={paginaAtual === 0}
        >
          ← Anterior
        </button>

        <span>
          Página {paginaAtual + 1} de {totalPaginas}
        </span>

        <button
          type="button"
          className="pagination-button"
          onClick={irParaProximaPagina}
          disabled={paginaAtual >= totalPaginas - 1}
        >
          Próxima →
        </button>
      </div>

      <ConfirmModal
        aberto={modalExcluirAberto}
        titulo="Excluir perfil?"
        mensagem={
          perfilSelecionado
            ? "Deseja realmente excluir o perfil " +
              perfilSelecionado.nome +
              "?"
            : ""
        }
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindo}
      />
    </main>
  );
}

export default Perfis;
