import {Map} from 'immutable';
import createReducer from "../../createReducer";
import {CHANGE_EMAIL, CHANGE_PASSWORD, SUBMIT, SUBMIT_FAILURE, SUBMIT_SUCCESS} from "./LoginActions";

export const INITIAL_STATE = Map({
  email: '',
  password: '',
  isLoading: false,
  errors: null
});

export default createReducer({
  [CHANGE_EMAIL]: (state, action) => state.set('email', action.payload.email),
  [CHANGE_PASSWORD]: (state, action) => state.set('password', action.payload.password),
  [SUBMIT]: (state, action) => state.merge({isLoading: true, errors: null}),
  [SUBMIT_SUCCESS]: (state, action) => state.set('isLoading', false),
  [SUBMIT_FAILURE]: (state, action) => state.merge({isLoading: false, errors: action.errors}),
}, INITIAL_STATE);