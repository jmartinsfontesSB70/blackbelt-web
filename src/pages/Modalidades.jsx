import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Search, GraduationCap } from "lucide-react";

import Permissao from "../components/Permissao";

import {
  listarModalidades,
  excluirModalidade,
} from "../services/modalidadeService";

import ConfirmModal from "../components/ConfirmModal";

function Modalidades() {
  const navigate = useNavigate();

  const [modalidades, setModalidades] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const [textoPesquisa, setTextoPesquisa] = useState("");
  const [pesquisa, setPesquisa] = useState("");

  const [sort, setSort] = useState("id");
  const [direction, setDirection] = useState("desc");

  async function carregarModalidades() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarModalidades(
        paginaAtual,
        10,
        pesquisa,
        sort,
        direction,
      );

      setModalidades(dados.content);
      setTotalPaginas(dados.totalPages);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarModalidades();
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

  function handleExcluir(modalidade) {
    setModalidadeSelecionada(modalidade);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!modalidadeSelecionada) {
      return;
    }

    try {
      setExcluindo(true);
      setErro("");

      await excluirModalidade(modalidadeSelecionada.id);

      setModalExcluirAberto(false);
      setModalidadeSelecionada(null);

      if (modalidades.length === 1 && paginaAtual > 0) {
        setPaginaAtual(paginaAtual - 1);
      } else {
        await carregarModalidades();
      }
    } catch (error) {
      setModalExcluirAberto(false);
      setModalidadeSelecionada(null);
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
    setModalidadeSelecionada(null);
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
        <h2>Modalidades</h2>
        <p>Carregando modalidades...</p>
      </main>
    );
  }

  if (erro && modalidades.length === 0) {
    return (
      <main className="main">
        <h2>Modalidades</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Modalidades</h2>

          <p>Gerencie as modalidades cadastradas na academia.</p>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Pesquisar modalidade..."
              value={textoPesquisa}
              onChange={(event) => setTextoPesquisa(event.target.value)}
              onKeyDown={handlePesquisaKeyDown}
            />

            <button
              type="button"
              className="search-button"
              onClick={executarPesquisa}
              title="Pesquisar"
              aria-label="Pesquisar modalidade"
            >
              <Search size={19} />
            </button>
          </div>
        </div>

        <Permissao nome="MODALIDADE_CRIAR">
          <button
            className="primary-button"
            onClick={() => navigate("/modalidades/nova")}
          >
            + Nova modalidade
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
                Nome {sort === "nome" ? (direction === "asc" ? "↑" : "↓") : ""}
              </th>

              <th>Descrição</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {modalidades.map((modalidade) => (
              <tr key={modalidade.id}>
                <td>{modalidade.id}</td>

                <td className="name-cell">{modalidade.nome}</td>

                <td>{modalidade.descricao || ""}</td>

                <td>
                  <span
                    className={
                      modalidade.ativa ? "status active" : "status inactive"
                    }
                  >
                    {modalidade.ativa ? "Ativa" : "Inativa"}
                  </span>
                </td>

                <td>
                  <div className="action-buttons graduation-button">
                    <button
                      type="button"
                      className="icon-button edit-button"
                      onClick={() =>
                        navigate(
                          "/modalidades/" + modalidade.id + "/graduacoes",
                        )
                      }
                      title="Gerenciar graduações"
                      aria-label="Gerenciar graduações"
                    >
                      <GraduationCap size={18} />
                    </button>

                    <Permissao nome="MODALIDADE_EDITAR">
                      <button
                        type="button"
                        className="icon-button edit-button"
                        onClick={() =>
                          navigate("/modalidades/" + modalidade.id)
                        }
                        title="Editar modalidade"
                      >
                        <Pencil size={18} />
                      </button>
                    </Permissao>

                    <Permissao nome="MODALIDADE_EXCLUIR">
                      <button
                        type="button"
                        className="icon-button delete-button"
                        onClick={() => handleExcluir(modalidade)}
                        title="Excluir modalidade"
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
        titulo="Excluir modalidade?"
        mensagem={
          modalidadeSelecionada
            ? "Deseja realmente excluir a modalidade " +
              modalidadeSelecionada.nome +
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

export default Modalidades;
