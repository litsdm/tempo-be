import mongoose, { Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

var LinkSchema = new Schema({
  createdAt: { type: Date },
  expiresAt: { type: Date },
  updatedAt: { type: Date },
  s3Url: { type: String },
  s3Filename: { type: String },
  type: { type: String, default: 'compress' },
  size: { type: Number, required: true },
  files: [{ type: ObjectId, ref: 'File' }],
  from: { type:  ObjectId, ref: 'User' },
  to: [String],
});

LinkSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.expiresAt = now.setDate(now.getDate() + 1);
    this.createdAt = now;
  }
  next();
});

export default mongoose.model('Link', LinkSchema);
