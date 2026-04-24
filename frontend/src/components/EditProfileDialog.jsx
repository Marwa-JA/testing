import { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { authService } from "../services/authService";

export const EditProfileDialog = ({ visible, user, onHide, onSave, onProfilePicDeleted }) => {
  const fileInputRef = useRef(null);
  const initialRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    role: "",
    profileFile: null,
  });

  useEffect(() => {
    if (user) {
      const initial = {
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role,
        profileFile: user.profilePictureUrl || null,
      };
      initialRef.current = initial;
      setFormData({
        name: initial.name,
        email: initial.email,
        phoneNumber: initial.phoneNumber,
        role: initial.role,
        profileFile: null,
      });
      setProfileRemoved(false);
    } else {
      initialRef.current = null;
      setFormData({ name: "", phoneNumber: "", email: "", role: "",profileFile: null });
      setProfileRemoved(false);
    }
  }, [user]);

  const [profileRemoved, setProfileRemoved] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setFormData((prev) => ({ ...prev, profileFile: file }));
    if (profileRemoved) setProfileRemoved(false);
  };

  const handleRemovePicture = async (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    if (!user?.id) {
      console.error("No user id; cannot delete profile picture");
      return;
    }

    if (formData.profileFile) {
      setFormData((prev) => ({ ...prev, profileFile: null }));
      if (fileInputRef.current) fileInputRef.current.value = null;
      setProfileRemoved(false);
      return;
    }

    if (user.profilePictureUrl) {
      try {
        setRemoving(true);
        const updatedUser = await authService.deleteProfilePic(user.id); 
        setProfileRemoved(true);
        setFormData((prev) => ({ ...prev, profileFile: null }));
        if (fileInputRef.current) fileInputRef.current.value = null;

        if (typeof onProfilePicDeleted === "function") {
          onProfilePicDeleted(updatedUser);
        }
      } catch (err) {
        console.error("Failed to delete profile picture", err);
      } finally {
        setRemoving(false);
      }
    }
  };

  const hasChanges = () => {
    const initial = initialRef.current;
    if (!initial) return true;
    if (formData.profileFile) return true;
    if (profileRemoved && (initial.profileFile !== null)) return true;
    if (initial.name !== formData.name) return true;
    if (initial.email !== formData.email) return true;
    if (initial.phoneNumber !== formData.phoneNumber) return true;
    return false;
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (!hasChanges()) {
      return;
    }
    const payload = { ...formData, profileRemoved };
    onSave(payload);
  };

  const footer = (
    <div>
      <Button type="button" label="Cancel" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button type="button" label="Save Changes" icon="pi pi-check" onClick={handleSubmit} />
    </div>
  );

  return (
    <Dialog header="Edit Profile" visible={visible} style={{ width: "500px" }} onHide={onHide} footer={footer}>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-column gap-3">
          <div>
            <label className="block text-900 font-medium mb-2">Full Name</label>
            <InputText
              className="w-full"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-900 font-medium mb-2">Email</label>
            <InputText
              className="w-full"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-900 font-medium mb-2">Phone Number</label>
            <InputText
              className="w-full"
              value={formData.phoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-900 font-medium mb-2">Profile Picture</label>

            <div className="flex gap-2 items-center">
              <Button
                type="button"
                label="Choose File"
                icon="pi pi-upload"
                onClick={() => fileInputRef.current?.click()}
              />

              {((user?.profilePictureUrl && !profileRemoved) || formData.profileFile) && (
                <Button
                  type="button"
                  icon="pi pi-trash"
                  className="p-button-danger p-button-rounded"
                  onClick={handleRemovePicture}
                  tooltip={formData.profileFile ? "Remove selected file" : "Remove Profile Picture"}
                />
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />

            {formData.profileFile && (
              <div className="mt-2 text-sm text-600">Selected: {formData.profileFile.name}</div>
            )}

            {profileRemoved && (
              <div className="mt-2 text-sm text-600">Profile picture removed</div>
            )}
          </div>
        </div>
      </form>
    </Dialog>
  );
};