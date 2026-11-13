import { useEffect, useState } from "react";
import {
  cadastrarAluno,
  buscarAlunoPorId,
  atualizarAluno,
  enviarFotoAluno,
  buscarFotoAluno,
  excluirFotoAluno,
  buscarEnderecoPorCep,
} from "../services/alunoService";
import HistoricoGraduacao from "../components/HistoricoGraduacao";
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

function AlunoForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const [endereco, setEndereco] = useState({
    rua: "",
    numero: "",
    bairro: "",
    cidadeId: "",
    cidade: "",
    uf: "",
    cep: "",
    pontoReferencia: "",
  });

  const [ativo, setAtivo] = useState(true);

  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [possuiFoto, setPossuiFoto] = useState(false);
  const [carregandoFoto, setCarregandoFoto] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  function handleSelecionarFoto(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    setFoto(arquivo);
    setFotoPreview(URL.createObjectURL(arquivo));
  }

  async function handleExcluirFoto() {
    if (!id) {
      setFoto(null);
      setFotoPreview(null);
      return;
    }

    try {
      setCarregandoFoto(true);
      setErro("");
      setSucesso("");

      await excluirFotoAluno(id);

      setFoto(null);
      setFotoPreview(null);
      setPossuiFoto(false);

      setSucesso("Foto removida com sucesso!");
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregandoFoto(false);
    }
  }

  async function handleBuscarCep() {
    const cepLimpo = endereco.cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      setErro("");
      setSucesso("");

      const dados = await buscarEnderecoPorCep(cepLimpo);

      setEndereco((anterior) => ({
        ...anterior,
        rua: dados.logradouro || "",
        bairro: dados.bairro || "",
        cidadeId: dados.cidadeId,
        cidade: dados.cidade,
        uf: dados.uf,
      }));
    } catch (error) {
      setErro(error.message);
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (!endereco.numero.trim()) {
      setErro("O número do endereço é obrigatório.");
      return;
    }

    const aluno = {
      nome,
      cpf: cpf.replace(/\D/g, ""),
      dataNascimento,
      telefone: telefone.replace(/\D/g, ""),
      email,
      ativo,
      endereco,
    };

    try {
      let alunoSalvo;

      if (id) {
        alunoSalvo = await atualizarAluno(id, aluno);
      } else {
        alunoSalvo = await cadastrarAluno(aluno);
      }

      if (foto) {
        await enviarFotoAluno(alunoSalvo.id, foto);
      }

      setSucesso(
        id ? "Aluno atualizado com sucesso!" : "Aluno cadastrado com sucesso!",
      );

      setTimeout(() => {
        navigate("/alunos");
      }, 1000);
    } catch (error) {
      setErro(error.message);
    }
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    async function carregarAluno() {
      try {
        const aluno = await buscarAlunoPorId(id);

        setNome(aluno.nome);
        setCpf(formatarCpf(aluno.cpf));
        setDataNascimento(aluno.dataNascimento);
        setTelefone(formatarTelefone(aluno.telefone));
        setEmail(aluno.email);
        setAtivo(aluno.ativo);
        setPossuiFoto(aluno.possuiFoto);

        setEndereco({
          rua: aluno.endereco.rua,
          numero: aluno.endereco.numero,
          bairro: aluno.endereco.bairro,
          cidade: aluno.endereco.cidade,
          cidadeId: aluno.endereco.cidadeId,
          uf: aluno.endereco.uf,
          cep: aluno.endereco.cep,
          pontoReferencia: aluno.endereco.pontoReferencia,
        });

        if (aluno.possuiFoto) {
          try {
            const blob = await buscarFotoAluno(id);
            const url = URL.createObjectURL(blob);

            setFotoPreview(url);
          } catch (error) {
            console.error("Não foi possível carregar a foto do aluno.", error);
          }
        }
      } catch (error) {
        setErro(error.message);
      }
    }

    carregarAluno();
  }, [id]);

  useEffect(() => {
    return () => {
      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview);
      }
    };
  }, [fotoPreview]);

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>{id ? "Editar aluno" : "Novo aluno"}</h2>

          <p>
            {id
              ? "Altere os dados do aluno."
              : "Cadastre um novo aluno na academia."}
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

        {/* =========================
            FOTO
        ========================== */}

        <div className="foto-section">
          <div className="foto-preview">
            {fotoPreview ? (
              <img
                src={fotoPreview}
                alt="Foto do aluno"
                className="foto-preview-image"
              />
            ) : (
              <div className="foto-placeholder">👤</div>
            )}
          </div>

          <div className="foto-actions">
            <label className="secondary-button foto-upload-button">
              {fotoPreview ? "Alterar foto" : "Escolher foto"}

              <input
                type="file"
                accept="image/jpeg"
                onChange={handleSelecionarFoto}
                hidden
              />
            </label>

            {fotoPreview && id && (
              <button
                type="button"
                className="secondary-button"
                onClick={handleExcluirFoto}
                disabled={carregandoFoto}
              >
                {carregandoFoto ? "Removendo..." : "Remover foto"}
              </button>
            )}
          </div>
        </div>

        {/* =========================
            DADOS PESSOAIS
        ========================== */}

        <div className="form-grid">
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
              placeholder="aluno@email.com"
            />
          </div>

          {/* =========================
              ENDEREÇO
          ========================== */}

          <div className="form-section-title full-width">
            <h3>Endereço</h3>

            <p>Informe o endereço do aluno.</p>
          </div>

          <div className="form-group">
            <label>CEP</label>

            <input
              type="text"
              value={endereco.cep}
              onChange={(event) => {
                const numeros = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 8);

                let cepFormatado = numeros;

                if (numeros.length > 5) {
                  cepFormatado = numeros.slice(0, 5) + "-" + numeros.slice(5);
                }

                setEndereco((anterior) => ({
                  ...anterior,
                  cep: cepFormatado,
                }));
              }}
              onBlur={handleBuscarCep}
              placeholder="00000-000"
            />
          </div>

          <div className="form-group">
            <label>Rua</label>

            <input
              type="text"
              value={endereco.rua}
              readOnly
              placeholder="Digite a rua"
            />
          </div>

          <div className="form-group">
            <label>Número</label>

            <input
              type="text"
              value={endereco.numero}
              onChange={(event) => {
                const numero = event.target.value.replace(/\D/g, "");
                setEndereco((anterior) => ({
                  ...anterior,
                  numero,
                }));
              }}
              placeholder="Número"
            />
          </div>

          <div className="form-group">
            <label>Bairro</label>

            <input
              type="text"
              value={endereco.bairro}
              readOnly
              placeholder="Digite o bairro"
            />
          </div>

          <div className="form-group">
            <label>Cidade</label>

            <input
              type="text"
              value={endereco.cidade}
              readOnly
              placeholder="Cidade"
            />
          </div>

          <div className="form-group">
            <label>Estado</label>

            <input
              type="text"
              value={endereco.uf}
              readOnly
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
            onClick={() => navigate("/alunos")}
          >
            Cancelar
          </button>

          <button type="submit" className="primary-button">
            {id ? "Atualizar aluno" : "Salvar aluno"}
          </button>
        </div>
      </form>

      {id && <HistoricoGraduacao alunoId={id} />}
    </main>
  );
}

export default AlunoForm;
