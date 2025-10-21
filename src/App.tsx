import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [marketHours, setMarketHours] = useState<string>("Loading...");
  const [marketHoursId, setMarketHoursId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHours, setNewHours] = useState("");
  const { signOut } = useAuthenticator();

  // --- Load todos ---
  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  // --- Load market hours ---
  useEffect(() => {
    async function loadMarketHours() {
      try {
        const result = await client.models.MarketHours.list();
        if (result.data.length > 0) {
          const record = result.data[0];
          setMarketHours(record.hours);
          setMarketHoursId(record.id);
        } else {
          const created = await client.models.MarketHours.create({
            hours: "9:00 AM - 5:00 PM",
          });
          setMarketHours(created.data.hours);
          setMarketHoursId(created.data.id);
        }
      } catch (err) {
        console.error("Error loading MarketHours:", err);
      }
    }
    loadMarketHours();
  }, []);

  // --- Todo actions ---
  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) client.models.Todo.create({ content });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  // --- Market Hours modal actions ---
  function openModal() {
    setNewHours(marketHours);
    setIsModalOpen(true);
  }

  async function saveMarketHours() {
    if (marketHoursId) {
      await client.models.MarketHours.update({ id: marketHoursId, hours: newHours });
    } else {
      const created = await client.models.MarketHours.create({ hours: newHours });
      setMarketHoursId(created.data.id);
    }
    setMarketHours(newHours);
    setIsModalOpen(false);
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Todos</h1>
        <div>
          <button onClick={openModal}>Change Market Hours</button>
          <button onClick={signOut} style={{ marginLeft: "0.5rem" }}>Sign out</button>
        </div>
      </header>

      <p><strong>Market Hours:</strong> {marketHours}</p>

      <button onClick={createTodo}>+ New</button>

      <ul>
        {todos.map((todo) => (
          <li
            onClick={() => deleteTodo(todo.id)}
            key={todo.id}
            style={{
              cursor: "pointer",
              marginTop: "0.25rem",
              listStyle: "none",
              padding: "0.25rem 0",
            }}
          >
            {todo.content}
          </li>
        ))}
      </ul>

      {/* --- Modal Popup --- */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              width: "300px",
              textAlign: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            <h2>Change Market Hours</h2>
            <input
              type="text"
              value={newHours}
              onChange={(e) => setNewHours(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "1rem",
                border: "1px solid #ccc",
                borderRadius: "6px",
              }}
            />
            <div style={{ marginTop: "1.5rem" }}>
              <button onClick={saveMarketHours}>Save</button>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ marginLeft: "0.5rem" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
