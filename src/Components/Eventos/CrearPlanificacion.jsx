import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import "./CrearPlanificacion.css";

const CrearPlanificacion = ({ onClose }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Tema: "",
    fecha: "",
    merienda: "",
    bendicionMerienda: "",
    oracionAnimadores: "",
    buenasTardes: "",
  });

  const divisiones = ["chiquitos", "medianitos", "medianos", "grandes"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.Tema.trim() ||
      !formData.fecha.trim() ||
      !formData.merienda.trim() ||
      !formData.bendicionMerienda.trim() ||
      !formData.oracionAnimadores.trim() ||
      !formData.buenasTardes.trim()
    ) {
      toast.error("Completa todos los campos obligatorios antes de enviar.");
      return;
    }

    setLoading(true);
    try {
      const endpoints = [
        "/eventos/planificacion",
        "/planificacion",
        "/planificaciones",
        "/eventos/planificaciones",
      ];

      let success = false;
      let lastErr = null;
      for (const ep of endpoints) {
        try {
          const res = await api.post(ep, formData);
          if (res?.status === 200 || res?.status === 201) {
            toast.success("Planificación creada exitosamente");
            //actualizar las planificaciones
            // window.location.reload();
            navigate("/inicio");
            success = true;
            break;
          }
        } catch (err) {
          lastErr = err;
          if (err?.response?.status && err.response.status !== 404) {
            throw err;
          }
        }
      }

      if (!success) {
        console.error("All planificacion endpoints failed", lastErr);
        throw lastErr || new Error("No planificacion endpoint responded");
      }
    } catch (err) {
      console.error("Error creating planificacion:", err, err?.response?.data);
      toast.error(
        err?.response?.data?.message || "Error al crear la planificación",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-crear-planificacion" onClick={onClose}>
      <div
        className="modal-crear-planificacion__content"
        onClick={(e) => e.stopPropagation()}
      >
        <h1>Crear Planificación</h1>
        <form className="crear-planificacion-form" onSubmit={handleSubmit}>
          <div className="grid">
            <label className="field">
              <span className="field-label-row">
                <span>Tema</span>
                <span className="required-badge">OBLIGATORIO</span>
              </span>
              <input
                type="text"
                name="Tema"
                value={formData.Tema}
                onChange={handleChange}
              />
            </label>

            <label className="field">
              <span className="field-label-row">
                <span>Fecha</span>
                <span className="required-badge">OBLIGATORIO</span>
              </span>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
              />
            </label>

            <label className="field">
              <span className="field-label-row">
                <span>Merienda</span>
                <span className="required-badge">OBLIGATORIO</span>
              </span>
              <select
                name="merienda"
                value={formData.merienda}
                onChange={handleChange}
              >
                <option value="">Seleccionar</option>
                {divisiones.map((division) => (
                  <option key={division} value={division}>
                    {division.charAt(0).toUpperCase() + division.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label-row">
                <span>Bendición</span>
                <span className="required-badge">OBLIGATORIO</span>
              </span>
              <select
                name="bendicionMerienda"
                value={formData.bendicionMerienda}
                onChange={handleChange}
              >
                <option value="">Seleccionar</option>
                {divisiones.map((division) => (
                  <option key={division} value={division}>
                    {division.charAt(0).toUpperCase() + division.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label-row">
                <span>Oración</span>
                <span className="required-badge">OBLIGATORIO</span>
              </span>
              <select
                name="oracionAnimadores"
                value={formData.oracionAnimadores}
                onChange={handleChange}
              >
                <option value="">Seleccionar</option>
                {divisiones.map((division) => (
                  <option key={division} value={division}>
                    {division.charAt(0).toUpperCase() + division.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="field-label-row">
                <span>Buenas tardes</span>
                <span className="required-badge">OBLIGATORIO</span>
              </span>
              <select
                name="buenasTardes"
                value={formData.buenasTardes}
                onChange={handleChange}
              >
                <option value="">Seleccionar</option>
                {divisiones.map((division) => (
                  <option key={division} value={division}>
                    {division.charAt(0).toUpperCase() + division.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Planificación"}
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

export default CrearPlanificacion;
