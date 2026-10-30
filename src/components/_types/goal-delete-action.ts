export type GoalDeleteActionProps = {
  isConfirming: boolean;
  isDeleting: boolean;
  onRequest: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};
