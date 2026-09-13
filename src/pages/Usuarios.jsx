import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Search } from "lucide-react";

import { listarUsuarios, excluirUsuario } from "../services/usuarioService";

import ConfirmModal from "../components/ConfirmModal";
import Permissao from "../components/Permissao";

function Usuarios() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const [textoPesquisa, setTextoPesquisa] = useState("");
  const [pesquisa, setPesquisa] = useState("");

  const [sort, setSort] = useState("id");
  const [direction, setDirection] = useState("desc");

  async function carregarUsuarios() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarUsuarios(
        paginaAtual,
        10,
        pesquisa,
        sort,
        direction,
      );

      setUsuarios(dados.content);
      setTotalPaginas(dados.totalPages);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, [paginaAtual, pesquisa, sort, direction]);

  function executarPesquisa() {
    setPaginaAtual(0);
    setPesquisa(textoPesquisa);
  }

  function handlePesquisaKeyDown(event) {
    if (event.key === "Enter") {
      executarPesquisa();
    }
  }

  function ordenarPor(campo) {
    if (sort === campo) {
      setDirection((direcaoAtual) => (direcaoAtual === "asc" ? "desc" : "asc"));
    } else {
      setSort(campo);
      setDirection("asc");
    }

    setPaginaAtual(0);
  }

  function handleExcluir(usuario) {
    setErro("");
    setUsuarioSelecionado(usuario);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!usuarioSelecionado) {
      return;
    }

    const id = usuarioSelecionado.id;

    try {
      setExcluindo(true);
      setErro("");

      await excluirUsuario(id);

      setModalExcluirAberto(false);
      setUsuarioSelecionado(null);

      if (usuarios.length === 1 && paginaAtual > 0) {
        setPaginaAtual(paginaAtual - 1);
      } else {
        await carregarUsuarios();
      }
    } catch (error) {
      /*
       * A exclusão pode ser recusada pelo backend.
       *
       * Nesse caso fechamos o modal e mostramos
       * a mensagem retornada pela API.
       */
      setModalExcluirAberto(false);
      setUsuarioSelecionado(null);
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
    setUsuarioSelecionado(null);
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

  if (carregando) {
    return (
      <main className="main">
        <h2>Usuários</h2>
        <p>Carregando usuários...</p>
      </main>
    );
  }

  if (erro && usuarios.length === 0) {
    return (
      <main className="main">
        <h2>Usuários</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Usuários</h2>

          <p>Gerencie os usuários do sistema.</p>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar usuário, e-mail ou perfil..."
              value={textoPesquisa}
              onChange={(event) => setTextoPesquisa(event.target.value)}
              onKeyDown={handlePesquisaKeyDown}
            />

            <button
              type="button"
              className="search-button"
              onClick={executarPesquisa}
              title="Pesquisar"
              aria-label="Pesquisar usuário"
            >
              <Search size={19} />
            </button>
          </div>
        </div>

        <Permissao nome="USUARIO_CRIAR">
          <button
            className="primary-button"
            onClick={() => navigate("/usuarios/novo")}
          >
            + Novo usuário
          </button>
        </Permissao>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table usuarios-table">
          <thead>
            <tr>
              <th>ID</th>

              <th
                onClick={() => ordenarPor("username")}
                style={{ cursor: "pointer" }}
              >
                Usuário{" "}
                {sort === "username" ? (direction === "asc" ? "↑" : "↓") : ""}
              </th>

              <th
                onClick={() => ordenarPor("email")}
                style={{ cursor: "pointer" }}
              >
                E-mail{" "}
                {sort === "email" ? (direction === "asc" ? "↑" : "↓") : ""}
              </th>

              <th>Perfil</th>

              <th>Status</th>

              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>

                <td className="name-cell">{usuario.username}</td>

                <td>{usuario.email}</td>

                <td>{usuario.perfilNome}</td>

                <td>
                  <span
                    className={
                      usuario.ativo ? "status active" : "status inactive"
                    }
                  >
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <Permissao nome="USUARIO_EDITAR">
                      <button
                        type="button"
                        className="icon-button edit-button"
                        onClick={() => navigate("/usuarios/" + usuario.id)}
                        title="Editar usuário"
                      >
                        <Pencil size={18} />
                      </button>
                    </Permissao>

                    <Permissao nome="USUARIO_EXCLUIR">
                      <button
                        type="button"
                        className="icon-button delete-button"
                        onClick={() => handleExcluir(usuario)}
                        title="Excluir usuário"
                      >
                        <Trash2 size={18} />
                      </button>
                    </Permissao>
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
          disabled={paginaAtual === 0 || carregando}
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
          disabled={paginaAtual >= totalPaginas - 1 || carregando}
        >
          Próxima →
        </button>
      </div>

      <ConfirmModal
        aberto={modalExcluirAberto}
        titulo="Excluir usuário?"
        mensagem={
          usuarioSelecionado
            ? "Deseja realmente excluir o usuário " +
              usuarioSelecionado.username +
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

export default Usuarios;
