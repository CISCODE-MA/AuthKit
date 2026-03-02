import { User, UserDocument } from "@models/user.model";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model, Types } from "mongoose";

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  findById(id: string | Types.ObjectId) {
    return this.userModel.findById(id);
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email }); // lgtm[js/sql-injection]
  }

  findByEmailWithPassword(email: string) {
    return this.userModel.findOne({ email }).select("+password"); // lgtm[js/sql-injection]
  }

  findByUsername(username: string) {
    return this.userModel.findOne({ username }); // lgtm[js/sql-injection]
  }

  findByPhone(phoneNumber: string) {
    return this.userModel.findOne({ phoneNumber }); // lgtm[js/sql-injection]
  }

  updateById(id: string | Types.ObjectId, data: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }); // lgtm[js/sql-injection]
  }

  deleteById(id: string | Types.ObjectId) {
    return this.userModel.findByIdAndDelete(id);
  }

  findByIdWithRolesAndPermissions(id: string | Types.ObjectId) {
    return this.userModel.findById(id).populate({
      path: "roles",
      populate: { path: "permissions", select: "name" },
      select: "name permissions",
    });
  }

  list(filter: { email?: string; username?: string }) {
    const query: any = {};
    if (filter.email) query.email = filter.email;
    if (filter.username) query.username = filter.username;

    return this.userModel
      .find(query) // lgtm[js/sql-injection]
      .populate({ path: "roles", select: "name" })
      .lean();
  }
}
