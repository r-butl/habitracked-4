import { useState } from "react";
import './CustomHabitForm.css';
import { Popup } from "../Popup/Popup";

export const CustomHabitForm = ({ onSubmit, initialHabit = null, onHide }) => {
  const [name, setName] = useState(initialHabit?.name || "");
  const [icon, setIcon] = useState(initialHabit?.icon || null);
  const [description, setDescription] = useState(initialHabit?.description || "");
  const [minTime, setMinTime] = useState(initialHabit?.minTime?.toString() || "");
  const [maxTime, setMaxTime] = useState(initialHabit?.maxTime?.toString() || "");
  const [timeBlock, setTimeBlock] = useState(initialHabit?.timeBlock || "morning");
  const [visibility, setVisibility] = useState(initialHabit?.visibility || "private");
  const [recurrence, setRecurrence] = useState(() => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const selected = initialHabit?.recurrence || [];
    return days.reduce((acc, day) => {
      acc[day] = selected.includes(day);
      return acc;
    }, {});
  });
  const [start, setStart] = useState(initialHabit?.start ? new Date(initialHabit.start) : new Date());
  const [end, setEnd] = useState(initialHabit?.end ? new Date(initialHabit.end) : new Date());

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const showError = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/png") {
      setIcon(URL.createObjectURL(file));
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
    const selectedDays = Object.keys(recurrence).filter(day => recurrence[day]);

    if (!name.trim() || !description.trim() || !minTime || !maxTime) {
      showError("Please fill in all required fields.");
      return;
    } else if (parseInt(minTime) < 1) {
      showError("Min Time should be at least 1 min.");
      return;
    } else if (parseInt(maxTime) < parseInt(minTime)) {
      showError("Max Time should be greater than or equal to Min Time.");
      return;
    } else if (new Date(start) >= new Date(end)) {
      showError("Start date should be before end date.");
      return;
    }

    const newHabit = {
      ...(initialHabit?.id || initialHabit?._id ? { id: initialHabit.id || initialHabit._id } : {}),
      name,
      icon,
      description,
      minTime: parseInt(minTime),
      maxTime: parseInt(maxTime),
      timeBlock,
      visibility,
      recurrence: selectedDays,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
    };

    onSubmit(newHabit);
  };

  return (
    <div className="fullscreen-form">
      <form onSubmit={handleSubmit}>
        <h2>{initialHabit ? "Edit Custom Habit" : "Create a Custom Habit"}</h2>

        <input
          type="text"
          placeholder="Habit name*"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Description*"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="number"
          placeholder="Min Time (min)*"
          value={minTime}
          onChange={(e) => setMinTime(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max Time (min)*"
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

        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button type="submit">
            {initialHabit ? "Update Habit" : "Save Habit"}
          </button>
          {initialHabit && onHide && (
            <button type="button" onClick={onHide}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {showPopup && (
        <Popup
          isVisible={showPopup}
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
};