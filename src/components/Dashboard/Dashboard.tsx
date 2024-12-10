import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LogOut, User } from 'react-feather';
import './Dashboard.css';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid);
          const userDataSnapshot = await getDoc(userDoc);

          if (userDataSnapshot.exists()) {
            setUserData(userDataSnapshot.data() as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        navigate('/login'); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!userData) {
    return <p>Loading...</p>; // Show loading state while fetching data
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          {/* User Icon */}
          <div className="user-icon">
            <User size={24} />
          </div>

          {/* Greeting and Welcome Message */}
          <div className="user-info">
            <h1>{getGreeting()}, {userData.firstName}</h1>
            <p className="welcome-message">Welcome to your UrjaShakti dashboard</p>
          </div>

          {/* Logout Button */}
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Main Section */}
        <div className="dashboard-main">
          <div className="profile-section">
            <h2>User Details</h2>
            <div className="profile-details">
              <p><strong>Full name:</strong> {userData.firstName} {userData.lastName}</p>
              <p><strong>Email address:</strong> {userData.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
