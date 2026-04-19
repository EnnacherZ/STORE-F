import React, {
  useState,
  ChangeEvent,
  FormEvent,
  CSSProperties,
  useRef,
} from "react";
import { connecter } from "./server/connecter";

type EmailData = {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
};

const containerStyle: CSSProperties = {
  maxWidth: "600px",
  margin: "40px auto",
  padding: "24px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  backgroundColor: "#ffffff",
  fontFamily: "Arial, sans-serif",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "16px",
};

const inputStyle: CSSProperties = {
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "14px",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: "120px",
};

const buttonStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#007bff",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
};

const SendEmail: React.FC = () => {
  const [emailData, setEmailData] = useState<EmailData>({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔹 handle inputs
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEmailData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // 🔹 handle file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  // 🔹 send email
  const sendEmail = async () => {
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("to", emailData.to);
      formData.append("cc", emailData.cc);
      formData.append("bcc", emailData.bcc);
      formData.append("subject", emailData.subject);
      formData.append("body", emailData.body);

      if (file) {
        formData.append("file", file);
      }

      const res = await connecter.post("api/send_mail/", formData);

      alert(res.data.message || "Email envoyé ✅");

      // 🔥 reset form
      setEmailData({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        body: "",
      });

      setFile(null);

      // 🔥 reset input file (important)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error: any) {
      console.error("ERROR:", error);
      alert(
        error?.response?.data?.error ||
        "Erreur lors de l'envoi de l'email ❌"
      );
    }

    setLoading(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailData.to || !emailData.subject || !emailData.body) {
      alert("Veuillez remplir les champs obligatoires ⚠️");
      return;
    }

    await sendEmail();
  };

  return (
    <div style={containerStyle}>
      <h2>Send Email 📧</h2>

      <form onSubmit={handleSubmit}>
        <div style={fieldStyle}>
          <label>To *</label>
          <input
            type="email"
            name="to"
            value={emailData.to}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label>CC</label>
          <input
            type="text"
            name="cc"
            placeholder="email1@gmail.com, email2@gmail.com"
            value={emailData.cc}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>BCC</label>
          <input
            type="text"
            name="bcc"
            placeholder="email1@gmail.com, email2@gmail.com"
            value={emailData.bcc}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label>Subject *</label>
          <input
            type="text"
            name="subject"
            value={emailData.subject}
            onChange={handleChange}
            style={inputStyle}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label>Body *</label>
          <textarea
            name="body"
            value={emailData.body}
            onChange={handleChange}
            style={textareaStyle}
            required
          />
        </div>

        <div style={fieldStyle}>
          <label>Attachment</label>
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
          />

          {/* 👇 affichage fichier */}
          {file && (
            <span style={{ marginTop: "8px", fontSize: "12px" }}>
              📎 {file.name}
            </span>
          )}
        </div>

        <button
          type="submit"
          style={{
            ...buttonStyle,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default SendEmail;