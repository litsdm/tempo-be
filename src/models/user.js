import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const { ObjectId } = Schema.Types;

const COLORS = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#FF5722', '#607D8B'];

var UserSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  lastConnection: { type: Date },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  placeholderColor: { type: String, default: COLORS[Math.floor(Math.random()*COLORS.length)] },
  friends: [{ type: ObjectId, ref: 'User' }],
  profilePic: { type: String, default: '' },
  tag: { type: String },
  discriminator: { type: String },
  expoToken: { type: String },
  isPro: { type: Boolean, default: false },
  remainingBytes: { type: Number, default: 2147483648 },
  remainingFiles: { type: Number, default: 10 },
  role: { type: String, default: 'user' }
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
