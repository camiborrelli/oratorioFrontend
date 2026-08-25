import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import "./CrearRecordatorio.css";

const CrearRecordatorio = ({ onClose } = {}) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
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

    if (!formData.titulo.trim() || !formData.descripcion.trim()) {
      toast.error("Ingresar el título y la descripción antes de enviar.");
      return;
    }

    setLoading(true);

    try {
      const endpoints = [
        "/eventos/recordatorio",
        "/recordatorio",
        "/recordatorios",
      ];

      let success = false;
      let lastErr = null;

      for (const ep of endpoints) {
        try {
          const res = await api.post(ep, formData);

          if (res?.status === 200 || res?.status === 201) {
            toast.success("Recordatorio creado exitosamente");

            window.dispatchEvent(
              new CustomEvent("oratorio:creado", {
                detail: {
                  tipo: "recordatorio",
                  item: res.data,
                },
              }),
            );

            if (typeof onClose === "function") {
              onClose();
            } else {
              navigate("/inicio");
            }

            success = true;
            break;
          }
        } catch (err) {
          lastErr = err;

          // Si no es 404, no intentamos con el siguiente endpoint
          if (err?.response?.status && err.response.status !== 404) {
            throw err;
          }
        }
      }

      if (!success) {
        console.error("All recordatorio endpoints failed", lastErr);

        throw lastErr || new Error("No recordatorio endpoint responded");
      }
    } catch (err) {
      console.error("Error creating recordatorio:", err, err?.response?.data);

      toast.error(
        err?.response?.data?.message || "Error al crear el recordatorio",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="recordatorio-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose?.();
        }
      }}
    >
      <div
        className="recordatorio-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recordatorio-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="recordatorio-modal-header">
          <div>
            <h2 id="recordatorio-modal-title">Crear nuevo recordatorio</h2>

            <p>Completá los datos para dejar registrado el recordatorio.</p>
          </div>

          <button
            type="button"
            className="recordatorio-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form className="recordatorio-modal-form" onSubmit={handleSubmit}>
          <div className="recordatorio-form-field">
            <label htmlFor="recordatorio-titulo">Título</label>

            <input
              id="recordatorio-titulo"
              type="text"
              name="titulo"
              placeholder="Título del recordatorio"
              value={formData.titulo}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="recordatorio-form-field">
            <label htmlFor="recordatorio-descripcion">Descripción</label>

            <textarea
              id="recordatorio-descripcion"
              name="descripcion"
              placeholder="Escribí una descripción del recordatorio..."
              value={formData.descripcion}
              onChange={handleChange}
              disabled={loading}
              rows={5}
            />
          </div>

          <div className="recordatorio-modal-actions">
            <button
              type="button"
              className="recordatorio-btn recordatorio-btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="recordatorio-btn recordatorio-btn-primary"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear recordatorio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearRecordatorio;
