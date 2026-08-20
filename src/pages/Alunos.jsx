import { useEffect, useState } from "react";
import { listarAlunos, excluirAluno } from "../services/alunoService";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import ConfirmModal from "../components/ConfirmModal";

import Permissao from "../components/Permissao";

function formatarCpf(cpf) {
  if (!cpf) {
    return "";
  }

  const numeros = cpf.replace(/\D/g, "");

  if (numeros.length !== 11) {
    return cpf;
  }

  return (
    numeros.slice(0, 3) +
    "." +
    numeros.slice(3, 6) +
    "." +
    numeros.slice(6, 9) +
    "-" +
    numeros.slice(9)
  );
}

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

function formatarTelefone(telefone) {
  if (!telefone) {
    return "";
  }

  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 11) {
    return (
      "(" +
      numeros.slice(0, 2) +
      ") " +
      numeros.slice(2, 7) +
      "-" +
      numeros.slice(7)
    );
  }

  if (numeros.length === 10) {
    return (
      "(" +
      numeros.slice(0, 2) +
      ") " +
      numeros.slice(2, 6) +
      "-" +
      numeros.slice(6)
    );
  }

  return telefone;
}

function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  const navigate = useNavigate();

  async function carregarAlunos() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarAlunos(paginaAtual, 10);

      setAlunos(dados.content);
      setTotalPaginas(dados.totalPages);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAlunos();
  }, [paginaAtual]);

  function handleExcluir(aluno) {
    setAlunoSelecionado(aluno);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!alunoSelecionado) {
      return;
    }

    try {
      setExcluindo(true);
      setErro("");

      await excluirAluno(alunoSelecionado.id);

      setModalExcluirAberto(false);
      setAlunoSelecionado(null);

      if (alunos.length === 1 && paginaAtual > 0) {
        setPaginaAtual(paginaAtual - 1);
      } else {
        await carregarAlunos();
      }
    } catch (error) {
      setModalExcluirAberto(false);
      setAlunoSelecionado(null);
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
    setAlunoSelecionado(null);
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
        <h2>Alunos</h2>
        <p>Carregando alunos...</p>
      </main>
    );
  }

  if (erro && alunos.length === 0) {
    return (
      <main className="main">
        <h2>Alunos</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Alunos</h2>

          <p>Gerencie os alunos cadastrados na academia.</p>
        </div>

        <Permissao nome="ALUNO_CRIAR">
          <button
            className="primary-button"
            onClick={() => navigate("/alunos/novo")}
          >
            + Novo aluno
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
              <th>CPF</th>
              <th>Data nascimento</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {alunos.map((aluno) => (
              <tr key={aluno.id}>
                <td>{aluno.id}</td>

                <td className="name-cell">{aluno.nome}</td>

                <td>{formatarCpf(aluno.cpf)}</td>

                <td>{formatarData(aluno.dataNascimento)}</td>

                <td>{formatarTelefone(aluno.telefone)}</td>

                <td>
                  <span
                    className={
                      aluno.ativo ? "status active" : "status inactive"
                    }
                  >
                    {aluno.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">
                    <Permissao nome="ALUNO_EDITAR">
                      <button
                        type="button"
                        className="icon-button edit-button"
                        onClick={() => navigate("/alunos/" + aluno.id)}
                        title="Editar aluno"
                      >
                        <Pencil size={18} />
                      </button>
                    </Permissao>

                    <Permissao nome="ALUNO_EXCLUIR">
                      <button
                        type="button"
                        className="icon-button delete-button"
                        onClick={() => handleExcluir(aluno)}
                        title="Excluir aluno"
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
        titulo="Excluir aluno?"
        mensagem={
          alunoSelecionado
            ? "Deseja realmente excluir o aluno " + alunoSelecionado.nome + "?"
            : ""
        }
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindo}
      />
    </main>
  );
}

export default Alunos;
