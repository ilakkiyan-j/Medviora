import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./Pages/Login";
import UserHome from "./Pages/user/UserHome";
import SignUp from "./Pages/SignUp";
import UserLogs from "./Pages/user/UserLogs";
import UserProfile from "./Pages/user/UserProfile";
import UserRecords from "./Pages/user/UserRecords";
import DrHome from "./Pages/doctor/DrHome";
import PatientProfile from "./Pages/doctor/PatientProfile";
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/userHome" element={<UserHome />} />
        <Route path="/userLogs" element={<UserLogs />} />
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/userRecords" element={<UserRecords />} />

        <Route path="/drHome" element={<DrHome />} />
        <Route path="/patientProfile" element={<PatientProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
