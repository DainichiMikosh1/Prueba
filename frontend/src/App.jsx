import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ListaArticulos from './components/ListaArticulos'
import ArticuloDetalle from './components/ArticuloDetalle'
import FormularioArticulo from './components/FormularioArticulo'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<ListaArticulos />} />
          <Route path="/articulo/:clave" element={<ArticuloDetalle />} />
          <Route path="/nuevo" element={<FormularioArticulo />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
