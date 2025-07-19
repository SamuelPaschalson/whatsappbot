import axios from "axios";
import { loginFailure, loginStart, loginSuccess } from "./AuthActions";

export const login = async (user, dispatch) => {
  dispatch(loginStart());
  try {
    const res = await axios.post(
      "https://whatsappbot-1-e6rt.onrender.com/api/auth/login",
      user
    );

    if (res.data.success) {
      // Store token in localStorage
      localStorage.setItem("token", res.data.accessToken);

      // Dispatch success with formatted user data
      dispatch(
        loginSuccess({
          ...res.data.data,
          accessToken: res.data.accessToken,
        })
      );
    } else {
      dispatch(loginFailure());
    }
  } catch (err) {
    dispatch(loginFailure());
  }
};
