import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  cadastrarTurma,
  buscarTurmaPorId,
  atualizarTurma,
} from "../services/turmaService";

import { listarProfessoresParaSelecao } from "../services/professorService";
import { listarModalidadesParaSelecao } from "../services/modalidadeService";

function TurmaForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [modalidadeId, setModalidadeId] = useState("");
  const [diasSemana, setDiasSemana] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [capacidade, setCapacidade] = useState("");
  const [ativa, setAtiva] = useState(true);

  const [professores, setProfessores] = useState([]);
  const [modalidades, setModalidades] = useState([]);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const [dadosProfessores, dadosModalidades] = await Promise.all([
          listarProfessoresParaSelecao(),
          listarModalidadesParaSelecao(),
        ]);

        setProfessores(dadosProfessores);
        setModalidades(dadosModalidades);

        if (id) {
          const turma = await buscarTurmaPorId(id);

          setNome(turma.nome);
          setProfessorId(String(turma.professorId));
          setModalidadeId(String(turma.modalidadeId));
          setDiasSemana(turma.diasSemana);
          setHorarioInicio(turma.horarioInicio);
          setHorarioFim(turma.horarioFim);
          setCapacidade(String(turma.capacidade));
          setAtiva(turma.ativa);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setErro(error.message);
      }
    }

    carregarDados();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!professorId) {
      setErro("Selecione o professor da turma.");
      return;
    }

    if (!modalidadeId) {
      setErro("Selecione a modalidade da turma.");
      return;
    }

    const turma = {
      nome,
      professorId: Number(professorId),
      modalidadeId: Number(modalidadeId),
      diasSemana,
      horarioInicio,
      horarioFim,
      capacidade: Number(capacidade),
      ativa,
    };

    try {
      if (id) {
        await atualizarTurma(id, turma);
      } else {
        await cadastrarTurma(turma);
      }

      setSucesso(
        id ? "Turma atualizada com sucesso!" : "Turma cadastrada com sucesso!",
      );

      setTimeout(() => {
        navigate("/turmas");
      }, 1000);
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
      setErro(error.message);
    }
  };

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>{id ? "Editar turma" : "Nova turma"}</h2>

          <p>
            {id
              ? "Altere os dados da turma."
              : "Cadastre uma nova turma na academia."}
          </p>
        </div>
      </div>

      <form className="form-container" onSubmit={handleSubmit}>
        {/* =========================
            MENSAGENS
        ========================== */}

        {erro && <div className="form-message error-message">{erro}</div>}

        {sucesso && (
          <div className="form-message success-message">{sucesso}</div>
        )}

        <div className="form-grid">
          {/* =========================
              DADOS DA TURMA
          ========================== */}

          <div className="form-group full-width">
            <label>Nome da turma</label>

            <input
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Digite o nome da turma"
            />
          </div>

          {/* PROFESSOR */}

          <div className="form-group">
            <label>Professor</label>

            <select
              value={professorId}
              onChange={(event) => setProfessorId(event.target.value)}
            >
              <option value="">Selecione o professor</option>

              {professores.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome}
                </option>
              ))}
            </select>
          </div>

          {/* MODALIDADE */}

          <div className="form-group">
            <label>Modalidade</label>

            <select
              value={modalidadeId}
              onChange={(event) => setModalidadeId(event.target.value)}
            >
              <option value="">Selecione a modalidade</option>

              {modalidades.map((modalidade) => (
                <option key={modalidade.id} value={modalidade.id}>
                  {modalidade.nome}
                </option>
              ))}
            </select>
          </div>

          {/* DIAS */}

          <div className="form-group full-width">
            <label>Dias da semana</label>

            <input
              type="text"
              value={diasSemana}
              onChange={(event) => setDiasSemana(event.target.value)}
              placeholder="Ex.: Segunda, Quarta e Sexta"
            />
          </div>

          {/* HORÁRIO INICIAL */}

          <div className="form-group">
            <label>Horário inicial</label>

            <input
              type="time"
              value={horarioInicio}
              onChange={(event) => setHorarioInicio(event.target.value)}
            />
          </div>

          {/* HORÁRIO FINAL */}

          <div className="form-group">
            <label>Horário final</label>

            <input
              type="time"
              value={horarioFim}
              onChange={(event) => setHorarioFim(event.target.value)}
            />
          </div>

          {/* CAPACIDADE */}

          <div className="form-group">
            <label>Capacidade</label>

            <input
              type="number"
              min="1"
              value={capacidade}
              onChange={(event) => setCapacidade(event.target.value)}
              placeholder="Ex.: 30"
            />
          </div>

          {/* SITUAÇÃO */}

          <div className="form-group">
            <label>Situação</label>

            <select
              value={ativa ? "true" : "false"}
              onChange={(event) => setAtiva(event.target.value === "true")}
            >
              <option value="true">Ativa</option>
              <option value="false">Inativa</option>
            </select>
          </div>
        </div>

        {/* =========================
            AÇÕES
        ========================== */}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/turmas")}
          >
            Cancelar
          </button>

          <button type="submit" className="primary-button">
            {id ? "Atualizar turma" : "Salvar turma"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default TurmaForm;
