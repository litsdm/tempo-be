import mongoose, { Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

var FileSchema = new Schema({
  createdAt: { type: Date },
  expiresAt: { type: Date },
  updatedAt: { type: Date },
  name: { type: String, required: true },
  s3Url: { type: String, required: true },
  size: { type: Number, required: true },
  from: { type:  ObjectId, ref: 'User' },
  to: [{ type: ObjectId, ref: 'User' }],
  senderDevice: { type: String },
  type: { type: String }
});

FileSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.expiresAt = now.setDate(now.getDate() + 1);
    this.createdAt = now;
  }
  next();
});

export default mongoose.model('File', FileSchema);
