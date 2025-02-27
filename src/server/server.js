import express from "express";
import cors from "cors";
import pool from "./db.js";
import session from "express-session";
import userRoutes from "./user.js";
import drRoutes from "./doctor.js";

const app = express();
const PORT = 5000;



pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Connection error", err));

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

//session
app.use(
    session({
      secret: "your-secret-key",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }, 
    })
  );

 
  app.use("/users", userRoutes);
  app.use("/dr",drRoutes);
// Login Route

app.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
});

// Logout Route
app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));