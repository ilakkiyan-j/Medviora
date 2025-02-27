import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/NavBar";
import "./UserHome.css";

export default function Home() {
  const [user, setUser] = useState(null);
  const [recent, setRecent] = useState(null);
  const navigate = useNavigate();

  const recommendations = ["t1.jpg", "t2.jpg", "t3.webp", "t4.webp", "t5.jpg", "t6.jpg","t7.jpg","t8.webp","t9.webp","t10.jpg"];

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await axios.get("http://localhost:5000/session", {
          withCredentials: true,
        });

        setUser(response.data.user);
        fetchRecent(response.data.user.email); // Passing email to fetchRecent
      } catch (error) {
        console.error("Error fetching session:", error);
        navigate("/");
      }
    }

    async function fetchRecent(email) {  // Accept email as a parameter
      try {
        const response = await axios.get(`http://localhost:5000/users/recent?email=${email}`, {
          withCredentials: true,
        });

        setRecent(response.data.recent);
      } catch (error) {
        console.error("Error fetching recent records:", error);
      }
    }

    fetchSession();
  }, [navigate]);

  return (
    <div className="container">
      <Navbar />
      <div className="welcome-section">
        <h2>Good Morning {user?.name}!</h2>
        <p>Here's a quick update on your health and upcoming events</p>
      </div>

      <div className="healing-section">
        <h3>Healing made simple..</h3>
        <div className="healing-images">
          {recommendations.map((item, index) => (
            <img src={item} key={index} alt={`Recommendation ${index + 1}`} />
          ))}
          <a href="" className="more-link">More</a>
        </div>
      </div>

      <div className="hospital-section">
  <p className="hospital-title">Place you recently visited:</p>
  <img src="./hospital.png" alt="Hospital" className="hospital-image" />
  {recent ? (
    <div className="hospital-details">
      <p className="hospital-name">Hospital Name: {recent.hospital_name}</p>
      <p className="hospital-visited">
        Visited On:{" "}
        {new Date(recent?.appointment_date).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        })}
      </p>
    </div>
  ) : (
    <p className="no-records">No recent records found.</p>
  )}
</div>

    </div>
  );
}
