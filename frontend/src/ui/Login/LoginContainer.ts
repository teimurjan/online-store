import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import Login from './Login';
import { RootState } from '../../rootReducer';
import LoginActions from './LoginActions';

function mapStateToProps(state: RootState) {
  return state.login.toJS();
}

function mapDispatchToProps(dispatch: Dispatch<RootState>) {
  return {
    actions: bindActionCreators(LoginActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);