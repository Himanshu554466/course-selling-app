import jwt from "jsonwebtoken";
//  JWT token ko verify karne ke liye jsonwebtoken library ka use kiya jata hai.

import config from "../config.js";
//  Secret key ko access karne ke liye config file ka import kiya gaya hai.

function userMiddleware(req, res, next) {
  //  Middleware function banaya gaya hai jo request ke JWT token ko verify karega aur user ko authenticate karega.

  const authHeader = req.headers.authorization;
  //  Authorization header se JWT token ko extract karte hain.

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //  Agar Authorization header na ho ya "Bearer" keyword na ho toh error bhejte hain.
    return res.status(401).json({ errors: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  //  Token ko "Bearer <token>" format se split karke actual token ko extract karte hain.

  try {
    const decoded = jwt.verify(token, config.JWT_USER_PASSWORD);
    //  JWT token ko verify karte hain using secret key jo config file me stored hai.
    // Agar token valid hai, toh decoded payload ko access karte hain.

    console.log(decoded);
    //  Debugging ke liye decoded token ko console me log karte hain.

    req.userId = decoded.id;
    //  Token ke payload me se `id` ko request object me store karte hain, taaki agle middleware ya controller me use kiya ja sake.

    next();
    //  Agar token valid hai, toh request ko next middleware ya controller tak forward karte hain.

  } catch (error) {
    //  Agar token invalid ho ya expire ho gaya ho, toh error handle karte hain.

    return res.status(401).json({ errors: "Invalid token or expired" });
    //  Unauthorized (401) error ke saath response bhejte hain.

    console.log("error in user middleware", error);
    //  Debugging ke liye error message ko console me log karte hain.
  }
}

export default userMiddleware;
//  Is middleware ko export karte hain taaki protected routes me isko include kiya ja sake.
