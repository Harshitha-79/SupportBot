import { useState } from "react";
import axios from "../api/axiosInstance";
import Navbar from "../components/Navbar";

export default function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      setMessage("Password changed successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container-page py-8 max-w-md">
        <h2 className="mb-6">Change Password</h2>
        <form onSubmit={handleSubmit} className="card">
          <div className="card-body space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="input"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="input"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="input"
              required
            />
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
        {message && (
          <p className={`mt-4 text-center ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}