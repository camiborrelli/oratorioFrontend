import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import "./CrearRecordatorio.css";

const CrearRecordatorio = () => {
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
    if (!formData.descripcion) {
      toast.error("Ingresar la descripción antes de enviar.");
      return;
    }

    setLoading(true);
    try {
      const endpoints = [
        "/eventos/recordatorio",
        "/recordatorio",
        "/recordatorios",
      ];

      let lastError = null;
      for (const endpoint of endpoints) {
        try {
          const res = await api.post(endpoint, formData);
          if (res.status === 200 || res.status === 201) {
            toast.success("Recordatorio creado exitosamente");
            navigate("/eventos");
            return;
          }
        } catch (err) {
          lastError = err;
          if (err?.response?.status !== 404) {
            throw err;
          }
        }
      }

      throw (
        lastError || new Error("No se encontró un endpoint para recordatorios")
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Error al crear el recordatorio",
      );
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-crear-recordatorio">
      <div className="modal-crear-recordatorio__content">
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
                required
              />
            </label>
            <label className="field">
              Descripción
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creando..." : "Crear Recordatorio"}
            </button>
            <button type="button" onClick={() => navigate("/eventos")}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearRecordatorio;
