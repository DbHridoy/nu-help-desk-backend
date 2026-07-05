export type JwtPayload = {
  adminId: string;
  email: string;
  role: "admin" | "super_admin";
};
