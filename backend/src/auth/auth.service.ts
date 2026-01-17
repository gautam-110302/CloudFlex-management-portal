import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity'; 
import { Client } from '../clients/entities/client.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
    
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, role } = registerDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Extract company name from email
    const domain = email.split('@')[1].split('.')[0];
    const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);

    // Find or Create the Client
    let client = await this.clientRepository.findOne({ where: { name: companyName } });
    if (!client) {
      client = this.clientRepository.create({ name: companyName });
      client = await this.clientRepository.save(client);
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepository.create({
      email,
      password_hash: hashedPassword, 
      role, 
      client,
    });

    return this.userRepository.save(user);
  }
  async getMe(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['client'],
      select: ['id', 'email', 'role', 'created_at'] 
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password_hash', 'role'], 
      relations: ['client']
    });

    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (isMatch) {
      const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role, 
        clientId: user.client?.id 
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };
    }
    
    throw new UnauthorizedException('Invalid credentials');
  }
}