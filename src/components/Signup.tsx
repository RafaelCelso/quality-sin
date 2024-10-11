import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { Eye, EyeOff } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';

const Signup: React.FC = () => {
  // ... (component code remains the same)
};

export default Signup;