import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async register(userDto: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    const user = this.userRepository.create({ ...userDto, password: hashedPassword });
    return this.userRepository.save(user);
  }

  async login(mobile: string, password: string) {
    const user = await this.userRepository.findOne({ where: { mobile } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload = { userId: user.id };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
