"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CancelIcon from "@mui/icons-material/Cancel";

interface CancelOrderDialogProps {
  open: boolean;
  orderNumber: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelOrderDialog: React.FC<CancelOrderDialogProps> = ({
  open,
  orderNumber,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="cancel-dialog-title"
      aria-describedby="cancel-dialog-description"
    >
      <DialogTitle
        id="cancel-dialog-title"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <WarningAmberIcon color="error" />
        Siparişi İptal Et
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="cancel-dialog-description">
          <strong>{orderNumber}</strong> numaralı siparişi iptal etmek
          istediğinize emin misiniz?
          <br />
          <br />
          Bu işlem geri alınamaz ve sipariş iptal edilecektir.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: "none" }}
        >
          Vazgeç
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          startIcon={<CancelIcon />}
          sx={{ textTransform: "none" }}
          autoFocus
        >
          Evet, İptal Et
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelOrderDialog;
