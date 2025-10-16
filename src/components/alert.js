import Swal from "sweetalert2";

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseenter = Swal.resumeTimer;
    }
})

export function alertSuccess(message) {
    Toast.fire({
        icon: "success",
        title: message,
        position: "center-end",
        background:"beige"
    });
}

export function alertError(message) {
    Toast.fire({
        icon: "error",
        title: message,
        position: "center-end",
        background: "beige"
    });
}

export function alertQuestion(message) {
  return Swal.fire({
    icon: "question",
    title: message,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });
}

