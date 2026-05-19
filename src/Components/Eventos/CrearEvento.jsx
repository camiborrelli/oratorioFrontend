import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./CrearEvento.css";

const CrearEvento = ({ embedded = false, onClose } = {}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    fecha: "",
    descripcion: "",
    lugar: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.nombre || !formData.fecha || !formData.lugar) {
        toast.error("Completa nombre, fecha y lugar antes de enviar.");
        setLoading(false);
        return;
      }

      // Normalize fecha to ISO if input type datetime-local provided
      let fechaPayload = formData.fecha;
      try {
        if (typeof fechaPayload === "string" && fechaPayload.includes("T")) {
          const dt = new Date(fechaPayload);
          if (!isNaN(dt)) fechaPayload = dt.toISOString();
        }
      } catch (err) {}

      const payload = { ...formData, fecha: fechaPayload };
      console.log("Creando evento with payload:", payload);

      // Try plural endpoint first, fallback to singular if 404
      let res;
      try {
        res = await api.post("/evento", payload);
      } catch (err) {
        if (err?.response?.status === 404) {
          res = await api.post("/evento", payload);
        } else {
          throw err;
        }
      }
      toast.success("Evento creado exitosamente");
      if (embedded) {
        // if embedded in a modal, call onClose if provided to close the modal
        if (typeof onClose === "function") onClose();
      } else {
        navigate("/inicio");
      }
    } catch (err) {
      console.error("Error creating event:", err, err?.response?.data);
      // Show backend error body when available
      const backend = err?.response?.data;
      const msg =
        (backend &&
          (backend.message || backend.error || JSON.stringify(backend))) ||
        err?.message ||
        "Error al crear el evento";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // add page-specific body class only when rendered as a standalone page
    if (!embedded) {
      document.body.classList.add("with-bg");
      return () => document.body.classList.remove("with-bg");
    }
    return undefined;
  }, [embedded]);

  return (
    <div className="crear-evento-container">
      <h1>Crear nuevo evento</h1>
      <form className="crear-evento-form" onSubmit={handleSubmit}>
        <div className="grid">
          <label className="field">
            <span className="label-text">
              Nombre del evento{" "}
              <span className="required-badge">OBLIGATORIO</span>
            </span>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span className="label-text">
              Fecha del evento{" "}
              <span className="required-badge">OBLIGATORIO</span>
            </span>
            <input
              type="datetime-local"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span className="label-text">
              Lugar del evento{" "}
              <span className="required-badge">OBLIGATORIO</span>
            </span>
            <input
              type="text"
              name="lugar"
              value={formData.lugar}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <label className="field full">
          <span className="label-text">Descripción</span>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={4}
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creando..." : "Crear Evento"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (embedded) {
                if (typeof onClose === "function") onClose();
              } else {
                navigate("/eventos");
              }
            }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearEvento;
