// mongoose schema for user
// intface User is located in src/interfaces/User.ts

import mongoose from 'mongoose';
import {User} from '../../types/DBTypes';

const userModel = new mongoose.Schema<User>({
  user_name: {
    type: String,
    minlength: [3, 'Username must be at least 3 characters'],
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['adopter', 'lister', 'admin'],
    default: 'adopter',
  },
  password: {
    type: String,
    minlength: [4, 'Password must be at least 4 characters'],
  },
  streetAddress: {
    type: String,
    minlength: [4, 'Password must be at least 4 characters'],
  },
  postalCode: {
    type: String,
    minlength: [2, 'Password must be at least 2 characters'],
  },
  city: {
    type: String,
    minlength: [2, 'Password must be at least 2 characters'],
  },
});

// Duplicate the ID field.
userModel.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userModel.set('toJSON', {
  virtuals: true,
});

export default mongoose.model<User>('User', userModel);
