import { useEffect, useRef, useState } from "react";
import { getProfile, upsertProfile } from "../lib/profileService";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function UserMenu({ session, onLogout }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    education: "",
    level: "Beginner",
  });
  const [saveError, setSaveError] = useState("");
  const menuRef = useRef(null);

  useEffect(() => {
    getProfile(session.user.id).then((p) => {
      if (p) {
        setProfile(p);
        setForm({
          name: p.name || "",
          age: p.age || "",
          education: p.education || "",
          level: p.level || "Beginner",
        });
      } else {
        setEditing(true);
      }
    });
  }, [session.user.id]);

  // close dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = (profile?.name || session.user.email || "?")[0].toUpperCase();

  const handleSave = async () => {
    setSaveError("");
    const { error } = await upsertProfile(session.user.id, {
      name: form.name,
      age: form.age ? Number(form.age) : null,
      education: form.education,
      level: form.level,
    });
    if (error) {
      setSaveError(error.message);
      return;
    }
    setProfile({ ...form });
    setEditing(false);
    setOpen(false);
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button className="avatar-btn" onClick={() => setOpen(!open)}>
        {initial}
      </button>
      {open && (
        <div className="user-dropdown">
          {editing ? (
            <div className="profile-form">
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
              </label>
              <label>
                Age
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Age"
                />
              </label>
              <label>
                Class / Degree
                <input
                  value={form.education}
                  onChange={(e) =>
                    setForm({ ...form, education: e.target.value })
                  }
                  placeholder="e.g. B.A. 2nd year"
                />
              </label>
              <label>
                Level
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              {saveError && <div className="profile-error">{saveError}</div>}
              <button className="save-profile-btn" onClick={handleSave}>
                Save
              </button>
            </div>
          ) : (
            <div className="profile-view">
              <div className="profile-name">
                {profile?.name || session.user.email}
              </div>
              {profile?.age && (
                <div className="profile-row">Age: {profile.age}</div>
              )}
              {profile?.education && (
                <div className="profile-row">{profile.education}</div>
              )}
              <div className="profile-row">
                Level: <b>{profile?.level || "Beginner"}</b>
              </div>
              <button
                className="edit-profile-btn"
                onClick={() => setEditing(true)}
              >
                Edit profile
              </button>
            </div>
          )}
          <button className="logout-btn-menu" onClick={onLogout}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
