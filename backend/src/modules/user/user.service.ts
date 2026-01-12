import { Repository } from "typeorm";
import { User, UserRole } from "./entities/User";
import { IUserService, CreateUserDto } from "./user.interface";
import { AppError } from "../../shared/middleware/errorHandler";

export class UserService implements IUserService {
  constructor(private readonly userRepository: Repository<User>) {}

  async findOrCreate(data: CreateUserDto): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { clerkId: data.clerkId },
    });

    if (!user) {
      user = this.userRepository.create({
        clerkId: data.clerkId,
        email: data.email,
        name: data.name || "",
        role: UserRole.CUSTOMER,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  async updateUser(
    clerkId: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { clerkId } });
    if (!user) {
      throw new AppError(404, "User not found");
    }
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async setAdmin(clerkId: string): Promise<User | null> {
    return this.updateUser(clerkId, { role: UserRole.ADMIN });
}}
