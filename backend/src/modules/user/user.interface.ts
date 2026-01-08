import { User } from './entities/User';

export interface CreateUserDto {
  clerkId: string;
  email: string;
  name?: string;
}

export interface IUserService {
  findOrCreate(data: CreateUserDto): Promise<User>;
}


