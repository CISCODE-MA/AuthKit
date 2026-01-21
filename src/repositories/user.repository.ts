import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import { User, UserDocument } from '@models/user.model';

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }

    create(data: Partial<User>) {
        return this.userModel.create(data);
    }

    findById(id: string | Types.ObjectId) {
        return this.userModel.findById(id);
    }

    findByEmail(email: string) {
        return this.userModel.findOne({ email });
    }

    findByUsername(username: string) {
        return this.userModel.findOne({ username });
    }

    findByPhone(phoneNumber: string) {
        return this.userModel.findOne({ phoneNumber });
    }

    updateById(id: string | Types.ObjectId, data: Partial<User>) {
        return this.userModel.findByIdAndUpdate(id, data, { new: true });
    }

    deleteById(id: string | Types.ObjectId) {
        return this.userModel.findByIdAndDelete(id);
    }

    findByIdWithRolesAndPermissions(id: string | Types.ObjectId) {
        return this.userModel.findById(id).populate({
            path: 'roles',
            populate: { path: 'permissions', select: 'name' },
            select: 'name permissions'
        });
    }
}
