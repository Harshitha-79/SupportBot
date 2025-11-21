import { useState } from "react";
import axios from "../api/axiosInstance";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "employee" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.password) {
      setError("Password is required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Email validation based on role
    if (form.role === 'employee' && !form.email.endsWith('@organization.com')) {
      setError("Employees must use their organization email address (@organization.com)");
      return;
    }
    if (form.role === 'it_support' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please provide a valid email address");
      return;
    }

    try {
      const { confirmPassword, ...registerData } = form;
      const res = await axios.post("/auth/register", registerData);

      // Check if registration is pending approval (IT Support)
      if (res.data.message === "Registration pending admin approval") {
        setSuccess("Registration successful! Your account is pending administrator approval. You can try logging in after approval (typically within 1-24 hours).");
        // Clear form
        setForm({ name: "", email: "", password: "", confirmPassword: "", role: "employee" });
        return;
      }

      // Normal registration flow
      sessionStorage.setItem("token", res.data.token);
      if (res.data?.user?.role) {
        sessionStorage.setItem("role", res.data.user.role);
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
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-full max-w-md">
        <form onSubmit={handleSubmit} className="card-body">
          <h2 className="text-center mb-6">Register</h2>
          {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-3 text-center">{success}</p>}
          <input className="input mb-3" placeholder="Name"
            value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/>
          <input className="input mb-3" placeholder="Email"
            value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/>
          <input className="input mb-3" placeholder="Password" type="password"
            value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/>
          <input className="input mb-3" placeholder="Confirm Password" type="password"
            value={form.confirmPassword} onChange={(e)=>setForm({...form,confirmPassword:e.target.value})}/>
          <select className="input mb-4"
            value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}>
            <option value="employee">Employee</option>
            <option value="it_support">IT Support</option>
          </select>
          <button className="btn-primary w-full" disabled={!!success}>Register</button>
          <p className="text-center text-sm mt-4 text-slate-600">
            Already have an account? <a href="/login" className="underline">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}
