import mongoose, { Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

var FileSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  name: { type: String, required: true },
  s3Url: { type: String, required: true },
  size: { type: Number, required: true },
  sender: { type:  ObjectId, ref: 'User' },
  senderDevice: { type: String }
});

FileSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) this.createdAt = now;
  next();
});

export default mongoose.model('File', FileSchema);
