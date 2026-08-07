import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchList } from "../../api";
import "./ListarRecordatorios.css";

const ListarRecordatorios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordatorios, setRecordatorios] = useState([]);

  const listarRecordatorios = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoints = [
        "/eventos/recordatorio",
        "/recordatorio",
        "/recordatorios",
      ];

      let data = null;
      let lastError = null;
      for (const endpoint of endpoints) {
        try {
          data = await fetchList(endpoint);
          break;
        } catch (err) {
          lastError = err;
          if (err?.response?.status !== 404) {
            throw err;
          }
        }
      }

      if (data == null)
        throw lastError || new Error("No recordatorios endpoint");
      setRecordatorios(Array.isArray(data) ? data : data || []);
    } catch (err) {
      console.error("Error fetching /recordatorios", err);
      if (err?.response?.status === 404) {
        setError(`No se encontró ningún recordatorio (404).`);
      } else {
        setError(err?.response?.data || err.message || String(err));
        toast.error("No se pudieron cargar los recordatorios");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    listarRecordatorios().catch(() => {});
  }, []);

  return (
    <div className="listar-recordatorios">
      <h2>Recordatorios</h2>
      {loading && <p>Cargando recordatorios...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && recordatorios.length === 0 && (
        <p>No hay recordatorios disponibles.</p>
      )}
      {!loading && !error && recordatorios.length > 0 && (
        <div className="recordatorios-list">
          {recordatorios.map((rec) => (
            <div key={rec._id} className="recordatorio-item">
              <li key={rec._id}>
                <span>{rec.titulo}</span>
                <strong>{rec.descripcion}</strong> -{" "}
              </li>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListarRecordatorios;
