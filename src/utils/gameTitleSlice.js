import { createSlice } from "@reduxjs/toolkit";

export const gameTitleSlice = createSlice({
  name: 'gameTitle',
  initialState: {
    gameTitleCache: {}
  },
  reducers: {
    cacheGameTitle: (state, action) => {
      state.gameTitleCache[action.payload.slug] = action.payload;
    },
    clearGameTitleCache: (state, action) => {
      state.gameTitleCache = {};
    }
  }
});

export const { cacheGameTitle, clearGameTitleCache } = gameTitleSlice.actions;

export default gameTitleSlice.reducer;