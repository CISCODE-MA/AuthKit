import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
class FullName {
  @Prop({ required: true, trim: true })
  fname!: string;

  @Prop({ required: true, trim: true })
  lname!: string;
}

const FullNameSchema = SchemaFactory.createForClass(FullName);

@Schema({ timestamps: true })
export class User {
  @Prop({ type: FullNameSchema, required: true })
  fullname!: FullName;

  @Prop({ required: true, unique: true, trim: true, minlength: 3, maxlength: 30 })
  username!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  })
  email!: string;

  @Prop({ default: 'default.jpg' })
  avatar?: string;

  @Prop({
    unique: true,
    trim: true,
    sparse: true,
    match: /^[0-9]{10,14}$/,
  })
  phoneNumber?: string;

  @Prop({ minlength: 8, select: false })
  password?: string;

  @Prop({ default: Date.now })
  passwordChangedAt!: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }], required: true })
  roles!: Types.ObjectId[];

  @Prop({ default: false })
  isVerified!: boolean;

  @Prop({ default: false })
  isBanned!: boolean;

  @Prop({ trim: true, sparse: true })
  jobTitle?: string;

  @Prop({ trim: true, sparse: true })
  company?: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
