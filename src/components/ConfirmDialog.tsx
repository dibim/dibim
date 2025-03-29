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

export type ConfirmDialogProp = {
  open: boolean;
  title: string;
  description?: string;
  content: React.ReactNode;
  cancelText: string; // 取消按钮的文字
  cancelCb: () => void; // 点击编辑按钮的回调函数
  okText: string; // 确认按钮的文字
  okCb: () => void; // 点击确认按钮的回调函数
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
}: ConfirmDialogProp) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}

          {content && <div className="text-muted-foreground">{content}</div>}
        </AlertDialogHeader>
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
