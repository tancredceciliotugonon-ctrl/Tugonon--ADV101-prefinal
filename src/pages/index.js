import { useEffect, useState } from "react";

// Simple To-Do app implementing create, update, delete, mark complete,
// two tabs (To Do / Completed) and search. Uses localStorage for persistence.

const STORAGE_KEY = "adv_todos_v1";

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [newText, setNewText] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("todo"); // "todo" or "completed"
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to load todos", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.error("Failed to save todos", e);
    }
  }, [todos]);

  function addTodo(e) {
    e && e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    const item = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((t) => [item, ...t]);
    setNewText("");
  }

  function deleteTodo(id) {
    setTodos((t) => t.filter((x) => x.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingText("");
    }
  }

  function toggleComplete(id) {
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, completed: !x.completed } : x)));
  }

  function startEdit(id, text) {
    setEditingId(id);
    setEditingText(text);
  }

  function saveEdit(id) {
    const text = editingText.trim();
    if (!text) return;
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, text } : x)));
    setEditingId(null);
    setEditingText("");
  }

  const filtered = todos.filter((t) => {
    if (tab === "todo" && t.completed) return false;
    if (tab === "completed" && !t.completed) return false;
    if (search && !t.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page-root">
      <main className="container">
        <h1>Simple To-Do</h1>

        <form onSubmit={addTodo} className="row">
          <input
            aria-label="Add todo"
            placeholder="Add a new task..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="input"
          />
          <button className="btn primary" type="submit">
            Add
          </button>
        </form>

        <div className="controls row">
          <div className="tabs" role="tablist">
            <button
              className={`tab ${tab === "todo" ? "active" : ""}`}
              onClick={() => setTab("todo")}
            >
              To Do
            </button>
            <button
              className={`tab ${tab === "completed" ? "active" : ""}`}
              onClick={() => setTab("completed")}
            >
              Completed
            </button>
          </div>

          <input
            aria-label="Search todos"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input search"
          />
        </div>

        <ul className="list">
          {filtered.length === 0 && <li className="empty">No items</li>}
          {filtered.map((item) => (
            <li key={item.id} className={`item ${item.completed ? "done" : ""}`}>
              <label className="item-left">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleComplete(item.id)}
                />
                {editingId === item.id ? (
                  <input
                    className="edit-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(item.id);
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditingText("");
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <span className="text">{item.text}</span>
                )}
              </label>

              <div className="item-controls">
                {editingId === item.id ? (
                  <>
                    <button className="btn" onClick={() => saveEdit(item.id)}>
                      Save
                    </button>
                    <button
                      className="btn muted"
                      onClick={() => {
                        setEditingId(null);
                        setEditingText("");
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn" onClick={() => startEdit(item.id, item.text)}>
                      Edit
                    </button>
                    <button className="btn danger" onClick={() => deleteTodo(item.id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>

      <style jsx>{`
        .page-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          padding: 40px 16px;
          box-sizing: border-box;
        }
        .container {
          width: 100%;
          max-width: 700px;
          background: #fff;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 6px 20px rgba(2,6,23,0.06);
        }
        h1 { margin: 0 0 12px 0; }
        .row { display: flex; gap: 8px; align-items: center; }
        form.row { margin-bottom: 12px; }
        .input { flex: 1; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; }
        .search { max-width: 220px; }
        .btn { padding: 8px 10px; border-radius: 6px; border: 1px solid #d1d5db; background: white; cursor: pointer; }
        .btn.primary { background: #111827; color: white; border-color: #111827; }
        .btn.danger { background: #ef4444; color: white; border-color: #ef4444; }
        .btn.muted { background: #f3f4f6; }
        .controls { justify-content: space-between; margin-bottom: 12px; }
        .tabs { display: flex; gap: 8px; }
        .tab { padding: 8px 12px; border-radius: 999px; border: 1px solid transparent; background: transparent; cursor: pointer; }
        .tab.active { background: #111827; color: white; }
        .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
        .item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 6px; border: 1px solid #e5e7eb; }
        .item.done { opacity: 0.7; text-decoration: line-through; }
        .item-left { display: flex; gap: 12px; align-items: center; }
        .text { max-width: 420px; display: inline-block; word-break: break-word; }
        .item-controls { display: flex; gap: 8px; }
        .edit-input { padding: 6px 8px; border-radius: 6px; border: 1px solid #d1d5db; }
        .empty { color: #6b7280; padding: 12px; text-align: center; }
        @media (max-width: 520px) {
          .container { padding: 16px; }
          .text { max-width: 200px; }
        }
      `}</style>
    </div>
  );
}
