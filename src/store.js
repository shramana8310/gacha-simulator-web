import { configureStore } from '@reduxjs/toolkit';
import gachaRequestFormSlice from './redux/gachaRequestFormSlice';
import gameTitleSlice from './redux/gameTitleSlice';

export default configureStore({
  reducer: {
    gachaRequestForm: gachaRequestFormSlice,
    gameTitle: gameTitleSlice,
  }
});