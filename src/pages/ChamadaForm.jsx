import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { listarTurmasParaSelecao } from "../services/turmaService";
import { listarMatriculasAtivasPorTurma } from "../services/matriculaService";
import {
  registrarChamada,
  listarPresencasPorTurmaEData,
} from "../services/presencaService";

function obterDataAtual() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function ChamadaForm() {
  const navigate = useNavigate();

  const [turmas, setTurmas] = useState([]);
  const [matriculas, setMatriculas] = useState([]);

  const [turmaId, setTurmaId] = useState("");
  const [data, setData] = useState(obterDataAtual());
  const [matriculasPresentes, setMatriculasPresentes] = useState([]);

  const [carregandoTurmas, setCarregandoTurmas] = useState(true);
  const [carregandoMatriculas, setCarregandoMatriculas] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregarTurmas() {
      try {
        setErro("");

        const dados = await listarTurmasParaSelecao();

        setTurmas(dados);
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregandoTurmas(false);
      }
    }

    carregarTurmas();
  }, []);

  useEffect(() => {
    async function carregarDadosChamada() {
      if (!turmaId || !data) {
        setMatriculas([]);
        setMatriculasPresentes([]);
        return;
      }

      try {
        setCarregandoMatriculas(true);
        setErro("");
        setSucesso("");

        const [dadosMatriculas, dadosPresencas] = await Promise.all([
          listarMatriculasAtivasPorTurma(turmaId, data),
          listarPresencasPorTurmaEData(turmaId, data),
        ]);

        setMatriculas(dadosMatriculas);

        const idsPresentes = dadosPresencas
          .filter((presenca) => presenca.presente === true)
          .map((presenca) => presenca.matriculaId);

        setMatriculasPresentes(idsPresentes);
      } catch (error) {
        setMatriculas([]);
        setMatriculasPresentes([]);
        setErro(error.message);
      } finally {
        setCarregandoMatriculas(false);
      }
    }

    carregarDadosChamada();
  }, [turmaId, data]);

  function handleTurmaChange(event) {
    setTurmaId(event.target.value);
  }

  function alternarPresenca(matriculaId) {
    setMatriculasPresentes((atual) => {
      if (atual.includes(matriculaId)) {
        return atual.filter((id) => id !== matriculaId);
      }

      return [...atual, matriculaId];
    });
  }

  function marcarTodos() {
    setMatriculasPresentes(matriculas.map((matricula) => matricula.id));
  }

  function desmarcarTodos() {
    setMatriculasPresentes([]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!turmaId) {
      setErro("A turma da chamada deve ser informada.");
      return;
    }

    if (!data) {
      setErro("A data da chamada deve ser informada.");
      return;
    }

    if (data > obterDataAtual()) {
      setErro("A data da chamada não pode ser futura.");
      return;
    }

    try {
      setSalvando(true);

      const dados = {
        turmaId: Number(turmaId),
        data,
        matriculaIdsPresentes: matriculasPresentes,
      };

      await registrarChamada(dados);

      setSucesso("Chamada registrada com sucesso!");

      setTimeout(() => {
        navigate("/presencas");
      }, 800);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregandoTurmas) {
    return (
      <main className="main chamada-page">
        <div className="chamada-loading">
          <div className="chamada-loading-spinner"></div>
          <span>Carregando turmas...</span>
        </div>
      </main>
    );
  }

  const totalAlunos = matriculas.length;
  const totalPresentes = matriculasPresentes.length;
  const totalAusentes = totalAlunos - totalPresentes;

  return (
    <main className="main chamada-page">
      <div className="page-header chamada-page-header">
        <div>
          <h2>Chamada</h2>
          <p>Registre e atualize a presença dos alunos da turma.</p>
        </div>
      </div>

      <div className="form-container chamada-container">
        {erro && <div className="form-message error-message">{erro}</div>}

        {sucesso && (
          <div className="form-message success-message">{sucesso}</div>
        )}

        <form onSubmit={handleSubmit}>
          <section className="chamada-filtros">
            <div className="chamada-section-heading">
              <div className="chamada-section-icon">01</div>

              <div>
                <h3>Dados da chamada</h3>
                <p>Selecione a turma e a data da aula.</p>
              </div>
            </div>

            <div className="chamada-filtros-grid">
              <div className="form-group">
                <label htmlFor="turmaId">Turma</label>

                <select
                  id="turmaId"
                  value={turmaId}
                  onChange={handleTurmaChange}
                  disabled={salvando || carregandoMatriculas}
                  required
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
                <label htmlFor="data">Data</label>

                <input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(event) => setData(event.target.value)}
                  max={obterDataAtual()}
                  disabled={salvando}
                  required
                />
              </div>
            </div>
          </section>

          {turmaId && (
            <section className="chamada-alunos-section">
              <div className="chamada-alunos-header">
                <div className="chamada-section-heading chamada-section-heading-alunos">
                  <div className="chamada-section-icon">02</div>

                  <div>
                    <h3>Alunos da turma</h3>
                    <p>
                      Marque os alunos presentes. Os demais serão registrados
                      como ausentes.
                    </p>
                  </div>
                </div>

                {!carregandoMatriculas && matriculas.length > 0 && (
                  <div className="chamada-resumo">
                    <div className="chamada-resumo-item">
                      <strong>{totalAlunos}</strong>
                      <span>Alunos</span>
                    </div>

                    <div className="chamada-resumo-item presente">
                      <strong>{totalPresentes}</strong>
                      <span>Presentes</span>
                    </div>

                    <div className="chamada-resumo-item ausente">
                      <strong>{totalAusentes}</strong>
                      <span>Ausentes</span>
                    </div>
                  </div>
                )}
              </div>

              {carregandoMatriculas ? (
                <div className="chamada-loading chamada-loading-lista">
                  <div className="chamada-loading-spinner"></div>
                  <span>Carregando alunos...</span>
                </div>
              ) : matriculas.length === 0 ? (
                <div className="chamada-vazia">
                  <strong>Nenhuma matrícula encontrada</strong>
                  <span>
                    Não existem matrículas ativas para esta turma nesta data.
                  </span>
                </div>
              ) : (
                <>
                  <div className="chamada-list-actions">
                    <button
                      type="button"
                      className="chamada-action-button"
                      onClick={marcarTodos}
                      disabled={salvando}
                    >
                      Marcar todos
                    </button>

                    <button
                      type="button"
                      className="chamada-action-button"
                      onClick={desmarcarTodos}
                      disabled={salvando}
                    >
                      Desmarcar todos
                    </button>
                  </div>

                  <div className="chamada-lista">
                    {matriculas.map((matricula) => {
                      const presente = matriculasPresentes.includes(
                        matricula.id,
                      );

                      return (
                        <label
                          key={matricula.id}
                          className={`chamada-aluno ${
                            presente ? "presente" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={presente}
                            onChange={() => alternarPresenca(matricula.id)}
                            disabled={salvando}
                          />

                          <span className="chamada-checkbox"></span>

                          <span className="chamada-aluno-info">
                            <strong>{matricula.alunoNome}</strong>
                            <small>{presente ? "Presente" : "Ausente"}</small>
                          </span>

                          <span
                            className={`chamada-status ${
                              presente ? "presente" : "ausente"
                            }`}
                          >
                            {presente ? "Presente" : "Ausente"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          )}

          <div className="chamada-form-actions">
            <button
              type="button"
              className="secondary-button chamada-cancelar"
              onClick={() => navigate("/presencas")}
              disabled={salvando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="primary-button chamada-salvar"
              disabled={
                salvando ||
                carregandoMatriculas ||
                !turmaId ||
                matriculas.length === 0
              }
            >
              {salvando ? "Salvando..." : "Registrar chamada"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default ChamadaForm;
