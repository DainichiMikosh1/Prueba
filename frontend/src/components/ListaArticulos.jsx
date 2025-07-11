import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './ListaArticulos.css'

function ListaArticulos() {
  const navigate = useNavigate()
  const [articulos, setArticulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // URL del backend
  const API_URL = 'http://localhost:5000/api/articulos'

  const obtenerArticulos = async () => {
    try {
      setLoading(true)
      const response = await axios.get(API_URL)
      setArticulos(response.data)
      setError(null)
    } catch (err) {
      setError('Error al cargar los artículos: ' + err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    obtenerArticulos()
  }, [])

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad)
  }

  const formatearDolares = (cantidad) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cantidad)
  }

  const verDetalle = (clave) => {
    navigate(`/articulo/${clave}`)
  }

  const nuevoArticulo = () => {
    navigate('/nuevo')
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Cargando artículos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={obtenerArticulos} className="retry-btn">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Catálogo de Artículos</h1>
        <p>Total de artículos: {articulos.length}</p>
        <small>Haz clic en cualquier artículo para ver más detalles</small>
        
        {/* Botón para crear nuevo artículo */}
        <div className="header-actions">
          <button onClick={nuevoArticulo} className="btn-nuevo">
            + Nuevo Artículo
          </button>
        </div>
      </header>

      {articulos.length === 0 ? (
        <div className="no-articles">
          <p>No hay artículos en el catálogo</p>
        </div>
      ) : (
        <div className="articles-grid">
          {articulos.map((articulo) => (
            <div 
              key={articulo._id} 
              className="article-card clickable"
              onClick={() => verDetalle(articulo.clave)}
            >
              <div className="article-header">
                <h3 className="article-key">{articulo.clave}</h3>
                <span className="article-unit">{articulo.unidadMedida}</span>
              </div>
              
              <div className="article-body">
                <h4 className="article-title">{articulo.descripcionCorta}</h4>
                <p className="article-description">{articulo.descripcionLarga}</p>
                
                <div className="article-prices">
                  <div className="price-row">
                    <span className="price-label">Costo:</span>
                    <span className="price-value">{formatearMoneda(articulo.costo)}</span>
                  </div>
                  <div className="price-row">
                    <span className="price-label">Precio:</span>
                    <span className="price-value price-main">{formatearMoneda(articulo.precio)}</span>
                  </div>
                  <div className="price-row">
                    <span className="price-label">Tipo de cambio:</span>
                    <span className="price-value">${articulo.tipoCambio}</span>
                  </div>
                  <div className="price-row">
                    <span className="price-label">Precio USD:</span>
                    <span className="price-value price-usd">{formatearDolares(articulo.precioDolares)}</span>
                  </div>
                </div>
              </div>

              {/* Indicador de que es clickeable */}
              <div className="click-indicator">
                <span>Ver detalles →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ListaArticulos
