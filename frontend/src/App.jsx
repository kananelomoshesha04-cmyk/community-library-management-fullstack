import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import BooksPage from "./pages/BooksPage";
import TransactionsPage from "./pages/TransactionsPage";
import UsersPage from "./pages/UsersPage";
import { libraryApi } from "./api/libraryApi";

function readCurrentUser() {
  try {
    const savedUser = sessionStorage.getItem("libraryCurrentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function getErrorMessage(error) {
  return error.message || "The request could not be completed.";
}

function App() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(readCurrentUser);
  const [loading, setLoading] = useState(Boolean(currentUser));
  const [appError, setAppError] = useState("");

  // Load the library records from the Express API after login.
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    async function loadLibraryData() {
      setLoading(true);
      setAppError("");

      try {
        const [booksResult, transactionsResult, usersResult] =
          await Promise.all([
            libraryApi.getBooks(),
            libraryApi.getTransactions(),
            libraryApi.getUsers(),
          ]);

        setBooks(booksResult.data);
        setTransactions(transactionsResult.data);
        setUsers(usersResult.data);
      } catch (error) {
        setAppError(
          `${getErrorMessage(error)} Make sure the backend and MySQL are running.`
        );
      } finally {
        setLoading(false);
      }
    }

    loadLibraryData();
  }, [currentUser]);

  async function login(membershipId) {
    try {
      const result = await libraryApi.login(membershipId);
      setLoading(true);
      setCurrentUser(result.data);
      sessionStorage.setItem(
        "libraryCurrentUser",
        JSON.stringify(result.data)
      );

      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }

  function logout() {
    sessionStorage.removeItem("libraryCurrentUser");
    setCurrentUser(null);
    setBooks([]);
    setTransactions([]);
    setUsers([]);
    setAppError("");
  }

  async function addBook(bookDetails) {
    try {
      const result = await libraryApi.createBook(bookDetails);
      setBooks((currentBooks) => [...currentBooks, result.data]);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }

  async function updateBook(updatedBook) {
    try {
      const result = await libraryApi.updateBook(updatedBook);
      setBooks((currentBooks) =>
        currentBooks.map((book) =>
          book.id === result.data.id ? result.data : book
        )
      );
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }

  async function deleteBook(bookId) {
    try {
      await libraryApi.deleteBook(bookId);
      setBooks((currentBooks) =>
        currentBooks.filter((book) => book.id !== bookId)
      );
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }

  async function recordTransaction(bookId, transactionType, quantity) {
    try {
      const result = await libraryApi.recordTransaction({
        bookId,
        type: transactionType,
        quantity: Number(quantity),
      });

      setBooks((currentBooks) =>
        currentBooks.map((book) =>
          book.id === result.book.id
            ? { ...book, quantity: result.book.quantity }
            : book
        )
      );

      setTransactions((currentTransactions) => [
        result.data,
        ...currentTransactions,
      ]);

      return {
        success: true,
        message: "Transaction recorded successfully.",
      };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }

  async function addUser(userDetails) {
    try {
      const result = await libraryApi.createUser(userDetails);
      setUsers((currentUsers) => [...currentUsers, result.data]);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }

  async function updateUser(updatedUser) {
    try {
      const result = await libraryApi.updateUser(updatedUser);
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === result.data.id ? result.data : user
        )
      );

      if (currentUser && currentUser.id === result.data.id) {
        setCurrentUser(result.data);
        sessionStorage.setItem(
          "libraryCurrentUser",
          JSON.stringify(result.data)
        );
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }

  async function deleteUser(userId) {
    if (currentUser && currentUser.id === userId) {
      return {
        success: false,
        message: "You cannot delete the account you are currently using.",
      };
    }

    try {
      await libraryApi.deleteUser(userId);
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId)
      );
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error) };
    }
  }

  if (currentUser && loading) {
    return (
      <main className="login-page">
        <section className="login-card">
          <h1>Loading Community Library</h1>
          <p>Please wait while the records are loaded from MySQL.</p>
        </section>
      </main>
    );
  }

  if (currentUser && appError) {
    return (
      <main className="login-page">
        <section className="login-card">
          <h1>Database Connection Error</h1>
          <p className="error-message">{appError}</p>
          <button className="danger-button" onClick={logout}>
            Return to Login
          </button>
        </section>
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          currentUser ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage onLogin={login} />
          )
        }
      />

      <Route
        path="/"
        element={
          currentUser ? (
            <Layout currentUser={currentUser} onLogout={logout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<DashboardPage books={books} />} />

        <Route
          path="books"
          element={
            <BooksPage
              books={books}
              onAddBook={addBook}
              onUpdateBook={updateBook}
              onDeleteBook={deleteBook}
            />
          }
        />

        <Route
          path="transactions"
          element={
            <TransactionsPage
              books={books}
              transactions={transactions}
              onRecordTransaction={recordTransaction}
            />
          }
        />

        <Route
          path="users"
          element={
            <UsersPage
              users={users}
              currentUser={currentUser}
              onAddUser={addUser}
              onUpdateUser={updateUser}
              onDeleteUser={deleteUser}
            />
          }
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to={currentUser ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;

