import React, { useState, useEffect } from "react";
import { Box, Modal, Button } from "@mui/material";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const AnnotationInputModal: React.FC<{
  open: boolean;
  selectedText: string | null;
  onClose: () => void;
  onSave: (annotation: string) => void;
}> = ({ open, selectedText, onClose, onSave }) => {
  const [annotation, setAnnotation] = useState("");

  useEffect(() => {
    if (open) setAnnotation(""); // Clear annotation when modal opens
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="annotation-modal-title"
      aria-describedby="annotation-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: "8px",
          p: 4,
        }}
      >
        <h3 id="annotation-modal-title" className="text-lg font-bold mb-4">
          Annotate Highlighted Text
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Highlighted Text: <span className="font-medium">{selectedText}</span>
        </p>
        <Box
          sx={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            overflow: "hidden",
            mb: 4, // Add margin-bottom to separate buttons from editor
          }}
        >
          <ReactQuill
            value={annotation}
            onChange={setAnnotation}
            placeholder="Type your annotation here..."
            style={{
              height: "150px",
              marginBottom: "0",
            }}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => onSave(annotation)}
            variant="contained"
            color="primary"
            disabled={!annotation.trim()}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AnnotationInputModal;
