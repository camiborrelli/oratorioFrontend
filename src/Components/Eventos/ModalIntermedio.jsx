import React from "react";
import { useNavigate } from "react-router-dom";

const OPTIONS = [
  {
    id: "evento",
    label: "Evento",
    path: "/eventos/crear",
  },
  {
    id: "planificacion",
    label: "Planificación",
    path: "/eventos/planificacion",
  },
  {
    id: "recordatorio",
    label: "Recordatorio",
    path: "/eventos/recordatorio",
  },
];

const ModalIntermedio = ({ onClose }) => {
  const navigate = useNavigate();

  const handleSelect = (path) => {
    if (typeof onClose === "function") onClose();
    navigate(path);
  };

  return (
    <div className="evt-modal-overlay" onClick={onClose}>
      <div
        className="evt-modal-box evt-selector-box"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="evt-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
          type="button"
        >
          ×
        </button>

        <div className="evt-selector-header">
          <h2>¿Qué deseas crear?</h2>
          <p>Tocá el punto de la opción para abrir su formulario.</p>
        </div>

        <div className="evt-selector-list">
          {OPTIONS.map((option) => (
            <label key={option.id} className="evt-selector-option">
              <input
                type="radio"
                name="tipo-evento"
                value={option.id}
                onChange={() => handleSelect(option.path)}
              />
              <span className="evt-selector-option__dot" aria-hidden="true" />
              <span className="evt-selector-option__text">
                <span className="evt-selector-option__title">
                  {option.label}
                </span>
                <span className="evt-selector-option__desc">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModalIntermedio;
