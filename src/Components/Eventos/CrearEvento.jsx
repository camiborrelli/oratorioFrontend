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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombre = formData.nombre.trim();
    const lugar = formData.lugar.trim();
    const descripcion = formData.descripcion.trim();

    if (!nombre || !formData.fecha || !lugar) {
      toast.error("Completá nombre, fecha y lugar antes de continuar.");
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
        nombre,
        fecha: fechaPayload,
        descripcion,
        lugar,
      };

      console.log("Creando evento:", payload);

      const res = await api.post("/evento", payload);

      console.log("Evento creado:", res.data);

      window.dispatchEvent(
        new CustomEvent("oratorio:creado", {
          detail: {
            tipo: "evento",
            item: res.data,
          },
        }),
      );

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
    if (!embedded) {
      document.body.classList.add("with-bg");

      return () => {
        document.body.classList.remove("with-bg");
      };
    }

    return undefined;
  }, [embedded]);

  /*
   * ================================
   * MODAL
   * ================================
   */

  if (embedded) {
    return (
      <div
        className="evento-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget && !loading) {
            onClose?.();
          }
        }}
      >
        <div
          className="evento-modal-box"
          role="dialog"
          aria-modal="true"
          aria-labelledby="evento-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="evento-modal-header">
            <div>
              <h2 id="evento-modal-title">Crear nuevo evento</h2>

              <p>
                Completá los datos para registrar un nuevo evento del oratorio.
              </p>
            </div>

            <button
              type="button"
              className="evento-modal-close"
              onClick={onClose}
              disabled={loading}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <form className="evento-modal-form" onSubmit={handleSubmit}>
            <div className="evento-form-field">
              <label htmlFor="evento-nombre">
                Nombre del evento
                <span className="evento-required">Obligatorio</span>
              </label>

              <input
                id="evento-nombre"
                type="text"
                name="nombre"
                placeholder="Nombre del evento"
                value={formData.nombre}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="evento-form-field">
              <label htmlFor="evento-fecha">
                Fecha y hora
                <span className="evento-required">Obligatorio</span>
              </label>

              <input
                id="evento-fecha"
                type="datetime-local"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="evento-form-field">
              <label htmlFor="evento-lugar">
                Lugar
                <span className="evento-required">Obligatorio</span>
              </label>

              <input
                id="evento-lugar"
                type="text"
                name="lugar"
                placeholder="Lugar donde se realizará el evento"
                value={formData.lugar}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="evento-form-field">
              <label htmlFor="evento-descripcion">Descripción</label>

              <textarea
                id="evento-descripcion"
                name="descripcion"
                placeholder="Escribí una descripción del evento..."
                value={formData.descripcion}
                onChange={handleChange}
                disabled={loading}
                rows={5}
              />
            </div>

            {error && <div className="evento-form-error">{error}</div>}

            <div className="evento-modal-actions">
              <button
                type="button"
                className="evento-btn evento-btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="evento-btn evento-btn-primary"
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear evento"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /*
   * ================================
   * PÁGINA NORMAL
   * ================================
   */

  return (
    <div className="evento-page">
      <div className="evento-page-box">
        <div className="evento-modal-header">
          <div>
            <h2>Crear nuevo evento</h2>

            <p>
              Completá los datos para registrar un nuevo evento del oratorio.
            </p>
          </div>

          <button
            type="button"
            className="evento-modal-close"
            onClick={() => navigate("/eventos")}
            disabled={loading}
            aria-label="Volver"
          >
            ×
          </button>
        </div>

        <form className="evento-modal-form" onSubmit={handleSubmit}>
          <div className="evento-form-field">
            <label htmlFor="evento-nombre-page">
              Nombre del evento
              <span className="evento-required">Obligatorio</span>
            </label>

            <input
              id="evento-nombre-page"
              type="text"
              name="nombre"
              placeholder="Nombre del evento"
              value={formData.nombre}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="evento-form-field">
            <label htmlFor="evento-fecha-page">
              Fecha y hora
              <span className="evento-required">Obligatorio</span>
            </label>

            <input
              id="evento-fecha-page"
              type="datetime-local"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="evento-form-field">
            <label htmlFor="evento-lugar-page">
              Lugar
              <span className="evento-required">Obligatorio</span>
            </label>

            <input
              id="evento-lugar-page"
              type="text"
              name="lugar"
              placeholder="Lugar donde se realizará el evento"
              value={formData.lugar}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="evento-form-field">
            <label htmlFor="evento-descripcion-page">Descripción</label>

            <textarea
              id="evento-descripcion-page"
              name="descripcion"
              placeholder="Escribí una descripción del evento..."
              value={formData.descripcion}
              onChange={handleChange}
              disabled={loading}
              rows={5}
            />
          </div>

          {error && <div className="evento-form-error">{error}</div>}

          <div className="evento-modal-actions">
            <button
              type="button"
              className="evento-btn evento-btn-secondary"
              onClick={() => navigate("/eventos")}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="evento-btn evento-btn-primary"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEvento;
