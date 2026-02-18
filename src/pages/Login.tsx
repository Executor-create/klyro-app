import { LuGamepad2 } from 'react-icons/lu';
import { Card } from '../components/ui/Card';
import { IoLockClosedOutline } from 'react-icons/io5';
import Input from '../components/ui/Input';
import { useForm, type SubmitHandler } from 'react-hook-form';
import Button from '../components/ui/Button';
import {
  MdOutlineMail,
  MdOutlineRemoveRedEye,
  MdOutlinePerson,
} from 'react-icons/md';
import { FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';
import { EMAIL_REGEX, PASSWORD_REGEX } from '../utils/regex';
import { signUp, type SignUpRequest } from '../api/auth';
import type { User } from '../types/user.type';

const Login = () => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm<any>();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLogin, setIsLogin] = useState<boolean>(true);

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const handleSignUp: SubmitHandler<SignUpRequest> = async (
    data: SignUpRequest,
  ): Promise<User | undefined> => {
    try {
      const user = await signUp(data);

      if (user) {
        reset();
      }

      return user;
    } catch (error: any) {
      reset(undefined, { keepValues: true });

      if (error?.field && error?.message) {
        setError(error.field, { type: 'server', message: error.message });
      } else if (error?.message) {
        const message = error.message.toLowerCase();

        if (message.includes('username') && message.includes('email')) {
          setError('username', {
            type: 'server',
            message: 'Username or email already exists',
          });
          setError('email', {
            type: 'server',
            message: 'Username or email already exists',
          });
        } else if (message.includes('username')) {
          setError('username', { type: 'server', message: error.message });
        } else if (message.includes('email')) {
          setError('email', { type: 'server', message: error.message });
        } else {
          setError('root', { type: 'server', message: error.message });
        }
      } else if (error instanceof Error) {
        setError('root', { type: 'server', message: error.message });
      } else {
        setError('root', {
          type: 'server',
          message: 'An unknown error occurred',
        });
      }
    }
  };

  const handleLogin = () => {
    // TODO: Implement login functionality
  };

  return (
    <div>
      <div className="flex flex-col justify-center items-center min-h-screen">
        <LuGamepad2
          size={80}
          className={`text-white rounded-3xl p-5 mb-4 ${!isLogin ? 'mt-10' : ''}`}
          style={{
            background:
              'linear-gradient(to bottom right, var(--primary-color), var(--secondary-color))',
          }}
        />
        <h1
          className="text-4xl mb-3 font-google font-bold"
          style={{
            background:
              'linear-gradient(to bottom right, var(--primary-color), var(--secondary-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Klyro
        </h1>
        <p className="text-lg text-gray-500 font-google">
          Your gaming social network
        </p>
        <form
          onSubmit={handleSubmit(isLogin ? handleLogin : handleSignUp)}
          className="w-full max-w-md"
        >
          <Card className="w-105 mt-8 p-6 shadow-lg border border-gray-300">
            <div className="flex p-1 mb-1 bg-gray-200 rounded-2xl">
              <Button
                className={`${
                  isLogin
                    ? 'bg-white text-black font-bold rounded-2xl p-1 w-full cursor-pointer font-google'
                    : 'bg-transparent text-black font-bold rounded-2xl p-1 w-full focus:bg-white cursor-pointer font-google'
                }`}
                text="Login"
                type="button"
                onClick={() => setIsLogin(true)}
              />
              <Button
                className={`${
                  !isLogin
                    ? 'bg-white text-black font-bold rounded-2xl p-1 w-full cursor-pointer font-google'
                    : 'bg-transparent text-black font-bold rounded-2xl p-1 w-full focus:bg-white cursor-pointer font-google'
                }`}
                text="Sign Up"
                type="button"
                onClick={() => setIsLogin(false)}
              />
            </div>
            {!isLogin && (
              <div className="relative">
                <Input
                  className="pl-10 bg-secondary border border-gray-300 rounded-md p-1 bg-gray-100 font-google"
                  label="Username"
                  type="text"
                  placeholder="yourusername"
                  name="username"
                  register={register}
                  errors={errors}
                  options={{
                    required: 'Username is required',
                  }}
                />
                <MdOutlinePerson
                  size={20}
                  className="absolute left-3 top-8.5 text-gray-500 pointer-events-none"
                />
              </div>
            )}
            <div className="relative">
              <Input
                className="pl-10 bg-secondary border border-gray-300 rounded-md p-1 bg-gray-100 font-google"
                label="Email"
                type="email"
                placeholder="your@email.com"
                name="email"
                register={register}
                errors={errors}
                options={{
                  required: 'Email is required',
                  pattern: {
                    value: EMAIL_REGEX,
                    message: 'Invalid email address',
                  },
                }}
              />
              <MdOutlineMail
                size={20}
                className="absolute left-3 top-8.5 text-gray-500 pointer-events-none"
              />
            </div>

            <div className="relative">
              <Input
                className="pl-10 bg-secondary border border-gray-300 rounded-md p-1 bg-gray-100 font-google"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder={'•••••••••'}
                name="password"
                register={register}
                errors={errors}
                options={{
                  required: 'Password is required',
                  pattern: {
                    value: PASSWORD_REGEX,
                    message: 'Invalid password',
                  },
                }}
              />
              <IoLockClosedOutline
                size={20}
                className="absolute left-3 top-8.5 text-gray-500 pointer-events-none"
              />
              {showPassword ? (
                <FiEyeOff
                  size={20}
                  className="absolute right-3 top-8.5 text-gray-400 cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <MdOutlineRemoveRedEye
                  size={20}
                  className="absolute right-3 top-8.5 text-gray-400 cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>

            {!isLogin && (
              <div className="relative">
                <Input
                  className="pl-10 bg-secondary border border-gray-300 rounded-md p-1 bg-gray-100 font-google"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={'•••••••••'}
                  name="confirmPassword"
                  register={register}
                  errors={errors}
                  options={{
                    required: 'Confirm password is required',
                    validate: (value: string) =>
                      value === watch('password') || 'Passwords do not match',
                  }}
                />
                <IoLockClosedOutline
                  size={20}
                  className="absolute left-3 top-8.5 text-gray-500 pointer-events-none"
                />
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm text-primary font-semibold hover:underline font-google"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <Button
              className="bg-black rounded-lg p-1.5 w-full text-white hover:bg-primary cursor-pointer font-google"
              text={isLogin ? 'Login' : 'Sign Up'}
              type="submit"
            />
          </Card>
        </form>
        <p
          className={`text-sm text-center text-gray-500 mt-8 font-google ${!isLogin ? 'mb-4' : ''}`}
        >
          By continuing, you agree to our{' '}
          <span className="cursor-pointer font-bold text-black text-[1.1em]">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="cursor-pointer font-bold text-black text-[1.1em]">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
