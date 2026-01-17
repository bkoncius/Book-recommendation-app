import jwt from "jsonwebtoken";

console.log("AUTH UTILS LOADED");
const ACCESS_COOKIE = "access_token";

export const createAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

export const setAuthCookie = (res, token) => {
  res.cookie(ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const clearAuthCookie = (res) => {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
};
