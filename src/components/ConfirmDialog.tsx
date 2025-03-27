import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export type ConfirmDialogProp = {
  open: boolean;
  title: string;
  content: React.ReactNode;
  cancelText: string; // 取消按钮的文字
  cancelCb: () => void; // 点击编辑按钮的回调函数
  okText: string; // 确认按钮的文字
  okCb: () => void; // 点击确认按钮的回调函数
};

export function ConfirmDialog(props: ConfirmDialogProp) {
  return (
    <AlertDialog open={props.open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {props.title && <AlertDialogTitle>{props.title}</AlertDialogTitle>}
          {props.content && <AlertDialogDescription>{props.content}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {props.cancelText && (
            <AlertDialogCancel
              onClick={() => {
                props.cancelCb ? props.cancelCb() : null;
              }}
            >
              {props.cancelText}
            </AlertDialogCancel>
          )}
          {props.okText && (
            <AlertDialogAction
              onClick={() => {
                props.okCb ? props.okCb() : null;
              }}
            >
              {props.okText}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
