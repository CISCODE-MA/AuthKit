<<<<<<< HEAD
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, Types } from 'mongoose';
import { User, UserDocument } from '@entities/user.entity';
import { IUserRepository } from './interfaces/user-repository.interface';
=======
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, Types } from "mongoose";
import { User, UserDocument } from "@entities/user.entity";
import { IUserRepository } from "./interfaces/user-repository.interface";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * User repository implementation using Mongoose
 */
@Injectable()
export class UserRepository implements IUserRepository {
<<<<<<< HEAD
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) { }
=======
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

  create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  findById(id: string | Types.ObjectId) {
    return this.userModel.findById(id);
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  findByEmailWithPassword(email: string) {
    return this.userModel.findOne({ email }).select("+password");
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

<<<<<<< HEAD
    findByIdWithRolesAndPermissions(id: string | Types.ObjectId) {
        return this.userModel.findById(id)
            .populate({
                path: 'roles',
                populate: { path: 'permissions', select: 'name' },
                select: 'name permissions'
            })
            .lean()
            .exec();
    }
=======
  findByIdWithRolesAndPermissions(id: string | Types.ObjectId) {
    return this.userModel
      .findById(id)
      .populate({
        path: "roles",
        populate: { path: "permissions", select: "name" },
        select: "name permissions",
      })
      .lean()
      .exec();
  }
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

  list(filter: { email?: string; username?: string }) {
    const query: any = {};
    if (filter.email) query.email = filter.email;
    if (filter.username) query.username = filter.username;

    return this.userModel
      .find(query)
      .populate({ path: "roles", select: "name" })
      .lean();
  }
}
