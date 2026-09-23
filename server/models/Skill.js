const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  title: { type: String, required: true },
  cat: { type: String, required: true },
  wants: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }
}, { timestamps: true });

// Transform for frontend
skillSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.by = ret.owner ? ret.owner.name : 'Unknown';
    ret.ownerId = ret.owner ? (ret.owner._id || ret.owner).toString() : null;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Skill', skillSchema);
