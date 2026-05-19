import "./ListarReuniones.css";
import { useEffect, useState } from "react";
import api from "../../api";

const AgregarReunionModal = ({ onClose, onCreated } = {}) => {
  const [titulo, setTitulo] = useState("");
  const [fechaLocal, setFechaLocal] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // set default local datetime for the input (YYYY-MM-DDTHH:MM)
    const pad = (n) => String(n).padStart(2, "0");
    const now = new Date();
    const localDatetime =
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate()) +
      "T" +
      pad(now.getHours()) +
      ":" +
      pad(now.getMinutes());
    setFechaLocal(localDatetime);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // The registration time should be the server/client current time.
      // We set `fecha` to the current instant in ISO format regardless of the input.
      const payload = {
        titulo: titulo || "Nueva reunión de animadores",
        fecha: new Date().toISOString(),
        descripcion: descripcion || "",
      };

      const res = await api.post("/reunion", payload);
      let created = res?.data;
      if (created && created.data) created = created.data;
      if (Array.isArray(created) && created.length > 0) created = created[0];
      if (!created || typeof created !== "object") created = payload;

      if (typeof onCreated === "function") onCreated(created);
      if (typeof onClose === "function") onClose();
    } catch (err) {
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
            placeholder="Fecha y hora"
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
