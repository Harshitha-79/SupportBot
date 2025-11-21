import { useState } from "react";
import axios from "../api/axiosInstance";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", { email, password });
      console.log('Login response:', res.data); // Debug log
      sessionStorage.setItem("token", res.data.token);
      if (res.data?.user?.role) {
        sessionStorage.setItem("role", res.data.user.role);
        console.log('Stored role:', res.data.user.role); // Debug log
      }
      if (res.data?.user?.id) {
        sessionStorage.setItem("userId", res.data.user.id);
      }
      if (res.data?.user?.name) {
        sessionStorage.setItem("userName", res.data.user.name);
      }
      if (res.data?.user?.email) {
        sessionStorage.setItem("userEmail", res.data.user.email);
      }
      const role = res.data?.user?.role;
      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "it_support") {
        window.location.href = "/it";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md">
        <form onSubmit={handleLogin} className="card-body">
          <h2 className="text-center mb-6">Login</h2>
          {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
          <input className="input mb-3" placeholder="Email"
            value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="input mb-4" placeholder="Password" type="password"
            value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button className="btn-primary w-full">Login</button>
          <p className="text-center text-sm mt-4 text-slate-600">
            Don’t have an account? <a href="/register" className="underline">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
}
