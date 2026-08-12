import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./CrearEvento.css";

const CrearEvento = ({ embedded = false, onClose } = {}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

    // Validaciones del formulario
    if (!formData.nombre.trim() || !formData.fecha || !formData.lugar.trim()) {
      toast.error("Completa nombre, fecha y lugar antes de enviar.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let fechaPayload = formData.fecha;

      // Convertir datetime-local a ISO
      if (typeof fechaPayload === "string" && fechaPayload.includes("T")) {
        const dt = new Date(fechaPayload);

        if (!isNaN(dt.getTime())) {
          fechaPayload = dt.toISOString();
        }
      }

      const payload = {
        ...formData,
        nombre: formData.nombre.trim(),
        lugar: formData.lugar.trim(),
        fecha: fechaPayload,
        descripcion: formData.descripcion.trim(),
      };

      console.log("Creando evento:", payload);

      const res = await api.post("/evento", payload);

      console.log("Evento creado:", res.data);

      toast.success("Evento creado exitosamente");

      if (embedded) {
        if (typeof onClose === "function") {
          onClose();
        }
      } else {
        navigate("/inicio");
      }
    } catch (err) {
      console.error("Error creando evento:", err);
      console.error("Respuesta backend:", err?.response?.data);

      const backend = err?.response?.data;

      let mensaje = "Error al crear el evento";

      if (backend) {
        if (typeof backend === "string") {
          mensaje = backend;
        } else if (backend.message) {
          mensaje = backend.message;
        } else if (backend.error) {
          mensaje = backend.error;
        } else if (backend.mensaje) {
          mensaje = backend.mensaje;
        }
      } else if (err?.message) {
        mensaje = err.message;
      }

      setError(mensaje);
      toast.error(mensaje);
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

  return embedded ? (
    <div className="modal-crear-evento" onClick={onClose}>
      <div
        className="modal-crear-evento__content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Crear nuevo evento</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
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
                placeholder="Ingrese el nombre del evento"
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
                placeholder="Ingrese el lugar"
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
              placeholder="Ingrese una descripción del evento"
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creando..." : "Crear Evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <div className="crear-evento-page">
      <div className="crear-evento-page__content">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <h2>Crear nuevo evento</h2>
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
              onClick={() => navigate("/eventos")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEvento;
