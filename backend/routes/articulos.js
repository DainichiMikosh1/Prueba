import express from 'express';
import Articulo from '../models/Articulo.js';

const router = express.Router();

router.get('/proxima-clave', async (req, res) => {
  try {
    const articulos = await Articulo.find().sort({ clave: 1 });
    
    let maxNumero = 0;
    articulos.forEach(articulo => {
      const match = articulo.clave.match(/ART(\d+)/);
      if (match) {
        const numero = parseInt(match[1]);
        if (numero > maxNumero) {
          maxNumero = numero;
        }
      }
    });
    
    //Generar clave
    const nuevoCodigo = maxNumero + 1;
    const nuevaClave = `ART${nuevoCodigo.toString().padStart(3, '0')}`;
    
    res.json({ proximaClave: nuevaClave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/tipo-cambio', async (req, res) => {
  try {
    console.log('Obteniendo tipo de cambio de Banxico...');
    
    const BANXICO_TOKEN = 'ee5f269613327a41864ed29ee5c523212a8b8470371bfdf755e0a00399205193';
    
    const banxicoUrl = 'https://www.banxico.org.mx/SieAPIRest/service/v1/series/SF43718/datos/oportuno';
    
    const response = await fetch(banxicoUrl, {
      headers: {
        'Accept': 'application/json',
        'Bmx-Token': BANXICO_TOKEN
      }
    });

    if (!response.ok) {
      throw new Error(`Error de Banxico: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Respuesta de Banxico recibida');
    
    if (data.bmx && data.bmx.series && data.bmx.series[0] && data.bmx.series[0].datos && data.bmx.series[0].datos.length > 0) {
      const ultimoDato = data.bmx.series[0].datos[0];
      const tipoCambio = parseFloat(ultimoDato.dato);
      const fecha = ultimoDato.fecha;
      
      console.log(`Tipo de cambio obtenido de Banxico: ${tipoCambio} en fecha ${fecha}`);
      
      res.json({
        tipoCambio: tipoCambio,
        fecha: fecha,
        fuente: 'Banco de México',
        serie: 'SF43718',
        timestamp: new Date().toISOString(),
        mensaje: 'Tipo de cambio obtenido exitosamente de Banxico'
      });
    } else {
      console.log('No se encontraron datos en la respuesta de Banxico');
    }
  } catch (error) {
    console.error('Error al obtener tipo de cambio de Banxico:', error);
    res.json({
      });
  }
});

router.get('/', async (req, res) => {
  try {
    const articulos = await Articulo.find();
    res.json(articulos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const articulo = await Articulo.findById(req.params.id);
    if (!articulo) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }
    res.json(articulo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const articulo = new Articulo(req.body);
    const nuevoArticulo = await articulo.save();
    res.status(201).json(nuevoArticulo);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'La clave del artículo ya existe' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

export default router;