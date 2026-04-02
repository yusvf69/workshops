import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({ success: false, message: "Email configuration missing" });
  }

  const booking = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🎨 New Workshop Booking",
      text: `Name: ${booking.name}\nEmail: ${booking.email}\nPhone: ${booking.phone}\nWorkshop: ${booking.workshop}\nSeats: ${booking.seats}\nNotes: ${booking.notes}`,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.email,
      subject: "Booking Confirmation",
      text: `Hello ${booking.name},\n\nYour booking is confirmed!\nWorkshop: ${booking.workshop}\nSeats: ${booking.seats}\n\nThanks!`,
    });

    if (process.env.GOOGLE_WEBAPP_URL) {
      await fetch(process.env.GOOGLE_WEBAPP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
}