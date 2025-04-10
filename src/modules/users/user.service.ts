import { inject, injectable } from "tsyringe";
import { IUserProfile } from "./dtos/userProfile.dto";
import { IUser } from "./user.model";
import { IUserBasicInfo } from "./dtos/userBasicInfo.dto";
import { IUserCreationResponse } from "./dtos/createUserRes.dto";
import { UserRepository } from "./user.repository";
import { IUserCreationRequest } from "./dtos/createUser.dto";

@injectable()
export class UserService {
    constructor(
        @inject("UserRepository") private userRepository: UserRepository,
    ) {}

    // Get user by ID
    async getUserById(id: string): Promise<IUserProfile | null> {
        return await this.userRepository.findById(id);
    }

    // Get user by email
    async getUserByEmail(email: string): Promise<IUserProfile | null> {
        return await this.userRepository.findByEmail(email);
    }

    // Create a user
    async createUser(userData: IUserCreationRequest): Promise<IUserCreationResponse> {
        return await this.userRepository.create(userData);
    }

    // Update a user
    async updateUser(id: string, updateData: Partial<IUserProfile>): Promise<IUserProfile | null> {
        return await this.userRepository.update(id, updateData);
    }

    // Delete a user
    async deleteUser(id: string): Promise<IUserProfile | null> {
        return this.userRepository.delete(id);
    }

    // Flexible find (based on query)
    async findOne(query: object, projection: string = ''): Promise<IUserProfile | null> {
        return await this.userRepository.findOne(query, projection);
    }
    async findOneByProviderId(providerId: string, provider: string): Promise<IUserProfile | null> {
        return await this.userRepository.findOne({ "providers.providerId": providerId, "providers.provider": provider });
    }
}
