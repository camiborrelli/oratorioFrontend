import "./ListarReuniones.css";
import { useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";

const AgregarReunionModal = ({ onClose, onCreated } = {}) => {
  const [titulo, setTitulo] = useState("Reunión de animadores");
  const [fechaLocal, setFechaLocal] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        titulo: titulo || "Nueva reunión de animadores",
        fecha: fechaLocal, // siempre "YYYY-MM-DD"
        descripcion: descripcion || "",
      };

      if (!payload.fecha) {
        toast.error("La fecha es obligatoria");
        setLoading(false);
        return;
      }
      if (!payload.titulo) {
        toast.error("El título es obligatorio");
        setLoading(false);
        return;
      }
      if (!payload.descripcion) {
        toast.error("La descripción es obligatoria");
        setLoading(false);
        return;
      }

      const res = await api.post("/reunion", payload);
      console.log(payload);
      let created = res?.data;
      if (created && created.data) created = created.data;
      toast.success("Reunión registrada con éxito");

      if (Array.isArray(created) && created.length > 0) created = created[0];
      if (!created || typeof created !== "object") created = payload;

      if (typeof onCreated === "function") onCreated(created);
      if (typeof onClose === "function") onClose();
    } catch (err) {
      toast.error(
        "Error al registrar la reunión:" +
          (err?.response?.data?.message || err.message),
      );
      console.error("Error creating reunion:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reunion-modal-overlay" onClick={onClose}>
      <div
        className="reunion-modal-box"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Registrar nueva reunión</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="titulo"
            placeholder="Título de la reunión"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <input
            type="datetime-local"
            name="fecha"
            placeholder="Fecha de la reunión"
            value={fechaLocal}
            onChange={(e) => setFechaLocal(e.target.value)}
          />
          <textarea
            name="descripcion"
            placeholder="Descripción de la reunión"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarReunionModal;
