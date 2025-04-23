import { useState } from "react";
import './CustomHabitForm.css'; // Import the CSS file

export const CustomHabitForm = ({ onSubmit }) => {
  // State for form fields
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null); // Will store the icon file
  const [description, setDescription] = useState("");
  const [minTime, setMinTime] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [timeBlock, setTimeBlock] = useState("morning");
  const [visibility, setVisibility] = useState("private"); // "public" or "private"
  const [recurrence, setRecurrence] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/png") {
      setIcon(URL.createObjectURL(file)); // Set the image file URL
    } else {
      alert("Please upload a PNG file.");
    }
  };

  const handleRecurrenceChange = (e) => {
    const { name, checked } = e.target;
    setRecurrence((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newHabit = {
      name,
      icon,
      description,
      minTime: parseInt(minTime),
      maxTime: parseInt(maxTime),
      timeBlock,
      visibility,
      recurrence: Object.keys(recurrence)
        .filter((day) => recurrence[day])
        .join(", "), // Join selected days
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    };

    onSubmit(newHabit); // Send the new habit back to parent component
  };

  return (
    <div className="fullscreen-form">
      <form onSubmit={handleSubmit}>
        <h2>Create a Custom Habit</h2>

        <input 
          type="text" 
          placeholder="Habit name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        
        <input 
          type="text" 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
        
        <input 
          type="number" 
          placeholder="Min Time (min)" 
          value={minTime} 
          onChange={(e) => setMinTime(e.target.value)} 
        />
        
        <input 
          type="number" 
          placeholder="Max Time (min)" 
          value={maxTime} 
          onChange={(e) => setMaxTime(e.target.value)} 
        />
        
        <select value={timeBlock} onChange={(e) => setTimeBlock(e.target.value)}>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>
        
        <select 
          value={visibility} 
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <div>
          <h4>Recurrence</h4>
          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
            <label key={day}>
              <input
                type="checkbox"
                name={day}
                checked={recurrence[day]}
                onChange={handleRecurrenceChange}
              />
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </label>
          ))}
        </div>

        <label>Start:</label>
        <input 
          type="datetime-local" 
          value={start.toISOString().slice(0, 16)} 
          onChange={(e) => setStart(new Date(e.target.value))} 
        />
        
        <label>End:</label>
        <input 
          type="datetime-local" 
          value={end.toISOString().slice(0, 16)} 
          onChange={(e) => setEnd(new Date(e.target.value))} 
        />
        
        <label>Upload Icon (PNG only):</label>
        <input 
          type="file" 
          accept="image/png" 
          onChange={handleFileChange} 
        />
        
        {icon && (
          <div>
            <h4>Selected Icon:</h4>
            <img src={icon} alt="Selected icon" style={{ maxWidth: '100px', maxHeight: '100px' }} />
          </div>
        )}

        <button type="submit">Save Habit</button>
      </form>
    </div>
  );
};