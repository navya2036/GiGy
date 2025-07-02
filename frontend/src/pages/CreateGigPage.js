import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './CreateGigPage.css';

const CreateGigPage = () => {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('Remote');
  const [duration, setDuration] = useState('');
  const [skills, setSkills] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      // Append each image to form data
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          formData.append('images', images[i]);
        }
      }
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.post(`${process.env.REACT_APP_API_URL}/gigs`, formData, config);
      
      navigate('/my-gigs');
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'Error creating gig. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  return (
    <div className="create-gig-page">
      <h1 className="page-title">Create a New Gig</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="create-gig-form">
        <div className="form-group full-width">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="A descriptive title for your gig"
          />
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Provide a detailed description of the task"
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
            placeholder="Your budget for this task"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Remote or specific location"
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
            placeholder="e.g., 2 days, 1 week, 3 months"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="skills">Required Skills (comma separated)</label>
          <input
            id="skills"
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g., JavaScript, React, Node.js"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="images">
            Images
            <span className="label-hint">(up to 5 images)</span>
          </label>
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
            You can upload up to 5 images (optional)
          </small>
        </div>
        
        <div className="form-group full-width">
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Gig'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGigPage;
