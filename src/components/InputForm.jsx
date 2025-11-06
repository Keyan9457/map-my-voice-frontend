import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Form.css'; 
import { locationData } from '../locationData';
import { toast } from 'react-toastify';

const InputForm = ({ onLocationChange, onReviewSubmit }) => {
  const [formData, setFormData] = useState({
    country: 'India',
    state: '',
    district: '',
    other_area: '',
    theme: 'Healthcare',
    rating: 'Good',

    // NEW INCIDENT FIELDS
    report_type: '',
    comment: '',
    latitude: null,
    longitude: null,
  });

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const themes = ['Healthcare', 'Education', 'Infrastructure', 'Public Transport', 'Sanitation'];

  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setStates(Object.keys(locationData[formData.country].states));
  }, [formData.country]);

  useEffect(() => {
    const handler = (e) => {
      setFormData((prev) => ({
        ...prev,
        latitude: e.detail.lat,
        longitude: e.detail.lng,
      }));
    };
    window.addEventListener("incident-location-selected", handler);
    return () => window.removeEventListener("incident-location-selected", handler);
  }, []);

  const handleCountryChange = (e) => {
    const country = e.target.value;
    const countryInfo = locationData[country];
    setFormData({ ...formData, country, state: '', district: '' });
    setStates(Object.keys(countryInfo.states));
    setDistricts([]);
    onLocationChange([countryInfo.lat, countryInfo.lon], countryInfo.zoom);
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    const stateInfo = locationData[formData.country].states[state];
    setFormData({ ...formData, state, district: '' });
    setDistricts(stateInfo.districts);
    onLocationChange([stateInfo.lat, stateInfo.lon], stateInfo.zoom);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFindMyLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        onLocationChange([latitude, longitude], 13);

        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));

        toast.success("Location detected! Click Submit to save.");
        setIsLocating(false);
      },
      () => {
        toast.error("Unable to retrieve your location.");
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/reviews/', formData);
      toast.success('Thank you for your review!');
      if (onReviewSubmit) onReviewSubmit();

      setFormData((prev) => ({
        ...prev,
        theme: 'Healthcare',
        rating: 'Good',
        report_type: '',
        comment: '',
        latitude: null,
        longitude: null,
      }));

    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      {/* Add Ripple class */}
      <button 
        type="button" 
        className="location-btn ripple" 
        onClick={handleFindMyLocation} 
        disabled={isLocating}
      >
        {isLocating ? <div className="btn-spinner"></div> : '🎯 Find My Location'}
      </button>

      <h2 style={{ marginTop: '20px' }}>Or Select Your Area</h2>

      <div className="form-group">
        <label>Country</label>
        <select name="country" value={formData.country} onChange={handleCountryChange}>
          {Object.keys(locationData).map(country => <option key={country} value={country}>{country}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>State</label>
        <select name="state" value={formData.state} onChange={handleStateChange} required>
          <option value="">-- Select State --</option>
          {states.map(state => <option key={state} value={state}>{state}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>District</label>
        <select name="district" value={formData.district} onChange={handleChange} required>
          <option value="">-- Select District --</option>
          {districts.map(district => <option key={district} value={district}>{district}</option>)}
        </select>
      </div>

      <h2 style={{ marginTop: '30px' }}>Voice Query</h2>

      <div className="form-group">
        <label>Theme</label>
        <select name="theme" value={formData.theme} onChange={handleChange}>
          {themes.map(theme => <option key={theme} value={theme}>{theme}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>Rate</label>
        <div className="rating-buttons">
          <button type="button" className={`ripple ${formData.rating === 'Good' ? 'active' : ''}`} onClick={() => setFormData({...formData, rating: 'Good'})}>👍 Good</button>
          <button type="button" className={`ripple ${formData.rating === 'Bad' ? 'active' : ''}`} onClick={() => setFormData({...formData, rating: 'Bad'})}>👎 Bad</button>
        </div>
      </div>

      {formData.rating === 'Bad' && (
        <>
          <div className="form-group">
            <label>Type of Issue</label>
            <select name="report_type" value={formData.report_type} onChange={handleChange} required>
              <option value="">-- Select Issue Type --</option>
              <option value="Safety Hazard">Safety Hazard</option>
              <option value="Poor Condition">Poor Condition</option>
              <option value="Staff Misconduct">Staff Misconduct</option>
              <option value="Service Failure">Service Failure</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Describe the Problem (Optional)</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={3}
              className="form-textarea"
            />
          </div>

          {formData.latitude && formData.longitude ? (
            <p style={{ color: '#4cd137', fontSize: '0.9em' }}>
              Location Selected: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
            </p>
          ) : (
            <p style={{ color: '#ccc', fontSize: '0.85em' }}>
              Click the map to mark the exact incident location.
            </p>
          )}
        </>
      )}

      {/* Submit button now has ripple */}
      <button type="submit" className="submit-btn ripple">Submit Review</button>
    </form>
  );
};

export default InputForm;
