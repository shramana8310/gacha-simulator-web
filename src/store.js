import { configureStore } from '@reduxjs/toolkit';
import gachaRequestFormSlice from './utils/gachaRequestFormSlice';
import gameTitleSlice from './utils/gameTitleSlice';

export default configureStore({
  reducer: {
    gachaRequestForm: gachaRequestFormSlice,
    gameTitle: gameTitleSlice,
  }
});