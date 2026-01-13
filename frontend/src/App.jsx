import { useState, useEffect } from 'react'
import axios from 'axios';
import Auth from './components/Auth';
import Categories from './components/Categories';
import Books from './components/Books';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('books'); // 'books' or 'categories'

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div style={{ color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return (
    <div className="app-container">
      {user ? (
        <>
          <nav className="navbar">
            <div className="nav-content">
              <h2 onClick={() => setView('books')} style={{ cursor: 'pointer' }}>📚 BookApp</h2>
              <div className="nav-links">
                <button
                  className={`nav-link ${view === 'books' ? 'active' : ''}`}
                  onClick={() => setView('books')}
                >
                  Books
                </button>
                <button
                  className={`nav-link ${view === 'categories' ? 'active' : ''}`}
                  onClick={() => setView('categories')}
                >
                  Categories
                </button>
              </div>
              <div className="nav-right">
                <span className="user-info">
                  {user.username} {user.role === 'admin' && <span className="admin-badge">Admin</span>}
                </span>
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </div>
            </div>
          </nav>

          <main className="main-content">
            {view === 'books' ? (
              <Books user={user} />
            ) : (
              <Categories user={user} />
            )}
          </main>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <Auth onAuthSuccess={(userData) => setUser(userData)} />
        </div>
      )}
    </div>
  )
}

export default App

