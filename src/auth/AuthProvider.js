import { AuthContext } from "./AuthContext";

export const AuthProvider = (props) => {
  const { authService, children } = props;
  
  return (
    <AuthContext.Provider value={{ authService }}>
      {children}
    </AuthContext.Provider>
  );
};