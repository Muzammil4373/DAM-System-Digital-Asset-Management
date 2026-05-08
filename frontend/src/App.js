import React, { useState } from 'react';
import UploadZone from './components/UploadZone';
import Gallery from './components/Gallery';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(true);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">DAM<span className="logo-accent">.</span>sys</span>
          </div>
          <p className="header-tagline">Digital Asset Management</p>
        </div>
      </header>

      <main className="app-main">
        {/* ── Upload Panel ── */}
        <section className="upload-panel">
          <div className="panel-header" onClick={() => setUploadOpen((p) => !p)}>
            <h2 className="panel-title">Upload New Asset</h2>
            <button className="panel-toggle">{uploadOpen ? '▲' : '▼'}</button>
          </div>
          {uploadOpen && <UploadZone onUploadSuccess={handleUploadSuccess} />}
        </section>

        {/* ── Gallery ── */}
        <Gallery refreshTrigger={refreshTrigger} />
      </main>

      <footer className="app-footer">
        <p>DAM System · Built with MERN Stack · Fullstack Interview Task</p>
      </footer>
    </div>
  );
}

export default App;
