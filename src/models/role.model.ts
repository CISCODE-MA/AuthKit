import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const RoleSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    permissions: [{ type: String }]
  },
  { timestamps: true }
);

RoleSchema.plugin(mongoosePaginate);
RoleSchema.index({ tenantId: 1, name: 1 }, { unique: true });

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);

export { RoleSchema };
export default Role;
