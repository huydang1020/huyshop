import {
  ToastContainer as ToastContainerDefault,
  toast,
  ToastContent,
  Slide,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ToastContainer = () => {
  return (
    <ToastContainerDefault
      position="bottom-right"
      theme="colored"
      autoClose={1000}
      hideProgressBar={false}
      newestOnTop={false}
      transition={Slide}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  );
};

class ToastUtil {
  public info(message: ToastContent, opts = {}) {
    toast.dismiss();
    toast.info(message, {
      position: "bottom-right",
      theme: "colored",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Slide,
      ...opts,
    });
  }

  public success(message: ToastContent, opts = {}) {
    toast.dismiss();
    toast.success(message, {
      position: "bottom-right",
      theme: "colored",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Slide,
      ...opts,
    });
  }

  public warning(message: ToastContent, opts = {}) {
    toast.dismiss();
    toast.warn(message, {
      position: "bottom-right",
      theme: "colored",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Slide,
      ...opts,
    });
  }

  public error(message: ToastContent, opts = {}) {
    toast.dismiss();
    toast.error(message, {
      position: "bottom-right",
      theme: "colored",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Slide,
      ...opts,
    });
  }
}

export const toastUtil = new ToastUtil();
