import { useState } from "react";
import BookForm from "../components/BookForm";
import BookList from "../components/BookList";

function BooksPage({
  books,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
}) {
  const [editingBook, setEditingBook] = useState(null);

  async function handleSaveBook(bookDetails) {
    let result;

    if (editingBook) {
      result = await onUpdateBook(bookDetails);
    } else {
      result = await onAddBook(bookDetails);
    }

    if (result.success) {
      setEditingBook(null);
    }

    return result;
  }

  async function handleDeleteBook(bookId) {
    const result = await onDeleteBook(bookId);

    if (result.success && editingBook && editingBook.id === bookId) {
      setEditingBook(null);
    }

    return result;
  }

  return (
    <div>
      <h1>Book Management</h1>
      <p>Add, update and delete library books.</p>

      <div className="two-column-layout">
        <BookForm
          books={books}
          editingBook={editingBook}
          onSaveBook={handleSaveBook}
          onCancelEdit={() => setEditingBook(null)}
        />

        <BookList
          books={books}
          onEditBook={setEditingBook}
          onDeleteBook={handleDeleteBook}
        />
      </div>
    </div>
  );
}

export default BooksPage;
