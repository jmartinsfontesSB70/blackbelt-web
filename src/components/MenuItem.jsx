import { useEffect, useRef } from "react";

function MenuItem({ titulo, aberto, onClick, children }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function tratarCliqueFora(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClick();
      }
    }

    if (aberto) {
      document.addEventListener("mousedown", tratarCliqueFora);
    }

    return () => {
      document.removeEventListener("mousedown", tratarCliqueFora);
    };
  }, [aberto, onClick]);

  return (
    <div ref={menuRef} className="menu-item">
      <button type="button" className="menu-item-button" onClick={onClick}>
        {titulo} {aberto ? "▲" : "▼"}
      </button>

      {aberto && <div className="submenu">{children}</div>}
    </div>
  );
}

export default MenuItem;
