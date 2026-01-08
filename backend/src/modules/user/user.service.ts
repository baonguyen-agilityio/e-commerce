import { Repository } from 'typeorm';
import { User, UserRole } from './entities/User';
import { IUserService, CreateUserDto } from './user.interface';

export class UserService implements IUserService {
  constructor(private readonly userRepository: Repository<User>) {}


  async findOrCreate(data: CreateUserDto): Promise<User> {
    let user = await this.userRepository.findOne({ where: { clerkId: data.clerkId } });

    if (!user) {
      user = this.userRepository.create({
        clerkId: data.clerkId,
        email: data.email,
        name: data.name || '',
        role: UserRole.CUSTOMER,
      });
      await this.userRepository.save(user);
    }

    return user;
  }
}


