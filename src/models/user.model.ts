import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: function () {
        return !this.microsoftId && !this.googleId && !this.facebookId;
      }
    },
    name: { type: String },
    tenantId: { type: String, required: true },
    microsoftId: { type: String, index: true },
    googleId: { type: String, index: true },
    facebookId: { type: String, index: true },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'deactivated'],
      default: 'pending'
    },
    refreshToken: { type: String },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date }
  },
  { timestamps: true }
);

UserSchema.plugin(mongoosePaginate);
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export { UserSchema };
export default User;
