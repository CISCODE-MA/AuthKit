import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const ClientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: function () {
        return !this.microsoftId && !this.googleId && !this.facebookId;
      },
      unique: true,
      sparse: true
    },
    password: {
      type: String,
      required: function () {
        return !this.microsoftId && !this.googleId && !this.facebookId;
      }
    },
    name: { type: String },
    microsoftId: { type: String, index: true },
    googleId: { type: String, index: true },
    facebookId: { type: String, index: true },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    refreshToken: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

ClientSchema.plugin(mongoosePaginate);

const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);

export { ClientSchema };
export default Client;
