import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import {
  listarMatriculas,
  excluirMatricula,
} from "../services/matriculaService";

import ConfirmModal from "../components/ConfirmModal";
import Permissao from "../components/Permissao";

function formatarData(data) {
  if (!data) {
    return "";
  }

  const partes = data.split("-");

  const ano = partes[0];
  const mes = partes[1];
  const dia = partes[2];

  return dia + "/" + mes + "/" + ano;
}

function Matriculas() {
  const navigate = useNavigate();

  const [matriculas, setMatriculas] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [matriculaSelecionada, setMatriculaSelecionada] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarMatriculas() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarMatriculas(paginaAtual, 10);

      setMatriculas(dados.content);
      setTotalPaginas(dados.totalPages);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarMatriculas();
  }, [paginaAtual]);

  function handleExcluir(matricula) {
    setErro("");
    setMatriculaSelecionada(matricula);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!matriculaSelecionada) {
      return;
    }

    const id = matriculaSelecionada.id;

    try {
      setExcluindo(true);
      setErro("");

      await excluirMatricula(id);

      setModalExcluirAberto(false);
      setMatriculaSelecionada(null);

      if (matriculas.length === 1 && paginaAtual > 0) {
        setPaginaAtual(paginaAtual - 1);
      } else {
        await carregarMatriculas();
      }
    } catch (error) {
      /*
       * A exclusão pode ser recusada pelo backend.
       * Exemplo: matrícula possui registros de presença.
       *
       * Nesse caso fechamos o modal e mostramos
       * a mensagem retornada pela API.
       */
      setModalExcluirAberto(false);
      setMatriculaSelecionada(null);
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
    setMatriculaSelecionada(null);
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
        <h2>Matrículas</h2>
        <p>Carregando matrículas...</p>
      </main>
    );
  }

  if (erro && matriculas.length === 0) {
    return (
      <main className="main">
        <h2>Matrículas</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Matrículas</h2>
          <p>Gerencie as matrículas dos alunos nas turmas.</p>
        </div>

        <Permissao nome="MATRICULA_CRIAR">
          <button
            className="primary-button"
            onClick={() => navigate("/matriculas/nova")}
          >
            + Nova matrícula
          </button>
        </Permissao>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Aluno</th>
              <th>Turma</th>
              <th>Data matrícula</th>
              <th>Situação</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {matriculas.map((matricula) => {
              return (
                <tr key={matricula.id}>
                  <td>{matricula.id}</td>

                  <td className="name-cell">{matricula.alunoNome}</td>

                  <td>{matricula.turmaNome}</td>

                  <td>{formatarData(matricula.dataMatricula)}</td>

                  <td>
                    <span
                      className={
                        matricula.ativa ? "status active" : "status inactive"
                      }
                    >
                      {matricula.ativa ? "Ativa" : "Inativa"}
                    </span>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <Permissao nome="MATRICULA_EDITAR">
                        <button
                          type="button"
                          className="icon-button edit-button"
                          onClick={() =>
                            navigate("/matriculas/" + matricula.id)
                          }
                          title="Editar matrícula"
                        >
                          <Pencil size={18} />
                        </button>
                      </Permissao>

                      <Permissao nome="MATRICULA_EXCLUIR">
                        <button
                          type="button"
                          className="btn-action btn-delete"
                          onClick={() => handleExcluir(matricula)}
                          title="Excluir matrícula"
                        >
                          <Trash2 size={18} />
                        </button>
                      </Permissao>
                    </div>
                  </td>
                </tr>
              );
            })}
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
        titulo="Excluir matrícula?"
        mensagem={
          matriculaSelecionada
            ? "Deseja excluir a matrícula de " +
              matriculaSelecionada.alunoNome +
              " na turma " +
              matriculaSelecionada.turmaNome +
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

export default Matriculas;
