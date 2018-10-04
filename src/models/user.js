import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const { ObjectId } = Schema.Types;

var UserSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  lastConnection: { type: Date },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  files: [{ type: ObjectId, ref: 'File' }]
});

UserSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.lastConnection) this.lastConnection = now;
  if (!this.createdAt) this.createdAt = now;

  // ENCRYPT PASSWORD
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      user.password = hash;
      next();
    });
  });
});


UserSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

export default mongoose.model('User', UserSchema);
