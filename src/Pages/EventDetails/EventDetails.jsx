import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../StoreContext/StoreContext';
import { useParams } from 'react-router-dom';
import Loader from '../../Components/Loader/Loader';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './EventDetails.css';
// import io from 'socket.io-client';

// const socket = io('http://localhost:4000', {
//     transports: ['websocket'], 
// });

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { url, token } = useContext(StoreContext);

    useEffect(() => {
        // Log the WebSocket connection status
        // socket.on('connect', () => {
        //     console.log('WebSocket connected:', socket.id);  // Log the socket ID to confirm the connection
        // });

        // socket.on('connect_error', (err) => {
        //     console.error('WebSocket connection error:', err);  // Log any connection errors
        // });

        const fetchEventDetails = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`${url}/api/events/event-detail/${id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch event details');
                }

                const data = await response.json();
                setEvent(data.event);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();

        // // WebSocket Listener for Real-Time Seat Updates
        // socket.on('updateSeats', (updatedEvent) => {
        //     console.log("Received seat update:", updatedEvent);  // Log the seat update to ensure the event is triggered
            
        //     if (updatedEvent.eventId === id) {
        //         setEvent((prev) => ({
        //             ...prev,
        //             bookedSeats: updatedEvent.bookedSeats,
        //         }));
        //     }
        // });

        // // Clean up socket connection when the component is unmounted
        // return () => {
        //     socket.off('updateSeats');  // Unsubscribe from WebSocket event when component unmounts
        //     socket.disconnect();  // Disconnect socket on component unmount
        // };
    }, [id, url]);

    const handleBooking = async () => {
        const isConfirmed = window.confirm(`Do you really want to book this event: "${event.title}"?`);
        if (!isConfirmed) return;

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${url}/api/events/${event._id}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Seat booked successfully!');
            } else {
                toast.error(data.message || 'Error booking seat');
            }
        } catch (err) {
            toast.error(err.message || 'Error booking seat');
        } finally {
            setLoading(false);
        }
    };

    if (error) return <p>Error: {error}</p>;
    if (!event) return <p>No event found.</p>;

    return (
        <div className="event-detail">
            {loading && <Loader />}
            <div className="event-detail-top">
                <h2>{event.title}</h2>
                {token && <button onClick={handleBooking}>Book</button>}
            </div>

            <img src={`${event.image}`} alt={event.title} />
            <div className="seats">
                <p>Total Seats: {event.capacity}</p>
                <p>Booked Seats: {event.bookedSeats}</p>
                <p>Available Seats: {event.capacity - event.bookedSeats}</p>
            </div>
            <h3>Date and Time</h3>
            <p className="bottom1margin">{new Date(event.date).toLocaleString()}</p>
            <h3>Location</h3>
            <p className="bottom1margin">{event.location}</p>
            <h3>About This Event</h3>
            <p>{event.description}</p>
        </div>
    );
};

export default EventDetails;
