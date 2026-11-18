const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "The request was not successful.");
  }

  return result;
}

export const libraryApi = {
  getBooks() {
    return request("/books");
  },

  createBook(book) {
    return request("/books", {
      method: "POST",
      body: JSON.stringify(book),
    });
  },

  updateBook(book) {
    return request(`/books/${book.id}`, {
      method: "PUT",
      body: JSON.stringify(book),
    });
  },

  deleteBook(bookId) {
    return request(`/books/${bookId}`, { method: "DELETE" });
  },

  getTransactions() {
    return request("/transactions");
  },

  recordTransaction(transaction) {
    return request("/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
  },

  getUsers() {
    return request("/users");
  },

  login(membershipId) {
    return request("/users/login", {
      method: "POST",
      body: JSON.stringify({ membershipId }),
    });
  },

  createUser(user) {
    return request("/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
  },

  updateUser(user) {
    return request(`/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
  },

  deleteUser(userId) {
    return request(`/users/${userId}`, { method: "DELETE" });
  },
};
