import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../../api";
import "react-toastify/dist/ReactToastify.css";
import "./RegistroNinio.css";

// Convierte cualquier formato de fecha a "YYYY-MM-DD" para el input date
const fmtDate = (val) => {
  if (!val) return "";
  const str = String(val);
  const dateOnly = str.includes("T") ? str.split("T")[0] : str.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dateOnly) ? dateOnly : "";
};

const EditarNinio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const nin = location.state?.nin || location.state?.ninio || null;

  const { register, handleSubmit, reset } = useForm();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales en el formulario
  useEffect(() => {
    if (!nin) return;

    // Si division/recorrida vienen populados como objetos, extraer el nombre
    const division =
      typeof nin.division === "object"
        ? nin.division?.nombre || ""
        : nin.division || "";

    const recorrida =
      typeof nin.recorrida === "object"
        ? nin.recorrida?.nombre || nin.recorrida?.color || ""
        : nin.recorrida || "";

    reset({
      nombre: nin.nombre || "",
      apellido: nin.apellido || "",
      fechaNacimiento: fmtDate(nin.fechaNacimiento || nin.fecha_nacimiento),
      edad: nin.edad || "",
      division,
      recorrida,
      direccion: nin.direccion || "",
      observaciones: nin.observaciones || "",
    });

    setContacts(
      (nin.contactos || []).map((c) => ({
        nombre: c.nombre || "",
        relacion: c.relacion || "",
        telefono: c.telefono || "",
      })),
    );
  }, [nin, reset]);

  const updateContact = (idx, field, value) =>
    setContacts((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)),
    );

  const addContact = () =>
    setContacts((prev) => [
      ...prev,
      { nombre: "", relacion: "", telefono: "" },
    ]);

  const removeContact = (idx) =>
    setContacts((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (data) => {
    if (!nin) return toast.error("No hay niño seleccionado para editar");
    setLoading(true);
    try {
      const payload = {
        ...data,
        edad: data.edad ? Number(data.edad) : undefined,
        contactos: contacts.filter((c) => c.nombre || c.telefono),
      };

      // Limpiar campos vacíos opcionales
      ["foto", "observaciones", "direccion"].forEach((k) => {
        if (!payload[k]) delete payload[k];
      });

      const nid = nin._id || nin.id;
      const res = await api.put(`/ninios/${nid}`, payload);
      toast.success("Guardado");
      navigate(`/ninios`, {
        state: { nin: res.data?.ninio || res.data },
      });
    } catch (err) {
      const msg = err?.response?.data?.message || "Error al guardar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!nin)
    return <p style={{ padding: 24 }}>No se encontró el niño a editar.</p>;

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Editar Niño</h2>
        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid">
            <div className="form-group">
              <label>Nombre</label>
              <input type="text" {...register("nombre")} />
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input type="text" {...register("apellido")} />
            </div>

            {/* <div className="form-group">
              <label>Apellido</label>
              <input type="text" {...register("apellido")} />
            </div> */}

            <div className="form-group">
              <label>Fecha de nacimiento</label>
              <input type="date" {...register("fechaNacimiento")} />
            </div>

            <div className="form-group">
              <label>Edad</label>
              <input type="number" {...register("edad")} />
            </div>

            <div className="form-group">
              <label>División</label>
              <select {...register("division")}>
                <option value="">--</option>
                <option value="Chiquitos">Chiquitos</option>
                <option value="Medianitos">Medianitos</option>
                <option value="Medianos">Medianos</option>
                <option value="Grandes">Grandes</option>
              </select>
            </div>

            <div className="form-group">
              <label>Recorrida</label>
              <select {...register("recorrida")}>
                <option value="">--</option>
                <option value="roja">Roja</option>
                <option value="azul">Azul</option>
                <option value="naranja">Naranja</option>
                <option value="amarillo">Amarilla</option>
                <option value="violeta">Violeta</option>
              </select>
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input type="text" {...register("direccion")} />
            </div>

            <div className="form-group">
              <label>Observaciones</label>
              <input type="text" {...register("observaciones")} />
            </div>
          </div>

          <div className="form-group full">
            <label>Contactos</label>
            <div className="contacts-list">
              {contacts.map((c, idx) => (
                <div className="contact-row" key={idx}>
                  <input
                    placeholder="Nombre"
                    value={c.nombre}
                    onChange={(e) =>
                      updateContact(idx, "nombre", e.target.value)
                    }
                  />
                  <input
                    placeholder="Relación"
                    value={c.relacion}
                    onChange={(e) =>
                      updateContact(idx, "relacion", e.target.value)
                    }
                  />
                  <input
                    placeholder="Teléfono"
                    value={c.telefono}
                    onChange={(e) =>
                      updateContact(idx, "telefono", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeContact(idx)}
                  >
                    Quitar
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary"
                onClick={addContact}
              >
                + Agregar contacto
              </button>
            </div>
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarNinio;
