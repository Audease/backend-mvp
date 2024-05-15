import { Users } from "./entities/user.entity";
import { Repository } from "typeorm"
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "../auth/dto/create-user.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>
    ) {}
    
    async create(createUserDto: CreateUserDto): Promise<Users> {
        return await this.userRepository.save(createUserDto);
    }
    
    async findAll(): Promise<Users[]> {
        return await this.userRepository.find();
    }
    
    async findOne(id: string): Promise<Users> {
        return await this.userRepository.findOne({
            where: { id }
        });
    }
    
    async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<Users> {
        await this.userRepository.update(id, updateUserDto);
        return await this.userRepository.findOne({
            where: { id }
        });
    }
}
