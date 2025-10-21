import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [marketHours, setMarketHours] = useState<string>("9:00 AM - 5:00 PM");
  const { signOut } = useAuthenticator();

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) client.models.Todo.create({ content });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  function changeMarketHours() {
    const newHours = window.prompt("Enter new market hours:", marketHours);
    if (newHours) setMarketHours(newHours);
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>My Todos</h1>
        <div>
          <button onClick={changeMarketHours}>Change Market Hours</button>
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
            style={{ cursor: "pointer", marginTop: "0.25rem" }}
          >
            {todo.content}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
