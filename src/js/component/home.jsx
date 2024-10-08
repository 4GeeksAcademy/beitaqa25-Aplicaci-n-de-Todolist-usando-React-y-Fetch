import React, { useState, useEffect } from "react";

const Home = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://playground.4geeks.com/todo';
  const USER_NAME = 'alesanchezr';

  useEffect(() => {
    // Intentar obtener la lista de tareas del usuario
    fetch(`${API_BASE_URL}/users/${USER_NAME}`)
      .then((response) => {
        if (response.status === 404) {
          // Si el usuario no existe, crearlo
          return createUser();
        }
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTodos(data);
        } else {
          setTodos([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Función para crear un usuario
  const createUser = () => {
    return fetch(`${API_BASE_URL}/users/${USER_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([])
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return []; // El usuario ha sido creado con una lista vacía de tareas
      })
      .catch((error) => {
        throw new Error('Error creando el usuario: ' + error.message);
      });
  };

  const addTodo = (task) => {
    if (!task.trim()) return;

    const newTodo = { label: task, done: false };
    createTodoOnServer(newTodo);
  };

  const createTodoOnServer = (todo) => {
    fetch(`${API_BASE_URL}/todos/${USER_NAME}`, {
      method: "POST",
      body: JSON.stringify(todo),
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setTodos((prevTodos) => [...prevTodos, data]);
      })
      .catch((error) => {
        console.error("Error creando la tarea:", error);
        setError("No se pudo crear la tarea. Revisa la consola para más detalles.");
      });
  };

  const deleteTodo = (index) => {
    const todoId = todos[index].id;
    fetch(`${API_BASE_URL}/todos/${todoId}`, {
      method: "DELETE"
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        setTodos((prevTodos) => prevTodos.filter((_, i) => i !== index));
      })
      .catch((error) => {
        console.error("Error eliminando la tarea:", error);
        setError("No se pudo eliminar la tarea. Revisa la consola para más detalles.");
      });
  };

  const clearTodos = () => {
    // Eliminar cada tarea en el servidor
    Promise.all(
      todos.map((todo) =>
        fetch(`${API_BASE_URL}/todos/${todo.id}`, {
          method: "DELETE"
        })
      )
    )
      .then(() => {
        setTodos([]);
      })
      .catch((error) => {
        console.error("Error limpiando todas las tareas:", error);
        setError("No se pudo limpiar todas las tareas. Revisa la consola para más detalles.");
      });
  };

  if (loading) {
    return <div className="text-center">Cargando tareas...</div>;
  }

  if (error) {
    return <div className="text-center text-danger">Error: {error}</div>;
  }

  return (
    <div className="text-center">
      <h1 className="text-center mt-5">TODO List</h1>
      <div>
        <input
          type="text"
          id="newTask"
          placeholder="Nueva tarea"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim() !== "") {
              addTodo(e.target.value.trim());
              e.target.value = "";
            }
          }}
        />
      </div>
      <ul className="list-group mt-3">
        {todos.map((todo, index) => (
          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
            {todo.label}
            <button
              className="btn btn-danger btn-sm"
              onClick={() => deleteTodo(index)}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
      <button className="btn btn-warning mt-3" onClick={clearTodos}>
        Limpiar todas las tareas
      </button>
      <p className="mt-5">
        Made by{" "}
        <a href="http://www.4geeksacademy.com">4Geeks Academy</a>, with love!
      </p>
    </div>
  );
};

export default Home;
