import {Request, Response, NextFunction} from 'express';
import {
  UserWithoutPassword,
  UserWithoutPasswordRole,
} from '../../types/DBTypes';
import {MessageResponse} from '../../types/MessageTypes';
import userModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const login = async (
  req: Request<{}, {}, {email: string; password: string}>,
  res: Response<
    MessageResponse & {token: string; user: UserWithoutPasswordRole}
  >,
  next: NextFunction
) => {
  try {
    const {email, password} = req.body;
    const user = await userModel.findOne({email: email});
    if (!user) {
      throw new CustomError('Username or password incorrect', 404);
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new CustomError('Username or password incorrect', 404);
    }

    if (!process.env.JWT_SECRET) {
      throw new CustomError('JWT secret not set', 500);
    }

    const userWithoutPassword: UserWithoutPasswordRole = {
      _id: user._id,
      email: user.email,
      user_name: user.user_name,
      streetAddress: user.streetAddress,
      postalCode: user.postalCode,
      city: user.city,
    };

    const tokenContent: UserWithoutPassword = {
      _id: user._id,
      email: user.email,
      user_name: user.user_name,
      role: user.role,
      streetAddress: user.streetAddress,
      postalCode: user.postalCode,
      city: user.city,
    };

    const token = jwt.sign(tokenContent, process.env.JWT_SECRET);

    res.json({message: 'Login successful', token, user: userWithoutPassword});
  } catch (error) {
    next(error);
  }
};

export {login};
