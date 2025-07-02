import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './EditGigPage.css';

const EditGigPage = () => {
  const { id } = useParams();
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [skills, setSkills] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/gigs/${id}`, config);
        
        // Check if the user is the creator of the gig
        if (data.creator._id !== userInfo._id) {
          navigate('/my-gigs');
          return;
        }
        
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setBudget(data.budget);
        setLocation(data.location);
        setDuration(data.duration);
        setSkills(data.skills.join(', '));
        setExistingImages(data.images || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch gig details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchGig();
  }, [id, userInfo, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !category || !budget || !duration) {
      setError('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('budget', budget);
      formData.append('location', location);
      formData.append('duration', duration);
      
      if (skills) {
        formData.append('skills', skills);
      }
      
      // Append each new image to form data
      if (newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          formData.append('images', newImages[i]);
        }
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.put(`${process.env.REACT_APP_API_URL}/gigs/${id}`, formData, config);
      
      navigate(`/gigs/${id}`);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Error updating gig. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    setNewImages([...e.target.files]);
  };

  if (loading) {
    return (
      <div className="edit-gig-page">
        <div className="main-content">
          <div className="loading-container">
            <p>Loading gig details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-gig-page">
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Edit Gig</h1>
        </div>
        
        {error && <div className="error-container">
          <p>{error}</p>
        </div>}
        
        <form onSubmit={handleSubmit} className="edit-gig-form">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="6"
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Design">Design</option>
              <option value="Writing">Writing</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="budget">Budget (USD) *</label>
            <input
              id="budget"
              type="number"
              min="1"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
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
          
          <div className="form-group">
            <label htmlFor="duration">Estimated Duration *</label>
            <input
              id="duration"
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="skills">Required Skills (comma separated)</label>
            <input
              id="skills"
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
          
          {existingImages.length > 0 && (
            <div className="form-group">
              <label>Existing Images:</label>
              <div className="image-preview-grid">
                {existingImages.map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    alt={`Gig ${index + 1}`} 
                    className="preview-image"
                  />
                ))}
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="images">Add New Images</label>
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              max="5"
              className="file-input"
            />
            <small className="input-hint">
              You can upload up to 5 new images (optional)
            </small>
          </div>
          
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Gig'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditGigPage;
