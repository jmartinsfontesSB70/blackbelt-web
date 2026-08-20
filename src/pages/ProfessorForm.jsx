import { useEffect, useState } from "react";
import {
  cadastrarProfessor,
  buscarProfessorPorId,
  atualizarProfessor,
} from "../services/professorService";
import { useNavigate, useParams } from "react-router-dom";

function formatarCpf(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 3) {
    return numeros;
  }

  if (numeros.length <= 6) {
    return numeros.slice(0, 3) + "." + numeros.slice(3);
  }

  if (numeros.length <= 9) {
    return (
      numeros.slice(0, 3) + "." + numeros.slice(3, 6) + "." + numeros.slice(6)
    );
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

function formatarTelefone(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 7) {
    return "(" + numeros.slice(0, 2) + ") " + numeros.slice(2);
  }

  return (
    "(" +
    numeros.slice(0, 2) +
    ") " +
    numeros.slice(2, 7) +
    "-" +
    numeros.slice(7)
  );
}

function ProfessorForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [dataContratacao, setDataContratacao] = useState("");
  const [valorHoraAula, setValorHoraAula] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [endereco, setEndereco] = useState({
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    pontoReferencia: "",
  });

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    async function carregarProfessor() {
      try {
        const professor = await buscarProfessorPorId(id);

        setNome(professor.nome);
        setDataNascimento(professor.dataNascimento);
        setCpf(formatarCpf(professor.cpf));
        setTelefone(formatarTelefone(professor.telefone));
        setEmail(professor.email);
        setDataContratacao(professor.dataContratacao);
        setValorHoraAula(professor.valorHoraAula);
        setAtivo(professor.ativo);

        setEndereco({
          rua: professor.endereco.rua,
          numero: professor.endereco.numero,
          bairro: professor.endereco.bairro,
          cidade: professor.endereco.cidade,
          estado: professor.endereco.estado,
          cep: professor.endereco.cep,
          pontoReferencia: professor.endereco.pontoReferencia,
        });
      } catch (error) {
        setErro(error.message);
      }
    }

    carregarProfessor();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const professor = {
      nome,
      dataNascimento,
      cpf: cpf.replace(/\D/g, ""),
      telefone: telefone.replace(/\D/g, ""),
      email,
      dataContratacao,
      valorHoraAula,
      ativo,
      endereco,
    };

    try {
      if (id) {
        await atualizarProfessor(id, professor);
      } else {
        await cadastrarProfessor(professor);
      }

      setSucesso(
        id
          ? "Professor atualizado com sucesso!"
          : "Professor cadastrado com sucesso!",
      );

      setTimeout(() => {
        navigate("/professores");
      }, 1000);
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>{id ? "Editar professor" : "Novo professor"}</h2>

          <p>
            {id
              ? "Altere os dados do professor."
              : "Cadastre um novo professor na academia."}
          </p>
        </div>
      </div>

      <form className="form-container" onSubmit={handleSubmit}>
        {erro && <div className="form-message error-message">{erro}</div>}

        {sucesso && (
          <div className="form-message success-message">{sucesso}</div>
        )}

        <div className="form-grid">
          {/* =========================
              DADOS PESSOAIS
          ========================== */}

          <div className="form-group">
            <label>Nome</label>

            <input
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Digite o nome completo"
            />
          </div>

          <div className="form-group">
            <label>CPF</label>

            <input
              type="text"
              value={cpf}
              onChange={(event) => setCpf(formatarCpf(event.target.value))}
              placeholder="000.000.000-00"
            />
          </div>

          <div className="form-group">
            <label>Data de nascimento</label>

            <input
              type="date"
              value={dataNascimento}
              onChange={(event) => setDataNascimento(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>

            <input
              type="text"
              value={telefone}
              onChange={(event) =>
                setTelefone(formatarTelefone(event.target.value))
              }
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="form-group full-width">
            <label>E-mail</label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="professor@email.com"
            />
          </div>

          {/* =========================
              DADOS PROFISSIONAIS
          ========================== */}

          <div className="form-section-title full-width">
            <h3>Dados profissionais</h3>

            <p>Informe os dados profissionais do professor.</p>
          </div>

          <div className="form-group">
            <label>Data de contratação</label>

            <input
              type="date"
              value={dataContratacao}
              onChange={(event) => setDataContratacao(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Valor da hora aula</label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={valorHoraAula}
              onChange={(event) => setValorHoraAula(event.target.value)}
              placeholder="0,00"
            />
          </div>

          <div className="form-group">
            <label>Situação</label>

            <select
              value={ativo}
              onChange={(event) => setAtivo(event.target.value === "true")}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          {/* =========================
              ENDEREÇO
          ========================== */}

          <div className="form-section-title full-width">
            <h3>Endereço</h3>

            <p>Informe o endereço do professor.</p>
          </div>

          <div className="form-group">
            <label>Rua</label>

            <input
              type="text"
              value={endereco.rua}
              onChange={(event) =>
                setEndereco({
                  ...endereco,
                  rua: event.target.value,
                })
              }
              placeholder="Digite a rua"
            />
          </div>

          <div className="form-group">
            <label>Número</label>

            <input
              type="text"
              value={endereco.numero}
              onChange={(event) =>
                setEndereco({
                  ...endereco,
                  numero: event.target.value,
                })
              }
              placeholder="Número"
            />
          </div>

          <div className="form-group">
            <label>Bairro</label>

            <input
              type="text"
              value={endereco.bairro}
              onChange={(event) =>
                setEndereco({
                  ...endereco,
                  bairro: event.target.value,
                })
              }
              placeholder="Digite o bairro"
            />
          </div>

          <div className="form-group">
            <label>CEP</label>

            <input
              type="text"
              value={endereco.cep}
              onChange={(event) =>
                setEndereco({
                  ...endereco,
                  cep: event.target.value,
                })
              }
              placeholder="00000-000"
            />
          </div>

          <div className="form-group">
            <label>Cidade</label>

            <input
              type="text"
              value={endereco.cidade}
              onChange={(event) =>
                setEndereco({
                  ...endereco,
                  cidade: event.target.value,
                })
              }
              placeholder="Digite a cidade"
            />
          </div>

          <div className="form-group">
            <label>Estado</label>

            <input
              type="text"
              value={endereco.estado}
              onChange={(event) =>
                setEndereco({
                  ...endereco,
                  estado: event.target.value,
                })
              }
              placeholder="UF"
              maxLength="2"
            />
          </div>

          <div className="form-group full-width">
            <label>Ponto de referência</label>

            <input
              type="text"
              value={endereco.pontoReferencia}
              onChange={(event) =>
                setEndereco({
                  ...endereco,
                  pontoReferencia: event.target.value,
                })
              }
              placeholder="Ex.: Próximo ao shopping"
            />
          </div>
        </div>

        {/* =========================
            AÇÕES
        ========================== */}

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/professores")}
          >
            Cancelar
          </button>

          <button type="submit" className="primary-button">
            {id ? "Atualizar professor" : "Salvar professor"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default ProfessorForm;
