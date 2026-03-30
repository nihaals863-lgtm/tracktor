import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  try {
    const operator = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        tractors: {
          take: 1
        }
      }
    });

    if (!operator) {
      return res.status(404).json({ success: false, message: 'Operator not found' });
    }

    res.json({
      success: true,
      data: {
        name: operator.name,
        email: operator.email,
        role: operator.role,
        language: operator.language,
        tractor: operator.tractors.length > 0 ? operator.tractors[0].modelName : 'Unassigned'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }

    const operator = await prisma.user.findUnique({ where: { id: req.user.id } });
    
    const isMatch = await bcrypt.compare(oldPassword, operator.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    
    if (!['en', 'naira'].includes(language)) {
      return res.status(400).json({ success: false, message: 'Invalid language selection' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { language }
    });

    res.json({ success: true, message: 'Language updated successfully', data: { language } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
