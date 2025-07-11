import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './FormularioArticulo.css'

function FormularioArticulo() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const [formulario, setFormulario] = useState({
    clave: '',
    descripcionCorta: '',
    descripcionLarga: '',
    unidadMedida: '',
    costo: '',
    precio: ''
  })

  const [tipoCambio, setTipoCambio] = useState({
    valor: 0,
    fecha: '',
    fuente: '',
    cargando: false
  })

  const [precioDolares, setPrecioDolares] = useState(0)

  // URL del backend
  const API_URL = 'http://localhost:5000/api/articulos'

  useEffect(() => {
    generarClaveAutomatica()
    obtenerTipoCambio() // Obtener tipo de cambio al iniciar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const calcularPrecioDolares = () => {
      if (formulario.precio && tipoCambio.valor) {
        const precioUSD = parseFloat(formulario.precio) / tipoCambio.valor
        setPrecioDolares(precioUSD)
      } else {
        setPrecioDolares(0)
      }
    }
    
    calcularPrecioDolares()
  }, [formulario.precio, tipoCambio.valor])

  const generarClaveAutomatica = async () => {
    try {
      console.log('Obteniendo próxima clave...')
      const response = await axios.get(`${API_URL}/proxima-clave`)
      console.log('Respuesta del servidor:', response.data)
      
      setFormulario(prev => ({
        ...prev,
        clave: response.data.proximaClave
      }))
    } catch (err) {
      console.error('Error al generar clave automática:', err)
    }
  }

  const obtenerTipoCambio = useCallback(async () => {
    try {
      setTipoCambio(prev => ({ ...prev, cargando: true }))
      
      const response = await axios.get(`${API_URL}/tipo-cambio`)
      
      setTipoCambio({
        valor: response.data.tipoCambio,
        fecha: response.data.fecha,
        fuente: response.data.fuente,
        cargando: false
      })

      if (formulario.precio && response.data.tipoCambio) {
        const precioUSD = parseFloat(formulario.precio) / response.data.tipoCambio
        setPrecioDolares(precioUSD)
      }

      console.log('Tipo de cambio obtenido:', response.data)
    } catch (err) {
      console.error('Error al obtener tipo de cambio:', err)
    }
  }, [formulario.precio]) 

  const manejarCambio = (e) => {
    const { name, value } = e.target
    setFormulario(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validarFormulario = () => {
    const errores = []
    
    if (!formulario.descripcionCorta.trim()) {
      errores.push('La descripción corta es obligatoria')
    }
    
    if (!formulario.descripcionLarga.trim()) {
      errores.push('La descripción larga es obligatoria')
    }
    
    if (!formulario.unidadMedida.trim()) {
      errores.push('La unidad de medida es obligatoria')
    }
    
    if (!formulario.costo || formulario.costo <= 0) {
      errores.push('El costo debe ser mayor a 0')
    }
    
    if (!formulario.precio || formulario.precio <= 0) {
      errores.push('El precio debe ser mayor a 0')
    }
    
    return errores
  }

  const guardarArticulo = async (e) => {
    e.preventDefault()
    
    const errores = validarFormulario()
    if (errores.length > 0) {
      setError(errores.join(', '))
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const datosArticulo = {
        clave: formulario.clave,
        descripcionCorta: formulario.descripcionCorta.trim(),
        descripcionLarga: formulario.descripcionLarga.trim(),
        unidadMedida: formulario.unidadMedida.trim(),
        costo: parseFloat(formulario.costo),
        precio: parseFloat(formulario.precio),
        tipoCambio: tipoCambio.valor,
        precioDolares: precioDolares
      }
      
      await axios.post(API_URL, datosArticulo)
      
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/')
      }, 2000)
      
    } catch (err) {
      console.error('Error al guardar artículo:', err)
      setError(err.response?.data?.message || 'Error al guardar el artículo')
    } finally {
      setLoading(false)
    }
  }

  const cancelar = () => {
    navigate('/')
  }

  const formatearMoneda = (cantidad) => {
    if (!cantidad || isNaN(cantidad)) return '-'
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(cantidad)
  }

  const formatearDolares = (cantidad) => {
    if (!cantidad || isNaN(cantidad)) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cantidad)
  }

  if (success) {
    return (
      <div className="formulario-container">
        <div className="success-message">
          <div className="success-icon">✅</div>
          <h2>¡Artículo guardado exitosamente!</h2>
          <p>Redirigiendo al catálogo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="formulario-container">
      {/* Header */}
      <div className="formulario-header">
        <button onClick={cancelar} className="btn-cancelar">
          ← Cancelar
        </button>
        <div className="breadcrumb">
          <span className="breadcrumb-home">Catálogo</span>
          <span className="breadcrumb-separator">→</span>
          <span className="breadcrumb-current">Nuevo Artículo</span>
        </div>
      </div>

      {/* Formulario */}
      <div className="formulario-card">
        <div className="formulario-titulo">
          <h1>Crear Nuevo Artículo</h1>
          <p>Complete la información del artículo. Los campos marcados con * son obligatorios.</p>
        </div>

        <form onSubmit={guardarArticulo} className="formulario">
          {/* Clave (solo lectura) */}
          <div className="campo-grupo">
            <label htmlFor="clave">Clave del Artículo</label>
            <div className="campo-con-boton">
              <input
                type="text"
                id="clave"
                name="clave"
                value={formulario.clave}
                readOnly
                className="campo-readonly"
              />
              <button
                type="button"
                onClick={generarClaveAutomatica}
                className="btn-regenerar"
                disabled={loading}
              >
                🔄 Regenerar
              </button>
            </div>
            <small>Esta clave se asigna automáticamente. Puede regenerar una nueva si es necesario.</small>
          </div>

          {/* Descripción Corta */}
          <div className="campo-grupo">
            <label htmlFor="descripcionCorta">Descripción Corta *</label>
            <input
              type="text"
              id="descripcionCorta"
              name="descripcionCorta"
              value={formulario.descripcionCorta}
              onChange={manejarCambio}
              placeholder="Ej: Laptop Dell Inspiron"
              maxLength={100}
              required
            />
          </div>

          {/* Descripción Larga */}
          <div className="campo-grupo">
            <label htmlFor="descripcionLarga">Descripción Detallada *</label>
            <textarea
              id="descripcionLarga"
              name="descripcionLarga"
              value={formulario.descripcionLarga}
              onChange={manejarCambio}
              placeholder="Descripción completa del artículo con todas sus características..."
              maxLength={500}
              rows={4}
              required
            ></textarea>
          </div>

          {/* Unidad de Medida */}
          <div className="campo-grupo">
            <label htmlFor="unidadMedida">Unidad de Medida *</label>
            <select
              id="unidadMedida"
              name="unidadMedida"
              value={formulario.unidadMedida}
              onChange={manejarCambio}
              required
            >
              <option value="">Seleccione una unidad</option>
              <option value="Pieza">Pieza</option>
              <option value="Metro">Metro</option>
              <option value="Kilogramo">Kilogramo</option>
              <option value="Litro">Litro</option>
              <option value="Caja">Caja</option>
              <option value="Paquete">Paquete</option>
              <option value="Rollo">Rollo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Costo y Precio en la misma fila */}
          <div className="campo-fila">
            <div className="campo-grupo">
              <label htmlFor="costo">Costo (MXN) *</label>
              <input
                type="number"
                id="costo"
                name="costo"
                value={formulario.costo}
                onChange={manejarCambio}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="campo-grupo">
              <label htmlFor="precio">Precio de Venta (MXN) *</label>
              <input
                type="number"
                id="precio"
                name="precio"
                value={formulario.precio}
                onChange={manejarCambio}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Campos no editables */}
          <div className="campos-readonly">
            <h3>Información Obtenida del Banco de México</h3>
            <p>Tipo de cambio actualizado automáticamente desde la API de Banxico:</p>
            
            <div className="campo-fila">
              <div className="campo-grupo">
                <label>Tipo de Cambio (USD/MXN)</label>
                <div className="tipo-cambio-info">
                  <input
                    type="text"
                    value={tipoCambio.cargando ? 'Obteniendo...' : 
                          tipoCambio.valor ? `$${tipoCambio.valor.toFixed(4)}` : 
                          'No disponible'}
                    readOnly
                    className="campo-readonly"
                  />
                  {tipoCambio.fecha && (
                    <small>Fecha: {tipoCambio.fecha} | Fuente: {tipoCambio.fuente}</small>
                  )}
                  <button
                    type="button"
                    onClick={obtenerTipoCambio}
                    className="btn-actualizar-tc"
                    disabled={tipoCambio.cargando}
                  >
                    {tipoCambio.cargando ? '⏳' : '🔄'} Actualizar
                  </button>
                </div>
              </div>

              <div className="campo-grupo">
                <label>Precio en Dólares</label>
                <input
                  type="text"
                  value={precioDolares > 0 ? 
                        formatearDolares(precioDolares) : 
                        'Se calculará automáticamente'}
                  readOnly
                  className="campo-readonly"
                />
                {precioDolares > 0 && (
                  <small>Calculado con TC: ${tipoCambio.valor?.toFixed(4)}</small>
                )}
              </div>
            </div>
          </div>

          {/* Preview del artículo */}
          {formulario.descripcionCorta && formulario.precio && (
            <div className="preview-articulo">
              <h3>Vista Previa</h3>
              <div className="preview-card">
                <div className="preview-header">
                  <strong>{formulario.clave}</strong>
                  <span className="preview-unidad">{formulario.unidadMedida}</span>
                </div>
                <h4>{formulario.descripcionCorta}</h4>
                <p>{formulario.descripcionLarga}</p>
                <div className="preview-precios">
                  <span>Costo: {formatearMoneda(formulario.costo)}</span>
                  <span>Precio: {formatearMoneda(formulario.precio)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Mensajes de error */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Botones */}
          <div className="botones-formulario">
            <button
              type="button"
              onClick={cancelar}
              className="btn-secundario"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primario"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormularioArticulo
