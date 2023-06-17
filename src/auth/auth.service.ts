import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, UpdateAuthDto, RegisterUserDto } from './dto';

import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

@Injectable()
export class AuthService {


  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {
      const { password, ...userData } = createUserDto;

      // Encrept password and create new user
      const newUser = new this.userModel({
        password: bcrypt.hashSync(password, 10),
        ...userData
      });

      await newUser.save();

      const { password: _, ...result } = newUser.toJSON();

      return result as User;
    } catch (error) {

      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists`);
      }

      throw new InternalServerErrorException('Something went wrong', error);
    }

  }

  async login(loginUserDto): Promise<LoginResponse> {

    const { email, password } = loginUserDto;

    try {
      const user = await this.userModel.findOne({ email });

      // Validate user password
      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException('No valid credentials');
      }

      const { password: _, ...result } = user.toJSON();

      return {
        ...result,
        token: this.getJwtToken({ id: user.id })
      };

    } catch (error) {
      console.log(error)
      throw new UnauthorizedException(`'No user founded with ${email} email'`);
    }

  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {

    const {
      email,
      password,
      name
    } = registerUserDto;

    const user = await this.create({ email, password, name });

    return {
      ...user,
      token: this.getJwtToken({ id: user._id })
    }

  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest
  }

  findAll() {
    return this.userModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}
