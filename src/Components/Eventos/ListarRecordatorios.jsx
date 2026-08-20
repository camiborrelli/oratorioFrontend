import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchList } from "../../api";
import "./ListarRecordatorios.css";
import { FiCheck } from "react-icons/fi";
import { FaRegCircleCheck } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const ListarRecordatorios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordatorios, setRecordatorios] = useState([]);
  // guardamos el estado "hecho" por id, no un solo boolean global
  const [doneIds, setDoneIds] = useState(() => new Set());
  const pendientes = recordatorios.filter((rec) => rec.estado === "pendiente");
  const hechos = recordatorios.filter((rec) => rec.estado === "completado");
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const [animadorId, setAnimadorId] = useState(null);
  const [animador, setAnimador] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCordi, setIsCordi] = useState(false);

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
  useEffect(() => {
    const cargarAnimador = async () => {
      try {
        const storedId = localStorage.getItem("animadorId");
        if (!storedId) {
          console.error("No existe animadorId en localStorage");
          return;
        }
        setAnimadorId(storedId);

        const res = await api.get(`/animador/id/${storedId}`);
        const datosAnimador = res.data?.animador || res.data;
        setAnimador(datosAnimador);

        const coordi =
          datosAnimador?.roles?.includes("coordinador") ||
          datosAnimador?.roles?.includes("cordi");
        setIsCordi(coordi);

        const admin = datosAnimador?.roles?.includes("admin");
        setIsAdmin(admin);
      } catch (error) {
        console.error(
          "Error obteniendo animador:",
          error?.response?.data || error,
        );
        setAnimador(null);
      }
    };
    cargarAnimador();
  }, []);

  const toggleDone = (id) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const marcarComoHecho = async (id) => {
    try {
      const res = await api.post(`/eventos/recordatorios/${id}/hecho`);
      if (res?.status === 200 || res?.status === 201) {
        toast.success("Recordatorio marcado como hecho");
        listarRecordatorios();
        // toggleDone(id);
      }
    } catch (error) {
      console.error("Error marcando recordatorio como hecho", error);
    }
  };

  const verTodos = () => {
    setMostrarTodos((prev) => !prev);
  };

  const eliminarRecordatorio = async (id) => {
    try {
      const res = await api.delete(`/eventos/recordatorios/${id}`);
      if (res?.status === 200 || res?.status === 204) {
        toast.success("Recordatorio eliminado");
        listarRecordatorios();
      }
    } catch (error) {
      console.error("Error eliminando recordatorio", error);
      toast.error("No se pudo eliminar el recordatorio");
    }
  };

  return (
    <div className="listar-recordatorios">
      <div className="recorridatorios-header">
        <h2>Recordatorios</h2>
        <button
          type="button"
          onClick={verTodos}
          className="btn bg-gray-100 px-3 py-1 rounded-md ver-todos-btn"
        >
          {mostrarTodos ? "Ver pendientes" : "Ver todos"}
        </button>
      </div>
      {mostrarTodos ? (
        <div>
          <h2>Recordatorios pendientes</h2>

          {pendientes.length === 0 ? (
            <p>No hay recordatorios pendientes.</p>
          ) : (
            <div className="recordatorios-list">
              {pendientes.map((rec) => (
                <article key={rec._id} className="rec-card">
                  {console.log("Recordatorio:", rec)}
                  <div
                    className={`rec-card__dot ${
                      rec.color === "green"
                        ? "rec-card__dot--green"
                        : "rec-card__dot--red"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="rec-card__content">
                    <h3 className="rec-card__title">{rec.titulo}</h3>
                    <p className="rec-card__desc">{rec.descripcion}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => marcarComoHecho(rec._id)}
                    aria-pressed="false"
                    aria-label="Marcar como hecho"
                    title="Marcar como hecho"
                  >
                    <FaRegCircleCheck className="rec-card__tick" />
                  </button>
                </article>
              ))}
            </div>
          )}

          <h2>Recordatorios hechos</h2>

          {hechos.length === 0 ? (
            <p>No hay recordatorios hechos.</p>
          ) : (
            <div className="recordatorios-list">
              {hechos.map((rec) => (
                <article key={rec._id} className="rec-card">
                  {console.log("Recordatorio:", rec)}
                  <div
                    className={`rec-card__dot ${
                      rec.color === "green"
                        ? "rec-card__dot--green"
                        : "rec-card__dot--red"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="rec-card__content">
                    <h3 className="rec-card__title">{rec.titulo}</h3>
                    <p className="rec-card__desc">{rec.descripcion}</p>
                    {isCordi && (
                      <button
                        type="button"
                        onClick={() => eliminarRecordatorio(rec._id)}
                        aria-label="Eliminar recordatorio"
                        title="Eliminar recordatorio"
                      >
                        <FaTrashAlt
                          className="rec-card__delete"
                          style={{ color: "red" }}
                        />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {loading && <p>Cargando recordatorios...</p>}
          {error && <p className="error">{error}</p>}
          {!loading && !error && recordatorios.length === 0 && (
            <p>No hay recordatorios disponibles.</p>
          )}
          {!loading && !error && recordatorios.length > 0 && (
            <>
              {pendientes.length === 0 ? (
                <p className="no-pendientes">
                  ¡No quedan recordatorios pendientes! 🎉
                </p>
              ) : (
                <div className="recordatorios-list">
                  {pendientes.map((rec) => (
                    <article key={rec._id} className="rec-card">
                      <div
                        className={`rec-card__dot ${
                          rec.color === "green"
                            ? "rec-card__dot--green"
                            : "rec-card__dot--red"
                        }`}
                        aria-hidden="true"
                      />
                      <div className="rec-card__content">
                        <h3 className="rec-card__title">{rec.titulo}</h3>
                        <p className="rec-card__desc">{rec.descripcion}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => marcarComoHecho(rec._id)}
                        aria-pressed="false"
                        aria-label="Marcar como hecho"
                        title="Marcar como hecho"
                      >
                        <FaRegCircleCheck className="rec-card__tick" />
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ListarRecordatorios;
