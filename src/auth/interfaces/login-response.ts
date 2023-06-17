import { User } from "../entities/user.entity";

export interface LoginResponse extends User {
  token: string;
}