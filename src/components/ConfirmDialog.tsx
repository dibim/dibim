import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/x_alert-dialog";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  content: React.ReactNode;
  cancelText: string;
  cancelCb: () => void;
  okText: string;
  okCb: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  content,
  cancelText,
  cancelCb,
  okText,
  okCb,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>

        {content && <div className="text-muted-foreground">{content}</div>}

        <AlertDialogFooter>
          {cancelText && (
            <AlertDialogCancel
              onClick={() => {
                cancelCb ? cancelCb() : null;
              }}
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          {okText && (
            <AlertDialogAction
              onClick={() => {
                okCb ? okCb() : null;
              }}
            >
              {okText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
