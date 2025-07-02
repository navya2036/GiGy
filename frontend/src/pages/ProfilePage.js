import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../components/layout/Header.css';
import './ProfilePage.css';

const ProfilePage = () => {
  const { userInfo, updateProfile, uploadProfilePicture, isLoading, error } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setBio(userInfo.bio || '');
      setSkills(userInfo.skills ? userInfo.skills.join(', ') : '');
      setLocation(userInfo.location || '');

      const fetchUserReviews = async () => {
        setReviewsLoading(true);
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          };

          const { data } = await axios.get(
            `${process.env.REACT_APP_API_URL}/reviews/user/${userInfo._id}`,
            config
          );

          setUserReviews(data);
        } catch (err) {
          console.error('Error fetching reviews:', err);
        } finally {
          setReviewsLoading(false);
        }
      };

      fetchUserReviews();
    } else {
      navigate('/login');
    }
  }, [userInfo, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (password && password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      const userData = {
        name,
        email,
        bio,
        skills: skills ? skills.split(',').map(skill => skill.trim()) : [],
        location
      };

      if (password) {
        userData.password = password;
      }

      await updateProfile(userData);
      setSuccessMessage('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      // Error is handled in the context
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!image) {
      setFormError('Please select an image to upload');
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      await uploadProfilePicture(formData);
      setSuccessMessage('Profile picture updated successfully');
      setImage(null);
    } catch (err) {
      // Error is handled in the context
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1 className="profile-title">Profile</h1>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Profile Picture</h2>
          <div className="profile-picture-section">
            {userInfo?.profilePicture && (
              <img 
                src={userInfo.profilePicture} 
                alt="Profile" 
                className="profile-picture" // Updated to match Header.css
              />
            )}
            
            <form onSubmit={handleImageUpload} className="file-upload">
              <div className="form-group">
                <label htmlFor="image">Upload new profile picture</label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <button type="submit" disabled={isLoading || !image}>
                {isLoading ? 'Uploading...' : 'Upload Image'}
              </button>
            </form>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Profile Details</h2>
          {error && <div className="error-message">{error}</div>}
          {formError && <div className="error-message">{formError}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password (leave blank to keep current)</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows="4"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="skills">Skills (comma separated)</label>
                <input
                  id="skills"
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Reviews</h2>
          {reviewsLoading ? (
            <p>Loading reviews...</p>
          ) : userReviews.length === 0 ? (
            <p>No reviews yet.</p>
          ) : (
            <div className="reviews-grid">
              <p>Average Rating: {userInfo?.rating?.toFixed(1)} / 5</p>
              {userReviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    {review.reviewer.profilePicture && (
                      <img 
                        src={review.reviewer.profilePicture} 
                        alt={review.reviewer.name} 
                        className="reviewer-picture"
                      />
                    )}
                    <div>
                      <p className="reviewer-name">{review.reviewer.name}</p>
                      <p>Rating: {review.rating} / 5</p>
                    </div>
                  </div>
                  <p>{review.comment}</p>
                  <p className="gig-title">
                    For gig: {review.gig.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
