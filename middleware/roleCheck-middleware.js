const jwt = require("jsonwebtoken");

const roles = {
  admin: ["manageUsers", "assignTasks", "viewAllProfiles", "manageAllTasks","viewAllTasks"],
  manager: ["assignTasks", "viewTeamProfiles", "manageTeamTasks"],
  user: ["viewProfile", "manageOwnTasks"],
};

module.exports.authorizeRole = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      const token = req.header("Authorization").replace("Bearer ", "").trim();
      const jwtVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);

      req.user = jwtVerified;

      const userPermissions = roles[jwtVerified.role];
      
      if (!userPermissions) {
        return res.status(403).json({
          success: false,
          message: "Role is not authorized to access this resource.",
        });
      }

      const hasPermission = requiredPermissions.every((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions to access this resource.",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error.",
        error: error.message,
      });
    }
  };
};

// const jwt = require("jsonwebtoken");

// // Middleware to enforce role-based access
// module.exports.authorizeRole = (requiredPermissions) => {
//   return (req, res, next) => {
//     try {
//       const authHeader = req.header("Authorization");
//       if (!authHeader) {
//         return res
//           .status(401)
//           .json({ success: false, message: "Authentication token is missing." });
//       }

//       const token = authHeader.replace("Bearer ", "").trim();
//       const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//       req.user = decoded; // Attach user data to request

//       const userPermissions = roles[decoded.role];
//       if (!userPermissions) {
//         return res.status(403).json({
//           success: false,
//           message: "Role is not authorized to access this resource.",
//         });
//       }

//       const hasPermission = requiredPermissions.every((perm) =>
//         userPermissions.includes(perm)
//       );

//       if (!hasPermission) {
//         return res.status(403).json({
//           success: false,
//           message: "Insufficient permissions to access this resource.",
//         });
//       }

//       next();
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error.",
//         error: error.message,
//       });
//     }
//   };
// };
