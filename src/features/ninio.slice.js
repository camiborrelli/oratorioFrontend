import { createSlice } from "@reduxjs/toolkit";
export const getNinios = (state) => state.ninios.ninios;

const initialState = {
  ninios: [],
};

const ninioSlice = createSlice({
  name: "ninio",
  initialState,
  reducers: {
    listarNinios(state, action) {
      state.ninios = action.payload || [];
    },
    agregarNinio(state, action) {
      state.ninios.push(action.payload);
    },
    // store a selected ninio when requested
    buscarNinio(state, action) {
      const found = state.ninios.find((nin) => nin.id === action.payload);
      state.selected = found || null;
    },
    editarNinio(state, action) {
      const index = state.ninios.findIndex(
        (nin) => nin.id === action.payload.id,
      );
      if (index !== -1) {
        state.ninios[index] = action.payload;
      }
    },
    eliminarNinio(state, action) {
      state.ninios = state.ninios.filter((nin) => nin.id !== action.payload);
    },
  },
});

export const {
  listarNinios,
  agregarNinio,
  buscarNinio,
  editarNinio,
  eliminarNinio,
} = ninioSlice.actions;

export default ninioSlice.reducer;
