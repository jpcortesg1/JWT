// Dependences
import { useState } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const refreshToken = async () => {
    try {
      const { data } = await axios.post("/refresh", {
        token: user.refreshToken,
      });
      setUser({
        ...user,
        accesToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    // Do sth
    async (config) => {
      let currentDate = new Date();
      const decodedToken = jwt_decode(user.accessToken);
      if (decodedToken.exp * 1000 < currentDate.getTime()) {
        const data = await refreshToken();
        config.headers["authorization"] = `Bearer ${data.accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const credentials = {
        username,
        password,
      };
      const { data } = await axios.post("/login", credentials);
      setUser(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id) => {
    setSuccess(false);
    setError(false);
    try {
      await axiosJWT.delete(`/user/${id}`, {
        headers: {
          authorization: `Bearer ${user.accessToken}`,
        },
      });
      setSuccess(true);
    } catch (error) {
      setError(true);
    }
  };

  return (
    <div className="App">
      <div className="container offset-3 col-6 row mt-5 pt-5">
        {user ? (
          <div className="card" style={{ width: "18rem" }}>
            <div className="card-body">
              <h5 className="card-title">Welcome to the user dashboard</h5>
              <h6 className="card-subtitle mb-2 text-muted">{user.username}</h6>
              <p className="card-text">Delete users</p>
              <div className="d-flex flex-column">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(1)}
                >
                  Delete Jhon
                </button>
                <button
                  type="button"
                  className="btn btn-danger mt-3 mb-3"
                  onClick={() => handleDelete(2)}
                >
                  Delete Jane
                </button>
                {success && (
                  <p className="fs-6">User has been deleted successfully</p>
                )}
                {error && <p className="fs-6">You are not authenticated!</p>}
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-5 p-5" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                className="form-control"
                id="username"
                autoComplete="off"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="form-control"
                id="exampleInputPassword1"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;
