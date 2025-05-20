import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserModel from "./models/User.js";
import Event from "./models/Event.js";
import Ticket from "./models/Ticket.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import Razorpay from "razorpay";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "bsbsfbrnsftentwnnwnwn";

app.use(express.json());
app.use(cookieParser());
app.use(
   cors({
      credentials: true,
      origin: "https://event-mangement-system-sable.vercel.app",
   })
);

const razorpay = new Razorpay({
   key_id: process.env.RZP_KEY_ID,
   key_secret: process.env.RZP_KEY_SECRET,
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
   fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   serverSelectionTimeoutMS: 5000,
   socketTimeoutMS: 45000,
})
   .then(() => {
      return Event.find().exec();
   })
   .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
   });

// Event listeners for MongoDB connection
mongoose.connection.on('connected', () => {
   console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
   console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
   console.log('Mongoose disconnected from MongoDB');
});

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      const uploadsDir = path.join(__dirname, 'uploads');
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadsDir)) {
         fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
   },
   filename: (req, file, cb) => {
      // Generate a unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
   }
});

const upload = multer({
   storage,
   limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
   },
   fileFilter: (req, file, cb) => {
      // Accept only image files
      if (file.mimetype.startsWith('image/')) {
         cb(null, true);
      } else {
         cb(new Error('Only image files are allowed!'), false);
      }
   }
});

app.get("/test", (req, res) => {
   res.json("test ok");
});

app.post("/register", async (req, res) => {
   const { name, email, password } = req.body;

   try {
      const userDoc = await UserModel.create({
         name,
         email,
         password: bcrypt.hashSync(password, bcryptSalt),
      });
      res.json(userDoc);
   } catch (e) {
      res.status(422).json(e);
   }
});

app.post("/login", async (req, res) => {
   const { email, password } = req.body;

   const userDoc = await UserModel.findOne({ email });

   if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
   }

   const passOk = bcrypt.compareSync(password, userDoc.password);
   if (!passOk) {
      return res.status(401).json({ error: "Invalid password" });
   }

   jwt.sign(
      {
         email: userDoc.email,
         id: userDoc._id,
      },
      jwtSecret,
      {},
      (err, token) => {
         if (err) {
            return res.status(500).json({ error: "Failed to generate token" });
         }
         res.cookie("token", token, {
  httpOnly: true,          // JS can't access cookie (helps prevent XSS)
  secure: true,            // Cookie only sent over HTTPS
  sameSite: "None",        // Allows cross-site cookies (important for different domains)
//   domain: ".yourbackenddomain.com", // Optional: set domain if needed
  path: "/",               // Cookie available to all routes
  maxAge: 24 * 60 * 60 * 1000 // 1 day
}).json(userDoc);

      }
   );
});

app.get("/profile", (req, res) => {
   const { token } = req.cookies;
   if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
         if (err) throw err;
         const { name, email, _id, role } = await UserModel.findById(userData.id);
         res.json({ name, email, _id, role });
      });
   } else {
      res.json(null);
   }
});

app.post("/logout", (req, res) => {
     res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",         // Optional but good practice if used in login
    expires: new Date(0) // Expire the cookie immediately
  }).json(true);
});

app.post("/createEvent", upload.single("image"), async (req, res) => {
   try {
      const eventData = req.body;
      // Store only the filename
      eventData.image = req.file ? req.file.filename : "";
      const newEvent = new Event(eventData);
      await newEvent.save();
      res.status(201).json(newEvent);
   } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Failed to save the event to MongoDB" });
   }
});

app.get("/createEvent", async (req, res) => {
   try {
      const events = await Event.find();
      res.status(200).json(events);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch events from MongoDB" });
   }
});

app.get("/event/:id", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

app.post('/event/:eventId', async (req, res) => {
   try {
      const { eventId } = req.params;
      const { action, userId } = req.body;

      const event = await Event.findById(eventId);
      if (!event) {
         return res.status(404).json({ error: 'Event not found' });
      }

      if (action === 'like') {
         if (!event.likedBy.includes(userId)) {
            event.likes += 1;
            event.likedBy.push(userId);
         }
      } else if (action === 'unlike') {
         if (event.likedBy.includes(userId)) {
            event.likes -= 1;
            event.likedBy = event.likedBy.filter(id => id.toString() !== userId);
         }
      }

      const updatedEvent = await event.save();
      res.json(updatedEvent);
   } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({ error: 'Internal server error' });
   }
});

app.get("/events", (req, res) => {
   Event.find()
      .then((events) => {
         res.json(events);
      })
      .catch((error) => {
         console.error("Error fetching events:", error);
         res.status(500).json({ message: "Server error" });
      });
});

app.get("/event/:id/ordersummary", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

app.get("/event/:id/ordersummary/paymentsummary", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

app.post("/tickets", async (req, res) => {
   try {
      const ticketDetails = req.body;
      // Ensure ticket price is stored as a number
      ticketDetails.ticketDetails.ticketprice = parseFloat(ticketDetails.ticketDetails.ticketprice);
      const newTicket = new Ticket(ticketDetails);
      await newTicket.save();

      // Update event's income
      const event = await Event.findById(ticketDetails.eventid);
      if (event) {
         event.Income = (event.Income || 0) + ticketDetails.ticketDetails.ticketprice;
         await event.save();
      }

      return res.status(201).json({ ticket: newTicket });
   } catch (error) {
      console.error("Error creating ticket:", error);
      return res.status(500).json({ error: "Failed to create ticket" });
   }
});

app.get("/tickets/:id", async (req, res) => {
   try {
      const tickets = await Ticket.find();
      res.json(tickets);
   } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ error: "Failed to fetch tickets" });
   }
});

app.get("/tickets/user/:userId", (req, res) => {
   const userId = req.params.userId;

   Ticket.find({ userid: userId })
      .then((tickets) => {
         res.json(tickets);
      })
      .catch((error) => {
         console.error("Error fetching user tickets:", error);
         res.status(500).json({ error: "Failed to fetch user tickets" });
      });
});

app.delete("/tickets/:id", async (req, res) => {
   try {
      const ticketId = req.params.id;
      await Ticket.findByIdAndDelete(ticketId);
      res.status(204).send();
   } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ error: "Failed to delete ticket" });
   }
});

// Admin routes
app.get('/admin/users', async (req, res) => {
   try {
      const users = await UserModel.find({}, { password: 0 });
      res.json({ users });
   } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
   }
});

app.get('/admin/stats/users', async (req, res) => {
   try {
      const count = await UserModel.countDocuments();
      res.json({ count });
   } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ error: 'Failed to fetch user statistics' });
   }
});

app.get('/admin/stats/events', async (req, res) => {
   try {
      const count = await Event.countDocuments();
      res.json({ count });
   } catch (error) {
      console.error('Error fetching event stats:', error);
      res.status(500).json({ error: 'Failed to fetch event statistics' });
   }
});

app.get('/admin/stats/tickets', async (req, res) => {
   try {
      const count = await Ticket.countDocuments();
      res.json({ count });
   } catch (error) {
      console.error('Error fetching ticket stats:', error);
      res.status(500).json({ error: 'Failed to fetch ticket statistics' });
   }
});

app.get('/admin/stats/revenue', async (req, res) => {
   try {
      const tickets = await Ticket.find();
      const totalRevenue = tickets.reduce((sum, ticket) => {
         // Ensure we're adding numbers, not strings
         const ticketPrice = parseFloat(ticket.ticketDetails.ticketprice) || 0;
         return sum + ticketPrice;
      }, 0);

      res.json({ amount: totalRevenue });
   } catch (error) {
      console.error('Error fetching revenue stats:', error);
      res.status(500).json({ error: 'Failed to fetch revenue statistics' });
   }
});

app.get('/admin/stats/upcoming-events', async (req, res) => {
   try {
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

      const count = await Event.countDocuments({
         eventDate: { $gte: today }
      });

      res.json({ count });
   } catch (error) {
      console.error('Error fetching upcoming events stats:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming events statistics' });
   }
});

app.get('/admin/stats/recent-events', async (req, res) => {
   try {
      const events = await Event.find()
         .sort({ createdAt: -1 })
         .limit(5)
         .populate({
            path: 'tickets',
            select: 'quantity totalPrice status'
         });

      const eventsWithStats = events.map(event => ({
         ...event.toObject(),
         ticketsSold: event.tickets.reduce((sum, ticket) => sum + ticket.quantity, 0),
         revenue: event.tickets.reduce((sum, ticket) => sum + ticket.totalPrice, 0)
      }));

      res.json({ events: eventsWithStats });
   } catch (error) {
      console.error('Error fetching recent events:', error);
      res.status(500).json({ error: 'Failed to fetch recent events' });
   }
});

// Email Verification
app.post('/api/verify/email', async (req, res) => {
   try {
      const { userId } = req.body;
      const user = await UserModel.findById(userId);

      if (!user) {
         return res.status(404).json({ error: 'User not found' });
      }

      // Generate verification token
      const verificationToken = Math.random().toString(36).substring(2, 15);
      user.emailVerificationToken = verificationToken;
      await user.save();

      // TODO: Send verification email with token
      // For now, we'll just simulate the verification
      user.emailVerified = true;
      await user.save();

      res.json({ success: true, message: 'Verification email sent' });
   } catch (error) {
      console.error('Error sending verification email:', error);
      res.status(500).json({ error: 'Failed to send verification email' });
   }
});

// Phone Verification
app.post('/api/verify/phone', async (req, res) => {
   try {
      const { userId, phoneNumber } = req.body;
      const user = await UserModel.findById(userId);

      if (!user) {
         return res.status(404).json({ error: 'User not found' });
      }

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.phoneVerificationCode = verificationCode;
      await user.save();

      // TODO: Send verification SMS with code
      // For now, we'll just simulate the verification
      user.phoneVerified = true;
      await user.save();

      res.json({ success: true, message: 'Verification code sent' });
   } catch (error) {
      console.error('Error sending verification code:', error);
      res.status(500).json({ error: 'Failed to send verification code' });
   }
});

// Get verification status
app.get('/api/verification/:userId', async (req, res) => {
   try {
      const { userId } = req.params;
      const user = await UserModel.findById(userId);

      if (!user) {
         return res.status(404).json({ error: 'User not found' });
      }

      res.json({
         emailVerified: user.emailVerified || false,
         phoneVerified: user.phoneVerified || false
      });
   } catch (error) {
      console.error('Error fetching verification status:', error);
      res.status(500).json({ error: 'Failed to fetch verification status' });
   }
});

app.post("/api/orders", async (req, res) => {
   const amount = req.body.amount

   console.log("new order: ", amount);
   

   try {
      const options = {
         amount: parseInt(amount), // amount in smallest currency unit
         currency: "INR",
      };

      const order = await razorpay.orders.create(options);

      if (!order) return res.status(500).send("Some error occured");

      res.json(order);
   } catch (error) {
      res.status(500).send(error);
   }
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});
