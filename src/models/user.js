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
  placeholderColor: { type: String },
  files: [{ type: ObjectId, ref: 'File' }],
  friends: [{ type: ObjectId, ref: 'User' }],
  tag: { type: String },
  discriminator: { type: String },
  expoToken: { type: String }
});

UserSchema.pre('save', function(next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.lastConnection) this.lastConnection = now;
  if (!this.createdAt) this.createdAt = now;
  if (!this.tag) {
    const discriminator = Math.random().toString().substr(2, 4);
    this.tag = `${this.username}#${discriminator}`;
    this.discriminator = discriminator;
  }

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
