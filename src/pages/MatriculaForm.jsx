import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  cadastrarMatricula,
  buscarMatriculaPorId,
  atualizarMatricula,
} from "../services/matriculaService";

import { listarAlunosParaSelecao } from "../services/alunoService";
import { listarTurmasParaSelecao } from "../services/turmaService";

function obterDataAtual() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function MatriculaForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicao = Boolean(id);

  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);

  const [alunoId, setAlunoId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [dataMatricula, setDataMatricula] = useState("");
  const [ativa, setAtiva] = useState("true");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const [dadosAlunos, dadosTurmas] = await Promise.all([
          listarAlunosParaSelecao(),
          listarTurmasParaSelecao(),
        ]);

        const alunosAtivos = dadosAlunos.filter((aluno) => aluno.ativo);

        const turmasAtivas = dadosTurmas.filter((turma) => turma.ativa);

        setAlunos(alunosAtivos);
        setTurmas(turmasAtivas);

        if (modoEdicao) {
          const matricula = await buscarMatriculaPorId(id);

          setAlunoId(String(matricula.alunoId));
          setTurmaId(String(matricula.turmaId));
          setDataMatricula(matricula.dataMatricula);
          setAtiva(String(matricula.ativa));
        }
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id, modoEdicao]);

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setSalvando(true);

    if (!alunoId) {
      setErro("O aluno da matrícula deve ser informado.");
      setSalvando(false);
      return;
    }

    if (!turmaId) {
      setErro("A turma da matrícula deve ser informada.");
      setSalvando(false);
      return;
    }

    try {
      const dados = {
        alunoId: Number(alunoId),
        turmaId: Number(turmaId),
        dataMatricula,
        ativa: ativa === "true",
      };

      if (modoEdicao) {
        await atualizarMatricula(id, dados);

        setSucesso("Matrícula atualizada com sucesso!");
      } else {
        await cadastrarMatricula(dados);

        setSucesso("Matrícula cadastrada com sucesso!");
      }

      setTimeout(() => {
        navigate("/matriculas");
      }, 800);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>{modoEdicao ? "Editar matrícula" : "Nova matrícula"}</h2>

        <p>
          {modoEdicao
            ? "Carregando dados da matrícula..."
            : "Carregando alunos e turmas..."}
        </p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>{modoEdicao ? "Editar matrícula" : "Nova matrícula"}</h2>

          <p>
            {modoEdicao
              ? "Altere os dados da matrícula."
              : "Cadastre um aluno em uma turma."}
          </p>
        </div>
      </div>

      <div className="form-container">
        {erro && <div className="form-message error-message">{erro}</div>}

        {sucesso && (
          <div className="form-message success-message">{sucesso}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-section-title">
              <h3>Dados da matrícula</h3>

              <p>Selecione o aluno, a turma e informe a situação.</p>
            </div>

            <div className="form-group full-width">
              <label htmlFor="alunoId">Aluno</label>

              <select
                id="alunoId"
                value={alunoId}
                onChange={(event) => setAlunoId(event.target.value)}
                disabled={salvando}
              >
                <option value="">Selecione o aluno</option>

                {alunos.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="turmaId">Turma</label>

              <select
                id="turmaId"
                value={turmaId}
                onChange={(event) => setTurmaId(event.target.value)}
                disabled={salvando}
              >
                <option value="">Selecione a turma</option>

                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dataMatricula">Data da matrícula</label>

              <input
                id="dataMatricula"
                type="date"
                value={dataMatricula}
                onChange={(event) => setDataMatricula(event.target.value)}
                max={obterDataAtual()}
                required
                disabled={salvando}
              />
            </div>

            <div className="form-group">
              <label htmlFor="ativa">Situação</label>

              <select
                id="ativa"
                value={ativa}
                onChange={(event) => setAtiva(event.target.value)}
                required
                disabled={salvando}
              >
                <option value="true">Ativa</option>
                <option value="false">Inativa</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/matriculas")}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={salvando}
            >
              {salvando
                ? "Salvando..."
                : modoEdicao
                  ? "Atualizar matrícula"
                  : "Salvar matrícula"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default MatriculaForm;
