import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const pronounMatch = email.match(/\.([a-z]+)(?=@)/); 

    if (!pronounMatch) {
      alert("Invalid email format");
      return;
    }

    const pronoun = pronounMatch[1]; 
    const endpointMap = {
      pt: "/users/login",
      dr: "/dr/login",
      ha: "/ha/login",
      ex: "/ex/login",
    };

    const loginEndpoint = endpointMap[pronoun];

    if (!loginEndpoint) {
      alert("Invalid user type");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000${loginEndpoint}`,
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const redirectMap = {
          pt: "/userHome",
          dr: "/drHome",
          ha: "/haHome",
          ex: "/exHome",
        };
        navigate(redirectMap[pronoun] || "/home");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="outer">
      <div className="loginContainer">
        <img className="logo" src="./Medviora.png" alt="Medvion Logo" />
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label>Email:</label>
          <input
            type="email"
            className="inputField"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br />
          <label>Password:</label>
          <input
            type="password"
            className="inputField"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <button type="submit" className="loginButton">Login</button>
          <div>
            <Link to="/resetPassword" className="forgotPassword">Forgot password?</Link>
            <Link to="/signUp" className="signup">Not a user? Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
