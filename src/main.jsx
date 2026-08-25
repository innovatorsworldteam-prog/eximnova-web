import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://eximnova-api.innovatorsworldteam.workers.dev';

function App() {
  return (
    <div className="app">
      <header className="nav">
        <div className="brand"><span className="brand-mark">E</span><span>EximNova</span></div>
        <nav>
          <a href="#market">Market</a>
          <a href="#workflow">Workflow</a>
          <a href="#dealgate">DealGate</a>
          <a className="nav-button" href="#login">Sign in</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">TRADE INTELLIGENCE ENGINE</div>
            <h1>Move from trade interest to <span>evidence-led opportunity.</span></h1>
            <p>EximNova brings requirements, counterparties, evidence and preliminary screening into one controlled workflow for international commodity trade.</p>
            <div className="actions">
              <button>Start a requirement</button>
              <a href="#workflow">See how it works →</a>
            </div>
          </div>
          <div className="hero-card">
            <div className="card-label">DEALGATE</div>
            <div className="score">PRELIMINARY</div>
            <div className="line"><span>Opportunity</span><strong>BUY · Maize B Grade</strong></div>
            <div className="line"><span>Evidence</span><strong>Collection required</strong></div>
            <div className="line"><span>Verification</span><strong>Pending</strong></div>
            <div className="status">Human review remains decisive.</div>
          </div>
        </section>

        <section id="workflow" className="section">
          <div className="section-heading"><div className="eyebrow">CONTROLLED WORKFLOW</div><h2>One trade record. Multiple evidence layers.</h2></div>
          <div className="grid">
            {[
              ['01','Requirement','Capture what is actually being bought or sold.'],
              ['02','Opportunity','Turn a requirement into a structured trade opportunity.'],
              ['03','Counterparty','Maintain the commercial identity and relationship record.'],
              ['04','DealGate','Run preliminary screening without presenting it as a guarantee.'],
              ['05','Evidence','Attach documents with integrity metadata in protected storage.'],
              ['06','Verification','Record findings, severity, status and supporting evidence.']
            ].map(([n,t,d]) => <article className="tile" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}
          </div>
        </section>

        <section id="dealgate" className="dark-section">
          <div><div className="eyebrow">DEALGATE</div><h2>Preliminary screening, not a false promise of certainty.</h2><p>EximNova separates signals from verified facts and keeps evidence, findings and audit activity attached to the trade workflow.</p></div>
          <div className="principles"><div><b>Evidence first</b><span>Documents remain traceable.</span></div><div><b>Owner isolation</b><span>Records are scoped to authorised users.</span></div><div><b>Auditability</b><span>Material actions are recorded.</span></div></div>
        </section>

        <section id="market" className="section compact"><div className="eyebrow">PLATFORM STATUS</div><h2>Backend connected</h2><p>API endpoint configured for production: <code>{API_BASE_URL}</code></p></section>
      </main>

      <footer><span>EximNova</span><span>Trade intelligence · evidence · workflow</span></footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
