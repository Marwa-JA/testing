import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Rating } from "primereact/rating";

export const RatingDialog = ({
  visible,
  onHide,
  onSubmit,
  eventTitle,
  supplierName,
  loading,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!rating || rating < 1) return;
    onSubmit({ rating, comment });
    setRating(0);
    setComment("");
  };

  const handleHide = () => {
    setRating(0);
    setComment("");
    onHide();
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={handleHide}
        disabled={loading}
      />
      <Button
        label="Submit Review"
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={loading}
        disabled={!rating || rating < 1}
      />
    </div>
  );

  return (
    <Dialog
      header={`Rate: ${supplierName || eventTitle || "Event"}`}
      visible={visible}
      style={{ width: "420px" }}
      onHide={handleHide}
      footer={footer}
    >
      <div className="flex flex-column gap-4 pt-2">
        <div className="flex flex-column align-items-center gap-2">
          <label className="font-medium text-gray-700">Your Rating</label>
          <Rating
            value={rating}
            onChange={(e) => setRating(e.value)}
            cancel={false}
            stars={5}
          />
          {rating > 0 && (
            <span className="text-sm text-gray-500">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </span>
          )}
        </div>

        <div className="flex flex-column gap-1">
          <label className="font-medium text-gray-700">
            Comment (optional)
          </label>
          <InputTextarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience..."
            autoResize
          />
        </div>
      </div>
    </Dialog>
  );
};
