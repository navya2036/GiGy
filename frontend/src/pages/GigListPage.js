import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './GigListPage.css';

const GigListPage = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [status, setStatus] = useState('open');

  const filters = { category, search, minBudget, maxBudget, status };

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/gigs`, { params: filters });
        // Ensure data is always an array
        setGigs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to fetch gigs. Please try again.');
        setGigs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGigs();
  }, [filters]);

  const handleFilter = (e) => {
    e.preventDefault();
    // The useEffect will trigger refetch with the updated filter values
  };

  return (
    <div className="gigs-page">
      <div className="gigs-header">
        <div className="content-wrapper">
          <h1 className="section-title">Available Gigs</h1>
          
          {/* Filter Form */}
          <div className="filters-section">
            <form onSubmit={handleFilter} className="filter-form">
              <div className="filters-grid">
                <div className="form-group">
                  <label htmlFor="search">Search</label>
                  <input
                    id="search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title or description"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Design">Design</option>
                    <option value="Writing">Writing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="minBudget">Min Budget</label>
                  <input
                    id="minBudget"
                    type="number"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    placeholder="Min Budget"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="maxBudget">Max Budget</label>
                  <input
                    id="maxBudget"
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="Max Budget"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="assigned">Assigned</option>
                    <option value="completed">Completed</option>
                    <option value="">All</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="filter-submit-btn">Apply Filters</button>
            </form>
          </div>
        </div>
      </div>

      <div className="gigs-container">
        <div className="content-wrapper">
          {loading ? (
            <div className="loading-state">Loading gigs...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : gigs.length === 0 ? (
            <div className="empty-state">No gigs found.</div>
          ) : (
            <div className="gigs-grid">
              {gigs.map((gig) => (
                <div key={gig._id} className="gig-card">
                  <h3 className="gig-title">{gig.title}</h3>
                  <p className="gig-description">{gig.description.substring(0, 150)}...</p>
                  <div className="gig-details">
                    <div className="gig-info">
                      <p><strong>Budget:</strong> ${gig.budget}</p>
                      <p><strong>Duration:</strong> {gig.duration}</p>
                      <p><strong>Category:</strong> {gig.category}</p>
                    </div>
                    <div className="gig-meta">
                      <span className={`gig-status ${gig.status}`}>{gig.status}</span>
                      <p><strong>Posted by:</strong> {gig.creator.name}</p>
                      <p><strong>Location:</strong> {gig.location}</p>
                    </div>
                  </div>
                  <Link to={`/gigs/${gig._id}`} className="view-gig-btn">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default GigListPage;
