import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../../api";
import { toast } from "react-toastify";
import "./PerfilNinio.css";
import "../../App.css";
import BotonEliminar from "./BotonEliminar";

const FALLBACK_IMG = "/img/image.png";

const PerfilNinio = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // accept several possible keys passed via navigation state
  const initialFromState =
    location.state?.nin ||
    location.state?.ninio ||
    location.state?.data ||
    location.state ||
    null;
  const [nin, setNin] = useState(initialFromState || null);
  const [loading, setLoading] = useState(!initialFromState);
  const [error, setError] = useState(null);
  const [editingContacts, setEditingContacts] = useState(false);
  const [editContacts, setEditContacts] = useState([]);

  useEffect(() => {
    // if data came via navigation state, don't refetch
    if (initialFromState) {
      setLoading(false);
      return;
    }

    api
      .get(`/ninios/id/${id}`)
      .then((res) => {
        const payload = res.data;
        const data = payload.ninio || payload.data || payload;
        setNin(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching", `/ninios/id/${id}`, err);

        const status = err?.response?.status;
        const data = err?.response?.data;
        const msg =
          err?.message || (data && JSON.stringify(data)) || "Unknown error";
        setError(`No se pudo cargar el perfil: ${status || ""} ${msg}`);
        setNin(null);
      })
      .finally(() => setLoading(false));
  }, [id, initialFromState]);

  if (loading) return <div className="perfil-container">Cargando...</div>;
  if (error) return <div className="perfil-container error">{error}</div>;
  if (!nin) return <div className="perfil-container">Ninio no encontrado</div>;
  const fotoSrc = nin.foto || nin.imagen || FALLBACK_IMG;
  const normalizeContactos = (raw) => {
    if (!raw) return [];
    let data = raw;
    if (typeof raw === "string") {
      try {
        data = JSON.parse(raw);
      } catch (e) {
        // keep as string
        data = raw;
      }
    }
    if (Array.isArray(data)) {
      return data
        .map((c, idx) => {
          if (!c) return null;
          if (typeof c === "string") return { id: idx, nombre: c };
          return { id: c.id ?? idx, ...c };
        })
        .filter(Boolean);
    }
    if (typeof data === "object") {
      return Object.keys(data)
        .map((key) => {
          const val = data[key];
          if (!val && val !== 0) return null;
          if (typeof val === "string")
            return { id: key, relacion: key, nombre: val };
          if (typeof val === "object")
            return { id: val.id ?? key, relacion: val.relacion ?? key, ...val };
          return { id: key, relacion: key, nombre: String(val) };
        })
        .filter(Boolean);
    }
    return [{ id: "c0", nombre: String(data) }];
  };

  const contactosList = normalizeContactos(
    nin.contactos || nin.contactosFamilia || nin.contactosData,
  );

  const startEditContacts = () => {
    setEditContacts(contactosList.map((c) => ({ ...c })));
    setEditingContacts(true);
  };

  const updateEditContact = (idx, field, value) =>
    setEditContacts((s) =>
      s.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );
  const addEditContact = () =>
    setEditContacts((s) => [...s, { nombre: "", relacion: "", telefono: "" }]);
  const removeEditContact = (idx) =>
    setEditContacts((s) => s.filter((_, i) => i !== idx));

  const saveContacts = async () => {
    const payload = {
      contactos: (editContacts || [])
        .map((c) => {
          // Only send allowed fields; some backend versions reject `relacion`
          const obj = {};
          if (c.nombre) obj.nombre = c.nombre;
          if (c.telefono) obj.telefono = c.telefono;
          return obj;
        })
        .filter((c) => Object.keys(c).length > 0),
    };
    if (!payload.contactos.length) {
      toast.error("Agrega al menos un contacto antes de guardar");
      return;
    }
    try {
      setLoading(true);
      const nid = nin._id || nin.id;
      console.info("Saving contactos payload:", payload);
      const res = await api.put(`/ninios/${nid}`, payload);
      const data = res.data?.ninio || res.data;
      setNin((prev) => ({
        ...prev,
        contactos: data.contactos || payload.contactos,
      }));
      toast.success("Contactos actualizados");
      setEditingContacts(false);
    } catch (err) {
      console.error(err);
      const server = err?.response?.data;
      console.info("Server error response (saveContacts):", server);
      const serverMsg =
        server?.message ||
        server ||
        err.message ||
        "Error al guardar contactos";
      try {
        toast.error(
          typeof serverMsg === "string" ? serverMsg : JSON.stringify(serverMsg),
        );
      } catch (e) {
        toast.error("Error al guardar contactos");
      }
    } finally {
      setLoading(false);
    }
  };
  // faltas: fetch count of absences for this child and store in state
  const [faltas, setFaltas] = useState(null);
  useEffect(() => {
    let mounted = true;
    const nid = nin.id || nin._id;
    if (!nid) return;
    api
      .get(`/asistencia/ninio/${nid}/faltas`)
      .then((res) => {
        if (!mounted) return;
        const data = res.data;
        const value =
          data?.faltas ??
          data?.cantFaltas ??
          (typeof data === "number" ? data : String(data));
        setFaltas(value ?? "-");
      })
      .catch((err) => {
        console.error("Error fetching faltas for niño", nid, err);
        setFaltas("N/A");
        const server = err?.response?.data;
        const serverMsg =
          server?.message || server || err.message || "Error al cargar faltas";
        try {
          toast.error(
            typeof serverMsg === "string"
              ? serverMsg
              : JSON.stringify(serverMsg),
          );
        } catch (e) {
          toast.error("Error al cargar faltas");
        }
      });
    return () => {
      mounted = false;
    };
  }, [nin.id, nin._id]);

  return (
    <div className="perfil-root">
      <div className="perfil-top">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
          aria-label="volver"
        >
          ←
        </button>
        <div className="perfil-avatar-wrap">
          <img
            className="perfil-avatar"
            src={fotoSrc}
            alt={nin.nombre || "Foto del niño"}
          />
        </div>
        <div className="nombre">{nin.nombre || "Nombre no disponible"}</div>
      </div>

      <div className="perfil-sections perfil-content">
        <div className="card">
          <h3>Información General</h3>
          <div className="row">
            <span>Nombre: </span>
            <span>
              {" " + (nin.nombre || "-")} {nin.apellido || ""}
            </span>
          </div>
          <div className="row">
            <span>Edad: </span>
            <span>{" " + (nin.edad || "-")}</span>
          </div>
          <div className="row">
            <span>División: </span>
            <span>{" " + (nin.division || nin.grupo || "-")}</span>
          </div>
          <div className="row">
            <span>Recorrida: </span>
            <span>{" " + (nin.recorrida || nin.grupo || "-")}</span>
          </div>
        </div>

        <div className="card">
          <h3>Contactos</h3>

          {editingContacts ? (
            <div className="contacts-edit-panel">
              {editContacts.map((c, idx) => (
                <div className="contact-row" key={idx}>
                  <input
                    placeholder="Nombre"
                    value={c.nombre || ""}
                    onChange={(e) =>
                      updateEditContact(idx, "nombre", e.target.value)
                    }
                  />
                  <input
                    placeholder="Relación"
                    value={c.relacion || ""}
                    onChange={(e) =>
                      updateEditContact(idx, "relacion", e.target.value)
                    }
                  />
                  <input
                    placeholder="Teléfono"
                    value={c.telefono || ""}
                    onChange={(e) =>
                      updateEditContact(idx, "telefono", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeEditContact(idx)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={addEditContact}
                >
                  + Agregar contacto
                </button>
              </div>
              <div className="actions" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingContacts(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={saveContacts}
                  disabled={loading}
                >
                  Guardar contactos
                </button>
              </div>
            </div>
          ) : contactosList.length === 0 ? (
            <div className="row">
              <span>Contacto</span>
              <span>-</span>
            </div>
          ) : (
            contactosList.map((c) => (
              <div key={c.id} className="contacto-item">
                <div className="row">
                  <span>Nombre</span>
                  <span>
                    {c.nombre || c.nombreCompleto || c.fullName || "-"}
                  </span>
                </div>
                <div className="row">
                  <span>Relación</span>
                  <span>
                    {" " + (c.relacion || c.parentesco || c.rol || "-")}
                  </span>
                </div>
                <div className="row">
                  <span>Teléfono</span>
                  <span>
                    {c.telefono ||
                      c.telefono_celular ||
                      c.telefono1 ||
                      nin.telefono ||
                      "-"}
                  </span>
                </div>

                {c.direccion || c.domicilio ? (
                  <div className="row">
                    <span>Dirección</span>
                    <span>{" " + (c.direccion || c.domicilio)}</span>
                  </div>
                ) : null}
              </div>
            ))
          )}
          {/* <button className="edit-btn" onClick={startEditContacts}>
            Editar contactos
          </button> */}
        </div>
      </div>
      <div className="perfil-actions">
        <button
          className="edit-btn"
          onClick={() => navigate("/ninios/edit", { state: { nin } })}
        >
          Editar perfil
        </button>
        <BotonEliminar
          id={nin._id || nin.id}
          onDeleted={() => navigate(-1)}
          className="delete-btn"
        />
        <button className="back-btn" onClick={() => navigate(-1)}></button>
      </div>
    </div>
  );
};

export default PerfilNinio;
