import "./ListarReuniones.css";
import "./AgregarReunionModal.css";

import { useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const AgregarReunionModal = ({ onClose, onCreated } = {}) => {
  const [titulo, setTitulo] = useState("Reunión de animadores");
  const [fechaLocal, setFechaLocal] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tituloLimpio = titulo.trim();
    const descripcionLimpia = descripcion.trim();

    if (!fechaLocal || !descripcionLimpia || !tituloLimpio) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    // Validaciones
    if (!tituloLimpio) {
      toast.error("El título es obligatorio");
      return;
    }

    if (!fechaLocal) {
      toast.error("La fecha y hora son obligatorias");
      return;
    }

    if (!descripcionLimpia) {
      toast.error("La descripción es obligatoria");
      return;
    }

    const payload = {
      titulo: tituloLimpio,
      fecha: fechaLocal,
      descripcion: descripcionLimpia,
    };

    setLoading(true);

    try {
      const res = await api.post("/reunion", payload);

      let created = res?.data;

      if (created?.data) {
        created = created.data;
      }

      if (Array.isArray(created) && created.length > 0) {
        created = created[0];
      }

      if (!created || typeof created !== "object") {
        created = payload;
      }

      toast.success("Reunión registrada con éxito");

      if (typeof onCreated === "function") {
        onCreated(created);
      }

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (err) {
      console.error("Error creating reunion:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error al registrar la reunión",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="reunion-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose?.();
        }
      }}
    >
      <div
        className="reunion-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reunion-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="reunion-modal-header">
          <div>
            <h2 id="reunion-modal-title">Registrar nueva reunión</h2>

            <p>
              Completá los datos para dejar registrado lo charlado en la reunión
              de animadores.
            </p>
          </div>

          <button
            type="button"
            className="reunion-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form className="reunion-modal-form" onSubmit={handleSubmit}>
          <div className="reunion-form-field">
            <label htmlFor="reunion-titulo">Título</label>

            <input
              id="reunion-titulo"
              type="text"
              name="titulo"
              placeholder="Título de la reunión"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="reunion-form-field">
            <label htmlFor="reunion-fecha">Fecha y hora</label>

            <input
              id="reunion-fecha"
              type="datetime-local"
              name="fecha"
              value={fechaLocal}
              onChange={(e) => setFechaLocal(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="reunion-form-field">
            <label htmlFor="reunion-descripcion">Descripción</label>

            <textarea
              id="reunion-descripcion"
              name="descripcion"
              placeholder="Escribí una descripción de la reunión..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading}
              rows={5}
            />
          </div>

          <div className="reunion-modal-actions">
            <button
              type="button"
              className="reunion-btn reunion-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="reunion-btn reunion-btn-primary"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar reunión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarReunionModal;
