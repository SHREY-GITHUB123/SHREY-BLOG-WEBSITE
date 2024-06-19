import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';

const Logout = () => {
  const [, setCurrentUser] = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Function to perform logout actions
    const performLogout = () => {
      setCurrentUser(null); // Update context state
      localStorage.removeItem('user'); // Clear user data from local storage
      navigate('/login'); // Redirect to login page after logout
    };

    // Call the function immediately when component mounts
    performLogout();
  }, [setCurrentUser, navigate]);

  // Logout component doesn't render anything, so return null
  return null;
};

export default Logout;
