import { User } from "./user.model";
import { inject, injectable } from "tsyringe";
import { IUserBasicInfo } from "./dtos/userBasicInfo.dto";
import { IUserProfile } from "./dtos/userProfile.dto";
import { IUserCreationResponse } from "./dtos/createUserRes.dto";
import { IUserCreationRequest } from "./dtos/createUser.dto";


@injectable()
export class UserRepository {
  constructor(
    @inject("UserModel") private userModel: typeof User
  ) {}

  // Return only basic info (used in login, authentication)
  async findById(id: string): Promise<IUserBasicInfo | null> {
    return await this.userModel.findById(id, 'email name _id').lean().exec();
  }

  // Return only basic info (used in login, authentication)
  async findByEmail(email: string): Promise<IUserBasicInfo | null> {
    return await this.userModel.findOne({ email }, 'email name _id').lean().exec();
  }

  // Return user creation response (only relevant data after user is created)
  async create(userData: IUserCreationRequest): Promise<IUserCreationResponse> {
    const { name, email, provider, providerId, picture } = userData;
    const input = {
      name,
      email,
      providers: [{ provider, providerId }],
      avatar: picture,
    }
    const user = new this.userModel(input);
    await user.save();
    return { _id: user._id, name: user.name, email: user.email };
  }

  // Update user profile (return the updated user profile)
  async update(id: string, updateData: Partial<IUserProfile>): Promise<IUserProfile | null> {
    return await this.userModel.findByIdAndUpdate(id, updateData, { new: true, fields: 'name email avatar bio' }).lean().exec();
  }

  // Deleting a user (return deleted user data)
  async delete(id: string): Promise<IUserBasicInfo | null> {
    const user = await this.userModel.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true, fields: 'name email _id' }).lean().exec();
    return user;
  }

  // Flexible query method with projection
  async findOne(query: object, projection: string = ''): Promise<IUserProfile | null> {
    return await this.userModel.findOne(query, projection).lean().exec();
  }
}


