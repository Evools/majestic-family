import { Role, UserStatus } from "@prisma/client"
import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      status: UserStatus
      firstName?: string | null
      lastName?: string | null
      staticId?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: Role
    status: UserStatus
    firstName?: string | null
    lastName?: string | null
    staticId?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    status: UserStatus
    firstName?: string | null
    lastName?: string | null
    staticId?: string | null
  }
}
