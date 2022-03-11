// Required modules
const express = require("express");
const jwt = require("jsonwebtoken");

// Create app to express
const app = express();

// Config
app.use(express.json());

const users = [
  {
    id: "1",
    username: "Juan Pablo",
    password: "juan123.",
    isAdmin: true,
  },
  {
    id: "2",
    username: "Mariana",
    password: "mariana123.",
    isAdmin: false,
  },
];

let refreshTokens = [];

app.post("/api/refresh", (req, res) => {
  // Take the refresh token from the user
  const refreshToken = req.body.token;

  // Send error if there is no token or it's no valid
  if (!refreshToken) return res.status(401).json("You are not authenticared!");
  if (!refreshTokens.includes(refreshToken))
    return res.status(403).json("Refresh token is no valid!");

  jwt.verify(refreshToken, "myRefreshSecretKey", (err, user) => {
    err && console.log(err);

    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });

  // If everything is ok, create new access token, refresh token and send to user
});

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "mySecretKey", {
    expiresIn: "5s",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, isAdmin: user.isAdmin }, "myRefreshSecretKey");
};

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });
  if (user) {
    // Generate and access token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    refreshTokens.push(refreshToken);

    res.json({
      username: user.username,
      isAdmin: user.isAdmin,
      accessToken,
      refreshToken,
    });
  } else res.status(400).json("Username or pass incorrect");
});

const verify = (req, res, next) => {
  // Get authorization of headers
  const authHeader = req.headers.authorization;

  // If are authorization
  if (authHeader) {
    // Get only token
    const token = authHeader.split(" ")[1];

    // Verify token
    jwt.verify(token, "mySecretKey", (err, user) => {
      if (err) {
        console.log(err.message);
        return res.status(403).json("Token is not valid!");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json("You are not authenticated!");
  }
};

app.post("/api/logout", verify, (req, res) => {
  const refreshToken = req.body.token;
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  res.status(200).json("You logged out successfully");
});

app.delete("/api/user/:userId", verify, (req, res) => {
  if (req.user.id === req.params.userId || req.user.isAdmin) {
    res.status(200).json("User has been deleted.");
  } else {
    res.status(403).json("You are not allowed to delete this user!");
  }
});

// Run server
app.listen(5000, () => {
  console.log("Backend is running");
});
