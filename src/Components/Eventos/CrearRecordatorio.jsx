import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import "./CrearRecordatorio.css";

const CrearRecordatorio = ({ onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            navigate("/inicio");
            success = true;
            break;
          }
        } catch (err) {
          lastErr = err;
          // try next endpoint on 404, otherwise rethrow
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
      className="modal-crear-recordatorio"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="modal-crear-recordatorio__content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Crear Recordatorio</h2>
        <form className="crear-recordatorio-form" onSubmit={handleSubmit}>
          <div className="grid">
            <label className="field">
              <p style={{ fontWeight: "bold" }}>Titulo</p>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
              />
            </label>
            <label className="field">
              Descripción
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creando..." : "Crear Recordatorio"}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearRecordatorio;
