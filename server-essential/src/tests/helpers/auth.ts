import jwt from "jsonwebtoken";

export function makeAccessToken(userId: string): string {
  const privateKey = process.env.ACCESS_PRIVATE_KEY!;
  return jwt.sign({ userId }, privateKey, { algorithm: "RS256", expiresIn: "1h" });
}
