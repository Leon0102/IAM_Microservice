/* eslint-disable prettier/prettier */
export interface UserInterface {
  uuid: string
  username: string
  password: string
  email: string
  refreshToken: string
  refreshTokenExpires: Date
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
  version: number
}
