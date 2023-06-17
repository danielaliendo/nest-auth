import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {
  _id?: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ minlength: 6 })
  password?: string;
  @Prop({ required: true, minlength: 3 })
  name: string;
  @Prop({ default: true})
  isActive: boolean;
  @Prop({ type: [String], default: ['user'] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);