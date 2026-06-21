import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, city, occupation } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            fullName, email, password: hashedPassword, city, occupation
        });
        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.status(201).json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
    } catch (err: any) {
        console.error("Register Error:", err);
        res.status(500).json({ message: 'Server error: ' + (err.message || 'Unknown error') });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password || '');
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found please create an Acount first' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' });

        res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};


export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
};
