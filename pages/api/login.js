export default function handler(req, res) {
  const { email, password } = JSON.parse(req.body);

  if (email === "vishnu@gmail.com" && password === "vishnu@54355api") {
    return res.json({ success: true });
  }

  res.status(401).json({ error: "Invalid login" });
}
