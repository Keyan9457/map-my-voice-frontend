import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Form.css'; 
import { locationData } from '../locationData';
import { toast } from 'react-toastify';
import confetti from "canvas-confetti";

const InputForm = ({ onLocationChange, onReviewSubmit }) => {
  const [formData, setFormData] = useState({
    country: 'India',
    state: '',
    district: '',
    other_area: '',
    theme: 'Healthcare',
    rating: 'Good',
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

  const createRipple = (e) => {
    const button = e.currentTarget;
    const ripple = document.createElement("span");
    const size = Math.max(button.clientWidth, button.clientHeight);
    const rect = button.getBoundingClientRect();
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.classList.add("ripple");

    // Remove old ripple
    const oldRipple = button.querySelector(".ripple");
    if (oldRipple) oldRipple.remove();
    button.appendChild(ripple);
  };

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

  const handleFindMyLocation = (e) => {
    createRipple(e);
    setIsLocating(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationChange([latitude, longitude], 13);

        setFormData(prev => ({ ...prev, latitude, longitude }));

        toast.success("Location detected!");
        setIsLocating(false);
      },
      () => {
        toast.error("Failed to detect location.");
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    createRipple(e);

    try {
      await axios.post('http://127.0.0.1:8000/api/reviews/', formData);
      toast.success('Thank you for your review!');
      // 🎉 Confetti Burst Animation
      confetti({
        particleCount: 120,
        startVelocity: 30,
        spread: 360,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
    });

      if (onReviewSubmit) onReviewSubmit();

      setFormData(prev => ({
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
      toast.error('Submission failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <button 
        type="button" 
        className="location-btn"
        onClick={handleFindMyLocation}
        disabled={isLocating}
      >
        {isLocating ? <div className="btn-spinner"></div> : '🎯 Find My Location'}
      </button>

      <h2 style={{ marginTop: '20px' }}>Or Select Your Area</h2>

      <div className="form-group">
        <label>Country</label>
        <select name="country" value={formData.country} onChange={handleCountryChange}>
          {Object.keys(locationData).map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
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
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
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
          <button type="button" className={formData.rating === 'Good' ? 'active' : ''} onClick={() => setFormData({...formData, rating: 'Good'})}>👍 Good</button>
          <button type="button" className={formData.rating === 'Bad' ? 'active' : ''} onClick={() => setFormData({...formData, rating: 'Bad'})}>👎 Bad</button>
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
            <textarea name="comment" value={formData.comment} onChange={handleChange} rows={3} className="form-textarea" />
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

      <button type="submit" className="submit-btn">Submit Review</button>

    </form>
  );
};

export default InputForm;
