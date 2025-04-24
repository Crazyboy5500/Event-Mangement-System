import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
   owner: { type: String, required: true },
   title: { type: String, required: true },
   description: { type: String, required: true },
   organizedBy: { type: String, required: true },
   eventDate: { type: String, required: true },
   eventTime: { type: String, required: true },
   location: { type: String, required: true },
   Participants: { type: Number, default: 0 },
   Count: { type: Number, default: 0 },
   Income: { type: Number, default: 0 },
   ticketPrice: { type: Number, required: true },
   Quantity: { type: Number, default: 0 },
   image: { type: String },
   likes: { type: Number, default: 0 },
   likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
   Comment: [{ type: String }],
   tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }]
}, { timestamps: true });

const EventModel = mongoose.model("Event", eventSchema);
export default EventModel; 