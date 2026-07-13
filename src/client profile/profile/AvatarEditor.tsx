// account/profile/AvatarEditor.tsx
import React, { useRef, useState } from "react";
import { FaCamera, FaSpinner } from "react-icons/fa";
import { connecter } from "../../server/connecter";

const MAX_BYTES = 3 * 1024 * 1024;          // 3 MB
const ACCEPTED  = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface AvatarEditorProps {
  currentUrl: string | undefined;
  initials:   string;                        // fallback e.g. "YA"
  t:          (key: string) => string;
  onUploaded: (newUrl: string) => void;      // called after server responds
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({
  currentUrl, initials, t, onUploaded,
}) => {
  const inputRef             = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error,    setError]      = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError(t("account.avatarInvalidType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(t("account.avatarTooLarge"));
      return;
    }

    // Instant local preview so the user sees the change before upload completes
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await connecter.patch<{ image: string }>(
        "api/client/me/avatar/",
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      onUploaded(res.data.image);
    } catch {
      setError(t("account.avatarUploadError"));
      setPreview(null);          // revert preview on failure
    } finally {
      setUploading(false);
    }
  };

  const displaySrc = preview ?? currentUrl;

  return (
    <div className="acc-avatar-editor">
      <div
        className="acc-avatar-editor__ring"
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && inputRef.current?.click()}
        aria-label={t("account.changeAvatar")}
      >
        {displaySrc ? (
          <img
            className="acc-avatar acc-avatar--img acc-avatar--lg"
            src={displaySrc}
            alt={initials}
          />
        ) : (
          <div className="acc-avatar acc-avatar--lg">{initials}</div>
        )}

        {/* Overlay shown on hover or while uploading */}
        <div className={`acc-avatar-editor__overlay ${uploading ? "acc-avatar-editor__overlay--busy" : ""}`}>
          {uploading
            ? <FaSpinner className="acc-avatar-editor__spin" />
            : <FaCamera />}
          <span>{t("account.changeAvatar")}</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        style={{ display: "none" }}
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";   // reset so the same file can be re-selected
        }}
      />

      {error && (
        <p className="acc-avatar-editor__error">{error}</p>
      )}
    </div>
  );
};

export default AvatarEditor;