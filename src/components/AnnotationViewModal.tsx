import React from "react";
import { Box, Modal, Button } from "@mui/material";

const AnnotationViewModal: React.FC<{
  open: boolean;
  annotation: string | null;
  onClose: () => void;
  onDelete: () => void;
}> = ({ open, annotation, onClose, onDelete }) => {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="view-annotation-modal" aria-describedby="view-annotated-text">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: "8px",
        }}
      >
        <h3 className="text-lg font-bold">Annotation</h3>
        <Box
          className="text-gray-700 mt-4"
          sx={{
            backgroundColor: "#f9f9f9",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: annotation || "" }} />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button onClick={onDelete} color="error" variant="contained">
            Delete
          </Button>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AnnotationViewModal;
