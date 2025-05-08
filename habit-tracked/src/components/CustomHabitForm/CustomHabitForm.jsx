import { useState } from "react";
import { Popup } from "../Popup/Popup";

export const CustomHabitForm = ({ show, onHide, onSubmit }) => {
  if (!show) return null;

  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [description, setDescription] = useState("");
  const [minTime, setMinTime] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [timeBlock, setTimeBlock] = useState("morning");
  const [visibility, setVisibility] = useState("private");
  const [recurrence, setRecurrence] = useState({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });
  const [start, setStart] = useState(() => new Date().toISOString().slice(0, 16));
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 16));
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
    e?.preventDefault();
    const selectedDays = Object.keys(recurrence).filter((day) => recurrence[day]);

    if (!name.trim() || !description.trim() || !minTime || !maxTime) {
      showError("Please fill in all required fields.");
      return;
    }
    if (parseInt(minTime) < 1) {
      showError("Min Time should be at least 1 min.");
      return;
    }
    if (parseInt(maxTime) < parseInt(minTime)) {
      showError("Max Time should be greater than or equal to Min Time.");
      return;
    }
    if (new Date(start) >= new Date(end)) {
      showError("Start date should be before end date.");
      return;
    }

    const newHabit = {
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
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Create a Custom Habit</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Habit Name*</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description*</label>
                  <input
                    type="text"
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <label className="form-label">Min Time (min)*</label>
                    <input
                      type="number"
                      className="form-control"
                      value={minTime}
                      onChange={(e) => setMinTime(e.target.value)}
                    />
                  </div>
                  <div className="col">
                    <label className="form-label">Max Time (min)*</label>
                    <input
                      type="number"
                      className="form-control"
                      value={maxTime}
                      onChange={(e) => setMaxTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <label className="form-label">Time Block</label>
                    <select
                      className="form-select"
                      value={timeBlock}
                      onChange={(e) => setTimeBlock(e.target.value)}
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                    </select>
                  </div>
                  <div className="col">
                    <label className="form-label">Visibility</label>
                    <select
                      className="form-select"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Recurrence</label>
                  <div className="d-flex flex-wrap gap-2">
                    {Object.keys(recurrence).map((day) => (
                      <div key={day} className="form-check form-check-inline">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`day-${day}`}
                          name={day}
                          checked={recurrence[day]}
                          onChange={handleRecurrenceChange}
                        />
                        <label className="form-check-label" htmlFor={`day-${day}`}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col">
                    <label className="form-label">Start</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                    />
                  </div>
                  <div className="col">
                    <label className="form-label">End</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Upload Icon (PNG only)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/png"
                    onChange={handleFileChange}
                  />
                </div>

                {icon && (
                  <div className="mb-3">
                    <label className="form-label">Selected Icon:</label>
                    <div>
                      <img
                        src={icon}
                        alt="Selected icon"
                        style={{ maxWidth: "100px", maxHeight: "100px" }}
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onHide}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                Save Habit
              </button>
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
        <Popup
          isVisible={showPopup}
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};
