import jwt from "jsonwebtoken";

export const generateToken = (
  id: string
) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyToken = (
  token: string
) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET as string

  ) as { 
    id: string 
  };
};