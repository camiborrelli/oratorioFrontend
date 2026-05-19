import React from "react";
import CrearEvento from "./CrearEvento";
import "./CrearEvento.css";

const CrearEventoModal = ({ onClose }) => {
  return (
    <div className="evt-modal-overlay" onClick={onClose}>
      <div
        className="evt-modal-box"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="evt-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <CrearEvento embedded={true} onClose={onClose} />
      </div>
    </div>
  );
};

export default CrearEventoModal;
