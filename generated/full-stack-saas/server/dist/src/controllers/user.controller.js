import Joi from 'joi';

const userSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required()
});

const users = [{ id: 1, name: 'Admin', email: 'admin@xandria.io' }];

export const getUsers = (req, res) => {
  res.json({ success: true, data: users });
};

export const createUser = (req, res, next) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }
  
  const newUser = { id: users.length + 1, ...value };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
};