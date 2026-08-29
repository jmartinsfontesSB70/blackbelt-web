import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";

import { listarPerfis, excluirPerfil } from "../services/perfilService";

import ConfirmModal from "../components/ConfirmModal";
import Permissao from "../components/Permissao";

function Perfis() {
  const navigate = useNavigate();

  const [perfis, setPerfis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  async function carregarPerfis() {
    try {
      setCarregando(true);
      setErro("");

      const dados = await listarPerfis();

      setPerfis(dados);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPerfis();
  }, []);

  function handleExcluir(perfil) {
    setErro("");
    setPerfilSelecionado(perfil);
    setModalExcluirAberto(true);
  }

  async function confirmarExclusao() {
    if (!perfilSelecionado) {
      return;
    }

    try {
      setExcluindo(true);
      setErro("");

      await excluirPerfil(perfilSelecionado.id);

      setModalExcluirAberto(false);
      setPerfilSelecionado(null);

      await carregarPerfis();
    } catch (error) {
      setModalExcluirAberto(false);
      setPerfilSelecionado(null);
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
    setPerfilSelecionado(null);
  }

  function perfilAdmin(perfil) {
    return perfil.nome?.trim().toLowerCase() === "admin";
  }

  if (carregando) {
    return (
      <main className="main">
        <h2>Perfis</h2>
        <p>Carregando perfis...</p>
      </main>
    );
  }

  if (erro && perfis.length === 0) {
    return (
      <main className="main">
        <h2>Perfis</h2>
        <p>{erro}</p>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="page-header">
        <div>
          <h2>Perfis</h2>

          <p>Gerencie os perfis de acesso do sistema.</p>
        </div>

        <Permissao nome="PERFIL_CRIAR">
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/perfis/novo")}
          >
            + Novo perfil
          </button>
        </Permissao>
      </div>

      {erro && <div className="form-message error-message">{erro}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Perfil</th>
              <th>Permissões</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {perfis.map((perfil) => (
              <tr key={perfil.id}>
                <td>{perfil.id}</td>

                <td className="name-cell">{perfil.nome}</td>

                <td>{perfil.permissoes?.length ?? 0}</td>

                <td>
                  <div className="action-buttons">
                    {!perfilAdmin(perfil) && (
                      <>
                        <Permissao nome="PERFIL_EDITAR">
                          <button
                            type="button"
                            className="edit-button"
                            onClick={() => navigate("/perfis/" + perfil.id)}
                            title="Editar perfil"
                          >
                            <Pencil size={18} />
                          </button>
                        </Permissao>

                        <Permissao nome="PERFIL_EXCLUIR">
                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => handleExcluir(perfil)}
                            title="Excluir perfil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </Permissao>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        aberto={modalExcluirAberto}
        titulo="Excluir perfil?"
        mensagem={
          perfilSelecionado
            ? "Deseja realmente excluir o perfil " +
              perfilSelecionado.nome +
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

export default Perfis;
