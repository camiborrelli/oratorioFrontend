import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "../../api";
import { toast } from "react-toastify";

const ConfirmarAsistencia = ({
  evento,
  eventoId,
  animadorId: propAnimadorId,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [animadorId, setAnimadorId] = useState(propAnimadorId || null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // try localStorage first
    if (!animadorId) {
      const stored =
        localStorage.getItem("animadorId") ||
        localStorage.getItem("userId") ||
        null;
      if (stored) setAnimadorId(stored);
    }
    // determine confirmed state from provided evento if available
    const isConfirmed = (ev, aid) => {
      if (!ev || !aid) return false;
      // common fields: animadores (array of ids or objects), animadoresIds, asistentes
      const candidates = [
        ev.animadores,
        ev.animadoresIds,
        ev.asistentes,
        ev.confirmados,
      ];
      for (const c of candidates) {
        if (!c) continue;
        if (Array.isArray(c)) {
          for (const it of c) {
            if (!it) continue;
            // it may be string/number id or object with id/_id
            if (typeof it === "string" || typeof it === "number") {
              if (String(it) === String(aid)) return true;
            } else if (typeof it === "object") {
              const vid =
                it.id || it._id || it.animadorId || it.userId || it.usuario;
              if (vid && String(vid) === String(aid)) return true;
            }
          }
        }
      }
      return false;
    };

    if (evento && animadorId) {
      setConfirmed(isConfirmed(evento, animadorId));
    }
    // do NOT call /animador/me here — backend may not expose this route.
  }, [evento, animadorId]);

  const sendConfirm = async () => {
    if (!eventoId) {
      console.warn("ConfirmarAsistencia: eventoId ausente", {
        eventoId,
        animadorId,
      });
      return toast.error("Evento inválido");
    }
    if (!animadorId) {
      console.warn("ConfirmarAsistencia: animadorId ausente", {
        eventoId,
        animadorId,
      });
      return toast.error(
        "No se encontró animador logueado. Iniciá sesión para confirmar asistencia.",
      );
    }
    setLoading(true);
    // Optimistic UI: mark as confirmed immediately so the button becomes "Cancelar"
    // Try a few endpoint variants to be robust against backend route differences.
    const candidates = [
      { method: "post", url: `/evento/${eventoId}/animadores/${animadorId}` },
      { method: "post", url: `/eventos/${eventoId}/animadores/${animadorId}` },
      {
        method: "post",
        url: `/evento/${eventoId}/animadores`,
        data: { animadorId },
      },
      {
        method: "post",
        url: `/eventos/${eventoId}/animadores`,
        data: { animadorId },
      },
      {
        method: "post",
        url: `/evento/${eventoId}/confirmar`,
        data: { animadorId },
      },
      { method: "put", url: `/evento/${eventoId}/animadores/${animadorId}` },
      { method: "put", url: `/eventos/${eventoId}/animadores/${animadorId}` },
    ];

    let lastError = null;
    for (const c of candidates) {
      try {
        console.info(
          "ConfirmarAsistencia: intentando",
          c.method.toUpperCase(),
          c.url,
          c.data ? c.data : "(no body)",
        );
        let res;
        if (c.method === "post")
          res = await api.post(c.url, c.data || undefined);
        else if (c.method === "put")
          res = await api.put(c.url, c.data || undefined);
        else
          res = await api.request({
            method: c.method,
            url: c.url,
            data: c.data,
          });

        console.info(
          "ConfirmarAsistencia: respuesta OK desde",
          c.url,
          res && res.data,
        );
        toast.success("Asistencia confirmada");
        setConfirmed(true);
        if (typeof onSuccess === "function") onSuccess(res.data);
        setLoading(false);
        return;
      } catch (err) {
        lastError = err;
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.warn("ConfirmarAsistencia: intento fallido", c.url, {
          status,
          data,
        });
        // if not found, try next candidate; if client error other than 404, stop and show message
        if (status && status !== 404 && status < 500) {
          const msg =
            data?.message || err.message || "Error al confirmar asistencia";
          // revert optimistic state on client error
          setConfirmed(false);
          toast.error(msg);
          setLoading(false);
          return;
        }
        // otherwise continue to next candidate
      }
    }

    // All attempts failed
    console.error(
      "ConfirmarAsistencia: todos los intentos fallaron",
      lastError,
    );
    // revert optimistic confirmed state
    setConfirmed(false);
    const finalData = lastError?.response?.data;
    if (lastError?.response?.status === 404) {
      toast.error(finalData?.message || "Evento no encontrado (404)");
    } else {
      toast.error(
        finalData?.message ||
          lastError?.message ||
          "Error al confirmar asistencia",
      );
    }
    setLoading(false);
  };

  const cancelConfirm = async () => {
    if (!eventoId) return toast.error("Evento inválido");
    if (!animadorId) return toast.error("Animador inválido");
    setLoading(true);
    const candidates = [
      { method: "delete", url: `/evento/${eventoId}/animadores/${animadorId}` },
      {
        method: "delete",
        url: `/eventos/${eventoId}/animadores/${animadorId}`,
      },
      {
        method: "delete",
        url: `/evento/${eventoId}/animadores`,
        data: { animadorId },
      },
      {
        method: "delete",
        url: `/eventos/${eventoId}/animadores`,
        data: { animadorId },
      },
      {
        method: "post",
        url: `/evento/${eventoId}/animadores/${animadorId}/cancel`,
      },
      {
        method: "post",
        url: `/evento/${eventoId}/cancelar`,
        data: { animadorId },
      },
    ];

    let lastError = null;
    for (const c of candidates) {
      try {
        console.info(
          "ConfirmarAsistencia: intentando cancel",
          c.method.toUpperCase(),
          c.url,
          c.data ? c.data : "(no body)",
        );
        let res;
        if (c.method === "delete")
          res = await api.delete(c.url, { data: c.data });
        else if (c.method === "post")
          res = await api.post(c.url, c.data || undefined);
        else
          res = await api.request({
            method: c.method,
            url: c.url,
            data: c.data,
          });

        console.info(
          "ConfirmarAsistencia: cancel OK desde",
          c.url,
          res && res.data,
        );
        toast.success("Asistencia cancelada");
        setConfirmed(false);
        if (typeof onSuccess === "function") onSuccess(res.data);
        setLoading(false);
        return;
      } catch (err) {
        lastError = err;
        const status = err?.response?.status;
        const data = err?.response?.data;
        console.warn("ConfirmarAsistencia: intento cancel fallido", c.url, {
          status,
          data,
        });
        if (status && status !== 404 && status < 500) {
          const msg =
            data?.message || err.message || "Error al cancelar asistencia";
          toast.error(msg);
          setLoading(false);
          return;
        }
      }
    }

    console.error(
      "ConfirmarAsistencia: todos intentos cancel fallaron",
      lastError,
    );
    const finalData = lastError?.response?.data;
    toast.error(
      finalData?.message ||
        lastError?.message ||
        "Error al cancelar asistencia",
    );
    setLoading(false);
  };

  return (
    <div className="confirmar-asistencia-root">
      {!confirmed ? (
        <button
          className="btn btn-primary bg-green-600 text-white px-3 py-1 rounded-md"
          onClick={sendConfirm}
          disabled={loading}
        >
          {loading ? "Confirmando..." : "Voy"}
        </button>
      ) : (
        <button
          className="btn btn-danger px-3 py-1 rounded-md"
          onClick={cancelConfirm}
          disabled={loading}
          title="Cancelar asistencia"
        >
          {loading ? "Cancelando..." : "Cancelar"}
        </button>
      )}
    </div>
  );
};

export default ConfirmarAsistencia;
