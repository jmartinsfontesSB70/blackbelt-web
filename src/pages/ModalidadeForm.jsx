import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  cadastrarModalidade,
  buscarModalidadePorId,
  atualizarModalidade,
} from "../services/modalidadeService";

const ModalidadeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ativa, setAtiva] = useState(true);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    const carregarModalidade = async () => {
      try {
        const modalidade = await buscarModalidadePorId(id);

        setNome(modalidade.nome);
        setDescricao(modalidade.descricao || "");
        setAtiva(modalidade.ativa);
      } catch (error) {
        setErro(error.message);
      }
    };

    carregarModalidade();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const modalidade = {
      nome,
      descricao,
      ativa,
    };

    try {
      if (id) {
        await atualizarModalidade(id, modalidade);

        setSucesso("Modalidade atualizada com sucesso!");
      } else {
        await cadastrarModalidade(modalidade);

        setSucesso("Modalidade cadastrada com sucesso!");
      }

      setTimeout(() => {
        navigate("/modalidades");
      }, 1000);
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>{id ? "Editar modalidade" : "Nova modalidade"}</h2>

          <p>
            {id
              ? "Altere os dados da modalidade."
              : "Cadastre uma nova modalidade na academia."}
          </p>
        </div>
      </div>

      <form className="form-container" onSubmit={handleSubmit}>
        {erro && <div className="form-message error-message">{erro}</div>}

        {sucesso && (
          <div className="form-message success-message">{sucesso}</div>
        )}

        <div className="form-grid">
          <div className="form-group full-width">
            <label>Nome</label>

            <input
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Digite o nome da modalidade"
            />
          </div>

          <div className="form-group full-width">
            <label>Descrição</label>

            <textarea
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Digite uma descrição para a modalidade"
              rows="5"
            />
          </div>

          <div className="form-group">
            <label>Situação</label>

            <select
              value={ativa}
              onChange={(event) => setAtiva(event.target.value === "true")}
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
            onClick={() => navigate("/modalidades")}
          >
            Cancelar
          </button>

          <button type="submit" className="primary-button">
            {id ? "Atualizar modalidade" : "Salvar modalidade"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default ModalidadeForm;
