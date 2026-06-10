import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'owner' | 'vet' | 'shelter' | 'admin';
  phone?: string;
  city?: string;
  avatarFileId?: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['owner', 'vet', 'shelter', 'admin'],
      default: 'owner',
    },
    phone: { type: String },
    city: { type: String },
    avatarFileId: { type: String },
  },
  { timestamps: true },
);

export const UserModel = model<IUser>('User', UserSchema);
