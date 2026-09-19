import { useEffect, useState } from "react";

import { listarGraduacoesPorModalidade } from "../services/graduacaoService";
import { cadastrarHistoricoGraduacao } from "../services/historicoGraduacaoService";
import { listarMatriculasAtivasPorAluno } from "../services/matriculaService";

function HistoricoGraduacaoForm({ alunoId, onCancelar, onSucesso }) {
  const [modalidades, setModalidades] = useState([]);
  const [graduacoes, setGraduacoes] = useState([]);

  const [modalidadeId, setModalidadeId] = useState("");
  const [graduacaoId, setGraduacaoId] = useState("");
  const [grau, setGrau] = useState("0");
  const [data, setData] = useState("");
  const [observacao, setObservacao] = useState("");

  const [carregandoModalidades, setCarregandoModalidades] = useState(true);

  const [carregandoGraduacoes, setCarregandoGraduacoes] = useState(false);

  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    async function carregarModalidades() {
      try {
        setCarregandoModalidades(true);
        setErro("");

        const matriculas = await listarMatriculasAtivasPorAluno(
          Number(alunoId),
        );

        const modalidadesMap = new Map();

        matriculas.forEach((matricula) => {
          if (matricula.modalidadeId != null && matricula.modalidadeNome) {
            modalidadesMap.set(matricula.modalidadeId, {
              id: matricula.modalidadeId,
              nome: matricula.modalidadeNome,
            });
          }
        });

        setModalidades(Array.from(modalidadesMap.values()));
      } catch (error) {
        setModalidades([]);
        setErro(error.message);
      } finally {
        setCarregandoModalidades(false);
      }
    }

    carregarModalidades();
  }, [alunoId]);

  useEffect(() => {
    if (!modalidadeId) {
      setGraduacoes([]);
      setGraduacaoId("");
      setGrau("0");
      return;
    }

    async function carregarGraduacoes() {
      try {
        setCarregandoGraduacoes(true);
        setErro("");

        const dados = await listarGraduacoesPorModalidade(modalidadeId);

        setGraduacoes(dados);
        setGraduacaoId("");
        setGrau("0");
      } catch (error) {
        setGraduacoes([]);
        setGraduacaoId("");
        setErro(error.message);
      } finally {
        setCarregandoGraduacoes(false);
      }
    }

    carregarGraduacoes();
  }, [modalidadeId]);

  useEffect(() => {
    if (!graduacaoId) {
      setGrau("0");
      return;
    }

    const graduacao = graduacoes.find(
      (item) => String(item.id) === String(graduacaoId),
    );

    if (graduacao && graduacao.quantidadeGraus === 0) {
      setGrau("0");
    }
  }, [graduacaoId, graduacoes]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const historico = {
      alunoId: Number(alunoId),
      graduacaoId: Number(graduacaoId),
      grau: Number(grau),
      data,
      observacao,
    };

    try {
      setSalvando(true);

      await cadastrarHistoricoGraduacao(historico);

      setSucesso("Graduação registrada com sucesso!");

      setTimeout(() => {
        onSucesso();
      }, 1000);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const graduacaoSelecionada = graduacoes.find(
    (graduacao) => String(graduacao.id) === String(graduacaoId),
  );

  const quantidadeGraus = graduacaoSelecionada?.quantidadeGraus ?? 0;

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      {erro && <div className="form-message error-message">{erro}</div>}

      {sucesso && <div className="form-message success-message">{sucesso}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label>Modalidade</label>

          <select
            value={modalidadeId}
            onChange={(event) => setModalidadeId(event.target.value)}
            disabled={carregandoModalidades || salvando}
            required
          >
            <option value="">
              {carregandoModalidades
                ? "Carregando..."
                : modalidades.length === 0
                  ? "Aluno sem matrícula ativa"
                  : "Selecione a modalidade"}
            </option>

            {modalidades.map((modalidade) => (
              <option key={modalidade.id} value={modalidade.id}>
                {modalidade.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Graduação</label>

          <select
            value={graduacaoId}
            onChange={(event) => setGraduacaoId(event.target.value)}
            disabled={!modalidadeId || carregandoGraduacoes || salvando}
            required
          >
            <option value="">
              {!modalidadeId
                ? "Selecione a modalidade primeiro"
                : carregandoGraduacoes
                  ? "Carregando..."
                  : "Selecione a graduação"}
            </option>

            {graduacoes.map((graduacao) => (
              <option key={graduacao.id} value={graduacao.id}>
                {graduacao.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Grau</label>

          <input
            type="number"
            min="0"
            max={quantidadeGraus}
            value={grau}
            onChange={(event) => setGrau(event.target.value)}
            disabled={!graduacaoId || quantidadeGraus === 0 || salvando}
            required
          />

          {graduacaoSelecionada && (
            <small>Máximo permitido: {quantidadeGraus}</small>
          )}
        </div>

        <div className="form-group">
          <label>Data</label>

          <input
            type="date"
            value={data}
            onChange={(event) => setData(event.target.value)}
            disabled={salvando}
            required
          />
        </div>

        <div className="form-group full-width">
          <label>Observação</label>

          <textarea
            value={observacao}
            onChange={(event) => setObservacao(event.target.value)}
            placeholder="Digite uma observação, se necessário"
            rows="4"
            disabled={salvando}
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onCancelar}
          disabled={salvando}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="primary-button"
          disabled={
            salvando ||
            modalidades.length === 0 ||
            !modalidadeId ||
            !graduacaoId ||
            !data
          }
        >
          {salvando ? "Registrando..." : "Registrar graduação"}
        </button>
      </div>
    </form>
  );
}

export default HistoricoGraduacaoForm;
