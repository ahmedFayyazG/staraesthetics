import { useMemo, useState } from "react";

const storageKey = "star-aesthetics-appointments";

const treatments = [
  "Injectable Artistry",
  "Skin Resurfacing",
  "Contour & Lift",
  "Regenerative",
  "IV & Wellness",
  "Not sure yet"
];

const times = ["09:30", "10:45", "12:00", "14:15", "15:30", "17:00"];

function getMinimumDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function loadAppointments() {
  if (typeof window === "undefined") return [];

  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveAppointments(appointments) {
  window.localStorage.setItem(storageKey, JSON.stringify(appointments));
}

function createBookingId() {
  return `apt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function AppointmentBooking() {
  const minDate = useMemo(getMinimumDate, []);
  const [booking, setBooking] = useState({
    treatment: treatments[0],
    date: minDate,
    time: times[1],
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [appointments, setAppointments] = useState(loadAppointments);
  const [message, setMessage] = useState(null);

  const bookedTimesForDate = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.date === booking.date)
        .map((appointment) => appointment.time),
    [appointments, booking.date]
  );

  const selectedSlotBooked = bookedTimesForDate.includes(booking.time);
  const availableTimes = times.filter((time) => !bookedTimesForDate.includes(time));
  const upcomingAppointments = useMemo(
    () =>
      [...appointments]
        .filter((appointment) => appointment.date >= minDate)
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
        .slice(0, 5),
    [appointments, minDate]
  );

  const updateBooking = (field, value) => {
    setBooking((current) => ({ ...current, [field]: value }));
    setMessage(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const hasMatchingSlot = appointments.some(
      (appointment) =>
        appointment.date === booking.date && appointment.time === booking.time
    );

    if (hasMatchingSlot) {
      setMessage({
        type: "error",
        title: "This appointment time is already booked.",
        detail: "Please choose another available time for this date."
      });
      return;
    }

    const newAppointment = {
      id: createBookingId(),
      ...booking,
      status: "requested",
      createdAt: new Date().toISOString()
    };
    const nextAppointments = [...appointments, newAppointment];
    setAppointments(nextAppointments);
    saveAppointments(nextAppointments);
    setMessage({
      type: "success",
      title: "Appointment request received.",
      detail: `${booking.treatment} on ${booking.date} at ${booking.time}. We will confirm by email.`
    });
    setBooking((current) => ({
      ...current,
      time: times.find((time) => ![...bookedTimesForDate, current.time].includes(time)) || ""
    }));
  };

  const cancelAppointment = (id) => {
    const nextAppointments = appointments.filter((appointment) => appointment.id !== id);
    setAppointments(nextAppointments);
    saveAppointments(nextAppointments);
    setMessage({
      type: "success",
      title: "Appointment removed.",
      detail: "The selected time is now available again."
    });
  };

  return (
    <section id="appointments" className="appointment-section">
      <div className="appointment-inner">
        <div className="appointment-copy">
          <div className="appointment-kicker">
            <span />
            <p>Appointments</p>
          </div>
          <h2>Reserve a private consultation.</h2>
          <p>
            Choose a treatment area and preferred time. Booked slots are blocked
            automatically, and matching date and time requests are flagged before
            they can be submitted.
          </p>
          <div className="appointment-details">
            <div>
              <strong>Location</strong>
              <span>14 Mayfair Row, London W1</span>
            </div>
            <div>
              <strong>Response</strong>
              <span>Confirmation within 24 hours</span>
            </div>
          </div>
        </div>

        <form className="appointment-panel" onSubmit={handleSubmit}>
          <div className="appointment-field appointment-wide">
            <label htmlFor="appointment-treatment">Treatment</label>
            <select
              id="appointment-treatment"
              value={booking.treatment}
              onChange={(event) => updateBooking("treatment", event.target.value)}
            >
              {treatments.map((treatment) => (
                <option key={treatment}>{treatment}</option>
              ))}
            </select>
          </div>

          <div className="appointment-field">
            <label htmlFor="appointment-date">Date</label>
            <input
              id="appointment-date"
              type="date"
              min={minDate}
              value={booking.date}
              onChange={(event) => updateBooking("date", event.target.value)}
              required
            />
          </div>

          <div className="appointment-field">
            <label htmlFor="appointment-time">Time</label>
            <select
              id="appointment-time"
              value={booking.time}
              onChange={(event) => updateBooking("time", event.target.value)}
              required
            >
              <option value="" disabled>
                Select an available time
              </option>
              {times.map((time) => (
                <option key={time} value={time} disabled={bookedTimesForDate.includes(time)}>
                  {time}
                  {bookedTimesForDate.includes(time) ? " - booked" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="appointment-availability appointment-wide">
            <strong>{booking.date}</strong>
            <div>
              {times.map((time) => {
                const isBooked = bookedTimesForDate.includes(time);
                return (
                  <button
                    key={time}
                    type="button"
                    className={time === booking.time ? "selected" : ""}
                    disabled={isBooked}
                    onClick={() => updateBooking("time", time)}
                  >
                    {time}
                    <span>{isBooked ? "Booked" : "Open"}</span>
                  </button>
                );
              })}
            </div>
            {selectedSlotBooked && (
              <p className="appointment-conflict" role="alert">
                This date and time match an existing appointment. Please choose
                another slot.
              </p>
            )}
            {!availableTimes.length && (
              <p className="appointment-conflict" role="alert">
                All appointments are booked for this date. Please choose another
                date.
              </p>
            )}
          </div>

          <div className="appointment-field">
            <label htmlFor="appointment-name">Full name</label>
            <input
              id="appointment-name"
              type="text"
              value={booking.name}
              onChange={(event) => updateBooking("name", event.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="appointment-field">
            <label htmlFor="appointment-email">Email</label>
            <input
              id="appointment-email"
              type="email"
              value={booking.email}
              onChange={(event) => updateBooking("email", event.target.value)}
              placeholder="you@email.com"
              required
            />
          </div>

          <div className="appointment-field appointment-wide">
            <label htmlFor="appointment-phone">Phone</label>
            <input
              id="appointment-phone"
              type="tel"
              value={booking.phone}
              onChange={(event) => updateBooking("phone", event.target.value)}
              placeholder="+44"
            />
          </div>

          <div className="appointment-field appointment-wide">
            <label htmlFor="appointment-notes">Notes</label>
            <textarea
              id="appointment-notes"
              value={booking.notes}
              onChange={(event) => updateBooking("notes", event.target.value)}
              placeholder="Anything you would like the clinician to know"
              rows="3"
            />
          </div>

          <button type="submit" disabled={!booking.time || selectedSlotBooked}>
            Request appointment
          </button>

          {message && (
            <div
              className={`appointment-confirmation ${message.type === "error" ? "appointment-error" : ""}`}
              role={message.type === "error" ? "alert" : "status"}
            >
              <strong>{message.title}</strong>
              <span>{message.detail}</span>
            </div>
          )}

          <div className="appointment-bookings appointment-wide">
            <div className="appointment-bookings-header">
              <strong>Upcoming requests</strong>
              <span>{appointments.length} saved</span>
            </div>
            {upcomingAppointments.length ? (
              <ul>
                {upcomingAppointments.map((appointment) => (
                  <li key={appointment.id}>
                    <div>
                      <strong>{appointment.date} at {appointment.time}</strong>
                      <span>{appointment.name} - {appointment.treatment}</span>
                    </div>
                    <button type="button" onClick={() => cancelAppointment(appointment.id)}>
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No appointments have been requested yet.</p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
