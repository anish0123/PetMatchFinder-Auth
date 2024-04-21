import jwt from 'jsonwebtoken';
// Description: This file contains the functions for the user routes
// TODO: add function check, to check if the server is alive
// TODO: add function to get all users
// TODO: add function to get a user by id
// TODO: add function to create a user
// TODO: add function to update a user
// TODO: add function to delete a user
// TODO: add function to check if a token is valid
import {Request, Response, NextFunction} from 'express';
import {User, UserWithoutPassword} from '../../types/DBTypes';
import {MessageResponse} from '../../types/MessageTypes';
import userModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import bcrypt from 'bcrypt';

const userListGet = async (
  req: Request,
  res: Response<User[]>,
  next: NextFunction
) => {
  try {
    const users = await userModel.find().select('-password -__v -role');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const userGet = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<User>,
  next: NextFunction
) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select('-password -__v -role');
    if (!user) {
      throw new CustomError('No species found', 404);
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const userPost = async (
  req: Request<{}, {}, Omit<User, 'user_id'>>,
  res: Response<MessageResponse & {data: User}>,
  next: NextFunction
) => {
  try {
    req.body.role = 'user';
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    const user = await userModel.create(req.body);
    console.log('user: ', user);
    const response = {
      message: 'User added',
      data: user,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

const userPut = async (
  req: Request<{}, {}, Omit<User, 'user_id'>>,
  res: Response<MessageResponse & {user: User}>,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader?.split(' ')[1];
      const userFromToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as UserWithoutPassword;
      if (req.body.password) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
      }

      const user = await userModel
        .findByIdAndUpdate(userFromToken._id, req.body, {
          new: true,
        })
        .select('-password -__v -role');
      if (!user) {
        throw new CustomError('No user found', 404);
      }
      const response = {
        message: 'User updated',
        user: user,
      };
      res.json(response);
    }
  } catch (error) {
    next(error);
  }
};

const userDelete = async (
  req: Request<{}, {}, {}>,
  res: Response<MessageResponse & {user: User}>,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader?.split(' ')[1];
      const userFromToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as UserWithoutPassword;
      const user = await userModel
        .findByIdAndDelete(userFromToken._id)
        .select('-password -__v -role');
      if (!user) {
        throw new CustomError('No user found', 404);
      }
      res.json({message: 'User deleted', user: user});
    }
  } catch (error) {
    next(error);
  }
};

const userAdminDelete = async (
  req: Request<{id: string}, {}, {}>,
  res: Response<MessageResponse & {user: User}>,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader?.split(' ')[1];
      const userFromToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as UserWithoutPassword;
      if (userFromToken.role === 'admin') {
        const user = await userModel
          .findByIdAndDelete(req.params.id)
          .select('-password -__v -role');
        if (!user) {
          throw new CustomError('No user found', 404);
        }
        res.json({message: 'User deleted', user: user});
      }
    }
  } catch (error) {
    next(error);
  }
};

export {userListGet, userGet, userPost, userPut, userDelete, userAdminDelete};
