import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{ type: String }]
  },
  { timestamps: true }
);

RoleSchema.plugin(mongoosePaginate);

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);

export { RoleSchema };
export default Role;
