exports.handlePsqlErrors = (err, req, res, next) => {
  switch (err.code) {
    case "22P02":
      res.status(400).send({ message: "Bad Request: Invalid Input" });
      break;
    case "23502":
      res.status(400).send({ message: "Bad Request: Missing Required Field" });
      break;
    case "23503":
      res.status(404).send({ message: "Not Found: user doesn't exist" });
      break;
    case "23505":
      res.status(400).send({ message: "Bad Request: Already Exists" });
      break;
    default:
      next(err);
      break;
  }
};
