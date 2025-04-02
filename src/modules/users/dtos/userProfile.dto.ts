import { IUserBasicInfo } from './userBasicInfo.dto';
export interface IUserProfile extends IUserBasicInfo {
    avatar?: string;
    bio?: string;
  }