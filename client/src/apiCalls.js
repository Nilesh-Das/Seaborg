import axios from "axios";

export const loginCall = async (userCredential, dispatch) => {
  const api = process.env.REACT_APP_API_URL;
  dispatch({ type: "LOGIN_START" });
  try {
    const res = await axios.post(`${api}/auth/login`, userCredential);
    dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
  } catch (err) {
    dispatch({ type: "LOGIN_FAILURE", payload: err });
  }
};

