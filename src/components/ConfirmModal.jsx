function ConfirmModal({
  aberto,
  titulo = "Confirmar exclusão",
  mensagem = "Tem certeza que deseja excluir este registro?",
  onConfirmar,
  onCancelar,
  carregando = false,
  textoConfirmar = "Excluir",
  icone = "🗑️",
}) {
  if (!aberto) {
    return null;
  }

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <div className="confirm-modal-icon">{icone}</div>

        <h3>{titulo}</h3>

        <p>{mensagem}</p>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancelar}
            disabled={carregando}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="confirm-delete-button"
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando ? "Saindo..." : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
