import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const PermissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String },
  description: { type: String }
});

PermissionSchema.plugin(mongoosePaginate);

const Permission = mongoose.models.Permission || mongoose.model('Permission', PermissionSchema);

export { PermissionSchema };
export default Permission;
