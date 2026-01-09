import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
  _id: String,
  name: String,
  plan: String
});

const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);

export { TenantSchema };
export default Tenant;
