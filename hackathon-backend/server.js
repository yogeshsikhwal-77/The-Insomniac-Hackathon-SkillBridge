require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const http = require('http'); // 1. Import http
const { Server } = require('socket.io'); // 2. Import Socket.io

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 3. Create HTTP server to wrap Express app
const server = http.createServer(app);

// 4. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Update this to your React app's URL if different
    methods: ["GET", "POST"]
  }
});

// PostgreSQL Connection
const pool = new Pool({
  user: 'postgres',          
  host: 'localhost',
  database: 'hackathon',    
  password: '1234', 
  port: 5432,
});

// Test DB Connection
pool.connect((err) => {
  if (err) {
    console.error('❌ Database connection error', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL');
  }
});

// Set up Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // ⚠️ PLEASE DELETE THIS FROM GOOGLE AND GENERATE A NEW ONE AFTER YOUR HACKATHON
  }
});

// TEST THE EMAIL CONNECTION ON STARTUP
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ EMAIL ERROR: Google rejected the login. Check App Password.', error.message);
  } else {
    console.log('✅ EMAIL SUCCESS: Server is ready to send emails!');
  }
});

// ==========================================
// ========== REAL-TIME CHAT LOGIC ==========
// ==========================================

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`🏠 User joined room: ${room}`);
  });

  socket.on("send_message", async (data) => {
    console.log("📩 Attempting to save message:", data);
    
    try {
      // 1. Force IDs to be Integers to prevent PostgreSQL crashes
      const senderInt = parseInt(data.senderId, 10);
      const receiverInt = parseInt(data.receiverId, 10);

      // 2. Insert into DB and IMMEDIATELY return the saved row
      const savedMessage = await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *",
        [senderInt, receiverInt, data.content]
      );
      
      console.log("✅ Successfully saved to DB:", savedMessage.rows[0]);

      // 3. Emit the EXACT row from the database back to the React frontend
      io.to(data.room).emit("receive_message", savedMessage.rows[0]);

    } catch (err) {
      console.error("\n❌ ================= DB ERROR ================= ❌");
      console.error(err.message);
      console.error("❌ ============================================ ❌\n");
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected", socket.id);
  });
});

// --- FETCH CHAT HISTORY ---
app.get('/api/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
       OR (sender_id = $2 AND receiver_id = $1) 
       ORDER BY created_at ASC`,
      [user1, user2]
    );
    res.json(messages.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});


// ==========================================
// ============== REST API ROUTES ===========
// ==========================================

// --- SIGN UP ROUTE ---
app.post('/api/signup', async (req, res) => {
  // ADDED 'club' TO DESTRUCTURED BODY
  const { fullName, email, password, mobileNo, year, branch, skills, club } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // ADDED 'club' TO INSERT QUERY AND VALUES ARRAY
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, mobile_no, year, branch, skills, club) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, full_name, email',
      [fullName, email, hashedPassword, mobileNo, year, branch, skills, club]
    );
    res.status(201).json({ message: "User registered successfully!", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "User already exists or database error" });
  }
});

// --- MAGIC SETUP ROUTE (Run once to create the messages table) ---
app.get('/api/setup-db', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          sender_id INTEGER REFERENCES users(id),
          receiver_id INTEGER REFERENCES users(id),
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    res.send("<h2>✅ Success! The 'messages' table is ready. Go test the chat!</h2>");
  } catch (err) {
    console.error("Setup DB Error:", err);
    res.status(500).send(`<h2>❌ Error:</h2><p>${err.message}</p>`);
  }
});

// --- SIGN IN ROUTE ---
app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) return res.status(401).json({ error: "Invalid password" });

    res.json({ 
        message: "Login successful", 
        user: { id: user.rows[0].id, full_name: user.rows[0].full_name, year: user.rows[0].year } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- FETCH MENTORS ROUTE ---
app.get('/api/mentors', async (req, res) => {
  try {
    // ADDED 'club' TO THE SELECT STATEMENT
    const mentors = await pool.query(
      "SELECT id, full_name, email, mobile_no, role, year, skills, club FROM users WHERE year IN ('2nd Year', '3rd Year', '4th Year') OR role = 'senior'"
    );
    res.json(mentors.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch mentors" });
  }
});

// --- FETCH SINGLE USER PROFILE ---
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // ADDED 'club' TO THE SELECT STATEMENT
    const user = await pool.query('SELECT full_name, email, year, branch, skills, about_me, club FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// --- UPDATE USER PROFILE ---
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  // ADDED 'club' TO DESTRUCTURED BODY
  const { year, branch, skills, aboutMe, club } = req.body; 
  try {
    // ADDED 'club = $5' TO UPDATE STATEMENT AND 'club' TO VALUES ARRAY
    await pool.query(
      'UPDATE users SET year = $1, branch = $2, skills = $3, about_me = $4, club = $5 WHERE id = $6',
      [year, branch, skills, aboutMe, club, id]
    );
    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});


// --- 1. SEND CONNECTION REQUEST ---
app.post('/api/request-connection', async (req, res) => {
  const { juniorId, seniorId, reason } = req.body;

  try {
    // 1. Save to database
    const newConnection = await pool.query(
      "INSERT INTO connections (junior_id, senior_id, reason) VALUES ($1, $2, $3) RETURNING id",
      [juniorId, seniorId, reason]
    );
    const connectionId = newConnection.rows[0].id;

    // 2. Fetch Junior and Senior details
    const junior = await pool.query("SELECT full_name, email, mobile_no, branch, year FROM users WHERE id = $1", [juniorId]);
    const senior = await pool.query("SELECT full_name, email FROM users WHERE id = $1", [seniorId]);

    if (junior.rows.length === 0 || senior.rows.length === 0) {
      return res.status(404).json({ error: "Junior or Senior not found in database." });
    }

    const jData = junior.rows[0];
    const sData = senior.rows[0];

    const acceptLink = `http://localhost:5000/api/connection-action?id=${connectionId}&status=accepted`;
    const declineLink = `http://localhost:5000/api/connection-action?id=${connectionId}&status=declined`;

    // 3. Send Email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: sData.email,
      subject: `New Mentorship Request from ${jData.full_name}`,
      html: `
        <h3>Hello ${sData.full_name},</h3>
        <p><strong>${jData.full_name}</strong> (${jData.year}, ${jData.branch}) wants to connect with you!</p>
        <p><strong>Their Reason:</strong> "${reason}"</p>
        <p><strong>Junior's Details:</strong><br>Email: ${jData.email}<br>Mobile: ${jData.mobile_no}</p>
        <br>
        <a href="${acceptLink}" style="padding: 10px 20px; background: green; color: white; text-decoration: none; border-radius: 5px;">Accept Request</a>
        &nbsp;&nbsp;&nbsp;
        <a href="${declineLink}" style="padding: 10px 20px; background: red; color: white; text-decoration: none; border-radius: 5px;">Decline</a>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Request sent successfully!" });

  } catch (err) {
    console.error("\n🔴 ---------------- ERROR SENDING EMAIL ---------------- 🔴");
    console.error(err.message);
    console.error("🔴 ----------------------------------------------------- 🔴\n");
    res.status(500).json({ error: "Failed to send request" });
  }
});

// --- 2. HANDLE EMAIL CLICK (Accept/Decline) ---
app.get('/api/connection-action', async (req, res) => {
  const { id, status } = req.query;
  try {
    await pool.query("UPDATE connections SET status = $1 WHERE id = $2", [status, id]);
    res.send(`<h1>Connection ${status}!</h1><p>You can close this tab now.</p>`);
  } catch (err) {
    res.status(500).send("Error updating connection status.");
  }
});

// --- 3. GET USER'S CONNECTION STATUSES ---
app.get('/api/connections/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const connections = await pool.query(
      "SELECT senior_id, status FROM connections WHERE junior_id = $1",
      [userId]
    );
    res.json(connections.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch connections" });
  }
});

// --- GET ALL ACCEPTED CHATS FOR ANY USER ---
app.get('/api/my-chats/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const chats = await pool.query(
      `SELECT 
        c.id as connection_id,
        CASE 
          WHEN c.junior_id = $1 THEN s.id 
          ELSE j.id 
        END as target_user_id,
        CASE 
          WHEN c.junior_id = $1 THEN s.full_name 
          ELSE j.full_name 
        END as target_name,
        CASE 
          WHEN c.junior_id = $1 THEN s.email 
          ELSE j.email 
        END as target_email,
        CASE 
          WHEN c.junior_id = $1 THEN 'Senior / Mentor' 
          ELSE 'Junior / Mentee' 
        END as connection_type
       FROM connections c
       JOIN users j ON c.junior_id = j.id
       JOIN users s ON c.senior_id = s.id
       WHERE (c.junior_id = $1 OR c.senior_id = $1) 
       AND c.status = 'accepted'`,
      [userId]
    );
    res.json(chats.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});

// --- GET SENIOR'S ACCEPTED JUNIORS ---
app.get('/api/senior-connections/:seniorId', async (req, res) => {
  const { seniorId } = req.params;
  try {
    // Join connections table with users table to get the junior's details
    const connections = await pool.query(
      `SELECT c.junior_id as id, u.full_name, u.email, u.branch, u.year 
       FROM connections c
       JOIN users u ON c.junior_id = u.id
       WHERE c.senior_id = $1 AND c.status = 'accepted'`,
      [seniorId]
    );
    res.json(connections.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch junior connections" });
  }
});

// --- 5. START SERVER (Updated to use server.listen instead of app.listen) ---
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});