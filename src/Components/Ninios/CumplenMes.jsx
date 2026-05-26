import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import "../Eventos/Eventos.css";
import "./CumplenMes.css";

const CumplenMes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ninios, setNinios] = useState([]);

  const listar = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date();
      const month = today.getMonth(); // 0-based
      // ask backend for that month (backend expects 1-12)
      const res = await api.get(`/ninios/cumplen-mes?mes=${month + 1}`);
      const payload = res.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.ninios)
          ? payload.ninios
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      // normalize possible date fields and ensure valid Date objects
      const withBirth = list
        .map((n) => {
          const raw =
            n.fecha_nacimiento ?? n.fechaNacimiento ?? n.fecha ?? n._fecha;
          const parsed = raw ? new Date(raw) : null;
          return {
            ...n,
            _fecha: parsed && !isNaN(parsed.getTime()) ? parsed : null,
          };
        })
        // if backend already filtered by month, keep; otherwise filter by month just in case
        .filter((n) => n._fecha && n._fecha.getMonth() === month)
        .sort((a, b) => a._fecha.getDate() - b._fecha.getDate());

      setNinios(withBirth);
    } catch (err) {
      console.error("Error fetching /ninios/cumplen-mes", err);
      setError(err?.response?.data || err.message || String(err));
      toast.error("No se pudieron cargar los cumpleaños");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listar().catch(() => {});
  }, []);

  const formatDay = (d) => (d ? d.getDate() : "?");

  return (
    <div className="eventos-container">
      {loading && (
        <div className="evt-loading text-center py-6">Cargando...</div>
      )}

      <div className="eventos-header flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Cumplen este mes</h1>
        <div className="eventos-header__actions">
          {/* <button
            className="btn btn-primary bg-green-600 text-white px-3 py-1 rounded-md"
            onClick={listar}
          >
            Actualizar
          </button> */}
        </div>
      </div>

      {!loading && !error && (
        <div className="eventos-grid">
          {ninios.length === 0 ? (
            <div className="evt-empty text-center py-6 text-slate-500">
              No hay cumpleaños este mes.
            </div>
          ) : (
            <div className="cumplen-carousel" role="list">
              {ninios.map((n) => (
                <div
                  key={n._id || n.id}
                  role="listitem"
                  className="cumple-card"
                >
                  <div className="cumple-avatar-wrap">
                    <img
                      src={
                        // n.foto ||
                        // n.imagen ||
                        // "/img/avatar-placeholder.png" ||
                        "/img/image.png"
                      }
                      alt={`${n.nombre || "Niño"} ${n.apellido || ""}`}
                      className="cumple-avatar"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/img/avatar-placeholder.png";
                      }}
                    />
                    <div className="cumple-day">{formatDay(n._fecha)}</div>
                  </div>
                  <div className="cumple-name">
                    {n.nombre || "Sin nombre"}
                    <div className="cumple-apellido">{n.apellido || ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CumplenMes;
