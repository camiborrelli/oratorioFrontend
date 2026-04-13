import { createSlice } from "@reduxjs/toolkit";

export const getEventos = (state) => state.eventos.eventos;

const initialState = { eventos: [] };

const eventoSlice = createSlice({
  name: "evento",
  initialState,
  reducers: {
    listarEventos(state, action) {
      state.eventos = action.payload;
    },
    agregarEvento(state, action) {
      state.eventos.push(action.payload);
    },
    editarEvento(state, action) {
      const index = state.eventos.findIndex(
        (evento) => evento.id === action.payload.id,
      );
      if (index !== -1) state.eventos[index] = action.payload;
    },
    eliminarEvento(state, action) {
      state.eventos = state.eventos.filter(
        (evento) => evento.id !== action.payload,
      );
    },
  },
});

export const { listarEventos, agregarEvento, editarEvento, eliminarEvento } =
  eventoSlice.actions;
export default eventoSlice.reducer;
