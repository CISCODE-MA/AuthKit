import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import { Role, RoleDocument } from '@models/role.model';

@Injectable()
export class RoleRepository {
    constructor(@InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>) { }

    create(data: Partial<Role>) {
        return this.roleModel.create(data);
    }

    findById(id: string | Types.ObjectId) {
        return this.roleModel.findById(id);
    }

    findByName(name: string) {
        return this.roleModel.findOne({ name });
    }

    list() {
        return this.roleModel.find().populate('permissions').lean();
    }

    updateById(id: string | Types.ObjectId, data: Partial<Role>) {
        return this.roleModel.findByIdAndUpdate(id, data, { new: true });
    }

    deleteById(id: string | Types.ObjectId) {
        return this.roleModel.findByIdAndDelete(id);
    }
}
