
export const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION';
export function showNotification(message, dispatch, type = "") {
  setTimeout(() => dispatch(hideNotification()), 5000);

    return {
      type: SHOW_NOTIFICATION,
      data: {
        message,
        type: type
      }
    };
}

export const HIDE_NOTIFICATION = 'HIDE_NOTIFICATION';
export function hideNotification(){
  return {
    type: HIDE_NOTIFICATION
  }
}