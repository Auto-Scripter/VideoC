import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Your Firebase imports
import { auth, db } from '../firebase.js'; 
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';

// --- SVG Icon Component ---
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 9.196C34.976 5.82 29.828 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
    <path fill="#FF3D00" d="M6.306 14.691c-1.645 3.119-2.656 6.637-2.656 10.309C3.65 29.363 4.661 32.881 6.306 36.009L12.05 31.549C11.233 29.531 10.8 27.345 10.8 25c0-2.345.433-4.531 1.25-6.549L6.306 14.691z"></path>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-5.657-5.657C30.072 34.668 27.221 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-5.744 4.614C10.032 39.577 16.506 44 24 44z"></path>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.16-4.082 5.571l5.657 5.657C42.488 36.425 44 31.13 44 25c0-2.616-.569-5.126-1.589-7.443l-5.8 4.526C37.525 18.067 37.225 20 37.225 20z"></path>
  </svg>
);

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const saveUserData = async (user, additionalData = {}) => {
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      const nameParts = user.displayName ? user.displayName.split(' ') : [];
      const fName = additionalData.firstName || nameParts[0] || '';
      const lName = additionalData.lastName || nameParts.slice(1).join(' ') || '';
      const userData = {
        uid: user.uid,
        firstName: fName,
        lastName: lName,
        email: user.email,
        createdAt: new Date(),
        authProvider: additionalData.provider || "email",
      };
      await setDoc(userDocRef, userData);}};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      } catch (err) {
        setError(err.message.replace('Firebase: ', ''));
      }
    } else {
      if (!firstName || !lastName) {
        setLoading(false);
        return setError('All fields are required.');
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserData(userCredential.user, { firstName, lastName, provider: 'email' });
        navigate('/dashboard');
      } catch (err) {
        setError(err.message.replace('Firebase: ', ''));
      }
    }
    setLoading(false);
  };
  
  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserData(result.user, { provider: 'google' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);}};

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-8 md:p-12 transition-all duration-300">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          {isLogin ? 'Welcome Back!' : 'Create Your Account'}
        </h1>
        <p className="text-gray-500 mt-2">
          {isLogin ? 'Log in to continue your journey.' : 'Join us and start your adventure.'}
        </p>
      </div>

      <div className="mt-8">
        <button onClick={handleGoogleAuth} disabled={loading} className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg px-4 py-3 text-md font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
          <GoogleIcon />
          Continue with Google
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-sm font-medium text-gray-500">Or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      
      {error && <p className="mt-4 text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {!isLogin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required={!isLogin} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow duration-200" placeholder="First Name" />
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required={!isLogin} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow duration-200" placeholder="Last Name" />
          </div>
        )}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow duration-200" placeholder="Email address" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-shadow duration-200" placeholder="Password" />
        
        <div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 disabled:bg-green-400 disabled:cursor-not-allowed">
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
          </button>
        </div>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={toggleAuthMode} className="ml-1 font-medium text-green-600 hover:text-green-500">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );};

function App() {
  return (
    <AuthForm/>
  );
}

export default App;
