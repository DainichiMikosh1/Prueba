import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './ArticuloDetalle.css'

function ArticuloDetalle() {
  const { clave } = useParams()
  const navigate = useNavigate()
  const [articulo, setArticulo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = 'http://localhost:5000/api/articulos'

  useEffect(() => {
    if (clave) {
      const obtenerArticuloPorClave = async () => {
        try {
          setLoading(true)

          const response = await axios.get(API_URL)
          const articuloEncontrado = response.data.find(art => art.clave === clave)
          
          if (articuloEncontrado) {
            setArticulo(articuloEncontrado)
            setError(null)
          } else {
            setError('Artículo no encontrado')
          }
        } catch (err) {
          setError('Error al cargar el artículo: ' + err.message)
          console.error('Error:', err)
        } finally {
          setLoading(false)
        }
      }

      obtenerArticuloPorClave()
    }
  }, [clave])

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

  const regresarAPrincipal = () => {
    navigate('/')
  }

  if (loading) {
    return (
      <div className="detalle-container">
        <div className="loading">Cargando artículo...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="detalle-container">
        <div className="error-section">
          <div className="error">{error}</div>
          <button onClick={regresarAPrincipal} className="btn-regresar">
            ← Regresar al Catálogo
          </button>
        </div>
      </div>
    )
  }

  if (!articulo) {
    return (
      <div className="detalle-container">
        <div className="error-section">
          <div className="error">Artículo no encontrado</div>
          <button onClick={regresarAPrincipal} className="btn-regresar">
            ← Regresar al Catálogo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="detalle-container">
      {/* Header con navegación */}
      <div className="detalle-header">
        <button onClick={regresarAPrincipal} className="btn-regresar">
          ← Regresar al Catálogo
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-home">Catálogo</span>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">{articulo.clave}</span>
        </div>
      </div>

      {/* Tarjeta principal del artículo */}
      <div className="detalle-card">
        {/* Header de la tarjeta */}
        <div className="detalle-card-header">
          <div className="articulo-principal">
            <h1 className="articulo-clave-titulo">{articulo.clave}</h1>
            <span className="articulo-unidad-badge">{articulo.unidadMedida}</span>
          </div>
          <div className="articulo-fecha">
            {articulo.createdAt && (
              <small>Creado: {new Date(articulo.createdAt).toLocaleDateString('es-MX')}</small>
            )}
          </div>
        </div>

        {/* Información del artículo */}
        <div className="detalle-info">
          <div className="info-section">
            <h2>Información General</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Descripción Corta:</label>
                <p>{articulo.descripcionCorta}</p>
              </div>
              <div className="info-item full-width">
                <label>Descripción Detallada:</label>
                <p className="descripcion-larga">{articulo.descripcionLarga}</p>
              </div>
            </div>
          </div>

          {/* Información de precios */}
          <div className="info-section">
            <h2>Información de Precios</h2>
            <div className="precios-grid">
              <div className="precio-item">
                <div className="precio-label">Costo</div>
                <div className="precio-valor costo">{formatearMoneda(articulo.costo)}</div>
              </div>
              <div className="precio-item">
                <div className="precio-label">Precio de Venta</div>
                <div className="precio-valor precio">{formatearMoneda(articulo.precio)}</div>
              </div>
              <div className="precio-item">
                <div className="precio-label">Tipo de Cambio</div>
                <div className="precio-valor cambio">${articulo.tipoCambio.toFixed(2)}</div>
              </div>
              <div className="precio-item">
                <div className="precio-label">Precio en Dólares</div>
                <div className="precio-valor dolares">{formatearDolares(articulo.precioDolares)}</div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="info-section">
            <h2>Análisis de Márgenes</h2>
            <div className="analisis-grid">
              <div className="analisis-item">
                <label>Margen de Ganancia (MXN):</label>
                <p className="margen-valor">
                  {formatearMoneda(articulo.precio - articulo.costo)} 
                  <span className="porcentaje">
                    ({(((articulo.precio - articulo.costo) / articulo.costo) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
              <div className="analisis-item">
                <label>Margen de Ganancia (USD):</label>
                <p className="margen-valor">
                  {formatearDolares(articulo.precioDolares - (articulo.costo / articulo.tipoCambio))}
                  <span className="porcentaje">
                    ({(((articulo.precio - articulo.costo) / articulo.costo) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArticuloDetalle
