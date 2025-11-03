import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Form.css'; // We're still using this for the new button
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
    review_text: '',
  });

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const themes = ['Healthcare', 'Education', 'Infrastructure', 'Public Transport', 'Sanitation'];

  // This state will track if we are currently fetching the user's location
  const [isLocating, setIsLocating] = useState(false);

  // This effect still runs, populating the state list when the country changes
  useEffect(() => {
    setStates(Object.keys(locationData[formData.country].states));
  }, [formData.country]);

  const handleCountryChange = (e) => {
    const country = e.target.value;
    const countryInfo = locationData[country];
    setFormData({ ...formData, country: country, state: '', district: '' });
    setStates(Object.keys(countryInfo.states));
    setDistricts([]); 
    onLocationChange([countryInfo.lat, countryInfo.lon], countryInfo.zoom);
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    const countryInfo = locationData[formData.country];
    const stateInfo = countryInfo.states[state];
    setFormData({ ...formData, state: state, district: '' });
    setDistricts(stateInfo.districts);
    onLocationChange([stateInfo.lat, stateInfo.lon], stateInfo.zoom);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // --- NEW FUNCTION: Geolocation & Reverse Geocoding ---
  const handleFindMyLocation = () => {
    setIsLocating(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    // 1. Get browser location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // 2. Pan map to location immediately
        onLocationChange([latitude, longitude], 13); // Zoom in close (level 13)

        // 3. Call Nominatim API for reverse geocoding
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
          const response = await axios.get(url);
          const address = response.data.address;
          
          const country = address.country;
          const state = address.state;
          // Nominatim uses 'city', 'county', or 'suburb' for district-level
          const district = address.city || address.county || address.suburb;

          // 4. Try to match the address with our locationData.js
          if (country && locationData[country]) {
            setStates(Object.keys(locationData[country].states)); // Populate states
            
            if (state && locationData[country].states[state]) {
              setDistricts(locationData[country].states[state].districts); // Populate districts
              
              if (district && locationData[country].states[state].districts.includes(district)) {
                // Perfect Match: Set all 3 fields
                setFormData({ ...formData, country, state, district });
                toast.success("Location found and set!");
              } else {
                // State matched, but not district
                setFormData({ ...formData, country, state, district: '' });
                toast.success("State found! Please select your district.");
              }
            } else {
              // Country matched, but not state
              setFormData({ ...formData, country, state: '', district: '' });
              toast.warn("Country found, but state is not in our list.");
            }
          } else {
            toast.error("Location found, but not in our supported country list.");
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          toast.error("Could not find an address for your location.");
        } finally {
          setIsLocating(false); // Stop loading
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error.code === 1) { // PERMISSION_DENIED
          toast.error("You must grant location permission to use this feature.");
        } else {
          toast.error("Unable to retrieve your location.");
        }
        setIsLocating(false);
      }
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://map-my-voice-backend.onrender.com/api/reviews/', formData);
      toast.success('Thank you for your review!');
      if (onReviewSubmit) onReviewSubmit();
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit review. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* --- NEW BUTTON ADDED HERE --- */}
      <button 
        type="button" 
        className="location-btn" 
        onClick={handleFindMyLocation} 
        disabled={isLocating}
      >
        {isLocating ? (
          <div className="btn-spinner"></div>
        ) : (
          '🎯 Find My Location'
        )}
      </button>

      {/* Title for the next section */}
      <h2 style={{ marginTop: '20px' }}>Or Select Your Area</h2>

      {/* Rest of the form is unchanged */}
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
          <button type="button" className={formData.rating === 'Good' ? 'active' : ''} onClick={() => setFormData({...formData, rating: 'Good'})}>👍 Good</button>
          <button type="button" className={formData.rating === 'Bad' ? 'active' : ''} onClick={() => setFormData({...formData, rating: 'Bad'})}>👎 Bad</button>
        </div>
      </div>
      <button type="submit" className="submit-btn">Submit Review</button>
    </form>
  );
};

export default InputForm;