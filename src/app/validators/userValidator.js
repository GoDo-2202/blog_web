import { body, param, query } from 'express-validator';

// Validate POST /users
export const createUserValidator = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required'),
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail().withMessage('Invalid email address'),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .isMobilePhone('any').withMessage('Invalid phone number'),
  body('loginType')
    .optional()
    .custom(val => ['local', 'google', 'facebook'].includes(val))
    .withMessage('Login type must be local, google, or facebook')
];

// Validate PUT /users/:id
export const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim(),
  body('username')
    .optional()
    .trim()
    .isAlphanumeric().withMessage('Username must contain only letters and numbers'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Validate DELETE /users/:id
export const deleteUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID')
];

// Validate query page
export const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1')
];
