import User from '../models/User.js';
import OTP from '../models/OTP.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret_key', {
    expiresIn: '30d',
  });
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any existing OTP for this email
    await OTP.deleteMany({ email });

    await OTP.create({
      email,
      otp
    });

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or your preferred service
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Vocal App" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Your Vocal Verification Code',
        text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
        html: `<h2>Your Verification Code</h2><p>Your verification code is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${email}`);
    } else {
      console.log(`[Development Mode] OTP for ${email} is ${otp}`);
    }

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { 
      fullName, username, email, password, otp,
      gender, state,
      highestQualification, institution, yearOfGraduation,
      currentRole, organization, skills
    } = req.body;

    /* OTP Disabled for now
    if (!otp) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const validOTP = await OTP.findOne({ email, otp });
    if (!validOTP) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    */

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      username,
      email,
      password: hashedPassword,
      gender,
      state,
      highestQualification,
      institution,
      yearOfGraduation,
      currentRole,
      organization,
      skills: skills ? skills : []
    });

    // Delete OTP after successful registration
    /* OTP Disabled for now
    await OTP.deleteMany({ email });
    */

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
