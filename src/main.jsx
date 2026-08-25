import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://eximnova-api.innovatorsworldteam.workers.dev';
const STORAGE_KEY = 'eximnova_token';

async function api(path, options = {}) {
  const token = localStorage.getItem(STORAGE_KEY);
  const headers = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data.error || data.detail || `Request failed (${res.status})`);
  return data;
}

const navItems = ['Overview', 'Businesses', 'Requirements', 'Opportunities', 'Counterparties', 'DealGate', 'Evidence', 'Verification'];
const emptyData = { businesses: [], requirements: [], opportunities: [], counterparties: [], dealgate: [], evidence: [], verification: [] };
const routes = {
  businesses: '/api/businesses', requirements: '/api/requirements', opportunities: '/api/opportunities',
  counterparties: '/api/counterparties', dealgate: '/api/dealgate', evidence: '/api/evidence', verification: '/api/verification'
};

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const data = await api(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, { method: 'POST', body: JSON.stringify({ email, password }) });
      if (!data.token) throw new Error('Authentication succeeded but no session token was returned.');
      localStorage.setItem(STORAGE_KEY, data.token); onAuth(data.token);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <div className="auth-shell"><div className="auth-panel">
    <div className="brand large"><span className="brand-mark">E</span><span>EximNova</span></div>
    <div className="eyebrow">TRADE INTELLIGENCE ENGINE</div><h1>{mode === 'login' ? 'Sign in to EximNova' : 'Create your EximNova account'}</h1>
    <p className="muted">Secure access to your trade workflow, evidence and preliminary screening.</p>
    <form onSubmit={submit} className="form"><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email" /></label><label>Password><input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength="8" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>{error && <div className="error">{error}</div>}<button disabled={busy}>{busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}</button></form>
    <button className="link-button" onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode === 'login' ? 'Create an account' : 'I already have an account'}</button>
  </div></div>;
}

function App() {
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [section, setSection] = useState('Overview');
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const logout = useCallback(() => { localStorage.removeItem(STORAGE_KEY); setToken(null); setUser(null); setData(emptyData); setSection('Overview'); }, []);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    const results = await Promise.all(Object.entries(routes).map(async ([key, path]) => {
      try { const r = await api(path); return [key, Array.isArray(r.data) ? r.data : []]; }
      catch { return [key, []]; }
    }));
    setData(current => ({ ...current, ...Object.fromEntries(results) }));
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    api('/api/me').then(r => { if (active) setUser(r.user); }).catch(() => { if (active) logout(); });
    return () => { active = false; };
  }, [token, logout]);

  useEffect(() => { loadData(); }, [loadData]);

  const stats = useMemo(() => [
    ['Businesses', data.businesses.length], ['Requirements', data.requirements.length], ['Opportunities', data.opportunities.length],
    ['Counterparties', data.counterparties.length], ['DealGate cases', data.dealgate.length], ['Verification cases', data.verification.length]
  ], [data]);
  if (!token) return <Auth onAuth={setToken} />;

  const createBusiness = async () => {
    const legal = prompt('Legal business name'); if (!legal) return;
    try {
      await api('/api/businesses',{method:'POST',body:JSON.stringify({legal_name:legal,brand_name:legal,entity_type:'Proprietorship',established_year:new Date().getFullYear(),description:'Created from EximNova dashboard'})});
      await loadData(); setSection('Businesses');
    } catch(e){setError(e.message)}
  };

  const content = section === 'Overview' ? <>
    <div className="hero dashboard-hero"><div><div className="eyebrow">CONTROL CENTRE</div><h1>Good to see you, {user?.email?.split('@')[0] || 'trader'}.</h1><p>Manage structured trade opportunities from requirement through evidence and verification.</p></div><div className="hero-badge"><strong>API</strong><span>Connected</span></div></div>
    <div className="stats">{stats.map(([label,value])=><div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="section-card"><div className="card-head"><div><div className="eyebrow">WORKFLOW</div><h2>Next actions</h2></div></div><div className="action-grid">{[['Requirements','Capture a buyer or seller requirement.','Requirements'],['Opportunities','Structure a requirement for market use.','Opportunities'],['DealGate','Open preliminary screening.','DealGate'],['Evidence','Attach documents and preserve integrity metadata.','Evidence']].map(([t,d,s])=><button className="action-card" key={t} onClick={()=>setSection(s)}><b>{t}</b><span>{d}</span><em>Open →</em></button>)}</div></div>
  </> : <Section name={section} data={data} onBusiness={createBusiness} onRefresh={loadData} />;

  return <div className="app-shell"><aside className="sidebar"><div className="brand"><span className="brand-mark">E</span><span>EximNova</span></div><div className="side-caption">TRADE INTELLIGENCE</div><nav>{navItems.map(item=><button className={section===item?'active':''} onClick={()=>setSection(item)} key={item}>{item}</button>)}</nav><div className="side-bottom"><div className="user-chip"><span>{user?.email?.[0]?.toUpperCase()}</span><div><b>{user?.email}</b><small>{user?.role || 'user'}</small></div></div><button onClick={logout}>Sign out</button></div></aside><main className="main"><header className="topbar"><span>EximNova Engine v4.1 · Production</span><span className="live"><i/> API online</span></header>{error && <div className="error banner">{error}<button onClick={()=>setError('')}>Dismiss</button></div>}{loading && <div className="loading">Refreshing workspace…</div>}{content}</main></div>;
}

function Section({name,data,onBusiness,onRefresh}) {
  const map={Businesses:'businesses',Requirements:'requirements',Opportunities:'opportunities',Counterparties:'counterparties',DealGate:'dealgate',Evidence:'evidence',Verification:'verification'};
  const rows=data[map[name]]||[];
  return <div className="section-card page-card"><div className="card-head"><div><div className="eyebrow">{name.toUpperCase()}</div><h1>{name}</h1><p className="muted">Owner-scoped records from the EximNova API.</p></div><div className="card-actions"><button className="secondary" onClick={onRefresh}>Refresh</button>{name==='Businesses'&&<button onClick={onBusiness}>+ Add business</button>}</div></div>{rows.length===0?<div className="empty"><strong>No records yet</strong><span>Records created through EximNova will appear here.</span></div>:<div className="records">{rows.map((r,i)=><div className="record" key={r.id||i}><div><strong>{r.brand_name||r.legal_name||r.title||r.product||r.name||r.scope||r.original_name||r.id}</strong><span>{r.status||r.side||r.category||r.created_at}</span></div><code>{r.id}</code></div>)}</div>}</div>;
}

createRoot(document.getElementById('root')).render(<App />);
