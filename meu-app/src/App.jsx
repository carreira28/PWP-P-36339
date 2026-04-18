import { useState, useEffect } from 'react'
import './index.css'

const API = '/api'

const api = (path, options = {}) => {
  const token = localStorage.getItem('token')
  return fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  }).then(async res => {
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Erro')
    return data
  })
}

//Login 
function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const submit = async e => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'register') {
        await api('/auth/signup', { method: 'POST', body: JSON.stringify(form) })
      }
      const { token } = await api('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      localStorage.setItem('token', token)
      onLogin()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth">
      <h1>Login</h1>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <input placeholder="Nome" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        )}
        <input type="email" placeholder="E-mail" value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        <input type="password" placeholder="Palavra-passe" value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">{mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
      </form>
      <p>
        {mode === 'login' ? 'Sem conta? ' : 'Já tens conta? '}
        <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Regista-te' : 'Entra aqui'}
        </button>
      </p>
    </div>
  )
}

//Gestor de Tarefas
function Dashboard({ onLogout }) {
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({ total: 0, completas: 0, pendentes: 0 })
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' })
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [userName, setUserName] = useState('')

    useEffect(() => {
    api('/auth/profile').then(u => setUserName(u.name))
  }, [])

  const load = async () => {
    const url = filter !== '' ? `/tasks?completed=${filter}` : '/tasks'
    const [t, s] = await Promise.all([api(url), api('/tasks/stats')])
    setTasks(t)
    setStats(s)
  }

  useEffect(() => { load() }, [filter])

  const submit = async e => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await api(`/tasks/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...form, completed: editing.completed }),
        })
        setEditing(null)
      } else {
        await api('/tasks', { method: 'POST', body: JSON.stringify(form) })
      }
      setForm({ title: '', description: '', priority: 'medium' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = task => {
    setEditing(task)
    setForm({ title: task.title, description: task.description || '', priority: task.priority })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm({ title: '', description: '', priority: 'medium' })
    setError('')
  }

  const toggle = async id => {
    await api(`/tasks/${id}/toggle`, { method: 'PATCH' })
    load()
  }

  const remove = async id => {
    if (!confirm('Apagar tarefa?')) return
    await api(`/tasks/${id}`, { method: 'DELETE' }).catch(() => {})
    load()
  }

  const PRIORITY = { low: 'Baixa', medium: 'Média', high: 'Alta' }

  return (
    <div className="app">
      {}
      <header>
        <strong>✓ Tarefas</strong>
        <div>
          <span>Olá, {userName}</span>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); onLogout() }}>Sair</button>
      </header>

      {}
      <div className="stats">
        <span>Total: <b>{stats.total}</b></span>
        <span>Pendentes: <b>{stats.pendentes}</b></span>
        <span>Concluídas: <b>{stats.completas}</b></span>
      </div>

      {}
      <form className="task-form" onSubmit={submit}>
        <input placeholder="Título *" value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        <input placeholder="Descrição (opcional)" value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select>
        {error && <p className="error">{error}</p>}
        <div className="form-btns">
          <button type="submit">{editing ? 'Guardar' : 'Criar Tarefa'}</button>
          {editing && <button type="button" onClick={cancelEdit}>Cancelar</button>}
        </div>
      </form>

      {}
      <div className="filters">
        <button className={filter === '' ? 'active' : ''} onClick={() => setFilter('')}>Todas</button>
        <button className={filter === 'false' ? 'active' : ''} onClick={() => setFilter('false')}>Pendentes</button>
        <button className={filter === 'true' ? 'active' : ''} onClick={() => setFilter('true')}>Concluídas</button>
      </div>

      {}
      <ul className="task-list">
        {tasks.length === 0 && <li className="empty">Sem tarefas.</li>}
        {tasks.map(t => (
          <li key={t.id} className={t.completed ? 'done' : ''}>
            <input type="checkbox" checked={t.completed} onChange={() => toggle(t.id)} />
            <div className="info">
              <span className="title">{t.title}</span>
              {t.description && <span className="desc">{t.description}</span>}
              <span className="priority">{PRIORITY[t.priority]}</span>
            </div>
            <div className="actions">
              <button onClick={() => startEdit(t)}>Editar</button>
              <button onClick={() => remove(t.id)}>Apagar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}


export default function App() {
  const [logged, setLogged] = useState(!!localStorage.getItem('token'))
  return logged
    ? <Dashboard onLogout={() => setLogged(false)} />
    : <Auth onLogin={() => setLogged(true)} />
}
