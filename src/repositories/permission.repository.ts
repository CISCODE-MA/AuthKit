import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import { Permission, PermissionDocument } from '@entities/permission.entity';

@Injectable()
export class PermissionRepository {
    constructor(@InjectModel(Permission.name) private readonly permModel: Model<PermissionDocument>) { }

    create(data: Partial<Permission>) {
        return this.permModel.create(data);
    }

    findById(id: string | Types.ObjectId) {
        return this.permModel.findById(id);
    }

    findByName(name: string) {
        return this.permModel.findOne({ name });
    }

    list() {
        return this.permModel.find().lean();
    }

    updateById(id: string | Types.ObjectId, data: Partial<Permission>) {
        return this.permModel.findByIdAndUpdate(id, data, { new: true });
    }

    deleteById(id: string | Types.ObjectId) {
        return this.permModel.findByIdAndDelete(id);
    }
}
