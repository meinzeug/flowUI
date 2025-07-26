import React, { useState } from 'react';

const METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

interface Resp {
  status: number;
  headers: Record<string, string>;
  body: any;
}

const DebugApiView: React.FC = () => {
  const [url, setUrl] = useState('/api/profile');
  const [method, setMethod] = useState('GET');
  const [headersInput, setHeadersInput] = useState('{}');
  const [body, setBody] = useState('');
  const [request, setRequest] = useState<any>(null);
  const [response, setResponse] = useState<Resp | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setError(null);
    setResponse(null);
    let headers: Record<string, string> = {};
    try {
      headers = headersInput ? JSON.parse(headersInput) : {};
    } catch (err) {
      setError('Header JSON invalid');
      return;
    }
    const init: RequestInit = { method, headers };
    if (method === 'POST' || method === 'PUT') {
      init.body = body;
    }
    setRequest({ url, method, headers, body: init.body });
    try {
      const res = await fetch(url, init);
      const text = await res.text();
      let parsed: any;
      try { parsed = JSON.parse(text); } catch { parsed = text; }
      setResponse({ status: res.status, headers: Object.fromEntries(res.headers.entries()), body: parsed });
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in-up">
      <h1 className="text-2xl font-bold text-white">API Debugger <span className="text-sm text-red-500">Nur für Entwicklungs- und Testzwecke</span></h1>
      <div className="flex flex-col gap-2 max-w-xl">
        <input className="p-2 rounded bg-slate-800 border border-slate-700" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" />
        <select className="p-2 rounded bg-slate-800 border border-slate-700" value={method} onChange={e => setMethod(e.target.value)}>
          {METHODS.map(m => <option key={m}>{m}</option>)}
        </select>
        <textarea className="p-2 rounded bg-slate-800 border border-slate-700 font-mono" rows={3} value={headersInput} onChange={e => setHeadersInput(e.target.value)} placeholder="Headers als JSON" />
        {(method === 'POST' || method === 'PUT') && (
          <textarea className="p-2 rounded bg-slate-800 border border-slate-700 font-mono" rows={4} value={body} onChange={e => setBody(e.target.value)} placeholder="Body" />
        )}
        <button onClick={send} className="bg-cyan-600 hover:bg-cyan-700 text-white rounded px-4 py-2">Send Request</button>
      </div>
      {request && (
        <div className="text-sm">
          <h2 className="font-semibold text-white">Request</h2>
          <pre className="bg-slate-900 p-2 rounded overflow-x-auto">{JSON.stringify(request, null, 2)}</pre>
        </div>
      )}
      {response && (
        <div className="text-sm">
          <h2 className="font-semibold text-white">Response</h2>
          <pre className="bg-slate-900 p-2 rounded overflow-x-auto">{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div className="text-red-400">Error: {error}</div>
      )}
    </div>
  );
};

export default DebugApiView;
