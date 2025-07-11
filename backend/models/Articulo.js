import mongoose from 'mongoose';

const articuloSchema = new mongoose.Schema({
  clave: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descripcionCorta: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  descripcionLarga: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  unidadMedida: {
    type: String,
    required: true,
    trim: true
  },
  costo: {
    type: Number,
    required: true,
    min: 0
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  tipoCambio: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  precioDolares: {
    type: Number,
    min: 0
  }
}, {
  timestamps: false, 
  versionKey: false  
});

articuloSchema.pre('save', function(next) {
  if (this.precio && this.tipoCambio) {
    this.precioDolares = this.precio / this.tipoCambio;
  }
  next();
});

const Articulo = mongoose.model('Articulo', articuloSchema);

export default Articulo;
