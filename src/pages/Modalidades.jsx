import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import Permissao from "../components/Permissao";

import {
  listarModalidades,
  excluirModalidade,
} from "../services/modalidadeService";

import ConfirmModal from "../components/ConfirmModal";

const Modalidades = () => {
  const navigate = useNavigate();

  const [modalidades, setModalidades] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarModalidades() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarModalidades(paginaAtual, 10);

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
  }, [paginaAtual]);

  const handleExcluir = (modalidade) => {
    setErro("");
    setModalidadeSelecionada(modalidade);
    setModalExcluirAberto(true);
  };

  const confirmarExclusao = async () => {
    if (!modalidadeSelecionada) {
      return;
    }

    const id = modalidadeSelecionada.id;

    try {
      setExcluindo(true);
      setErro("");

      await excluirModalidade(id);

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
  };

  const cancelarExclusao = () => {
    if (excluindo) {
      return;
    }

    setModalExcluirAberto(false);
    setModalidadeSelecionada(null);
  };

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
              <th>Nome</th>
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
                  <div className="action-buttons">
                    <Permissao nome="MODALIDADE_EDITAR">
                      <button
                        type="button"
                        className="edit-button"
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
                        className="btn-delete"
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
};

export default Modalidades;
