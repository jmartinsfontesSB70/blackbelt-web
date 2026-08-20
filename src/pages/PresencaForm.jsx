import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  cadastrarPresenca,
  buscarPresencaPorId,
  atualizarPresenca,
} from "../services/presencaService";

import { listarMatriculasParaSelecao } from "../services/matriculaService";

function obterDataAtual() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function PresencaForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modoEdicao = Boolean(id);

  const [matriculas, setMatriculas] = useState([]);
  const [matriculaId, setMatriculaId] = useState("");
  const [data, setData] = useState("");
  const [presente, setPresente] = useState("true");
  const [observacao, setObservacao] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const matriculas = await listarMatriculasParaSelecao();

        const matriculasAtivas = matriculas.filter(
          (matricula) => matricula.ativa,
        );

        setMatriculas(matriculasAtivas);

        if (modoEdicao) {
          const presenca = await buscarPresencaPorId(id);

          setMatriculaId(String(presenca.matriculaId));
          setData(presenca.data);
          setPresente(String(presenca.presente));
          setObservacao(presenca.observacao || "");
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

    if (!matriculaId) {
      setErro("A matrícula da presença deve ser informada.");
      setSalvando(false);
      return;
    }

    if (!data) {
      setErro("A data da presença deve ser informada.");
      setSalvando(false);
      return;
    }

    if (data > obterDataAtual()) {
      setErro("A data da presença não pode ser futura.");
      setSalvando(false);
      return;
    }

    try {
      const dados = {
        matriculaId: Number(matriculaId),
        data,
        presente: presente === "true",
        observacao: observacao.trim() || null,
      };

      if (modoEdicao) {
        await atualizarPresenca(id, dados);

        setSucesso("Presença atualizada com sucesso!");
      } else {
        await cadastrarPresenca(dados);

        setSucesso("Presença cadastrada com sucesso!");
      }

      setTimeout(() => {
        navigate("/presencas");
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
        <h2>{modoEdicao ? "Editar presença" : "Nova presença"}</h2>
        <p>
          {modoEdicao
            ? "Carregando dados da presença..."
            : "Carregando matrículas..."}
        </p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>{modoEdicao ? "Editar presença" : "Nova presença"}</h2>

          <p>
            {modoEdicao
              ? "Altere os dados do registro de presença."
              : "Registre a presença de um aluno na aula."}
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
              <h3>Registro da presença</h3>
              <p>Informe o aluno, a data e a situação da presença.</p>
            </div>

            <div className="form-group full-width">
              <label htmlFor="matriculaId">Aluno / Turma</label>

              <select
                id="matriculaId"
                value={matriculaId}
                onChange={(event) => setMatriculaId(event.target.value)}
                disabled={salvando}
              >
                <option value="">Selecione o aluno e a turma</option>

                {matriculas.map((matricula) => (
                  <option key={matricula.id} value={matricula.id}>
                    {matricula.alunoNome} - {matricula.turmaNome}
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="presente">Presença</label>

              <select
                id="presente"
                value={presente}
                onChange={(event) => setPresente(event.target.value)}
                required
                disabled={salvando}
              >
                <option value="true">Presente</option>

                <option value="false">Ausente</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="observacao">Observação</label>

              <textarea
                id="observacao"
                value={observacao}
                onChange={(event) => setObservacao(event.target.value)}
                maxLength={300}
                rows={4}
                placeholder="Digite uma observação, se necessário..."
                disabled={salvando}
              />

              <small className="character-counter">
                {observacao.length}/300
              </small>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/presencas")}
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
                  ? "Atualizar presença"
                  : "Cadastrar presença"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default PresencaForm;
