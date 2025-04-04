import { SignJWT, jwtVerify } from 'jose';

type TokenPayload = {
  userId: number;
  username: string;
  email: string;
};

// Create a secret key from the JWT_SECRET
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return new TextEncoder().encode(secret);
};

export const signToken = async (payload: TokenPayload): Promise<string> => {
  const secretKey = getSecretKey();
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
  
  return token;
};

export const verifyToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as TokenPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};
