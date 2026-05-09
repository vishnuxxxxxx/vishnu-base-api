export default function handler(req, res) {
  const { email, password } = JSON.parse(req.body);

  if (email === "admin@gmail.com" && password === "123456") {
    return res.json({ success: true });
  }

  res.status(401).json({ error: "Invalid login" });
}